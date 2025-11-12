import { useState, useEffect, useCallback, useMemo } from 'react';
import { Word, Dictionary } from '../types';
import { MAX_MASTERY_LEVEL, QUIZ_SESSION_LENGTH, LOCAL_STORAGE_DATA_KEY } from '../constants';
import { fetchWordDetails } from '../services/geminiService';

const saveDictionariesToStorage = (dictionaries: Dictionary[]) => {
    try {
        localStorage.setItem(LOCAL_STORAGE_DATA_KEY, JSON.stringify(dictionaries));
    } catch (error) {
        console.error("Failed to save data to localStorage", error);
    }
};

const loadDictionariesFromStorage = (): Dictionary[] => {
    try {
        const data = localStorage.getItem(LOCAL_STORAGE_DATA_KEY);
        if (data) {
            const parsedData = JSON.parse(data);
            if (Array.isArray(parsedData)) {
                // Perform a deeper validation to ensure each item is a valid dictionary object.
                // This prevents crashes if the array contains non-objects or malformed objects.
                const validDictionaries = parsedData.filter(item => 
                    item && typeof item === 'object' && 
                    'id' in item && 'name' in item && Array.isArray(item.words)
                );
                
                // If the loaded data had invalid items, clean it up for the next session.
                if (validDictionaries.length !== parsedData.length) {
                   console.warn("Cleaned up corrupted data from localStorage.");
                   saveDictionariesToStorage(validDictionaries);
                }
                return validDictionaries;
            }
        }
        return []; // Return empty array if no data or data is not an array
    } catch (error) {
        console.error("Failed to load or parse data from localStorage", error);
        // If data is corrupted, it's safer to start fresh.
        localStorage.removeItem(LOCAL_STORAGE_DATA_KEY);
        return [];
    }
};

export function useWordBank() {
  const [dictionaries, setDictionaries] = useState<Dictionary[]>(loadDictionariesFromStorage());
  const [activeDictionaryId, setActiveDictionaryId] = useState<string | null>(null);

  useEffect(() => {
    if (dictionaries.length > 0) {
        const lastActiveId = localStorage.getItem('lingoLearn_lastActiveDict');
        if (lastActiveId && dictionaries.some(d => d.id === lastActiveId)) {
            setActiveDictionaryId(lastActiveId);
        } else {
            setActiveDictionaryId(dictionaries[0].id);
        }
    } else {
        setActiveDictionaryId(null);
    }
  }, [dictionaries]);


  const persistData = useCallback((newDictionaries: Dictionary[]) => {
      setDictionaries(newDictionaries);
      saveDictionariesToStorage(newDictionaries);
  }, []);

  const activeDictionary = useMemo(() => {
    return dictionaries.find(d => d.id === activeDictionaryId) || null;
  }, [dictionaries, activeDictionaryId]);

  const setActiveDictionary = useCallback((dictionaryId: string | null) => {
    setActiveDictionaryId(dictionaryId);
     if (dictionaryId) {
        localStorage.setItem('lingoLearn_lastActiveDict', dictionaryId);
     }
  }, []);

  const createDictionary = useCallback(async (name: string, sourceLanguage: string, targetLanguage: string) => {
    const newDictionary: Dictionary = {
        id: Date.now().toString(),
        name,
        sourceLanguage,
        targetLanguage,
        words: [],
    };
    const newDictionaries = [...dictionaries, newDictionary];
    persistData(newDictionaries);
    if (dictionaries.length === 0) {
        setActiveDictionary(newDictionary.id);
    }
  }, [dictionaries, persistData, setActiveDictionary]);

  const deleteDictionary = useCallback(async (dictionaryId: string) => {
    const newDictionaries = dictionaries.filter(d => d.id !== dictionaryId);
    if (activeDictionaryId === dictionaryId) {
        const newActiveId = newDictionaries.length > 0 ? newDictionaries[0].id : null;
        setActiveDictionary(newActiveId);
    }
    persistData(newDictionaries);
  }, [dictionaries, activeDictionaryId, persistData, setActiveDictionary]);

  const addWord = useCallback(async (wordDetails: Omit<Word, 'id' | 'masteryLevel' | 'lastReviewed'>) => {
    if (!activeDictionaryId) return;
    const newWord: Word = {
        ...wordDetails,
        id: Date.now().toString(),
        masteryLevel: 0,
        lastReviewed: null,
    };
    const newDictionaries = dictionaries.map(d =>
        d.id === activeDictionaryId ? { ...d, words: [newWord, ...d.words] } : d
    );
    persistData(newDictionaries);
  }, [dictionaries, activeDictionaryId, persistData]);

  const updateWordMastery = useCallback(async (wordId: string, isCorrect: boolean) => {
    if (!activeDictionaryId) return;
    const newDictionaries = dictionaries.map(d => {
        if (d.id === activeDictionaryId) {
            return {
                ...d,
                words: d.words.map(w => {
                    if (w.id === wordId) {
                        const newLevel = isCorrect
                            ? Math.min(w.masteryLevel + 1, MAX_MASTERY_LEVEL)
                            : Math.max(w.masteryLevel - 1, 0);
                        return { ...w, masteryLevel: newLevel, lastReviewed: new Date().toISOString() };
                    }
                    return w;
                })
            };
        }
        return d;
    });
    persistData(newDictionaries);
  }, [dictionaries, activeDictionaryId, persistData]);

  const deleteWord = useCallback(async (wordId: string) => {
    if (!activeDictionaryId) return;
    const newDictionaries = dictionaries.map(d =>
        d.id === activeDictionaryId ? { ...d, words: d.words.filter(w => w.id !== wordId) } : d
    );
    persistData(newDictionaries);
  }, [dictionaries, activeDictionaryId, persistData]);

  const updateWord = useCallback(async (wordId: string, updatedDetails: { translatedWord: string; exampleSentence: string; }) => {
    if (!activeDictionaryId) return;
    const newDictionaries = dictionaries.map(d =>
        d.id === activeDictionaryId
        ? { ...d, words: d.words.map(w => w.id === wordId ? { ...w, ...updatedDetails } : w) }
        : d
    );
    persistData(newDictionaries);
  }, [dictionaries, activeDictionaryId, persistData]);

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
      if (!activeDictionary) throw new Error("No active dictionary selected.");

      const { sourceLanguage, targetLanguage } = activeDictionary;
      const wordsToImport = wordListText.split('\n').map(w => w.trim().toLowerCase()).filter(Boolean);
      const uniqueWords = [...new Set(wordsToImport)];

      let successful = 0;
      let failed = 0;
      const errors: string[] = [];
      const addedWords: Word[] = [];

      for (let i = 0; i < uniqueWords.length; i++) {
          const word = uniqueWords[i];
          onProgress({ current: i + 1, total: uniqueWords.length, word });

          if (activeDictionary.words.some(w => w.sourceWord.toLowerCase() === word)) {
              console.log(`Skipping duplicate: ${word}`);
              continue;
          }

          try {
              const details = await fetchWordDetails(word, sourceLanguage, targetLanguage);
              const newWord: Word = {
                  sourceWord: word,
                  ...details,
                  id: `${Date.now()}-${i}`,
                  masteryLevel: 0,
                  lastReviewed: null,
              };
              addedWords.push(newWord);
              successful++;
          } catch (error: any) {
              failed++;
              errors.push(`"${word}": ${error.message || 'Unknown error'}`);
          }
      }

      if (addedWords.length > 0) {
        const newDictionaries = dictionaries.map(d =>
            d.id === activeDictionary.id ? { ...d, words: [...addedWords, ...d.words] } : d
        );
        persistData(newDictionaries);
      }

      return { successful, failed, errors };
  }, [activeDictionary, dictionaries, persistData]);
  
  const deleteAllData = useCallback(() => {
    persistData([]);
    setActiveDictionaryId(null);
    localStorage.removeItem('lingoLearn_lastActiveDict');
  }, [persistData]);

  const words = activeDictionary?.words || [];
  const totalMastery = words.reduce((sum, word) => sum + word.masteryLevel, 0);
  const maxPossibleMastery = words.length * MAX_MASTERY_LEVEL;

  return {
    dictionaries,
    activeDictionary,
    setActiveDictionary,
    createDictionary,
    deleteDictionary,
    deleteAllData,
    words,
    addWord,
    updateWordMastery,
    getWordsForQuiz,
    totalMastery,
    maxPossibleMastery,
    deleteWord,
    updateWord,
    importWords,
    isLoading: false, // No more API loading
    error: null,
  };
}