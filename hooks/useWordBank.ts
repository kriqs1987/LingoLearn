import { useState, useEffect, useCallback } from 'react';
import { Word } from '../types';
import { LOCAL_STORAGE_KEY, MAX_MASTERY_LEVEL, QUIZ_SESSION_LENGTH } from '../constants';

// Data structure in localStorage:
// {
//   "user1": {
//     "Polish": [word1, word2],
//     "Spanish": [word3]
//   }
// }

const getAllData = () => {
    try {
        const item = window.localStorage.getItem(LOCAL_STORAGE_KEY);
        return item ? JSON.parse(item) : {};
    } catch (error) {
        console.error("Error reading from localStorage", error);
        return {};
    }
};

export function useWordBank(username: string | null, language: string) {
  const [words, setWords] = useState<Word[]>([]);

  useEffect(() => {
    if (!username) {
        setWords([]);
        return;
    }
    const allData = getAllData();
    const userWords = allData[username] || {};
    const languageWords = userWords[language] || [];
    setWords(languageWords);
  }, [username, language]);

  useEffect(() => {
    if (!username || !language) return;
    
    try {
        const allData = getAllData();
        if (!allData[username]) {
            allData[username] = {};
        }
        allData[username][language] = words;
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(allData));
    } catch (error) {
        console.error("Error writing to localStorage", error);
    }
  }, [words, username, language]);

  const addWord = useCallback((wordDetails: Omit<Word, 'id' | 'masteryLevel' | 'lastReviewed'>) => {
    setWords(prevWords => {
      const alreadyExists = prevWords.some(w => w.english.toLowerCase() === wordDetails.english.toLowerCase());
      if (alreadyExists) {
        throw new Error(`The word "${wordDetails.english}" is already in your list for this language.`);
      }
      const newWord: Word = {
        ...wordDetails,
        id: `${new Date().toISOString()}-${wordDetails.english}`,
        masteryLevel: 0,
        lastReviewed: null,
      };
      return [newWord, ...prevWords];
    });
  }, []);

  const updateWordMastery = useCallback((wordId: string, isCorrect: boolean) => {
    setWords(prevWords =>
      prevWords.map(word => {
        if (word.id === wordId) {
          let newMasteryLevel = word.masteryLevel;
          if (isCorrect) {
            newMasteryLevel = Math.min(MAX_MASTERY_LEVEL, word.masteryLevel + 1);
          } else {
            newMasteryLevel = Math.max(0, word.masteryLevel - 1);
          }
          return { ...word, masteryLevel: newMasteryLevel, lastReviewed: new Date().toISOString() };
        }
        return word;
      })
    );
  }, []);

  const deleteWord = useCallback((wordId: string) => {
    setWords(prevWords => prevWords.filter(word => word.id !== wordId));
  }, []);

  const updateWord = useCallback((wordId: string, updatedDetails: { translation: string; exampleSentence: string; }) => {
    setWords(prevWords =>
      prevWords.map(word => {
        if (word.id === wordId) {
          return { ...word, ...updatedDetails };
        }
        return word;
      })
    );
  }, []);
  
  const getWordsForQuiz = useCallback(() => {
    const sortedWords = [...words].sort((a, b) => {
      if (a.masteryLevel !== b.masteryLevel) {
        return a.masteryLevel - b.masteryLevel;
      }
      if (!a.lastReviewed) return -1;
      if (!b.lastReviewed) return 1;
      return new Date(a.lastReviewed).getTime() - new Date(b.lastReviewed).getTime();
    });
    return sortedWords.slice(0, QUIZ_SESSION_LENGTH);
  }, [words]);

  const totalMastery = words.reduce((sum, word) => sum + word.masteryLevel, 0);
  const maxPossibleMastery = words.length * MAX_MASTERY_LEVEL;

  return { words, addWord, updateWordMastery, getWordsForQuiz, totalMastery, maxPossibleMastery, deleteWord, updateWord };
}
