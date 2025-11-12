import { useState, useEffect, useCallback, useMemo } from 'react';
import { Word, Dictionary, User } from '../types';
import { MAX_MASTERY_LEVEL, QUIZ_SESSION_LENGTH } from '../constants';
import { fetchWordDetails } from '../services/geminiService';
import { apiService } from '../services/apiService';

export function useWordBank(user: User | null, token: string | null) {
  const [dictionaries, setDictionaries] = useState<Dictionary[]>([]);
  const [activeDictionaryId, setActiveDictionaryId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all user data when user logs in
  useEffect(() => {
    const loadInitialData = async () => {
      if (user && token) {
        setIsLoading(true);
        setError(null);
        try {
          const userDictionaries = await apiService.getDictionaries(token);
          setDictionaries(userDictionaries);
          if (userDictionaries.length > 0) {
            // Try to load last active dictionary from local storage for better UX
            const lastActiveId = localStorage.getItem(`lingoLearn_lastActiveDict_${user.username}`);
            if (lastActiveId && userDictionaries.some(d => d.id === lastActiveId)) {
               setActiveDictionaryId(lastActiveId);
            } else {
               setActiveDictionaryId(userDictionaries[0].id);
            }
          } else {
            setActiveDictionaryId(null);
          }
        } catch (err: any) {
          setError(err.message || 'Failed to load your dictionaries.');
        } finally {
          setIsLoading(false);
        }
      } else {
        // Clear data on logout
        setDictionaries([]);
        setActiveDictionaryId(null);
      }
    };
    loadInitialData();
  }, [user, token]);
  
  const activeDictionary = useMemo(() => {
    return dictionaries.find(d => d.id === activeDictionaryId) || null;
  }, [dictionaries, activeDictionaryId]);
  
  const setActiveDictionary = useCallback((dictionaryId: string | null) => {
    setActiveDictionaryId(dictionaryId);
     if (user && dictionaryId) {
        localStorage.setItem(`lingoLearn_lastActiveDict_${user.username}`, dictionaryId);
     }
  }, [user]);

  const createDictionary = useCallback(async (name: string, sourceLanguage: string, targetLanguage: string) => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
        const newDictionary = await apiService.createDictionary(token, { name, sourceLanguage, targetLanguage });
        setDictionaries(prev => [...prev, newDictionary]);
        // If it's the first dictionary, make it active
        if (dictionaries.length === 0) {
            setActiveDictionary(newDictionary.id);
        }
    } catch(err: any) {
        setError(err.message || 'Failed to create dictionary.');
    } finally {
        setIsLoading(false);
    }
  }, [token, dictionaries.length]);
  
  const deleteDictionary = useCallback(async (dictionaryId: string) => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
        await apiService.deleteDictionary(token, dictionaryId);
        setDictionaries(prev => {
            const newDictionaries = prev.filter(d => d.id !== dictionaryId);
            if (activeDictionaryId === dictionaryId) {
                const newActiveId = newDictionaries.length > 0 ? newDictionaries[0].id : null;
                setActiveDictionary(newActiveId);
            }
            return newDictionaries;
        });
    } catch(err: any) {
        setError(err.message || 'Failed to delete dictionary.');
    } finally {
        setIsLoading(false);
    }
  }, [token, activeDictionaryId]);
  
  const addWord = useCallback(async (wordDetails: Omit<Word, 'id' | 'masteryLevel' | 'lastReviewed'>) => {
    if (!token || !activeDictionaryId) return;
    setIsLoading(true);
    setError(null);
    try {
        const newWord = await apiService.addWord(token, activeDictionaryId, wordDetails);
        setDictionaries(prev => prev.map(d => 
            d.id === activeDictionaryId ? { ...d, words: [newWord, ...d.words] } : d
        ));
    } catch (err: any) {
        setError(err.message);
        throw err; // Re-throw to be caught by the calling component
    } finally {
        setIsLoading(false);
    }
  }, [token, activeDictionaryId]);

  const updateWordMastery = useCallback(async (wordId: string, isCorrect: boolean) => {
    if (!token || !activeDictionaryId) return;
    try {
        const updatedWord = await apiService.updateWordMastery(token, wordId, isCorrect);
        setDictionaries(prev => prev.map(d => 
            d.id === activeDictionaryId 
            ? { ...d, words: d.words.map(w => w.id === wordId ? updatedWord : w) } 
            : d
        ));
    } catch (err: any) {
        console.error("Failed to update mastery:", err.message);
        // This is a background update, so we don't set a global error
    }
  }, [token, activeDictionaryId]);

  const deleteWord = useCallback(async (wordId: string) => {
    if (!token || !activeDictionaryId) return;
    try {
        await apiService.deleteWord(token, wordId);
        setDictionaries(prev => prev.map(d =>
            d.id === activeDictionaryId ? { ...d, words: d.words.filter(w => w.id !== wordId) } : d
        ));
    } catch(err: any) {
        setError(err.message || 'Failed to delete word.');
    }
  }, [token, activeDictionaryId]);

  const updateWord = useCallback(async (wordId: string, updatedDetails: { translatedWord: string; exampleSentence: string; }) => {
    if (!token || !activeDictionaryId) return;
    try {
        const updatedWord = await apiService.updateWord(token, wordId, updatedDetails);
         setDictionaries(prev => prev.map(d => 
            d.id === activeDictionaryId 
            ? { ...d, words: d.words.map(w => w.id === wordId ? updatedWord : w) } 
            : d
        ));
    } catch(err: any) {
        setError(err.message || 'Failed to update word.');
    }
  }, [token, activeDictionaryId]);
  
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
      if (!activeDictionary || !token) throw new Error("No active dictionary or auth token.");

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
              const newWord = await apiService.addWord(token, activeDictionary.id, { sourceWord: word, ...details });
              addedWords.push(newWord);
              successful++;
          } catch (error: any) {
              failed++;
              errors.push(`"${word}": ${error.message || 'Unknown error'}`);
          }
      }

      if (addedWords.length > 0) {
        setDictionaries(prev => prev.map(d =>
            d.id === activeDictionary.id ? { ...d, words: [...addedWords, ...d.words] } : d
        ));
      }
      
      return { successful, failed, errors };
  }, [activeDictionary, token]);

  const words = activeDictionary?.words || [];
  const totalMastery = words.reduce((sum, word) => sum + word.masteryLevel, 0);
  const maxPossibleMastery = words.length * MAX_MASTERY_LEVEL;

  return { 
    dictionaries,
    activeDictionary,
    setActiveDictionary,
    createDictionary,
    deleteDictionary,
    words,
    addWord,
    updateWordMastery,
    getWordsForQuiz,
    totalMastery,
    maxPossibleMastery,
    deleteWord,
    updateWord,
    importWords,
    isLoading,
    error
  };
}
