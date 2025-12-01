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

export enum QuizMode {
  SELECT_TRANSLATION = 'SELECT_TRANSLATION', // Show source, choose translation
  SELECT_SOURCE = 'SELECT_SOURCE',           // Show translation, choose source
  TYPE_SOURCE = 'TYPE_SOURCE',               // Show translation, type source
  SPEED_CHALLENGE = 'SPEED_CHALLENGE',       // Game mode: Timer, Source -> Translation
}

export interface QuizQuestion {
  word: Word;
  mode: QuizMode;
  questionText: string;
  options?: string[]; // array of strings (translations or source words), undefined for typing
  correctAnswer: string;
}