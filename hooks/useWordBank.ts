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

/**
 * A simple CSV line parser that handles quoted fields.
 * This is designed to work with the format exported by this application.
 */
const parseCsvLine = (line: string): string[] => {
    const regex = /(?:"([^"]*(?:""[^"]*)*)"|([^,]*))(,|$)/g;
    const fields: string[] = [];
    let match;
    // eslint-disable-next-line no-cond-assign
    while ((match = regex.exec(line))) {
        let value = match[1] !== undefined ? match[1].replace(/""/g, '"') : match[2];
        fields.push(value.trim());
        if (match[3] === '') break;
    }
    return fields;
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
  
    const importFromCSV = useCallback(async (
        csvText: string
    ): Promise<{ successful: number; failed: number, errors: string[] }> => {
        if (!activeDictionary) throw new Error("No active dictionary selected.");

        const lines = csvText.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length < 2) {
            return { successful: 0, failed: 0, errors: ["CSV file is empty or contains only a header."] };
        }

        const headerLine = lines.shift()!;
        const headers = parseCsvLine(headerLine).map(h => h.toLowerCase().trim());
        const expectedHeaders = ["sourceword", "translatedword", "definition", "examplesentence", "masterylevel", "lastreviewed"];

        const hasAllHeaders = expectedHeaders.every(h => headers.includes(h));
        if (!hasAllHeaders) {
            return { successful: 0, failed: 0, errors: [`Invalid CSV header. Expected columns: ${expectedHeaders.join(', ')}`] };
        }

        const sourceWordIndex = headers.indexOf("sourceword");
        const translatedWordIndex = headers.indexOf("translatedword");
        const definitionIndex = headers.indexOf("definition");
        const exampleSentenceIndex = headers.indexOf("examplesentence");
        const masteryLevelIndex = headers.indexOf("masterylevel");
        const lastReviewedIndex = headers.indexOf("lastreviewed");

        let successful = 0;
        let failed = 0;
        const errors: string[] = [];
        const addedWords: Word[] = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const values = parseCsvLine(line);
            
            if (values.length < headers.length) {
                failed++;
                errors.push(`Row ${i + 2}: Incorrect number of columns.`);
                continue;
            }

            const sourceWord = values[sourceWordIndex];

            if (!sourceWord) {
                failed++;
                errors.push(`Row ${i + 2}: Missing source word.`);
                continue;
            }

            if (activeDictionary.words.some(w => w.sourceWord.toLowerCase() === sourceWord.toLowerCase())) {
                console.log(`Skipping duplicate from CSV: ${sourceWord}`);
                continue;
            }

            try {
                const masteryLevel = parseInt(values[masteryLevelIndex], 10);
                if (isNaN(masteryLevel) || masteryLevel < 0 || masteryLevel > MAX_MASTERY_LEVEL) {
                    throw new Error(`Invalid mastery level: ${values[masteryLevelIndex]}. Must be a number between 0 and ${MAX_MASTERY_LEVEL}.`);
                }

                const lastReviewedRaw = values[lastReviewedIndex];
                const lastReviewed = lastReviewedRaw && !isNaN(new Date(lastReviewedRaw).getTime()) ? new Date(lastReviewedRaw).toISOString() : null;

                const newWord: Word = {
                    id: `${Date.now()}-${i}`,
                    sourceWord: sourceWord,
                    translatedWord: values[translatedWordIndex] || '',
                    definition: values[definitionIndex] || '',
                    exampleSentence: values[exampleSentenceIndex] || '',
                    masteryLevel: masteryLevel,
                    lastReviewed: lastReviewed,
                };
                addedWords.push(newWord);
                successful++;
            } catch (error: any) {
                failed++;
                errors.push(`Row ${i + 2} ("${sourceWord}"): ${error.message || 'Invalid data.'}`);
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
    
    const importExamples = useCallback(async (
        examplesText: string
    ): Promise<{ successful: number; failed: number, errors: string[] }> => {
        if (!activeDictionary) throw new Error("No active dictionary selected.");

        const blocks = examplesText.trim().split(/\n\s*\n/);
        let successful = 0;
        let failed = 0;
        const errors: string[] = [];
        const addedWords: Word[] = [];

        for (let i = 0; i < blocks.length; i++) {
            const block = blocks[i];
            const lines = block.split('\n').map(l => l.trim()).filter(Boolean);

            if (lines.length !== 3) {
                failed++;
                errors.push(`Example ${i + 1}: Must contain exactly 3 non-empty lines. Found ${lines.length}.`);
                continue;
            }

            const [sourceWord, translatedWord, exampleSentence] = lines;
            
             if (activeDictionary.words.some(w => w.sourceWord.toLowerCase() === sourceWord.toLowerCase())) {
                console.log(`Skipping duplicate example: ${sourceWord}`);
                continue;
            }

            try {
                 const newWord: Word = {
                    id: `${Date.now()}-${i}`,
                    sourceWord,
                    translatedWord,
                    exampleSentence,
                    definition: '', // No definition in this import type
                    masteryLevel: 0,
                    lastReviewed: null,
                };
                addedWords.push(newWord);
                successful++;
            } catch (error: any) {
                 failed++;
                 errors.push(`Example ${i + 1} ("${sourceWord}"): ${error.message || 'Invalid data.'}`);
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
    importFromCSV,
    importExamples,
    isLoading: false, // No more API loading
    error: null,
  };
}