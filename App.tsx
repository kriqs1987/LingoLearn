import React, { useState, useCallback, useContext } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import QuizView from './components/QuizView';
import ManageWordsView from './components/ManageWordsView';
import NavBar from './components/NavBar';
import LoginView from './components/LoginView';
import LanguageSelector from './components/LanguageSelector';
import { AppView, QuizQuestion, User } from './types';
import { fetchWordDetails } from './services/geminiService';
import { useWordBank } from './hooks/useWordBank';
import { AuthContext, AuthProvider } from './contexts/AuthContext';
import { SUPPORTED_LANGUAGES } from './constants';
import { LogoutIcon } from './components/Icons';

const AppContent: React.FC = () => {
  const { user, logout } = useContext(AuthContext);
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [currentLanguage, setCurrentLanguage] = useState(SUPPORTED_LANGUAGES[0]);
  
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQuizResult, setLastQuizResult] = useState<{correct: number, total: number} | null>(null);

  const {
    words,
    addWord,
    updateWordMastery,
    getWordsForQuiz,
    totalMastery,
    maxPossibleMastery,
    deleteWord,
    updateWord,
  } = useWordBank(user?.username || null, currentLanguage);

  const handleAddNewWord = useCallback(async (word: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const details = await fetchWordDetails(word, currentLanguage);
      addWord({
        english: word,
        ...details
      });
    } catch (e: any) {
      setError(e.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [addWord, currentLanguage]);

  const shuffleArray = <T,>(array: T[]): T[] => {
    return array.sort(() => Math.random() - 0.5);
  };
  
  const handleStartQuiz = useCallback(() => {
    const quizWords = getWordsForQuiz();
    if (quizWords.length > 0) {
      const questions = quizWords.map(wordToQuiz => {
        const distractors = words
          .filter(w => w.id !== wordToQuiz.id)
          .map(w => w.translation);
        
        const shuffledDistractors = shuffleArray(distractors).slice(0, 3);
        const options = shuffleArray([wordToQuiz.translation, ...shuffledDistractors]);
        
        return {
          word: wordToQuiz,
          options,
          correctAnswer: wordToQuiz.translation
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

  const handleNavigate = (view: AppView) => {
    setError(null);
    setLastQuizResult(null);
    setCurrentView(view);
  }

  if (!user) {
    return <LoginView />;
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
            username={user.username}
            currentLanguage={currentLanguage}
          />
        );
      case AppView.MANAGE_WORDS:
        return (
          <ManageWordsView
            words={words}
            onAddWord={handleAddNewWord}
            onDeleteWord={deleteWord}
            onUpdateWord={updateWord}
            isLoading={isLoading}
            error={error}
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
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <Header>
          <LanguageSelector
            currentLanguage={currentLanguage}
            onLanguageChange={setCurrentLanguage}
          />
          <button onClick={logout} className="p-2 text-slate-500 hover:text-red-500 transition-colors" aria-label="Logout">
              <LogoutIcon className="w-6 h-6" />
          </button>
      </Header>
      <main className="container mx-auto p-4 md:p-6 pb-20">
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
    </div>
  );
};

const App: React.FC = () => (
    <AuthProvider>
        <AppContent />
    </AuthProvider>
);


export default App;
