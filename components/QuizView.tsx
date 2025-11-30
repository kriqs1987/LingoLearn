import React, { useState, useEffect, useRef } from 'react';
import { QuizQuestion, QuizMode } from '../types';
import { CheckIcon, XIcon } from './Icons';

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

const QuizView: React.FC<QuizViewProps> = ({ quizQuestions, onFinishQuiz, onAnswer }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answerState, setAnswerState] = useState<AnswerState>('unanswered');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentQuestion = quizQuestions[currentQuestionIndex];

  useEffect(() => {
    setAnswerState('unanswered');
    setSelectedAnswer(null);
    setTypedAnswer('');
    // Focus input automatically if it's a typing question
    if (currentQuestion.mode === QuizMode.TYPE_SOURCE) {
        setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
    }
  }, [currentQuestionIndex, currentQuestion.mode]);

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

      onAnswer(currentQuestion.word.id, isCorrect);

      setTimeout(() => {
          if (currentQuestionIndex < quizQuestions.length - 1) {
              setCurrentQuestionIndex(prev => prev + 1);
          } else {
              onFinishQuiz({ correct: correctAnswers + (isCorrect ? 1 : 0), total: quizQuestions.length });
          }
      }, 2000);
  };
  
  const getButtonClass = (option: string) => {
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

  // Helper to mask the source word in the example sentence if we are testing for the source word
  const getDisplayExample = () => {
      if (!currentQuestion.word.exampleSentence) return null;

      if (currentQuestion.mode === QuizMode.SELECT_TRANSLATION) {
          // Normal mode (Apple -> Jabłko): Show full sentence "I eat an apple"
          return currentQuestion.word.exampleSentence;
      } else {
          // Reverse modes (Jabłko -> Apple): Mask "apple" in "I eat an apple"
          const sentence = currentQuestion.word.exampleSentence;
          const wordToMask = escapeRegExp(currentQuestion.word.sourceWord);
          
          // Create a regex to replace the word case-insensitively
          // \b checks for word boundaries to avoid replacing substrings (e.g. "cat" in "category")
          const regex = new RegExp(`\\b${wordToMask}\\b`, 'gi');
          return sentence.replace(regex, '______');
      }
  };

  const getQuestionInstruction = () => {
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

  const isTypingMode = currentQuestion.mode === QuizMode.TYPE_SOURCE;
  const displayExample = getDisplayExample();

  return (
    <div className="w-full max-w-2xl mx-auto p-4 md:p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl space-y-8">
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Question {currentQuestionIndex + 1} of {quizQuestions.length}</p>
        <div className="mt-4 w-full bg-slate-200 rounded-full h-2.5 dark:bg-slate-700">
            <div className="bg-sky-500 h-2.5 rounded-full" style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}></div>
        </div>
      </div>

      <div className="text-center space-y-2">
        <p className="text-lg text-slate-600 dark:text-slate-300">{getQuestionInstruction()}</p>
        <h2 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white mb-4">{currentQuestion.questionText}</h2>
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