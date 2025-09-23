import { useState, useCallback, useRef } from 'react';
import { quizService } from '../services/quizService';
import { getQuizByMissionId } from '../data/quizQuestions';
import { handleError } from '../utils/ErrorHandler';

export const useQuiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  /**
   * 퀴즈 시작
   */
  const startQuiz = useCallback((missionId) => {
    const quiz = getQuizByMissionId(missionId);
    if (!quiz) {
      setError('퀴즈를 찾을 수 없습니다.');
      return null;
    }

    setCurrentQuestion(0);
    setAnswers(new Array(quiz.questions.length).fill(null));
    setIsCompleted(false);
    setScore(null);
    setError(null);
    setTimeSpent(0);
    setIsTimerRunning(true);
    startTimeRef.current = Date.now();

    // 타이머 시작
    timerRef.current = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return quiz;
  }, []);

  /**
   * 답변 선택
   */
  const selectAnswer = useCallback((answerIndex) => {
    setAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[currentQuestion] = answerIndex;
      return newAnswers;
    });
  }, [currentQuestion]);

  /**
   * 다음 문제로 이동
   */
  const nextQuestion = useCallback(() => {
    setCurrentQuestion(prev => prev + 1);
  }, []);

  /**
   * 이전 문제로 이동
   */
  const prevQuestion = useCallback(() => {
    setCurrentQuestion(prev => Math.max(0, prev - 1));
  }, []);

  /**
   * 특정 문제로 이동
   */
  const goToQuestion = useCallback((questionIndex) => {
    setCurrentQuestion(questionIndex);
  }, []);

  /**
   * 퀴즈 제출 (무조건 완료)
   */
  const submitQuiz = useCallback(async (missionId) => {
    try {
      setIsLoading(true);
      setError(null);

      // 타이머 정지
      if (timerRef.current) {
        clearInterval(timerRef.current);
        setIsTimerRunning(false);
      }

      const result = await quizService.completeQuiz(missionId);
      
      setIsCompleted(true);
      setScore(100); // 무조건 만점 처리
      return result;

    } catch (error) {
      const errorMessage = handleError(error);
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 퀴즈 재시작
   */
  const restartQuiz = useCallback((missionId) => {
    // 타이머 정지
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return startQuiz(missionId);
  }, [startQuiz]);

  /**
   * 퀴즈 종료
   */
  const endQuiz = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      setIsTimerRunning(false);
    }
    
    setCurrentQuestion(0);
    setAnswers([]);
    setIsCompleted(false);
    setScore(null);
    setError(null);
    setTimeSpent(0);
  }, []);

  /**
   * 진행률 계산
   */
  const getProgress = useCallback(() => {
    const quiz = getQuizByMissionId();
    if (!quiz) return 0;
    
    const answeredCount = answers.filter(answer => answer !== null).length;
    return Math.round((answeredCount / quiz.questions.length) * 100);
  }, [answers]);

  /**
   * 남은 시간 계산
   */
  const getRemainingTime = useCallback((timeLimit) => {
    return Math.max(0, timeLimit - timeSpent);
  }, [timeSpent]);

  /**
   * 시간 포맷팅
   */
  const formatTime = useCallback((seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  /**
   * 모든 문제 답변 완료 여부
   */
  const isAllAnswered = useCallback(() => {
    return answers.every(answer => answer !== null);
  }, [answers]);

  /**
   * 현재 문제 답변 여부
   */
  const isCurrentQuestionAnswered = useCallback(() => {
    return answers[currentQuestion] !== null;
  }, [answers, currentQuestion]);

  return {
    // 상태
    currentQuestion,
    answers,
    isCompleted,
    score,
    isLoading,
    error,
    timeSpent,
    isTimerRunning,
    
    // 액션
    startQuiz,
    selectAnswer,
    nextQuestion,
    prevQuestion,
    goToQuestion,
    submitQuiz,
    restartQuiz,
    endQuiz,
    
    // 유틸리티
    getProgress,
    getRemainingTime,
    formatTime,
    isAllAnswered,
    isCurrentQuestionAnswered
  };
};
