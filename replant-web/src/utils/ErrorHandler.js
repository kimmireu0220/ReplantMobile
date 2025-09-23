/**
 * 전역 에러 처리 시스템
 * 일관된 에러 처리와 사용자 친화적 메시지 제공
 */

// 에러 타입 정의
export const ERROR_TYPES = {
  NETWORK: 'network',           // 네트워크 연결 오류
  SERVER: 'server',             // 서버 오류 (5xx)
  CLIENT: 'client',             // 클라이언트 오류 (4xx)
  VALIDATION: 'validation',     // 입력 유효성 검증 오류
  PERMISSION: 'permission',     // 권한 오류
  NOT_FOUND: 'not_found',      // 리소스를 찾을 수 없음
  TIMEOUT: 'timeout',           // 요청 시간 초과
  JAVASCRIPT: 'javascript',     // JavaScript 런타임 오류
  SUPABASE: 'supabase',        // Supabase 관련 오류
  UNKNOWN: 'unknown'            // 알 수 없는 오류
};

// 사용자 친화적 에러 메시지
const ERROR_MESSAGES = {
  [ERROR_TYPES.NETWORK]: '인터넷 연결을 확인해주세요.',
  [ERROR_TYPES.SERVER]: '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
  [ERROR_TYPES.CLIENT]: '요청이 올바르지 않습니다. 다시 시도해주세요.',
  [ERROR_TYPES.VALIDATION]: '입력한 정보를 다시 확인해주세요.',
  [ERROR_TYPES.PERMISSION]: '접근 권한이 없습니다.',
  [ERROR_TYPES.NOT_FOUND]: '요청하신 정보를 찾을 수 없습니다.',
  [ERROR_TYPES.TIMEOUT]: '요청 시간이 초과되었습니다. 다시 시도해주세요.',
  [ERROR_TYPES.JAVASCRIPT]: '앱에서 오류가 발생했습니다. 새로고침 후 다시 시도해주세요.',
  [ERROR_TYPES.SUPABASE]: '데이터베이스 연결에 문제가 발생했습니다.',
  [ERROR_TYPES.UNKNOWN]: '알 수 없는 오류가 발생했습니다.'
};

/**
 * 에러 타입을 자동으로 감지합니다
 * @param {Error} error - 감지할 에러 객체
 * @returns {string} 에러 타입
 */
export const detectErrorType = (error) => {
  if (!error) return ERROR_TYPES.UNKNOWN;

  // Supabase 에러
  if (error.code && (error.code.startsWith('PGRST') || error.code.startsWith('23'))) {
    return ERROR_TYPES.SUPABASE;
  }

  // 네트워크 오류
  if (error.name === 'NetworkError' || error.code === 'ERR_NETWORK') {
    return ERROR_TYPES.NETWORK;
  }

  // HTTP 상태 코드 기반 분류
  if (error.response?.status) {
    const status = error.response.status;
    if (status >= 500) return ERROR_TYPES.SERVER;
    if (status === 404) return ERROR_TYPES.NOT_FOUND;
    if (status === 403 || status === 401) return ERROR_TYPES.PERMISSION;
    if (status >= 400) return ERROR_TYPES.CLIENT;
  }

  // 시간 초과 오류
  if (error.name === 'TimeoutError' || error.code === 'ECONNTIMEDOUT') {
    return ERROR_TYPES.TIMEOUT;
  }

  // 유효성 검증 오류
  if (error.name === 'ValidationError') {
    return ERROR_TYPES.VALIDATION;
  }

  // JavaScript 런타임 오류
  if (error instanceof TypeError || error instanceof ReferenceError || error instanceof SyntaxError) {
    return ERROR_TYPES.JAVASCRIPT;
  }

  return ERROR_TYPES.UNKNOWN;
};

/**
 * 사용자 친화적 에러 메시지를 반환합니다
 * @param {Error} error - 에러 객체
 * @returns {string} 사용자 친화적 메시지
 */
export const getUserFriendlyMessage = (error) => {
  const errorType = detectErrorType(error);
  return ERROR_MESSAGES[errorType] || ERROR_MESSAGES[ERROR_TYPES.UNKNOWN];
};

/**
 * 에러를 로깅하고 리포팅합니다
 * @param {Error} error - 에러 객체
 * @param {string} operation - 실행 중이던 작업명
 * @param {Object} context - 추가 컨텍스트 정보
 */
export const logError = (error, operation = 'Unknown', context = {}) => {
  const errorType = detectErrorType(error);
  const timestamp = new Date().toISOString();
  
  const errorReport = {
    type: errorType,
    message: error.message,
    stack: error.stack,
    operation,
    context,
    timestamp,
    userAgent: navigator.userAgent,
    url: window.location.href,
    userId: localStorage.getItem('userNickname') || 'anonymous',
    deviceId: localStorage.getItem('deviceId') || 'unknown',
  };

  if (process.env.NODE_ENV === 'development') {
    console.group(`🚨 Error in ${operation}`);
    console.error('Error Type:', errorType);
    console.error('Error Message:', error.message);
    console.error('Error Object:', error);
    console.groupEnd();
  } else {
    // 프로덕션에서는 에러 리포팅 서비스로 전송
    try {
      // 예: Sentry, LogRocket, 자체 로깅 서비스
      console.error('Error Report:', errorReport);
      // await sendErrorToLoggingService(errorReport);
    } catch (loggingError) {
      console.error('Error logging failed:', loggingError);
    }
  }

  return errorReport;
};

/**
 * Supabase 에러를 처리합니다
 * @param {Error} error - Supabase 에러
 * @param {string} operation - 실행 중이던 작업명
 * @returns {Object} 처리된 에러 정보
 */
export const handleSupabaseError = (error, operation) => {
  const errorReport = logError(error, operation, { source: 'supabase' });
  
  let userMessage = '';
  
  // Supabase 특정 에러 코드 처리
  switch (error.code) {
    case 'PGRST116':
      userMessage = '로그인이 필요합니다.';
      break;
    case '23505':
      userMessage = '이미 존재하는 데이터입니다.';
      break;
    case '23503':
      userMessage = '참조된 데이터가 존재하지 않습니다.';
      break;
    case '42P01':
      userMessage = '데이터베이스 테이블을 찾을 수 없습니다.';
      break;
    case '42501':
      userMessage = '데이터베이스 접근 권한이 없습니다.';
      break;
    default:
      userMessage = getUserFriendlyMessage(error);
  }

  return {
    type: ERROR_TYPES.SUPABASE,
    message: userMessage,
    originalError: error,
    report: errorReport
  };
};

/**
 * 네트워크 에러를 처리합니다
 * @param {Error} error - 네트워크 에러
 * @param {string} operation - 실행 중이던 작업명
 * @returns {Object} 처리된 에러 정보
 */
export const handleNetworkError = (error, operation) => {
  const errorReport = logError(error, operation, { source: 'network' });
  
  return {
    type: ERROR_TYPES.NETWORK,
    message: ERROR_MESSAGES[ERROR_TYPES.NETWORK],
    originalError: error,
    report: errorReport
  };
};

/**
 * 유효성 검증 에러를 처리합니다
 * @param {Error} error - 유효성 검증 에러
 * @param {string} operation - 실행 중이던 작업명
 * @param {Object} validationContext - 검증 컨텍스트
 * @returns {Object} 처리된 에러 정보
 */
export const handleValidationError = (error, operation, validationContext = {}) => {
  const errorReport = logError(error, operation, { 
    source: 'validation', 
    validationContext 
  });
  
  return {
    type: ERROR_TYPES.VALIDATION,
    message: error.message || ERROR_MESSAGES[ERROR_TYPES.VALIDATION],
    originalError: error,
    report: errorReport,
    validationContext
  };
};

/**
 * 통합 에러 핸들러
 * @param {Error} error - 에러 객체
 * @param {string} operation - 실행 중이던 작업명
 * @param {Object} context - 추가 컨텍스트
 * @returns {Object} 처리된 에러 정보
 */
export const handleError = (error, operation = 'Unknown', context = {}) => {
  const errorType = detectErrorType(error);
  
  switch (errorType) {
    case ERROR_TYPES.SUPABASE:
      return handleSupabaseError(error, operation);
    case ERROR_TYPES.NETWORK:
      return handleNetworkError(error, operation);
    case ERROR_TYPES.VALIDATION:
      return handleValidationError(error, operation, context);
    default:
      const errorReport = logError(error, operation, context);
      return {
        type: errorType,
        message: getUserFriendlyMessage(error),
        originalError: error,
        report: errorReport
      };
  }
};

/**
 * 비동기 함수를 에러 처리와 함께 실행합니다
 * @param {Function} asyncFunction - 실행할 비동기 함수
 * @param {string} operation - 작업명
 * @param {Object} options - 옵션 (retries, retryDelay 등)
 * @returns {Promise} 실행 결과
 */
export const executeWithErrorHandling = async (asyncFunction, operation, options = {}) => {
  const { retries = 0, retryDelay = 1000, context = {} } = options;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await asyncFunction();
    } catch (error) {
      // 마지막 시도가 아니면 재시도
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
        continue;
      }
      
      // 모든 시도 실패 - 에러 처리 후 재던지기
      const processedError = handleError(error, operation, { 
        ...context, 
        attempts: attempt + 1 
      });
      
      throw processedError;
    }
  }
};

// 기본 에러 핸들러 내보내기
const ErrorHandlerDefault = {
  handleError,
  handleSupabaseError,
  handleNetworkError,
  handleValidationError,
  executeWithErrorHandling,
  logError,
  getUserFriendlyMessage,
  detectErrorType,
  ERROR_TYPES,
};

export default ErrorHandlerDefault;