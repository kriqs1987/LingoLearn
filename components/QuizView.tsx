
import React, { useState, useEffect } from 'react';
import { QuizQuestion, Word } from '../types';
import { CheckIcon, XIcon } from './Icons';

interface QuizViewProps {
  quizQuestions: QuizQuestion[];
  onFinishQuiz: (results: { correct: number, total: number }) => void;
  onAnswer: (wordId: string, isCorrect: boolean) => void;
}

type AnswerState = 'unanswered' | 'correct' | 'incorrect';

const QuizView: React.FC<QuizViewProps> = ({ quizQuestions, onFinishQuiz, onAnswer }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answerState, setAnswerState] = useState<AnswerState>('unanswered');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  
  const currentQuestion = quizQuestions[currentQuestionIndex];

  useEffect(() => {
    // Reset state when question changes
    setAnswerState('unanswered');
    setSelectedAnswer(null);
  }, [currentQuestionIndex]);

  const handleAnswerClick = (option: string) => {
    if (answerState !== 'unanswered') return;

    const isCorrect = option === currentQuestion.correctAnswer;
    setSelectedAnswer(option);

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
    }, 1500);
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

  return (
    <div className="w-full max-w-2xl mx-auto p-4 md:p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl space-y-8">
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Question {currentQuestionIndex + 1} of {quizQuestions.length}</p>
        <div className="mt-4 w-full bg-slate-200 rounded-full h-2.5 dark:bg-slate-700">
            <div className="bg-sky-500 h-2.5 rounded-full" style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}></div>
        </div>
      </div>

      <div className="text-center space-y-2">
        <p className="text-lg text-slate-600 dark:text-slate-300">What is the translation of:</p>
        <h2 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white">{currentQuestion.word.english}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentQuestion.options.map(option => (
          <button
            key={option}
            onClick={() => handleAnswerClick(option)}
            disabled={answerState !== 'unanswered'}
            className={`p-4 rounded-lg text-lg font-semibold border-2 border-slate-200 dark:border-slate-600 w-full text-left transition duration-300 ease-in-out flex items-center justify-between ${getButtonClass(option)}`}
          >
            <span>{option}</span>
            {answerState !== 'unanswered' && option === currentQuestion.correctAnswer && <CheckIcon className="w-6 h-6" />}
            {answerState !== 'unanswered' && option === selectedAnswer && option !== currentQuestion.correctAnswer && <XIcon className="w-6 h-6" />}
          </button>
        ))}
      </div>
      
      {answerState === 'incorrect' && (
          <div className="text-center p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <p className="font-semibold text-green-800 dark:text-green-200">Correct answer: {currentQuestion.correctAnswer}</p>
          </div>
      )}
    </div>
  );
};

export default QuizView;
