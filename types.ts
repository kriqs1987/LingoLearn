export interface Word {
  id: string;
  english: string;
  translation: string;
  definition: string;
  exampleSentence: string;
  masteryLevel: number; // 0-5
  lastReviewed: string | null; // ISO date string
}

export interface Dictionary {
  id: string;
  name: string;
  words: Word[];
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  QUIZ = 'QUIZ',
  MANAGE_WORDS = 'MANAGE_WORDS',
}

export interface QuizQuestion {
  word: Word;
  options: string[]; // array of translations
  correctAnswer: string;
}

// FIX: Add User interface to resolve import error in contexts/AuthContext.tsx.
export interface User {
  username: string;
}
