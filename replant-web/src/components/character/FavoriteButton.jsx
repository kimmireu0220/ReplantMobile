import React from 'react';
import { tokens } from '../../design/tokens';

/**
 * Favorite Button Component
 * 카드의 상단 우측 모서리에 배치되는 즐겨찾기 스타일 대표 캐릭터 설정 버튼
 */
const FavoriteButton = ({
  isMainCharacter = false,
  isSettingMain = false,
  onSetAsMain,
  disabled = false,
  size = 'medium'
}) => {
  // 크기별 스타일 (가시성 개선을 위한 크기 증가)
  const sizeStyles = {
    small: {
      width: '28px',
      height: '28px',
      fontSize: '14px',
      top: tokens.spacing[2],
      right: tokens.spacing[2]
    },
    medium: {
      width: '32px',
      height: '32px',
      fontSize: '16px',
      top: tokens.spacing[3],
      right: tokens.spacing[3]
    },
    large: {
      width: '36px',
      height: '36px',
      fontSize: '18px',
      top: tokens.spacing[4],
      right: tokens.spacing[4]
    }
  };

  const currentSize = sizeStyles[size];

  // 카드 모서리 배치를 위한 컨테이너 스타일
  const containerStyle = {
    position: 'absolute',
    top: currentSize.top,
    right: currentSize.right,
    zIndex: tokens.zIndex.dropdown,
    width: currentSize.width,
    height: currentSize.height
  };

  // 현재 대표 캐릭터인 경우 배지 스타일 - 북마크 스타일
  const activeBadgeStyle = {
    width: '100%',
    height: '100%',
    backgroundColor: tokens.colors.accent.yellow,
    borderRadius: tokens.borderRadius.base,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontSize: currentSize.fontSize,
    fontWeight: tokens.typography.fontWeight.bold,
    boxShadow: `0 2px 8px rgba(251, 191, 36, 0.4), 0 1px 3px rgba(0, 0, 0, 0.1)`,
    border: `1px solid rgba(255, 255, 255, 0.3)`,
    cursor: 'default',
    transform: 'scale(1)',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box' // box-sizing 명시적 설정
  };

  // 기본 버튼 스타일
  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: currentSize.size,
    height: currentSize.size,
    borderRadius: tokens.borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    color: tokens.colors.gray[600],
    fontSize: currentSize.fontSize,
    fontWeight: tokens.typography.fontWeight.medium,
    border: `1px solid ${tokens.colors.gray[300]}`, // border 두께 통일
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : (isSettingMain ? 0.7 : 0.95),
    transition: 'all 0.2s ease',
    transform: 'scale(1)',
    outline: 'none',
    boxSizing: 'border-box' // box-sizing 명시적 설정
  };

  // 로딩 중 스타일
  const loadingStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    color: tokens.colors.gray[400],
    cursor: 'default'
  };

  // 클릭 핸들러
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!disabled && !isMainCharacter && !isSettingMain && onSetAsMain) {
      onSetAsMain();
    }
  };

  // 키보드 핸들러
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e);
    }
  };

  // 현재 대표 캐릭터인 경우 (currentSize 사용)
  if (isMainCharacter) {
    return (
      <div style={containerStyle}>
        <div 
          style={activeBadgeStyle}
          role="status"
          aria-label="현재 대표 캐릭터"
          title="대표 캐릭터입니다"
        >
          ⭐
        </div>
      </div>
    );
  }

  // 설정 가능한 버튼인 경우
  return (
    <div style={containerStyle}>
      <button
        style={isSettingMain ? { ...buttonStyle, ...loadingStyle } : buttonStyle}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled || isSettingMain}
        aria-label="대표 캐릭터로 설정"
        title="대표 캐릭터로 설정"
        tabIndex={0}
        onTouchStart={handleClick}
        onTouchEnd={handleClick}
        onTouchCancel={handleClick}
      >
        {isSettingMain ? '⏳' : '📌'}
      </button>
    </div>
  );
};

export default FavoriteButton;