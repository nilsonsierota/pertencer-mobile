export interface User {
  uid: string;
  email: string;
  displayName: string;
}

export interface Banner {
  id: string;
  title: string;
  description?: string;
  button: { name: string; link: string };
  backgroundImage: string;
  isFixed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Book {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  isToday: boolean;
  totalChapters: number;
  doneChapters: number;
  donePercentage: number;
  planId: string;
}

export interface Chapter {
  id: string;
  bookId: string;
  number: number;
  title: string;
  content?: string;
  devotionalDate: string;
  createdAt: string;
  updatedAt: string;
  isToday: boolean;
  done: boolean;
}

export interface UserDevotional {
  id: string;
  chapterId: string;
  bookId: string;
  userId: string;
  answerOne: string;
  answerTwo: string;
  answerThree: string;
  answerFour: string;
  answerFive: string;
  answerSix?: string;
  done: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserBookProgress {
  id: string;
  userId: string;
  bookId: string;
  doneCount: number;
  totalCount: number;
  updatedAt: string;
}

export interface Plan {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  active: boolean;
}

export interface SearchResult {
  chapterId: string;
  bookId: string;
  planId: string;
  bookTitle: string;
  planName: string;
  chapterNumber: number;
  chapterTitle: string;
  matchedText: string;
  answerField: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
}

export interface BibleVersion {
  id: string;
  name: string;
  abbreviation: string;
}

export interface Verse {
  chapter: number;
  verse: number;
  text: string;
}

export interface ChapterData {
  book: string;
  bookName: string;
  chapter: number;
  verses: Verse[];
}