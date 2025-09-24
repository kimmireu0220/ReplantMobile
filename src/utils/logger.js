/**
 * 통합 로깅 시스템
 * 개발/프로덕션 환경별 로깅 관리
 */

import { Platform } from 'react-native';

// 환경 설정
const isDevelopment = __DEV__;
const isProduction = !isDevelopment;

/**
 * 로그 레벨 정의
 */
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

/**
 * 현재 로그 레벨 (개발: DEBUG, 프로덕션: ERROR)
 */
const CURRENT_LOG_LEVEL = isDevelopment ? LOG_LEVELS.DEBUG : LOG_LEVELS.ERROR;

/**
 * 로그 포맷터
 */
const formatLogMessage = (level, message, data = null) => {
  const timestamp = new Date().toISOString();
  const platform = Platform.OS;
  
  const baseMessage = `[${timestamp}] [${platform}] [${level}] ${message}`;
  
  if (data) {
    return `${baseMessage}\nData: ${JSON.stringify(data, null, 2)}`;
  }
  
  return baseMessage;
};

/**
 * 로그 출력 함수
 */
const log = (level, levelName, message, data = null) => {
  if (level <= CURRENT_LOG_LEVEL) {
    const formattedMessage = formatLogMessage(levelName, message, data);
    
    switch (level) {
      case LOG_LEVELS.ERROR:
        console.error(formattedMessage);
        break;
      case LOG_LEVELS.WARN:
        console.warn(formattedMessage);
        break;
      case LOG_LEVELS.INFO:
        console.info(formattedMessage);
        break;
      case LOG_LEVELS.DEBUG:
        console.log(formattedMessage);
        break;
    }
  }
};

/**
 * 에러 로깅
 */
export const logError = (message, error = null, context = {}) => {
  const errorData = {
    message: error?.message || message,
    stack: error?.stack,
    context,
  };
  
  log(LOG_LEVELS.ERROR, 'ERROR', message, errorData);
};

/**
 * 경고 로깅
 */
export const logWarn = (message, data = null) => {
  log(LOG_LEVELS.WARN, 'WARN', message, data);
};

/**
 * 정보 로깅
 */
export const logInfo = (message, data = null) => {
  log(LOG_LEVELS.INFO, 'INFO', message, data);
};

/**
 * 디버그 로깅 (개발 환경에서만)
 */
export const logDebug = (message, data = null) => {
  log(LOG_LEVELS.DEBUG, 'DEBUG', message, data);
};

/**
 * 성능 로깅
 */
export const logPerformance = (operation, startTime, endTime, data = {}) => {
  const duration = endTime - startTime;
  const performanceData = {
    operation,
    duration: `${duration}ms`,
    ...data,
  };
  
  if (duration > 1000) {
    logWarn(`Slow operation: ${operation}`, performanceData);
  } else {
    logDebug(`Performance: ${operation}`, performanceData);
  }
};

/**
 * 사용자 액션 로깅
 */
export const logUserAction = (action, data = {}) => {
  const actionData = {
    action,
    timestamp: new Date().toISOString(),
    ...data,
  };
  
  logInfo(`User Action: ${action}`, actionData);
};

/**
 * API 호출 로깅
 */
export const logApiCall = (endpoint, method, status, duration, data = {}) => {
  const apiData = {
    endpoint,
    method,
    status,
    duration: `${duration}ms`,
    ...data,
  };
  
  if (status >= 400) {
    logError(`API Error: ${method} ${endpoint}`, null, apiData);
  } else {
    logDebug(`API Call: ${method} ${endpoint}`, apiData);
  }
};

/**
 * 성능 측정 래퍼
 */
export const measurePerformance = async (operation, asyncFunction, data = {}) => {
  const startTime = Date.now();
  
  try {
    const result = await asyncFunction();
    const endTime = Date.now();
    
    logPerformance(operation, startTime, endTime, data);
    
    return result;
  } catch (error) {
    const endTime = Date.now();
    
    logError(`Performance measurement failed: ${operation}`, error, {
      ...data,
      duration: `${endTime - startTime}ms`,
    });
    
    throw error;
  }
};

/**
 * 로그 레벨 설정 (개발용)
 */
export const setLogLevel = (level) => {
  if (isDevelopment) {
    CURRENT_LOG_LEVEL = level;
    logInfo('Log level changed', { newLevel: level });
  }
};

/**
 * 로그 초기화
 */
export const initializeLogger = () => {
  logInfo('Logger initialized', {
    environment: isDevelopment ? 'development' : 'production',
    logLevel: CURRENT_LOG_LEVEL,
  });
};
