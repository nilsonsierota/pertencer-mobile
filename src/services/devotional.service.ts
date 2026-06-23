import { db } from "./firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  orderBy,
  getDoc,
  setDoc,
  limit,
  Query,
  QuerySnapshot,
} from "firebase/firestore";
import type { Banner, Book, Chapter, User, UserDevotional, UserBookProgress, SearchResult, Plan } from "../types";

function normalizeDone(value: unknown): boolean {
  return value === true || value === "true" || value === 1;
}

async function getDocsWithTimeout<T>(q: Query<T>, timeoutMs = 30000): Promise<QuerySnapshot<T>> {
  return Promise.race([
    getDocs(q),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Firestore query timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

export const DevotionalService = {
  async getPlans(): Promise<Plan[]> {
    try {
      if (!db) return [];
      const ref = collection(db, "plan");
      const snap = await getDocsWithTimeout(query(ref));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Plan));
    } catch (e) {
      console.error("Erro ao buscar planos:", e);
      return [];
    }
  },

  async getBooks(userId: string, planId: string): Promise<Book[]> {
    try {
      if (!db) return [];
      const booksSnap = await getDocsWithTimeout(
        query(collection(db, "books"), where("planId", "==", planId), orderBy("createdAt", "asc"))
      );
      if (booksSnap.empty) return [];

      const bookDocs = booksSnap.docs;
      const bookIds = bookDocs.map(d => d.id);

      const now = new Date();
      now.setHours(now.getHours() - 4);
      const today = now.toISOString().split("T")[0];

      let todayBookId: string | null = null;
      const todayChaptersSnap = await getDocsWithTimeout(
        query(
          collection(db, "chapters"),
          where("devotionalDate", ">=", today),
          orderBy("devotionalDate", "asc"),
          limit(50)
        )
      );
      const todayChapter = todayChaptersSnap.docs.find(d => {
        const chapterDate = d.data().devotionalDate?.split("T")[0];
        return chapterDate === today && bookIds.includes(d.data().bookId);
      });
      if (todayChapter) {
        todayBookId = todayChapter.data().bookId;
      }

      const donePerBook = new Map<string, number>();
      const userDevotionalsSnap = await getDocsWithTimeout(
        query(collection(db, "userDevotionals"), where("userId", "==", userId))
      );

      const legacyDevotionals: { chapterId: string }[] = [];
      for (const d of userDevotionalsSnap.docs) {
        if (!normalizeDone(d.data().done)) continue;
        const bId = d.data().bookId;
        if (bId) {
          donePerBook.set(bId, (donePerBook.get(bId) || 0) + 1);
        } else {
          legacyDevotionals.push({ chapterId: d.data().chapterId });
        }
      }

      if (legacyDevotionals.length > 0) {
        const chapterIds = [...new Set(legacyDevotionals.map(d => d.chapterId))];
        const chapterToBook = new Map<string, string>();

        const chunks = chunkArray(chapterIds, 30);
        const snapshots = await Promise.all(
          chunks.map(chunk =>
            getDocsWithTimeout(
              query(collection(db!, "chapters"), where("__name__", "in", chunk))
            )
          )
        );

        for (const snap of snapshots) {
          for (const d of snap.docs) {
            chapterToBook.set(d.id, d.data().bookId);
          }
        }

        for (const ld of legacyDevotionals) {
          const bId = chapterToBook.get(ld.chapterId);
          if (bId && bookIds.includes(bId)) {
            donePerBook.set(bId, (donePerBook.get(bId) || 0) + 1);
          }
        }
      }

      const books = await Promise.all(bookDocs.map(async (bookDoc) => {
        const bookId = bookDoc.id;
        const bookData = bookDoc.data() as Book;
        const progressRef = doc(db!, "userBookProgress", `${userId}_${bookId}`);
        const progressSnap = await getDoc(progressRef);
        const needsSync = !progressSnap.exists() || !(progressSnap.data() as UserBookProgress)?.syncedAt;

        let doneCount = 0;
        let totalCount = 0;

        if (needsSync) {
          const chaptersSnap = await getDocsWithTimeout(
            query(collection(db!, "chapters"), where("bookId", "==", bookId))
          );
          totalCount = chaptersSnap.size;
          doneCount = donePerBook.get(bookId) || 0;
          await setDoc(progressRef, {
            userId,
            bookId,
            doneCount,
            totalCount,
            updatedAt: new Date().toISOString(),
            syncedAt: new Date().toISOString(),
          });
        } else {
          const progress = progressSnap.data();
          doneCount = progress.doneCount || 0;
          totalCount = progress.totalCount || 0;
        }

        const donePercentage = totalCount > 0
          ? Math.round((doneCount / totalCount) * 100)
          : 0;

        return {
          ...bookData,
          id: bookId,
          isToday: bookId === todayBookId,
          totalChapters: totalCount,
          doneChapters: doneCount,
          donePercentage,
        } as Book;
      }));

      return books;
    } catch (e) {
      console.error("Erro ao buscar livros:", e);
      return [];
    }
  },

  async getChapters(bookId: string, userId: string): Promise<Chapter[]> {
    try {
      if (!db) return [];
      const chaptersSnap = await getDocsWithTimeout(
        query(collection(db, "chapters"), where("bookId", "==", bookId), orderBy("number", "asc"))
      );

      const now = new Date();
      now.setHours(now.getHours() - 4);
      const today = now.toISOString().split("T")[0];

      const userDevotionalsSnap = await getDocsWithTimeout(
        query(collection(db, "userDevotionals"), where("userId", "==", userId))
      );

      const doneChaptersSet = new Set(
        userDevotionalsSnap.docs
          .filter(d => normalizeDone(d.data().done))
          .map(d => d.data().chapterId)
      );

      return chaptersSnap.docs.map(d => {
        const data = d.data();
        const isToday = data.devotionalDate?.split("T")[0] === today;
        const done = doneChaptersSet.has(d.id);
        return { id: d.id, ...data, isToday, done } as Chapter;
      });
    } catch (e) {
      console.error("Erro ao buscar capítulos:", e);
      return [];
    }
  },

  async createBook(
    book: Omit<Book, "id" | "createdAt" | "updatedAt" | "isToday" | "totalChapters" | "doneChapters" | "donePercentage">
  ): Promise<string> {
    if (!db) throw new Error("Firestore not initialized");
    const newBook = await addDoc(collection(db, "books"), {
      ...book,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return newBook.id;
  },

  async createChapter(
    chapter: Omit<Chapter, "id" | "createdAt" | "updatedAt" | "done" | "isToday">
  ): Promise<string> {
    if (!db) throw new Error("Firestore not initialized");
    const newChapter = await addDoc(collection(db, "chapters"), {
      ...chapter,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return newChapter.id;
  },

  async getBanners(): Promise<Banner[]> {
    try {
      if (!db) return [];
      const snap = await getDocsWithTimeout(collection(db, "banners"));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Banner));
    } catch (e) {
      console.error("Erro ao buscar banners:", e);
      return [];
    }
  },

  async createBanner(banner: Omit<Banner, "id" | "createdAt" | "updatedAt">): Promise<string> {
    if (!db) throw new Error("Firestore not initialized");
    const newBanner = await addDoc(collection(db, "banners"), {
      ...banner,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return newBanner.id;
  },

  async saveUserDevotional(
    data: Omit<UserDevotional, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    if (!db) throw new Error("Firestore not initialized");
    const newDoc = await addDoc(collection(db, "userDevotionals"), {
      ...data,
      done: normalizeDone(data.done),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    if (data.bookId && normalizeDone(data.done)) {
      const progressId = `${data.userId}_${data.bookId}`;
      const progressRef = doc(db, "userBookProgress", progressId);
      const progressSnap = await getDoc(progressRef);

      if (progressSnap.exists()) {
        const currentDoneCount = progressSnap.data().doneCount || 0;
        await updateDoc(progressRef, {
          doneCount: currentDoneCount + 1,
          updatedAt: new Date().toISOString(),
          syncedAt: new Date().toISOString(),
        });
      } else {
        const chaptersSnap = await getDocsWithTimeout(
          query(collection(db, "chapters"), where("bookId", "==", data.bookId))
        );
        await setDoc(progressRef, {
          userId: data.userId,
          bookId: data.bookId,
          doneCount: 1,
          totalCount: chaptersSnap.size,
          updatedAt: new Date().toISOString(),
          syncedAt: new Date().toISOString(),
        });
      }
    }

    return newDoc.id;
  },

  async updateUserDevotional(
    id: string,
    updates: Partial<Omit<UserDevotional, "id" | "createdAt">>
  ): Promise<void> {
    if (!db) throw new Error("Firestore not initialized");
    const userDevotionalDoc = doc(db, "userDevotionals", id);
    const oldDocSnap = await getDoc(userDevotionalDoc);
    const oldData = oldDocSnap.exists() ? oldDocSnap.data() : null;

    const normalizedUpdates = {
      ...updates,
      ...(updates.done !== undefined ? { done: normalizeDone(updates.done) } : {}),
    };

    await updateDoc(userDevotionalDoc, {
      ...normalizedUpdates,
      updatedAt: new Date().toISOString(),
    });

    if (updates.bookId && updates.done !== undefined) {
      const normalizedNewDone = normalizeDone(updates.done);
      const normalizedOldDone = normalizeDone(oldData?.done);
      const progressId = `${updates.userId}_${updates.bookId}`;
      const progressRef = doc(db, "userBookProgress", progressId);
      const progressSnap = await getDoc(progressRef);

      if (progressSnap.exists()) {
        const currentDoneCount = progressSnap.data().doneCount || 0;

        if (!normalizedOldDone && normalizedNewDone) {
          await updateDoc(progressRef, {
            doneCount: currentDoneCount + 1,
            updatedAt: new Date().toISOString(),
            syncedAt: new Date().toISOString(),
          });
        } else if (normalizedOldDone && !normalizedNewDone) {
          await updateDoc(progressRef, {
            doneCount: Math.max(0, currentDoneCount - 1),
            updatedAt: new Date().toISOString(),
            syncedAt: new Date().toISOString(),
          });
        }
      } else if (normalizedNewDone) {
        const chaptersSnap = await getDocsWithTimeout(
          query(collection(db, "chapters"), where("bookId", "==", updates.bookId))
        );
        await setDoc(progressRef, {
          userId: updates.userId,
          bookId: updates.bookId,
          doneCount: 1,
          totalCount: chaptersSnap.size,
          updatedAt: new Date().toISOString(),
          syncedAt: new Date().toISOString(),
        });
      }
    }
  },

  async getUserDevotional(userId: string, chapterId: string): Promise<UserDevotional | null> {
    try {
      if (!db) return null;
      const q = query(
        collection(db, "userDevotionals"),
        where("userId", "==", userId),
        where("chapterId", "==", chapterId)
      );
      const snap = await getDocsWithTimeout(q);
      const docSnap = snap.docs[0];
      if (!docSnap) return null;

      const data = docSnap.data();

      if (!data.bookId) {
        const chapterDoc = await getDoc(doc(db, "chapters", chapterId));
        if (chapterDoc.exists()) {
          const bookId = chapterDoc.data().bookId;
          await updateDoc(docSnap.ref, {
            bookId,
            updatedAt: new Date().toISOString(),
          });
          data.bookId = bookId;
        }
      }

      return {
        id: docSnap.id,
        ...data,
        done: normalizeDone(data.done),
      } as UserDevotional;
    } catch (e) {
      console.error("Erro ao buscar devocional:", e);
      return null;
    }
  },

  async saveUser(data: Partial<User>): Promise<string> {
    if (!db) throw new Error("Firestore not initialized");
    const docRef = await addDoc(collection(db, "users"), {
      uid: data.uid,
      name: data.displayName,
      email: data.email,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  },

  async findUser(data: User): Promise<void> {
    if (!db) return;
    const userDocRef = doc(db, "users", data.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        uid: data.uid,
        name: data.displayName,
        email: data.email,
        createdAt: new Date().toISOString(),
      });
    } else {
      await updateDoc(userDocRef, { name: data.displayName });
    }
  },

  async searchUserDevotionals(userId: string, searchTerm: string): Promise<{ results: SearchResult[]; total: number }> {
    try {
      if (!db) return { results: [], total: 0 };
      const searchLower = searchTerm.toLowerCase();

      const devotionalsSnap = await getDocsWithTimeout(
        query(collection(db, "userDevotionals"), where("userId", "==", userId))
      );

      if (devotionalsSnap.empty) return { results: [], total: 0 };

      const chapterIds = [...new Set(devotionalsSnap.docs.map(d => d.data().chapterId))];

      const chunks = chunkArray(chapterIds, 30);
      const chaptersSnapshots = await Promise.all(
        chunks.map(chunk =>
          getDocsWithTimeout(
            query(collection(db!, "chapters"), where("__name__", "in", chunk))
          )
        )
      );
      const chaptersMap = new Map<string, Record<string, any>>();
      for (const snap of chaptersSnapshots) {
        for (const d of snap.docs) {
          chaptersMap.set(d.id, { ...d.data(), id: d.id });
        }
      }

      const [booksSnap, plansSnap] = await Promise.all([
        getDocsWithTimeout(collection(db, "books")),
        getDocsWithTimeout(collection(db, "plan")),
      ]);

      const booksMap = new Map(booksSnap.docs.map(d => [d.id, { ...d.data(), id: d.id } as Record<string, any>]));
      const plansMap = new Map(plansSnap.docs.map(d => [d.id, d.data() as Record<string, any>]));

      const results: SearchResult[] = [];
      const foundChapters = new Set<string>();

      for (const devotionalDoc of devotionalsSnap.docs) {
        if (results.length >= 10) break;

        const data = devotionalDoc.data();
        if (foundChapters.has(data.chapterId)) continue;

        const chapterData = chaptersMap.get(data.chapterId);
        if (!chapterData) continue;

        const bookData = booksMap.get(chapterData.bookId);
        if (!bookData) continue;

        const planData = plansMap.get(bookData.planId);
        if (!planData) continue;

        const answerOne = data.answerOne;
        if (answerOne && answerOne.toLowerCase().includes(searchLower)) {
          const index = answerOne.toLowerCase().indexOf(searchLower);
          const start = Math.max(0, index - 30);
          const end = Math.min(answerOne.length, index + searchTerm.length + 30);
          const matchedText = (start > 0 ? "..." : "") +
            answerOne.slice(start, end) +
            (end < answerOne.length ? "..." : "");

          results.push({
            chapterId: data.chapterId,
            bookId: chapterData.bookId,
            planId: bookData.planId,
            bookTitle: bookData.title,
            planName: planData.name,
            chapterNumber: chapterData.number,
            chapterTitle: chapterData.title,
            matchedText,
            answerField: "answerOne",
          });
          foundChapters.add(data.chapterId);
          continue;
        }

        const otherAnswers = [
          { field: "answerTwo", value: data.answerTwo },
          { field: "answerThree", value: data.answerThree },
          { field: "answerFour", value: data.answerFour },
          { field: "answerFive", value: data.answerFive },
          { field: "answerSix", value: data.answerSix },
        ];

        for (const answer of otherAnswers) {
          if (results.length >= 10) break;
          if (foundChapters.has(data.chapterId)) break;

          if (answer.value && answer.value.toLowerCase().includes(searchLower)) {
            const index = answer.value.toLowerCase().indexOf(searchLower);
            const start = Math.max(0, index - 30);
            const end = Math.min(answer.value.length, index + searchTerm.length + 30);
            const matchedText = (start > 0 ? "..." : "") +
              answer.value.slice(start, end) +
              (end < answer.value.length ? "..." : "");

            results.push({
              chapterId: data.chapterId,
              bookId: chapterData.bookId,
              planId: bookData.planId,
              bookTitle: bookData.title,
              planName: planData.name,
              chapterNumber: chapterData.number,
              chapterTitle: chapterData.title,
              matchedText,
              answerField: answer.field,
            });
            foundChapters.add(data.chapterId);
            break;
          }
        }
      }

      return { results, total: foundChapters.size };
    } catch (e) {
      console.error("Erro ao buscar devocionais:", e);
      return { results: [], total: 0 };
    }
  },
};
