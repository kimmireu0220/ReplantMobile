import React, { useEffect } from 'react';

/**
 * 스크린 리더 전용 콘텐츠 컴포넌트
 * 시각적으로는 숨겨지지만 스크린 리더에서는 읽히는 텍스트
 */
export const ScreenReaderOnly = ({ 
  children, 
  as: Component = 'span',
  className = '',
  ...props 
}) => {
  const srOnlyStyle = {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: '0'
  };

  return (
    <Component 
      style={srOnlyStyle}
      className={`sr-only ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

/**
 * 라이브 영역 컴포넌트 - 동적 콘텐츠 변경사항을 스크린 리더에 알림
 */
export const LiveRegion = ({ 
  children, 
  level = 'polite', 
  atomic = false,
  relevant = 'additions text',
  className = '',
  ...props 
}) => {
  return (
    <div
      aria-live={level}
      aria-atomic={atomic}
      aria-relevant={relevant}
      className={`live-region ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * 로딩 상태 스크린 리더 지원 컴포넌트
 */
export const LoadingAnnouncement = ({ 
  message = '로딩 중입니다',
  isLoading = true,
  completedMessage = '로딩이 완료되었습니다'
}) => {
  if (!isLoading && !completedMessage) return null;

  return (
    <LiveRegion level="polite">
      <ScreenReaderOnly>
        {isLoading ? message : completedMessage}
      </ScreenReaderOnly>
    </LiveRegion>
  );
};

/**
 * 에러/성공 메시지 스크린 리더 지원 컴포넌트
 */
export const StatusAnnouncement = ({ 
  message, 
  type = 'info', 
  visible = true 
}) => {
  if (!message) return null;

  const level = type === 'error' || type === 'warning' ? 'assertive' : 'polite';
  const roleAttr = type === 'error' ? 'alert' : 'status';

  if (visible) {
    // 시각적으로 보이는 메시지
    return (
      <div role={roleAttr} aria-live={level}>
        {message}
      </div>
    );
  }

  // 스크린 리더 전용 알림
  return (
    <LiveRegion level={level}>
      <ScreenReaderOnly role={roleAttr}>
        {message}
      </ScreenReaderOnly>
    </LiveRegion>
  );
};

/**
 * 페이지 제목 변경 컴포넌트 (스크린 리더 내비게이션 지원)
 */
export const PageTitle = ({ title, announce = true }) => {
  useEffect(() => {
    if (title) {
      document.title = `${title} - Replant`;
      
      // 페이지 변경을 스크린 리더에 알림
      if (announce) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.style.position = 'absolute';
        announcement.style.left = '-10000px';
        announcement.style.width = '1px';
        announcement.style.height = '1px';
        announcement.style.overflow = 'hidden';
        
        announcement.textContent = `${title} 페이지로 이동했습니다`;
        document.body.appendChild(announcement);
        
        // 1초 후 제거
        setTimeout(() => {
          document.body.removeChild(announcement);
        }, 1000);
      }
    }
  }, [title, announce]);

  return null;
};

/**
 * 스킵 링크 컴포넌트 - 키보드 사용자를 위한 빠른 네비게이션
 */
export const SkipLink = ({ href = '#main-content', children = '메인 콘텐츠로 바로가기' }) => {
  const skipLinkStyle = {
    position: 'absolute',
    top: '-40px',
    left: '6px',
    background: '#000000',
    color: '#ffffff',
    padding: '8px',
    textDecoration: 'none',
    borderRadius: '4px',
    zIndex: 10000,
    fontSize: '14px',
    transition: 'top 0.2s',
  };

  const skipLinkFocusStyle = {
    ...skipLinkStyle,
    top: '6px'
  };

  return (
    <a
      href={href}
      style={skipLinkStyle}
      onFocus={(e) => {
        Object.assign(e.target.style, skipLinkFocusStyle);
      }}
      onBlur={(e) => {
        Object.assign(e.target.style, skipLinkStyle);
      }}
      className="skip-link"
    >
      {children}
    </a>
  );
};

const screenReaderComponents = {
  ScreenReaderOnly,
  LiveRegion,
  LoadingAnnouncement,
  StatusAnnouncement,
  PageTitle,
  SkipLink
};

export default screenReaderComponents;