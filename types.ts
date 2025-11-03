export interface Word {
  id: string;
  english: string;
  translation: string;
  definition: string;
  exampleSentence: string;
  masteryLevel: number; // 0-5
  lastReviewed: string | null; // ISO date string
}

export enum AppView {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  QUIZ = 'QUIZ',
  MANAGE_WORDS = 'MANAGE_WORDS',
}

export interface QuizQuestion {
  word: Word;
  options: string[]; // array of translations
  correctAnswer: string;
}

export interface User {
  username: string;
}
