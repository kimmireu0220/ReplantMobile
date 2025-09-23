/**
 * 통합 로깅 유틸리티
 * 환경별 로그 레벨 관리 및 일관된 로깅 인터페이스 제공
 */

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * 로그 레벨 정의
 */
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

/**
 * 현재 환경에 따른 로그 레벨 설정
 */
const CURRENT_LOG_LEVEL = isDevelopment ? LOG_LEVELS.DEBUG : LOG_LEVELS.ERROR;

/**
 * 통합 로거
 */
export const logger = {
  /**
   * 에러 로그 (항상 출력)
   * @param {string} message - 로그 메시지
   * @param {any} data - 추가 데이터
   */
  error: (message, data) => {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.ERROR) {
      console.error(`[ERROR] ${message}`, data || '');
    }
  },

  /**
   * 경고 로그 (개발 환경에서만 출력)
   * @param {string} message - 로그 메시지
   * @param {any} data - 추가 데이터
   */
  warn: (message, data) => {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.WARN) {
      console.warn(`[WARN] ${message}`, data || '');
    }
  },

  /**
   * 정보 로그 (개발 환경에서만 출력)
   * @param {string} message - 로그 메시지
   * @param {any} data - 추가 데이터
   */
  info: (message, data) => {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.INFO) {
      console.log(`[INFO] ${message}`, data || '');
    }
  },

  /**
   * 디버그 로그 (개발 환경에서만 출력)
   * @param {string} message - 로그 메시지
   * @param {any} data - 추가 데이터
   */
  debug: (message, data) => {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.DEBUG) {
      console.log(`[DEBUG] ${message}`, data || '');
    }
  }
};

export default logger;