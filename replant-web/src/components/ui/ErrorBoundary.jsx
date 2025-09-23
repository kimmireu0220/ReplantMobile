/**
 * 에러 바운더리 및 오류 상태 관리 컴포넌트
 * React Error Boundary와 사용자 친화적 오류 UI 제공
 */

import React, { Component, useState } from 'react';
import { tokens } from '../../design/tokens';

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
  UNKNOWN: 'unknown'            // 알 수 없는 오류
};

// 에러 메시지 및 액션 정의
const ERROR_CONFIG = {
  [ERROR_TYPES.NETWORK]: {
    title: '네트워크 연결 오류',
    message: '인터넷 연결을 확인해주세요.',
    icon: '📶',
    actionLabel: '다시 시도',
    canRetry: true,
    severity: 'warning'
  },
  [ERROR_TYPES.SERVER]: {
    title: '서버 오류',
    message: '일시적인 서버 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
    icon: '🔧',
    actionLabel: '다시 시도',
    canRetry: true,
    severity: 'error'
  },
  [ERROR_TYPES.CLIENT]: {
    title: '요청 오류',
    message: '잘못된 요청입니다. 입력한 내용을 확인해주세요.',
    icon: '⚠️',
    actionLabel: '확인',
    canRetry: false,
    severity: 'warning'
  },
  [ERROR_TYPES.VALIDATION]: {
    title: '입력 오류',
    message: '입력한 정보를 다시 확인해주세요.',
    icon: '❌',
    actionLabel: '수정하기',
    canRetry: false,
    severity: 'error'
  },
  [ERROR_TYPES.PERMISSION]: {
    title: '접근 권한 없음',
    message: '이 기능에 접근할 권한이 없습니다.',
    icon: '🔒',
    actionLabel: '확인',
    canRetry: false,
    severity: 'error'
  },
  [ERROR_TYPES.NOT_FOUND]: {
    title: '페이지를 찾을 수 없음',
    message: '요청한 페이지가 존재하지 않습니다.',
    icon: '🔍',
    actionLabel: '홈으로',
    canRetry: false,
    severity: 'info'
  },
  [ERROR_TYPES.TIMEOUT]: {
    title: '요청 시간 초과',
    message: '서버 응답 시간이 초과되었습니다.',
    icon: '⏱️',
    actionLabel: '다시 시도',
    canRetry: true,
    severity: 'warning'
  },
  [ERROR_TYPES.JAVASCRIPT]: {
    title: '앱 오류',
    message: '예상치 못한 오류가 발생했습니다.',
    icon: '🐛',
    actionLabel: '새로고침',
    canRetry: true,
    severity: 'error'
  },
  [ERROR_TYPES.UNKNOWN]: {
    title: '알 수 없는 오류',
    message: '알 수 없는 오류가 발생했습니다. 계속 문제가 발생하면 고객센터에 문의하세요.',
    icon: '❓',
    actionLabel: '다시 시도',
    canRetry: true,
    severity: 'error'
  }
};

// 오류 상태 UI 컴포넌트
export const ErrorState = ({
  errorType = ERROR_TYPES.UNKNOWN,
  customTitle = null,
  customMessage = null,
  customIcon = null,
  onAction = null,
  onRetry = null,
  actionLabel = null,
  showDetails = false,
  errorDetails = null,
  className = '',
  size = 'medium' // 'small', 'medium', 'large'
}) => {
  const config = ERROR_CONFIG[errorType] || ERROR_CONFIG[ERROR_TYPES.UNKNOWN];
  const [showErrorDetails, setShowErrorDetails] = useState(false);

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: size === 'small' ? tokens.spacing[4] : 
             size === 'large' ? tokens.spacing[8] : tokens.spacing[6],
    backgroundColor: tokens.colors.background.primary,
    borderRadius: tokens.borderRadius.lg,
    border: `1px solid ${tokens.colors.border.light}`,
    minHeight: size === 'small' ? '200px' : 
               size === 'large' ? '400px' : '300px',
  };

  const iconStyle = {
    fontSize: size === 'small' ? '48px' : 
              size === 'large' ? '96px' : '72px',
    marginBottom: tokens.spacing[4],
    opacity: 0.8,
  };

  const titleStyle = {
    fontSize: size === 'small' ? tokens.typography.fontSize.lg :
              size === 'large' ? tokens.typography.fontSize['2xl'] : tokens.typography.fontSize.xl,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing[2],
  };

  const messageStyle = {
    fontSize: size === 'small' ? tokens.typography.fontSize.sm : tokens.typography.fontSize.base,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.spacing[6],
    maxWidth: '400px',
    lineHeight: 1.6,
  };

  const buttonStyle = {
    backgroundColor: config.severity === 'error' ? tokens.colors.error :
                    config.severity === 'warning' ? tokens.colors.warning :
                    config.severity === 'info' ? tokens.colors.info : tokens.colors.primary[500],
    color: tokens.colors.text.inverse,
    border: 'none',
    borderRadius: tokens.borderRadius.md,
    padding: `${tokens.spacing[3]} ${tokens.spacing[6]}`,
    fontSize: tokens.typography.fontSize.base,
    fontWeight: tokens.typography.fontWeight.medium,
    cursor: 'pointer',
    minHeight: tokens.components.touchTargets.minimum,
    minWidth: '120px',
    transition: `all ${tokens.animation.fast} ease`,
  };

  const handleAction = () => {
    if (config.canRetry && onRetry) {
      onRetry();
    } else if (onAction) {
      onAction();
    } else if (errorType === ERROR_TYPES.NOT_FOUND) {
      window.location.href = '#/home';
    } else if (errorType === ERROR_TYPES.JAVASCRIPT) {
      window.location.reload();
    }
  };

  const handleShowDetails = () => {
    setShowErrorDetails(!showErrorDetails);
  };

  return (
    <div className={`error-state ${className}`} style={containerStyle} role="alert">
      <div style={iconStyle}>
        {customIcon || config.icon}
      </div>
      
      <h2 style={titleStyle}>
        {customTitle || config.title}
      </h2>
      
      <p style={messageStyle}>
        {customMessage || config.message}
      </p>
      
      <button
        style={buttonStyle}
        onClick={handleAction}
        onTouchStart={handleAction}
        onTouchEnd={handleAction}
        onTouchCancel={handleAction}
      >
        {actionLabel || config.actionLabel}
      </button>
      
      {/* 에러 상세 정보 토글 */}
      {showDetails && errorDetails && (
        <div style={{ marginTop: tokens.spacing[4], width: '100%' }}>
          <button
            onClick={handleShowDetails}
            style={{
              background: 'none',
              border: 'none',
              color: tokens.colors.text.tertiary,
              fontSize: tokens.typography.fontSize.sm,
              cursor: 'pointer',
              padding: tokens.spacing[2],
              minHeight: tokens.components.touchTargets.minimum,
            }}
          >
            {showErrorDetails ? '상세 정보 숨기기' : '상세 정보 보기'}
          </button>
          
          {showErrorDetails && (
            <div style={{
              marginTop: tokens.spacing[2],
              padding: tokens.spacing[4],
              backgroundColor: tokens.colors.background.secondary,
              borderRadius: tokens.borderRadius.md,
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.text.tertiary,
              textAlign: 'left',
              fontFamily: tokens.typography.fontFamily.mono.join(', '),
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              maxHeight: '200px',
              overflowY: 'auto',
            }}>
              {typeof errorDetails === 'string' ? errorDetails : JSON.stringify(errorDetails, null, 2)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// React Error Boundary 클래스 컴포넌트
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error) {
    // 에러가 발생하면 상태를 업데이트하여 폴백 UI를 표시
    return {
      hasError: true,
      errorId: Date.now().toString(),
    };
  }

  componentDidCatch(error, errorInfo) {
    // 에러 로깅
    this.setState({
      error,
      errorInfo,
    });

    // 에러 리포팅 (개발 환경에서는 콘솔, 프로덕션에서는 로깅 서비스)
    this.logError(error, errorInfo);
  }

  logError = (error, errorInfo) => {
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught an Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.groupEnd();
    } else {
      // 프로덕션에서는 로깅 서비스로 전송
      // 예: Sentry, LogRocket, 자체 로깅 서비스
      try {
        // window.errorReporting?.captureException(error, {
        //   message: error.message,
        //   stack: error.stack,
        //   componentStack: errorInfo.componentStack,
        //   timestamp: new Date().toISOString(),
        //   userAgent: navigator.userAgent,
        //   url: window.location.href,
        //   errorId: this.state.errorId,
        // });
      } catch (loggingError) {
        console.error('Error logging failed:', loggingError);
      }
    }
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // 사용자 정의 폴백 UI가 있으면 사용
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.state.errorInfo, this.handleRetry);
      }

      // 기본 에러 UI
      const errorDetails = process.env.NODE_ENV === 'development' ? 
        `${this.state.error?.message}\n\n${this.state.error?.stack}` : 
        `오류 ID: ${this.state.errorId}`;

      return (
        <ErrorState
          errorType={ERROR_TYPES.JAVASCRIPT}
          onRetry={this.handleRetry}
          showDetails={process.env.NODE_ENV === 'development'}
          errorDetails={errorDetails}
          size={this.props.size || 'medium'}
          className={this.props.className}
        />
      );
    }

    return this.props.children;
  }
}

// 비동기 오류 처리 훅

// 전역 에러 핸들러 설정
export const setupGlobalErrorHandling = () => {
  // 처리되지 않은 Promise rejection 처리
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason);
    
    // 커스텀 에러 이벤트 발생
    window.dispatchEvent(new CustomEvent('globalError', {
      detail: {
        type: ERROR_TYPES.JAVASCRIPT,
        error: event.reason,
        source: 'unhandledrejection'
      }
    }));
    
    // 기본 동작 방지 (선택사항)
    // event.preventDefault();
  });

  // 일반 JavaScript 에러 처리
  window.addEventListener('error', (event) => {
    console.error('Global JavaScript Error:', event.error);
    
    // 커스텀 에러 이벤트 발생
    window.dispatchEvent(new CustomEvent('globalError', {
      detail: {
        type: ERROR_TYPES.JAVASCRIPT,
        error: event.error,
        source: 'javascript',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      }
    }));
  });
};

export default ErrorBoundary;