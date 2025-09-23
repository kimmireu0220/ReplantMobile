/**
 * 테마 토글 버튼 컴포넌트
 * 다크모드 기능 테스트를 위한 임시 컴포넌트
 */
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle = ({ 
  className = '',
  style = {},
  showLabel = true,
  position = 'relative',
  variant = 'toggle', // 'toggle' | 'segmented'
  showSystem = true
}) => {
  const { theme, actualTheme, toggleTheme, setTheme } = useTheme();

  // 기존 스타일과 호환되는 버튼 스타일
  const buttonStyle = {
    // CSS 변수를 사용하되 fallback 제공
    backgroundColor: 'var(--color-background-primary, #ffffff)',
    color: 'var(--color-text-primary, #333333)',
    border: '2px solid var(--color-border-light, #e5e7eb)',
    borderRadius: '8px',
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    position: position,
    
    // 기존 스타일과 병합
    ...style
  };

  // 테마별 아이콘
  const getThemeIcon = () => {
    if (actualTheme === 'dark') {
      return '🌙'; // 다크 모드일 때 달 아이콘
    }
    return '☀️'; // 라이트 모드일 때 태양 아이콘
  };

  // 테마 상태 텍스트
  const getThemeText = () => {
    const themeNames = {
      light: '라이트 모드',
      dark: '다크 모드',
      system: '시스템 설정'
    };
    
    if (theme === 'system') {
      return `${themeNames.system} (${themeNames[actualTheme]})`;
    }
    
    return themeNames[theme] || themeNames.light;
  };

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      toggleTheme();
    } catch (error) {
      console.error('[ThemeToggle] 테마 전환 실패:', error);
    }
  };

  // 시스템 테마로 설정하는 함수
  const handleSystemTheme = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      setTheme('system');
    } catch (error) {
      console.error('[ThemeToggle] 시스템 테마 설정 실패:', error);
    }
  };

  // Segmented UI 렌더링
  if (variant === 'segmented') {
    const baseSegmentStyle = {
      backgroundColor: 'transparent',
      color: 'var(--color-text-primary, #333333)',
      border: 'none',
      padding: '6px 10px',
      fontSize: '13px',
      fontWeight: 500,
      cursor: 'pointer',
      borderRadius: '6px',
    };

    const containerStyle = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      backgroundColor: 'var(--color-background-primary, #ffffff)',
      border: '1px solid var(--color-border-light, #e5e7eb)',
      borderRadius: '10px',
      padding: '4px',
    };

    const isActive = (target) => (theme === target) || (target === 'system' && theme === 'system');

    const activeStyle = {
      backgroundColor: 'var(--color-primary-100, #dcfce7)',
      color: 'var(--color-primary-600, #16a34a)',
      border: '1px solid var(--color-primary-300, #86efac)'
    };

    return (
      <div className={`theme-toggle-container ${className}`} style={{ position }}>
        <div style={{ ...containerStyle, ...style }} role="group" aria-label="테마 선택">
          <button
            type="button"
            onClick={() => setTheme('light')}
            style={{ ...baseSegmentStyle, ...(isActive('light') ? activeStyle : {}) }}
            aria-pressed={theme === 'light'}
            aria-label="라이트 모드"
            title="라이트 모드"
          >
            ☀️{showLabel ? ' 라이트' : ''}
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            style={{ ...baseSegmentStyle, ...(isActive('dark') ? activeStyle : {}) }}
            aria-pressed={theme === 'dark'}
            aria-label="다크 모드"
            title="다크 모드"
          >
            🌙{showLabel ? ' 다크' : ''}
          </button>
          {showSystem && (
            <button
              type="button"
              onClick={handleSystemTheme}
              style={{ ...baseSegmentStyle, ...(isActive('system') ? activeStyle : {}) }}
              aria-pressed={theme === 'system'}
              aria-label="시스템 설정 따르기"
              title="시스템 설정"
            >
              🖥️{showLabel ? ' 시스템' : ''}
            </button>
          )}
        </div>
      </div>
    );
  }

  // 기본 토글 UI
  return (
    <div className={`theme-toggle-container ${className}`}>
      <button
        onClick={handleClick}
        style={buttonStyle}
        title="테마 전환 (라이트/다크)"
        aria-label={`현재 테마: ${getThemeText()}, 클릭하여 전환`}
      >
        <span style={{ fontSize: '16px' }}>{getThemeIcon()}</span>
        {showLabel && (
          <span style={{ fontSize: '13px' }}>
            {getThemeText()}
          </span>
        )}
      </button>
      {showSystem && (
        <button
          onClick={handleSystemTheme}
          style={{
            ...buttonStyle,
            padding: '4px 8px',
            fontSize: '11px',
            marginLeft: '8px',
            backgroundColor: theme === 'system' 
              ? 'var(--color-primary-100, #dcfce7)' 
              : buttonStyle.backgroundColor,
            borderColor: theme === 'system' 
              ? 'var(--color-primary-300, #86efac)' 
              : buttonStyle.borderColor,
          }}
          title="시스템 설정 따르기"
          aria-label="시스템 테마 설정으로 전환"
        >
          🖥️ {theme === 'system' ? '✓' : ''}
        </button>
      )}
    </div>
  );
};

// CSS 변수 동작을 테스트하는 컴포넌트
export const ThemeTestCard = ({ className = '' }) => {
  const { actualTheme } = useTheme();
  
  const cardStyle = {
    // CSS 변수를 사용하여 테마 반응성 테스트
    backgroundColor: 'var(--color-background-primary, #ffffff)',
    color: 'var(--color-text-primary, #333333)',
    border: '1px solid var(--color-border-light, #e5e7eb)',
    borderRadius: '12px',
    padding: '16px',
    marginTop: '16px',
    boxShadow: '0 2px 4px var(--color-shadow-light, rgba(0, 0, 0, 0.1))',
  };
  
  return (
    <div className={`theme-test-card ${className}`} style={cardStyle}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>
        🎨 테마 테스트 카드
      </h3>
      <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
        현재 테마: <strong>{actualTheme === 'dark' ? '다크 모드' : '라이트 모드'}</strong>
      </p>
      <p style={{ margin: '0', fontSize: '12px', opacity: '0.7' }}>
        이 카드는 CSS 변수를 사용하여 테마에 따라 자동으로 색상이 변경됩니다.
      </p>
      
      {/* 색상 샘플들 */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        <div style={{
          width: '20px',
          height: '20px',
          backgroundColor: 'var(--color-primary-500, #22c55e)',
          borderRadius: '4px',
          title: 'Primary Color'
        }} />
        <div style={{
          width: '20px',
          height: '20px',
          backgroundColor: 'var(--color-success, #22c55e)',
          borderRadius: '4px',
          title: 'Success Color'
        }} />
        <div style={{
          width: '20px',
          height: '20px',
          backgroundColor: 'var(--color-warning, #f59e0b)',
          borderRadius: '4px',
          title: 'Warning Color'
        }} />
        <div style={{
          width: '20px',
          height: '20px',
          backgroundColor: 'var(--color-error, #ef4444)',
          borderRadius: '4px',
          title: 'Error Color'
        }} />
      </div>
    </div>
  );
};

export default ThemeToggle;