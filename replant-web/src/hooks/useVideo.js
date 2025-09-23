import { useState, useCallback } from 'react';
import { videoService } from '../services/videoService';
import { handleError } from '../utils/ErrorHandler';

export const useVideo = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  /**
   * 영상 업로드
   * @param {File} file - 업로드할 영상 파일
   * @param {string} missionId - 미션 ID
   * @returns {Promise<Object>} 업로드 결과
   */
  const uploadVideo = useCallback(async (file, missionId) => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const result = await videoService.uploadVideo(file, missionId);
      setUploadProgress(100);
      return result;
    } catch (error) {
      const processedError = handleError(error, '영상 업로드');
      setError(processedError.message);
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, []);

  /**
   * 영상 삭제
   * @param {string} fileName - 삭제할 파일명
   * @returns {Promise<Object>} 삭제 결과
   */
  const deleteVideo = useCallback(async (fileName) => {
    try {
      return await videoService.deleteVideo(fileName);
    } catch (error) {
      const processedError = handleError(error, '영상 삭제');
      setError(processedError.message);
      throw error;
    }
  }, []);

  /**
   * 영상 URL 가져오기
   * @param {string} fileName - 파일명
   * @returns {string} 공개 URL
   */
  const getVideoUrl = useCallback((fileName) => {
    try {
      return videoService.getVideoUrl(fileName);
    } catch (error) {
      const processedError = handleError(error, '영상 URL 가져오기');
      setError(processedError.message);
      throw error;
    }
  }, []);

  /**
   * 영상 목록 조회
   * @param {string} missionId - 미션 ID (선택사항)
   * @returns {Promise<Array>} 파일 목록
   */
  const listVideos = useCallback(async (missionId = null) => {
    try {
      return await videoService.listVideos(missionId);
    } catch (error) {
      const processedError = handleError(error, '영상 목록 조회');
      setError(processedError.message);
      throw error;
    }
  }, []);

  /**
   * 에러 초기화
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    uploadVideo,
    deleteVideo,
    getVideoUrl,
    listVideos,
    isUploading,
    uploadProgress,
    error,
    clearError
  };
};
