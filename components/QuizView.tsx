import React, { useState, useEffect, useRef } from 'react';
import { QuizQuestion, QuizMode } from '../types';
import { CheckIcon, XIcon, ArrowDownTrayIcon } from './Icons';

interface QuizViewProps {
  quizQuestions: QuizQuestion[];
  onFinishQuiz: (results: { correct: number, total: number }) => void;
  onAnswer: (wordId: string, isCorrect: boolean) => void;
}

type AnswerState = 'unanswered' | 'correct' | 'incorrect';

// Utility to escape special characters for RegExp
const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

function shuffleArray<T>(array: T[]): T[] {
    return [...array].sort(() => Math.random() - 0.5);
}

const QuizView: React.FC<QuizViewProps> = ({ quizQuestions, onFinishQuiz, onAnswer }) => {
  const [shuffledQuestions, setShuffledQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answerState, setAnswerState] = useState<AnswerState>('unanswered');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize shuffled questions on mount
  useEffect(() => {
    setShuffledQuestions(shuffleArray([...quizQuestions]));
    setCurrentQuestionIndex(0);
    setCorrectAnswers(0);
    setQuestionsAnswered(0);
  }, [quizQuestions]);

  const currentQuestion = shuffledQuestions[currentQuestionIndex];

  // Reset state when question changes
  useEffect(() => {
    setAnswerState('unanswered');
    setSelectedAnswer(null);
    setTypedAnswer('');
    // Focus input automatically if it's a typing question
    if (currentQuestion?.mode === QuizMode.TYPE_SOURCE) {
        setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
    }
  }, [currentQuestionIndex, currentQuestion]);

  const handleFinishClick = () => {
      onFinishQuiz({ correct: correctAnswers, total: questionsAnswered });
  };

  const handleAnswerClick = (option: string) => {
    if (answerState !== 'unanswered') return;
    processAnswer(option);
  };

  const handleTypingSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (answerState !== 'unanswered') return;
      processAnswer(typedAnswer);
  };

  const processAnswer = (answer: string) => {
      if (!currentQuestion) return;

      // Normalize answer for comparison (trim whitespace and lowercase)
      const normalize = (s: string) => s.trim().toLowerCase();
      const isCorrect = normalize(answer) === normalize(currentQuestion.correctAnswer);
      
      setSelectedAnswer(answer);

      if (isCorrect) {
          setAnswerState('correct');
          setCorrectAnswers(prev => prev + 1);
      } else {
          setAnswerState('incorrect');
      }
      setQuestionsAnswered(prev => prev + 1);

      onAnswer(currentQuestion.word.id, isCorrect);

      setTimeout(() => {
          // Infinite loop logic: move to next, if end of array, reshuffle and restart
          if (currentQuestionIndex < shuffledQuestions.length - 1) {
              setCurrentQuestionIndex(prev => prev + 1);
          } else {
              setShuffledQuestions(prev => shuffleArray([...prev]));
              setCurrentQuestionIndex(0);
          }
      }, 2000);
  };
  
  const getButtonClass = (option: string) => {
    if (!currentQuestion) return '';
    if (answerState === 'unanswered') {
      return 'bg-white dark:bg-slate-700 hover:bg-sky-100 dark:hover:bg-slate-600';
    }
    if (option === currentQuestion.correctAnswer) {
      return 'bg-green-500 text-white transform scale-105';
    }
    if (option === selectedAnswer && option !== currentQuestion.correctAnswer) {
      return 'bg-red-500 text-white';
    }
    return 'bg-white dark:bg-slate-700 opacity-50 cursor-not-allowed';
  };

  const getDisplayExample = () => {
      if (!currentQuestion?.word.exampleSentence) return null;

      if (currentQuestion.mode === QuizMode.SELECT_TRANSLATION) {
          return currentQuestion.word.exampleSentence;
      } else {
          const sentence = currentQuestion.word.exampleSentence;
          const wordToMask = escapeRegExp(currentQuestion.word.sourceWord);
          const regex = new RegExp(`\\b${wordToMask}\\b`, 'gi');
          return sentence.replace(regex, '______');
      }
  };

  const getQuestionInstruction = () => {
      if (!currentQuestion) return "";
      switch (currentQuestion.mode) {
          case QuizMode.SELECT_TRANSLATION:
              return "Select the translation for:";
          case QuizMode.SELECT_SOURCE:
              return "Select the original word for:";
          case QuizMode.TYPE_SOURCE:
              return "Type the original word for:";
          default:
              return "Translate:";
      }
  };

  if (!currentQuestion) return <div className="p-10 text-center">Loading...</div>;

  const isTypingMode = currentQuestion.mode === QuizMode.TYPE_SOURCE;
  const displayExample = getDisplayExample();

  return (
    <div className="w-full max-w-2xl mx-auto p-4 md:p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl space-y-8 relative">
      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-4">
        <div className="flex gap-4">
            <div>
                 <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Score</p>
                 <p className="text-xl font-bold text-green-500">{correctAnswers}</p>
            </div>
            <div>
                 <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Reviewed</p>
                 <p className="text-xl font-bold text-sky-500">{questionsAnswered}</p>
            </div>
        </div>
        <button 
            onClick={handleFinishClick}
            className="text-sm font-bold text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 px-3 py-1.5 rounded transition"
        >
            Finish Quiz
        </button>
      </div>

      <div className="text-center space-y-2">
        <p className="text-lg text-slate-600 dark:text-slate-300">{getQuestionInstruction()}</p>
        <h2 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white mb-4 break-words">{currentQuestion.questionText}</h2>
        {displayExample && (
            <p className="text-lg text-slate-500 dark:text-slate-400 italic font-serif bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg inline-block">
                "{displayExample}"
            </p>
        )}
      </div>

      {isTypingMode ? (
           <form onSubmit={handleTypingSubmit} className="space-y-4">
                <input
                    ref={inputRef}
                    type="text"
                    value={typedAnswer}
                    onChange={(e) => setTypedAnswer(e.target.value)}
                    disabled={answerState !== 'unanswered'}
                    placeholder="Type your answer here..."
                    className={`w-full text-center text-xl p-4 rounded-lg border-2 focus:outline-none transition-colors 
                        ${answerState === 'unanswered' 
                            ? 'border-slate-300 dark:border-slate-600 focus:border-sky-500 bg-white dark:bg-slate-700' 
                            : answerState === 'correct'
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                : 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                        }`}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                />
                {answerState === 'unanswered' && (
                    <button 
                        type="submit"
                        disabled={!typedAnswer.trim()}
                        className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-6 rounded-lg transition disabled:bg-slate-400"
                    >
                        Check Answer
                    </button>
                )}
           </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options?.map(option => (
            <button
                key={option}
                onClick={() => handleAnswerClick(option)}
                disabled={answerState !== 'unanswered'}
                className={`p-4 rounded-lg border-2 w-full text-lg font-semibold text-left transition duration-300 ease-in-out flex justify-between items-center ${getButtonClass(option)} ${answerState !== 'unanswered' ? 'border-transparent' : 'border-slate-200 dark:border-slate-600'}`}
            >
                <span>{option}</span>
                {answerState !== 'unanswered' && option === currentQuestion.correctAnswer && <CheckIcon className="w-6 h-6" />}
                {answerState !== 'unanswered' && option === selectedAnswer && option !== currentQuestion.correctAnswer && <XIcon className="w-6 h-6" />}
            </button>
            ))}
        </div>
      )}
      
      {answerState === 'incorrect' && (
          <div className="text-center p-3 bg-red-100 dark:bg-red-900/30 rounded-lg animate-pulse">
              <p className="font-semibold text-red-800 dark:text-red-200">
                  Correct answer: <span className="font-bold">{currentQuestion.correctAnswer}</span>
              </p>
          </div>
      )}
      {answerState === 'correct' && (
           <div className="text-center p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <p className="font-semibold text-green-800 dark:text-green-200">
                    Correct!
                </p>
            </div>
      )}
    </div>
  );
};

export default QuizView;