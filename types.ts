export interface Word {
  id: string;
  sourceWord: string;
  translatedWord: string;
  definition: string;
  exampleSentence: string;
  masteryLevel: number; // 0-5
  lastReviewed: string | null; // ISO date string
}

export interface Dictionary {
  id: string;
  name: string;
  sourceLanguage: string;
  targetLanguage: string;
  words: Word[];
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  QUIZ = 'QUIZ',
  MANAGE_WORDS = 'MANAGE_WORDS',
  SETTINGS = 'SETTINGS',
}

export interface QuizQuestion {
  word: Word;
  options: string[]; // array of translations
  correctAnswer: string;
}