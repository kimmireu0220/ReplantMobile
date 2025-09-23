/**
 * 지연 로딩 컴포넌트 유틸리티
 * 코드 스플리팅과 동적 import를 통한 번들 크기 최적화
 */

import React, { lazy, Suspense } from 'react';
import { tokens } from '../design/tokens';

/**
 * 로딩 컴포넌트
 */
const LoadingFallback = ({ message = '로딩 중...', size = 'base' }) => {
  const sizeStyles = {
    sm: {
      padding: tokens.spacing[2],
      fontSize: tokens.typography.fontSize.sm
    },
    base: {
      padding: tokens.spacing[4],
      fontSize: tokens.typography.fontSize.base
    },
    lg: {
      padding: tokens.spacing[6],
      fontSize: tokens.typography.fontSize.lg
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        ...sizeStyles[size],
        color: tokens.colors.text.secondary
      }}
      role="status"
      aria-live="polite"
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          border: `3px solid ${tokens.colors.gray[200]}`,
          borderTop: `3px solid ${tokens.colors.primary[500]}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: tokens.spacing[2]
        }}
      />
      <span>{message}</span>
    </div>
  );
};

/**
 * 에러 폴백 컴포넌트
 */
const ErrorFallback = ({ error, retry, componentName = '컴포넌트' }) => (
  <div
    style={{
      padding: tokens.spacing[4],
      borderRadius: tokens.borderRadius.base,
      backgroundColor: tokens.colors.error + '10',
      border: `1px solid ${tokens.colors.error}`,
      color: tokens.colors.error,
      textAlign: 'center'
    }}
    role="alert"
  >
    <h3 style={{ margin: `0 0 ${tokens.spacing[2]} 0` }}>
      {componentName} 로딩 실패
    </h3>
    <p style={{ margin: `0 0 ${tokens.spacing[3]} 0` }}>
      {error?.message || '컴포넌트를 불러오는데 실패했습니다.'}
    </p>
    {retry && (
      <button
        onClick={retry}
        style={{
          padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
          backgroundColor: tokens.colors.error,
          color: tokens.colors.text.inverse,
          border: 'none',
          borderRadius: tokens.borderRadius.base,
          cursor: 'pointer'
        }}
      >
        다시 시도
      </button>
    )}
  </div>
);

/**
 * 지연 로딩 컴포넌트 래퍼
 */
class LazyComponentWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Error handled by component state
  }

  retry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          retry={this.retry}
          componentName={this.props.componentName}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * 지연 로딩 컴포넌트 생성 헬퍼
 * @param {Function} importFunc - 동적 import 함수
 * @param {Object} options - 옵션
 * @returns {React.Component} 지연 로딩 컴포넌트
 */
export const createLazyComponent = (importFunc, options = {}) => {
  const {
    fallback = <LoadingFallback />,
    componentName = '컴포넌트'
  } = options;

  const LazyComponent = lazy(importFunc);

  return React.forwardRef((props, ref) => (
    <LazyComponentWrapper componentName={componentName}>
      <Suspense fallback={fallback}>
        <LazyComponent {...props} ref={ref} />
      </Suspense>
    </LazyComponentWrapper>
  ));
};

/**
 * 조건부 지연 로딩
 * @param {boolean} condition - 로딩 조건
 * @param {Function} importFunc - 동적 import 함수
 * @param {React.Component} fallback - 조건이 false일 때 표시할 컴포넌트
 * @param {Object} options - 옵션
 * @returns {React.Component} 조건부 지연 로딩 컴포넌트
 */
export const createConditionalLazyComponent = (condition, importFunc, fallback = null, options = {}) => {
  if (!condition) {
    return () => fallback;
  }

  return createLazyComponent(importFunc, options);
};

/**
 * 미리 정의된 지연 로딩 컴포넌트들
 */

// 페이지 컴포넌트들
export const LazyDexPage = createLazyComponent(
  () => import('../pages/DexPage'),
  { 
    componentName: '도감 페이지',
    fallback: <LoadingFallback message="도감을 로딩하는 중..." />
  }
);

export const LazyCounselChatPage = createLazyComponent(
  () => import('../pages/CounselChatPage'),
  { 
    componentName: '상담 채팅 페이지',
    fallback: <LoadingFallback message="상담 채팅을 로딩하는 중..." />
  }
);

export const LazyCharacterDetailPage = createLazyComponent(
  () => import('../pages/CharacterDetailPage'),
  { 
    componentName: '캐릭터 상세 페이지',
    fallback: <LoadingFallback message="캐릭터 정보를 로딩하는 중..." />
  }
);

export const LazyCompletedMissionsPage = createLazyComponent(
  () => import('../pages/CompletedMissionsPage'),
  { 
    componentName: '완료된 미션 페이지',
    fallback: <LoadingFallback message="완료된 미션을 로딩하는 중..." />
  }
);

/**
 * 라우트별 프리로딩
 * 사용자가 특정 라우트로 이동할 가능성이 높을 때 미리 로드
 */
export const preloadComponents = {
  // 홈페이지에서 미리 로드할 컴포넌트들
  home: () => {
    import('../pages/DiaryPage');
    import('../pages/MissionPage');
  },
  
  // 미션 페이지에서 미리 로드할 컴포넌트들
  mission: () => {
    import('../pages/CompletedMissionsPage');
  },
  
  // 일기 페이지에서 미리 로드할 컴포넌트들
  diary: () => {
    import('../components/features/EmotionDiaryForm');
  },
  
  // 설정 페이지에서 미리 로드할 컴포넌트들
  settings: () => {
    // 향후 개발 도구가 필요한 경우 여기에 추가
  }
};

/**
 * 네트워크 상태에 따른 지연 로딩 최적화
 */
export const createNetworkAwareLazyComponent = (importFunc, options = {}) => {
  const { lowBandwidthFallback, highBandwidthPreload = false } = options;
  
  // 네트워크 정보 확인
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const isSlowConnection = connection && (
    connection.effectiveType === 'slow-2g' || 
    connection.effectiveType === '2g' ||
    connection.saveData
  );

  if (isSlowConnection && lowBandwidthFallback) {
    return () => lowBandwidthFallback;
  }

  // 고속 연결에서는 미리 로드
  if (!isSlowConnection && highBandwidthPreload) {
    // 다음 틱에 프리로드 시작
    setTimeout(() => importFunc(), 0);
  }

  return createLazyComponent(importFunc, options);
};

/**
 * 사용량 기반 지연 로딩
 * 사용 빈도가 낮은 컴포넌트는 더 늦게 로드
 */
export const createUsageBasedLazyComponent = (importFunc, usage = 'normal', options = {}) => {
  const delays = {
    critical: 0,      // 즉시 로드
    high: 100,        // 100ms 후 로드
    normal: 300,      // 300ms 후 로드
    low: 1000,        // 1초 후 로드
    rare: 3000        // 3초 후 로드
  };

  const delay = delays[usage] || delays.normal;
  
  if (delay === 0) {
    return createLazyComponent(importFunc, options);
  }

  // 지연된 import 함수 생성
  const delayedImportFunc = () => {
    return new Promise(resolve => {
      setTimeout(() => {
        importFunc().then(resolve);
      }, delay);
    });
  };

  return createLazyComponent(delayedImportFunc, options);
};

const lazyComponentsDefault = {
  LoadingFallback,
  ErrorFallback,
  createLazyComponent,
  createConditionalLazyComponent,
  createNetworkAwareLazyComponent,
  createUsageBasedLazyComponent,
  preloadComponents
};

export default lazyComponentsDefault;