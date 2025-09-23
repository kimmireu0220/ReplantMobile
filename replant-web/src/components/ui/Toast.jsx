import React, { useState, useEffect, useCallback } from 'react';
import { tokens } from '../../design/tokens';
import { StatusAnnouncement } from './ScreenReaderOnly';

const Toast = ({
  message,
  type = 'success', // 'success' | 'error' | 'warning' | 'info'
  duration = 3000,
  onClose,
  onClick,
  visible = false
}) => {
  const [isVisible, setIsVisible] = useState(visible);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClose = useCallback(() => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300); // 애니메이션 시간과 맞춤
  }, [onClose]);

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      setIsAnimating(true);
      
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, handleClose]);

  if (!isVisible) return null;

  // 타입별 스타일 설정
  const getTypeStyles = () => {
    const baseStyle = {
      backgroundColor: tokens.colors.background.primary,
      border: `1px solid`,
      color: tokens.colors.text.primary
    };

    switch (type) {
      case 'success':
        return {
          ...baseStyle,
          backgroundColor: tokens.colors.success || '#22c55e',
          borderColor: tokens.colors.success || '#22c55e',
          color: '#ffffff'
        };
      case 'error':
        return {
          ...baseStyle,
          backgroundColor: '#fef2f2',
          borderColor: '#fecaca',
          color: '#dc2626'
        };
      case 'warning':
        return {
          ...baseStyle,
          backgroundColor: '#fffbeb',
          borderColor: '#fed7aa',
          color: '#d97706'
        };
      case 'info':
        return {
          ...baseStyle,
          backgroundColor: tokens.colors.gray[100],
          borderColor: tokens.colors.gray[300],
          color: tokens.colors.gray[600]
        };
      default:
        return baseStyle;
    }
  };

  // 타입별 아이콘
  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📌';
    }
  };

  const toastStyle = {
    position: 'fixed',
    top: tokens.spacing[4],
    right: tokens.spacing[4],
    zIndex: 9999,
    padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
    borderRadius: tokens.borderRadius.lg,
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing[2],
    minWidth: '300px',
    maxWidth: '500px',
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.medium,
    transition: 'all 0.15s ease',
    transform: isAnimating ? 'translateX(0)' : 'translateX(100%)',
    opacity: isAnimating ? 1 : 0,
    cursor: onClick ? 'pointer' : 'default',
    ...getTypeStyles()
  };

  const iconStyle = {
    fontSize: tokens.typography.fontSize.base,
    flexShrink: 0
  };

  const messageStyle = {
    flex: 1,
    lineHeight: tokens.typography.lineHeight.relaxed
  };

  const closeButtonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: tokens.spacing[1],
    borderRadius: tokens.borderRadius.base,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: tokens.typography.fontSize.sm,
    color: 'inherit',
    opacity: 1,
    transition: 'opacity 0.2s ease'
  };

  // 접근성을 위한 역할과 레벨 결정
  const ariaRole = type === 'error' || type === 'warning' ? 'alert' : 'status';
  const ariaLive = type === 'error' || type === 'warning' ? 'assertive' : 'polite';

  return (
    <>
      {/* 스크린 리더를 위한 메시지 알림 */}
      <StatusAnnouncement 
        message={`${type === 'success' ? '성공' : type === 'error' ? '오류' : type === 'warning' ? '경고' : '알림'}: ${message}`}
        type={type}
        visible={false} // 시각적으로는 숨기고 스크린 리더용으로만 사용
      />
      
      {/* 시각적 토스트 메시지 */}
      <div 
        style={toastStyle}
        role={ariaRole}
        aria-live={ariaLive}
        aria-atomic="true"
        onClick={onClick}
        onTouchStart={onClick}
        onTouchEnd={onClick}
        onTouchCancel={onClick}
      >
        <span style={iconStyle} aria-hidden="true">{getIcon()}</span>
        <span style={messageStyle}>{message}</span>
        <button
          style={closeButtonStyle}
          onClick={handleClose}
          onTouchStart={handleClose}
          onTouchEnd={handleClose}
          onTouchCancel={handleClose}
          aria-label={`${type} 알림 닫기`}
          title="알림 닫기"
        >
          <span aria-hidden="true">✕</span>
        </button>
      </div>
    </>
  );
};

export default Toast;