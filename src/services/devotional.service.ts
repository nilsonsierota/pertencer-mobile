import { db } from "./firebase";
import { collection, doc, getDocs, query, where, addDoc, updateDoc, orderBy, getDoc, setDoc } from "firebase/firestore";
import type { Banner, Book, Chapter, User, UserDevotional, SearchResult, Plan } from "../types";

export const DevotionalService = {
  async getPlans(): Promise<Plan[]> {
    try {
      const ref = collection(db, "plan");
      const snap = await getDocs(query(ref));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Plan));
    } catch (e) { console.error(e); return []; }
  },

  async getBooks(userId: string, planId: string): Promise<Book[]> {
    try {
      const booksRef = collection(db, "books");
      const booksSnap = await getDocs(query(booksRef, where("planId", "==", planId), orderBy("createdAt", "asc")));
      
      const bookIds = booksSnap.docs.map(d => d.id);
      
      const chaptersRef = collection(db, "chapters");
      const chaptersSnap = await getDocs(query(chaptersRef, where("bookId", "in", bookIds)));
      
      const chapterCountByBook: Record<string, number> = {};
      chaptersSnap.docs.forEach(d => {
        const bookId = d.data().bookId;
        chapterCountByBook[bookId] = (chapterCountByBook[bookId] || 0) + 1;
      });
      
      const userDevotionalsRef = collection(db, "userDevotionals");
      const userDevotionalsSnap = await getDocs(query(userDevotionalsRef, where("userId", "==", userId)));
      
      const bookProgress: Record<string, number> = {};
      userDevotionalsSnap.docs.forEach(d => {
        const data = d.data();
        if (data.done) {
          bookProgress[data.bookId] = (bookProgress[data.bookId] || 0) + 1;
        }
      });
      
      return booksSnap.docs.map(d => {
        const data = d.data();
        const bookId = d.id;
        const totalChapters = chapterCountByBook[bookId] || 0;
        const doneChapters = bookProgress[bookId] || 0;
        const donePercentage = totalChapters > 0 ? Math.round((doneChapters / totalChapters) * 100) : 0;
        return { id: bookId, ...data, isToday: false, totalChapters, doneChapters, donePercentage } as Book;
      });
    } catch (e) { console.error(e); return []; }
  },

  async getChapters(bookId: string, userId: string): Promise<Chapter[]> {
    try {
      const chaptersRef = collection(db, "chapters");
      const chaptersSnap = await getDocs(query(chaptersRef, where("bookId", "==", bookId), orderBy("number", "asc")));
      
      const userDevotionalsRef = collection(db, "userDevotionals");
      const userDevotionalsSnap = await getDocs(query(userDevotionalsRef, where("userId", "==", userId)));
      
      const doneChapterIds = new Set(
        userDevotionalsSnap.docs
          .filter(d => d.data().done === true)
          .map(d => d.data().chapterId)
      );
      
      const today = new Date().toISOString().split('T')[0];
      
      return chaptersSnap.docs.map(d => {
        const data = d.data();
        const isToday = data.devotionalDate === today;
        const done = doneChapterIds.has(d.id);
        return { id: d.id, ...data, isToday, done } as Chapter;
      });
    } catch (e) { console.error(e); return []; }
  },

  async saveUserDevotional(data: Omit<UserDevotional, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const ref = collection(db, "userDevotionals");
    const newDoc = await addDoc(ref, { ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    return newDoc.id;
  },

  async updateUserDevotional(id: string, updates: Partial<Omit<UserDevotional, "id" | "createdAt">>): Promise<void> {
    const ref = doc(db, "userDevotionals", id);
    await updateDoc(ref, { ...updates, updatedAt: new Date().toISOString() });
  },

  async getUserDevotional(userId: string, chapterId: string): Promise<UserDevotional | null> {
    try {
      const ref = collection(db, "userDevotionals");
      const q = query(ref, where("userId", "==", userId), where("chapterId", "==", chapterId));
      const snap = await getDocs(q);
      if (snap.empty) return null;
      const d = snap.docs[0];
      return { id: d.id, ...d.data() } as UserDevotional;
    } catch (e) { return null; }
  },

  async saveUser(data: Partial<User>): Promise<string> {
    const ref = collection(db, "users");
    const docRef = await addDoc(ref, { uid: data.uid, name: data.displayName, email: data.email, createdAt: new Date().toISOString() });
    return docRef.id;
  },

  async findUser(data: User): Promise<void> {
    const ref = doc(db, "users", data.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, { uid: data.uid, name: data.displayName, email: data.email, createdAt: new Date().toISOString() });
    } else {
      await updateDoc(ref, { name: data.displayName });
    }
  },

  async searchUserDevotionals(userId: string, searchTerm: string): Promise<{ results: SearchResult[]; total: number }> {
    try {
      const searchLower = searchTerm.toLowerCase();
      
      const userDevotionalsRef = collection(db, "userDevotionals");
      const devotionalsSnap = await getDocs(query(userDevotionalsRef, where("userId", "==", userId)));
      
      const results: SearchResult[] = [];
      
      for (const devotionalDoc of devotionalsSnap.docs) {
        const data = devotionalDoc.data();
        
        const answerFields = ['answerOne', 'answerTwo', 'answerThree', 'answerFour', 'answerFive', 'answerSix'];
        let matchedField = '';
        let matchedText = '';
        
        for (const field of answerFields) {
          const answer = data[field];
          if (answer && typeof answer === 'string' && answer.toLowerCase().includes(searchLower)) {
            matchedField = field;
            matchedText = answer;
            break;
          }
        }
        
        if (matchedText) {
          const chapterRef = doc(db, "chapters", data.chapterId);
          const chapterSnap = await getDoc(chapterRef);
          
          if (chapterSnap.exists()) {
            const chapterData = chapterSnap.data();
            
            const bookRef = doc(db, "books", data.bookId);
            const bookSnap = await getDoc(bookRef);
            
            let bookTitle = '';
            let planId = '';
            let planName = '';
            
            if (bookSnap.exists()) {
              const bookData = bookSnap.data();
              bookTitle = bookData.title || '';
              planId = bookData.planId || '';
              
              if (planId) {
                const planRef = doc(db, "plan", planId);
                const planSnap = await getDoc(planRef);
                if (planSnap.exists()) {
                  planName = planSnap.data().name || '';
                }
              }
            }
            
            results.push({
              chapterId: data.chapterId,
              bookId: data.bookId,
              planId,
              bookTitle,
              planName,
              chapterNumber: chapterData.number || 0,
              chapterTitle: chapterData.title || '',
              matchedText,
              answerField: matchedField,
            });
          }
        }
      }
      
      return { results, total: results.length };
    } catch (e) { 
      console.error(e);
      return { results: [], total: 0 }; 
    }
  },
};