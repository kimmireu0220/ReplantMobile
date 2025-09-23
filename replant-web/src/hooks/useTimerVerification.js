import { useState, useCallback, useEffect, useRef } from 'react';
import { timerVerificationService } from '../services/timerVerificationService';
import { handleError } from '../utils/ErrorHandler';

export const useTimerVerification = () => {
  // 타이머 관련 상태
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(300); // 5분 = 300초
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 반응형 상태
  const [screenSize, setScreenSize] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false
  });

  // 타이머 ref
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const pausedTimeRef = useRef(0);

  // 반응형 감지
  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      setScreenSize({
        isMobile: width <= 640,
        isTablet: width > 640 && width <= 1024,
        isDesktop: width > 1024
      });
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  // 진행률 계산
  useEffect(() => {
    const calculatedProgress = Math.min((currentTime / duration) * 100, 100);
    setProgress(calculatedProgress);
  }, [currentTime, duration]);

  // 타이머 완료 감지
  useEffect(() => {
    if (currentTime >= duration && isRunning) {
      setIsRunning(false);
      setIsCompleted(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [currentTime, duration, isRunning]);

  // 타이머 시작
  const startTimer = useCallback(async (missionId) => {
    try {
      setIsLoading(true);
      setError(null);

      // 서비스에서 세션 시작
      await timerVerificationService.startTimerSession(missionId);

      // 타이머 시작
      setIsRunning(true);
      setCurrentTime(0);
      setProgress(0);
      setIsCompleted(false);
      pausedTimeRef.current = 0;
      startTimeRef.current = Date.now();

      timerRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          return newTime;
        });
      }, 1000);

      setIsLoading(false);
    } catch (error) {
      const processedError = handleError(error, '타이머 시작');
      setError(processedError.message);
      setIsLoading(false);
      throw error;
    }
  }, []);

  // 타이머 일시정지
  const pauseTimer = useCallback(() => {
    if (isRunning && timerRef.current) {
      setIsRunning(false);
      clearInterval(timerRef.current);
      timerRef.current = null;
      pausedTimeRef.current = currentTime;
    }
  }, [isRunning, currentTime]);

  // 타이머 재시작
  const resumeTimer = useCallback(() => {
    if (!isRunning && !isCompleted && timerRef.current === null) {
      setIsRunning(true);
      startTimeRef.current = Date.now() - (pausedTimeRef.current * 1000);

      timerRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          return newTime;
        });
      }, 1000);
    }
  }, [isRunning, isCompleted]);

  // 타이머 리셋
  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsRunning(false);
    setCurrentTime(0);
    setProgress(0);
    setIsCompleted(false);
    setError(null);
    pausedTimeRef.current = 0;
    startTimeRef.current = null;
  }, []);

  // 미션 완료 처리
  const completeMission = useCallback(async (missionId) => {
    try {
      setIsLoading(true);
      setError(null);

      // 타이머 정지
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // 세션 유효성 검사
      const isValid = timerVerificationService.validateTimerSession(currentTime, duration);
      if (!isValid) {
        throw new Error('타이머 시간이 부족합니다. 최소 4분 이상 완료해야 합니다.');
      }

      // 미션 완료 처리
      const result = await timerVerificationService.completeTimerMission(missionId, currentTime);
      setIsCompleted(true);

      setIsLoading(false);
      return result;
    } catch (error) {
      const processedError = handleError(error, '미션 완료 처리');
      setError(processedError.message);
      setIsLoading(false);
      throw error;
    }
  }, [currentTime, duration]);

  // 시간 포맷팅 (분:초)
  const formatTime = useCallback((seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // 에러 초기화
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 상태 초기화
  const resetState = useCallback(() => {
    resetTimer();
    setIsLoading(false);
    setError(null);
  }, [resetTimer]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return {
    // 상태
    isRunning,
    currentTime,
    duration,
    progress,
    isCompleted,
    error,
    isLoading,
    screenSize,

    // 액션
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    completeMission,
    clearError,
    resetState,

    // 유틸리티
    formatTime
  };
};
