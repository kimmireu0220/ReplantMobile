import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { diaryVerificationService } from '../services/diaryVerificationService';
import { handleError } from '../utils/ErrorHandler';

export const useDiaryVerification = () => {
  const navigate = useNavigate();
  
  // 상태 관리
  const [isChecking, setIsChecking] = useState(false);
  const [diaryStatus, setDiaryStatus] = useState(null);
  const [error, setError] = useState(null);
  
  // 반응형 상태
  const [screenSize, setScreenSize] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false
  });
  
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
  
  // 일기 완료 확인
  const checkDiaryCompletion = useCallback(async (missionId) => {
    try {
      setIsChecking(true);
      setError(null);
      
      const isCompleted = await diaryVerificationService.checkDiaryCompletion(missionId);
      setDiaryStatus(isCompleted ? 'completed' : 'not_completed');
      
      return isCompleted;
    } catch (error) {
      const processedError = handleError(error, '일기 완료 확인');
      setError(processedError.message);
      setDiaryStatus('error');
      throw error;
    } finally {
      setIsChecking(false);
    }
  }, []);
  
  // 미션 완료 처리
  const completeMission = useCallback(async (missionId) => {
    try {
      setError(null);
      
      const result = await diaryVerificationService.completeDiaryMission(missionId);
      setDiaryStatus('completed');
      
      return result;
    } catch (error) {
      const processedError = handleError(error, '미션 완료 처리');
      setError(processedError.message);
      throw error;
    }
  }, []);
  
  // 일기 페이지로 이동
  const navigateToDiary = useCallback(() => {
    try {
      navigate('/diary');
    } catch (error) {
      console.error('일기 페이지 이동 실패:', error);
      setError('일기 페이지로 이동할 수 없습니다.');
    }
  }, [navigate]);
  
  // 에러 초기화
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // 상태 초기화
  const resetState = useCallback(() => {
    setIsChecking(false);
    setDiaryStatus(null);
    setError(null);
  }, []);
  
  return {
    // 상태
    isChecking,
    diaryStatus,
    error,
    screenSize,
    
    // 액션
    checkDiaryCompletion,
    completeMission,
    navigateToDiary,
    clearError,
    resetState
  };
};
