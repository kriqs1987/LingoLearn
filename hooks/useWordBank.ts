import { useState, useEffect, useCallback, useMemo } from 'react';
import { Word, Dictionary } from '../types';
import { LOCAL_STORAGE_KEY, MAX_MASTERY_LEVEL, QUIZ_SESSION_LENGTH } from '../constants';
import { fetchWordDetails } from '../services/geminiService';

interface LingoLearnData {
    dictionaries: Dictionary[];
    activeDictionaryId: string | null;
}

const getInitialData = (): LingoLearnData => {
    try {
        const item = window.localStorage.getItem(LOCAL_STORAGE_KEY);
        if (item) {
            const data = JSON.parse(item);
            // Basic validation
            if (Array.isArray(data.dictionaries)) {
                return data;
            }
        }
    } catch (error) {
        console.error("Error reading from localStorage", error);
    }
    // Return default structure if no valid data found
    return { dictionaries: [], activeDictionaryId: null };
};


export function useWordBank() {
  const [data, setData] = useState<LingoLearnData>(getInitialData);

  useEffect(() => {
    try {
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error("Error writing to localStorage", error);
    }
  }, [data]);

  const activeDictionary = useMemo(() => {
    return data.dictionaries.find(d => d.id === data.activeDictionaryId) || null;
  }, [data.dictionaries, data.activeDictionaryId]);

  const createDictionary = useCallback((name: string, sourceLanguage: string, targetLanguage: string) => {
    const newDictionary: Dictionary = {
        id: new Date().toISOString(),
        name,
        sourceLanguage,
        targetLanguage,
        words: [],
    };
    setData(prevData => {
        const newData = {
            ...prevData,
            dictionaries: [...prevData.dictionaries, newDictionary],
        };
        // If it's the first dictionary, make it active
        if (prevData.dictionaries.length === 0) {
            newData.activeDictionaryId = newDictionary.id;
        }
        return newData;
    });
  }, []);

  const deleteDictionary = useCallback((dictionaryId: string) => {
    setData(prevData => {
        const newDictionaries = prevData.dictionaries.filter(d => d.id !== dictionaryId);
        let newActiveId = prevData.activeDictionaryId;
        // If the deleted dictionary was active, select the first one or null
        if (newActiveId === dictionaryId) {
            newActiveId = newDictionaries.length > 0 ? newDictionaries[0].id : null;
        }
        return { dictionaries: newDictionaries, activeDictionaryId: newActiveId };
    });
  }, []);
  
  const setActiveDictionary = useCallback((dictionaryId: string | null) => {
    setData(prevData => ({ ...prevData, activeDictionaryId: dictionaryId }));
  }, []);

  const updateActiveDictionaryWords = (updateFn: (words: Word[]) => Word[]) => {
    if (!data.activeDictionaryId) return;
    setData(prevData => ({
        ...prevData,
        dictionaries: prevData.dictionaries.map(d => 
            d.id === data.activeDictionaryId ? { ...d, words: updateFn(d.words) } : d
        )
    }));
  };

  const addWord = useCallback((wordDetails: Omit<Word, 'id' | 'masteryLevel' | 'lastReviewed'>) => {
    if (!activeDictionary) return;
    const alreadyExists = activeDictionary.words.some(w => w.sourceWord.toLowerCase() === wordDetails.sourceWord.toLowerCase());
    if (alreadyExists) {
      throw new Error(`The word "${wordDetails.sourceWord}" is already in this dictionary.`);
    }
    
    const newWord: Word = {
      ...wordDetails,
      id: `${new Date().toISOString()}-${wordDetails.sourceWord}`,
      masteryLevel: 0,
      lastReviewed: null,
    };
    updateActiveDictionaryWords(prevWords => [newWord, ...prevWords]);
  }, [activeDictionary]);

  const updateWordMastery = useCallback((wordId: string, isCorrect: boolean) => {
    updateActiveDictionaryWords(prevWords =>
      prevWords.map(word => {
        if (word.id === wordId) {
          const newMasteryLevel = isCorrect
            ? Math.min(MAX_MASTERY_LEVEL, word.masteryLevel + 1)
            : Math.max(0, word.masteryLevel - 1);
          return { ...word, masteryLevel: newMasteryLevel, lastReviewed: new Date().toISOString() };
        }
        return word;
      })
    );
  }, []);

  const deleteWord = useCallback((wordId: string) => {
    updateActiveDictionaryWords(prevWords => prevWords.filter(word => word.id !== wordId));
  }, []);

  const updateWord = useCallback((wordId: string, updatedDetails: { translatedWord: string; exampleSentence: string; }) => {
    updateActiveDictionaryWords(prevWords =>
      prevWords.map(word => 
        word.id === wordId ? { ...word, ...updatedDetails } : word
      )
    );
  }, []);
  
  const getWordsForQuiz = useCallback(() => {
    if (!activeDictionary) return [];
    const sortedWords = [...activeDictionary.words].sort((a, b) => {
      if (a.masteryLevel !== b.masteryLevel) return a.masteryLevel - b.masteryLevel;
      if (!a.lastReviewed) return -1;
      if (!b.lastReviewed) return 1;
      return new Date(a.lastReviewed).getTime() - new Date(b.lastReviewed).getTime();
    });
    return sortedWords.slice(0, QUIZ_SESSION_LENGTH);
  }, [activeDictionary]);

  const importWords = useCallback(async (
    wordListText: string,
    onProgress: (progress: { current: number; total: number; word: string }) => void
  ): Promise<{ successful: number; failed: number, errors: string[] }> => {
      if (!activeDictionary) throw new Error("No active dictionary to import words into.");

      const { sourceLanguage, targetLanguage } = activeDictionary;
      const wordsToImport = wordListText.split('\n').map(w => w.trim().toLowerCase()).filter(Boolean);
      const uniqueWords = [...new Set(wordsToImport)];
      const wordsToAdd: Omit<Word, 'id' | 'masteryLevel' | 'lastReviewed'>[] = [];
      
      let successful = 0;
      let failed = 0;
      const errors: string[] = [];

      for (let i = 0; i < uniqueWords.length; i++) {
          const word = uniqueWords[i];
          onProgress({ current: i + 1, total: uniqueWords.length, word });
          
          if (activeDictionary.words.some(w => w.sourceWord.toLowerCase() === word)) {
              console.log(`Skipping duplicate: ${word}`);
              continue; // Skip words already in the dictionary
          }

          try {
              const details = await fetchWordDetails(word, sourceLanguage, targetLanguage);
              wordsToAdd.push({ sourceWord: word, ...details });
              successful++;
          } catch (error: any) {
              console.error(`Failed to import "${word}":`, error);
              failed++;
              errors.push(`"${word}": ${error.message || 'Unknown error'}`);
          }
      }

      if (wordsToAdd.length > 0) {
        updateActiveDictionaryWords(prevWords => {
          const newWords: Word[] = wordsToAdd.map(details => ({
            ...details,
            id: `${new Date().toISOString()}-${details.sourceWord}`,
            masteryLevel: 0,
            lastReviewed: null,
          }));
          return [...newWords, ...prevWords];
        });
      }
      
      return { successful, failed, errors };

  }, [activeDictionary]);


  const words = activeDictionary?.words || [];
  const totalMastery = words.reduce((sum, word) => sum + word.masteryLevel, 0);
  const maxPossibleMastery = words.length * MAX_MASTERY_LEVEL;

  return { 
    dictionaries: data.dictionaries,
    activeDictionary,
    createDictionary,
    deleteDictionary,
    setActiveDictionary,
    words,
    addWord,
    updateWordMastery,
    getWordsForQuiz,
    totalMastery,
    maxPossibleMastery,
    deleteWord,
    updateWord,
    importWords
  };
}