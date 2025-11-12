import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import QuizView from './components/QuizView';
import ManageWordsView from './components/ManageWordsView';
import NavBar from './components/NavBar';
import ImportModal from './components/ImportModal';
import { AppView, QuizQuestion, Word } from './types';
import { fetchWordDetails } from './services/geminiService';
import { useWordBank } from './hooks/useWordBank';
import SettingsView from './components/SettingsView';
import { LOCAL_STORAGE_API_KEY } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [isAddingWord, setIsAddingWord] = useState(false);
  const [addWordError, setAddWordError] = useState<string | null>(null);
  const [lastQuizResult, setLastQuizResult] = useState<{correct: number, total: number} | null>(null);
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(localStorage.getItem(LOCAL_STORAGE_API_KEY));

  const {
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
  } = useWordBank();
  
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === LOCAL_STORAGE_API_KEY) {
        setApiKey(event.newValue);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleApiKeySave = (newKey: string) => {
    localStorage.setItem(LOCAL_STORAGE_API_KEY, newKey);
    setApiKey(newKey);
    alert("API Key saved successfully!");
    setCurrentView(AppView.DASHBOARD);
  };

  const handleDeleteAllData = () => {
    if (window.confirm("Are you sure you want to delete all your dictionaries and words? This action cannot be undone.")) {
      deleteAllData();
      alert("All data has been deleted.");
    }
  };

  const handleAddNewWord = useCallback(async (word: string) => {
    if (!activeDictionary) {
        setAddWordError("Please select a dictionary first.");
        return;
    }
    setIsAddingWord(true);
    setAddWordError(null);
    try {
      const { sourceLanguage, targetLanguage } = activeDictionary;
      const details = await fetchWordDetails(word, sourceLanguage, targetLanguage);
      await addWord({
        sourceWord: word,
        ...details
      });
    } catch (e: any) {
      setAddWordError(e.message || "An unknown error occurred.");
    } finally {
      setIsAddingWord(false);
    }
  }, [addWord, activeDictionary]);

  const shuffleArray = <T,>(array: T[]): T[] => {
    return array.sort(() => Math.random() - 0.5);
  };
  
  const handleStartQuiz = useCallback(() => {
    const quizWords = getWordsForQuiz();
    if (quizWords.length > 0) {
      const questions = quizWords.map(wordToQuiz => {
        const distractors = words
          .filter(w => w.id !== wordToQuiz.id)
          .map(w => w.translatedWord);
        
        const shuffledDistractors = shuffleArray(distractors).slice(0, 3);
        const options = shuffleArray([wordToQuiz.translatedWord, ...shuffledDistractors]);
        
        return {
          word: wordToQuiz,
          options,
          correctAnswer: wordToQuiz.translatedWord
        };
      });
      setQuizQuestions(questions);
      setCurrentView(AppView.QUIZ);
      setLastQuizResult(null);
    }
  }, [getWordsForQuiz, words]);

  const handleFinishQuiz = useCallback((results: { correct: number, total: number }) => {
    setLastQuizResult(results);
    setCurrentView(AppView.DASHBOARD);
  }, []);
  
  const handleExportDictionary = () => {
    if (!activeDictionary || activeDictionary.words.length === 0) {
        alert("No words to export in the current dictionary.");
        return;
    }

    const headers = ["sourceWord", "translatedWord", "definition", "exampleSentence", "masteryLevel", "lastReviewed"];
    const csvContent = [
        headers.join(','),
        ...activeDictionary.words.map(word =>
            [
                `"${word.sourceWord.replace(/"/g, '""')}"`,
                `"${word.translatedWord.replace(/"/g, '""')}"`,
                `"${word.definition.replace(/"/g, '""')}"`,
                `"${word.exampleSentence.replace(/"/g, '""')}"`,
                word.masteryLevel,
                `"${word.lastReviewed || ''}"`
            ].join(',')
        )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${activeDictionary.name}_export.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNavigate = (view: AppView) => {
    setAddWordError(null);
    setLastQuizResult(null);
    setCurrentView(view);
  }
  
  const renderContent = () => {
    switch(currentView) {
      case AppView.DASHBOARD:
        return (
          <Dashboard
            words={words}
            totalMastery={totalMastery}
            maxPossibleMastery={maxPossibleMastery}
            onStartQuiz={handleStartQuiz}
            activeDictionary={activeDictionary}
          />
        );
      case AppView.MANAGE_WORDS:
        return (
          <ManageWordsView
            dictionaries={dictionaries}
            activeDictionary={activeDictionary}
            createDictionary={createDictionary}
            deleteDictionary={deleteDictionary}
            setActiveDictionary={setActiveDictionary}
            onAddWord={handleAddNewWord}
            onDeleteWord={deleteWord}
            onUpdateWord={updateWord}
            isLoading={isAddingWord}
            error={addWordError}
            onOpenImportModal={() => setImportModalOpen(true)}
            onExportDictionary={handleExportDictionary}
          />
        );
      case AppView.QUIZ:
        return (
          <QuizView
            quizQuestions={quizQuestions}
            onFinishQuiz={handleFinishQuiz}
            onAnswer={updateWordMastery}
          />
        );
      case AppView.SETTINGS:
        return <SettingsView onSave={handleApiKeySave} onDeleteAllData={handleDeleteAllData} />;
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <Header />
      <main className="container mx-auto p-4 md:p-6 pb-20">
        {!apiKey && currentView !== AppView.SETTINGS && (
           <div className="bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-200 p-4 rounded-lg mb-6" role="alert">
            <p className="font-bold">Action Required</p>
            <p>Please set your Gemini API key in the <button onClick={() => setCurrentView(AppView.SETTINGS)} className="font-bold underline hover:text-yellow-800 dark:hover:text-yellow-100">Settings</button> tab to enable AI features.</p>
          </div>
        )}
        {lastQuizResult && currentView === AppView.DASHBOARD && (
          <div className="bg-sky-100 dark:bg-sky-900 border-l-4 border-sky-500 text-sky-700 dark:text-sky-200 p-4 rounded-lg mb-6" role="alert">
            <p className="font-bold">Quiz Complete!</p>
            <p>You scored {lastQuizResult.correct} out of {lastQuizResult.total}. Keep practicing!</p>
          </div>
        )}
        {renderContent()}
      </main>
      {currentView !== AppView.QUIZ && (
         <NavBar currentView={currentView} onNavigate={handleNavigate} />
      )}
      {isImportModalOpen && activeDictionary && (
        <ImportModal
            dictionaryName={activeDictionary.name}
            onClose={() => setImportModalOpen(false)}
            onImport={importWords}
        />
      )}
    </div>
  );
};

export default App;