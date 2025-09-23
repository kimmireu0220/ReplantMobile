// eslint-disable-next-line no-unused-vars
import { tokens } from '../design/tokens';

/**
 * 영상 파일 검증
 * @param {File} file - 검증할 영상 파일
 * @returns {Object} 검증 결과
 */
export const validateVideoFile = (file) => {
  if (!file) {
    return { isValid: false, error: '파일이 선택되지 않았습니다.' };
  }

  // 파일 크기 검증 (100MB 제한)
  if (file.size > 100 * 1024 * 1024) {
    return { isValid: false, error: '영상 파일 크기는 100MB 이하여야 합니다.' };
  }

  // 지원하는 영상 형식 검증
  const supportedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
  if (!supportedTypes.includes(file.type)) {
    return { isValid: false, error: '지원하지 않는 영상 형식입니다. MP4, WebM, OGG, MOV 형식만 지원합니다.' };
  }

  // 파일명 길이 검증
  if (file.name.length > 100) {
    return { isValid: false, error: '파일명이 너무 깁니다. 더 짧은 이름의 파일을 선택해주세요.' };
  }

  return { isValid: true };
};

/**
 * 영상 압축 (기본 구현 - 향후 개선 가능)
 * @param {File} file - 압축할 영상 파일
 * @returns {Promise<File>} 압축된 파일 (현재는 원본 반환)
 */
export const compressVideo = async (file) => {
  // 현재는 압축 없이 원본 반환
  // 향후 FFmpeg.wasm 등을 사용한 클라이언트 사이드 압축 구현 가능
  return file;
};

/**
 * 영상 시간 포맷팅
 * @param {number} seconds - 초 단위 시간
 * @returns {string} 포맷된 시간 문자열 (MM:SS)
 */
export const formatVideoDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * 영상 파일명 정규화
 * @param {string} originalName - 원본 파일명
 * @param {string} missionId - 미션 ID
 * @returns {string} 정규화된 파일명
 */
export const normalizeVideoFileName = (originalName, missionId) => {
  // 파일 확장자 추출
  const lastDotIndex = originalName.lastIndexOf('.');
  const extension = lastDotIndex !== -1 ? originalName.slice(lastDotIndex) : '';
  const nameWithoutExtension = lastDotIndex !== -1 ? originalName.slice(0, lastDotIndex) : originalName;
  
  // 한글, 특수문자, 공백을 제거하고 영문/숫자만 남김
  const normalizedName = nameWithoutExtension
    .replace(/[^a-zA-Z0-9]/g, '') // 영문/숫자만 남김
    .toLowerCase(); // 소문자로 변환
  
  // 정규화된 이름이 비어있으면 기본값 사용
  const finalName = normalizedName || 'video';
  
  // 타임스탬프와 미션 ID와 함께 반환
  return `${Date.now()}-mission-${missionId}-${finalName}${extension}`;
};

/**
 * 영상 파일 크기 포맷팅
 * @param {number} bytes - 바이트 단위 크기
 * @returns {string} 포맷된 크기 문자열
 */
export const formatVideoFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 영상 업로드 진행률 계산
 * @param {number} loaded - 로드된 바이트
 * @param {number} total - 전체 바이트
 * @returns {number} 진행률 (0-100)
 */
export const calculateUploadProgress = (loaded, total) => {
  if (total === 0) return 0;
  return Math.round((loaded / total) * 100);
};
