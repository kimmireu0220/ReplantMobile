import { useState, useCallback, useRef } from 'react';
import { stretchingService } from '../services/stretchingService';
import { handleError } from '../utils/ErrorHandler';

export const useStretching = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const timerRef = useRef(null);

  /**
   * 스트레칭 영상 정보 가져오기
   * @param {string} missionId - 미션 ID
   * @returns {Object|null} 스트레칭 영상 정보
   */
  const getStretchingVideo = useCallback((missionId) => {
    try {
      return stretchingService.getStretchingVideoByMissionId(missionId);
    } catch (error) {
      const processedError = handleError(error, '스트레칭 영상 조회');
      setError(processedError.message);
      throw error;
    }
  }, []);

  /**
   * 영상 재생 시작
   */
  const startVideo = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  }, []);

  /**
   * 영상 일시정지
   */
  const pauseVideo = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  /**
   * 영상 재시작
   */
  const restartVideo = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
      setCurrentTime(0);
      setIsCompleted(false);
    }
  }, []);

  /**
   * 영상 시간 업데이트
   */
  const updateTime = useCallback(() => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      
      setCurrentTime(current);
      setDuration(total);

      // 90% 이상 시청 시 완료 상태로 설정 (부동소수점 정밀도 문제 해결)
      const completionThreshold = total * 0.9;
      if (current >= completionThreshold && !isCompleted) {
        setIsCompleted(true);
      }
    }
  }, [isCompleted]);

  /**
   * 영상 재생 완료 처리
   */
  const handleVideoEnded = useCallback(() => {
    if (videoRef.current && !isCompleted) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      
      // 90% 이상 시청했으면 완료 상태로 설정
      const completionThreshold = total * 0.9;
      if (current >= completionThreshold) {
        setIsCompleted(true);
      }
    }
  }, [isCompleted]);

  /**
   * 스트레칭 미션 완료
   * @param {string} missionId - 미션 ID
   * @returns {Promise<Object>} 완료 결과
   */
  const completeStretchingMission = useCallback(async (missionId) => {
    try {
      setError(null);
      
      // 검증 로직 없이 바로 미션 완료 처리
      const result = await stretchingService.completeStretchingMission(missionId, currentTime);
      
      // 타이머 정리
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      return result;
    } catch (error) {
      const processedError = handleError(error, '스트레칭 미션 완료');
      setError(processedError.message);
      throw error;
    }
  }, [currentTime]);

  /**
   * 진행률 계산
   * @returns {number} 진행률 (0-100)
   */
  const getProgress = useCallback(() => {
    if (duration === 0) return 0;
    return Math.round((currentTime / duration) * 100);
  }, [currentTime, duration]);

  /**
   * 남은 시간 계산
   * @returns {string} 남은 시간 (MM:SS)
   */
  const getRemainingTime = useCallback(() => {
    const remaining = Math.max(0, duration - currentTime);
    const minutes = Math.floor(remaining / 60);
    const seconds = Math.floor(remaining % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [currentTime, duration]);

  /**
   * 현재 시간 포맷팅
   * @returns {string} 현재 시간 (MM:SS)
   */
  const getCurrentTimeFormatted = useCallback(() => {
    const minutes = Math.floor(currentTime / 60);
    const seconds = Math.floor(currentTime % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [currentTime]);

  /**
   * 에러 초기화
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // 상태
    isPlaying,
    currentTime,
    duration,
    isCompleted,
    error,
    videoRef,
    timerRef,
    
    // 액션
    getStretchingVideo,
    startVideo,
    pauseVideo,
    restartVideo,
    updateTime,
    completeStretchingMission,
    handleVideoEnded,
    
    // 계산된 값
    getProgress,
    getRemainingTime,
    getCurrentTimeFormatted,
    
    // 유틸리티
    clearError
  };
};
