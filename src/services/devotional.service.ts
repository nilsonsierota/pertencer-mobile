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
      const ref = collection(db, "books");
      const snap = await getDocs(query(ref, where("planId", "==", planId), orderBy("createdAt", "asc")));
      return snap.docs.map(d => ({ id: d.id, ...d.data(), isToday: false, totalChapters: 0, doneChapters: 0, donePercentage: 0 } as Book));
    } catch (e) { console.error(e); return []; }
  },

  async getChapters(bookId: string, userId: string): Promise<Chapter[]> {
    try {
      const ref = collection(db, "chapters");
      const snap = await getDocs(query(ref, where("bookId", "==", bookId), orderBy("number", "asc")));
      return snap.docs.map(d => ({ id: d.id, ...d.data(), isToday: false, done: false } as Chapter));
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
    return { results: [], total: 0 };
  },
};