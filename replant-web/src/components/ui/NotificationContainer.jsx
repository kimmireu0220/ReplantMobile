import React from 'react';
import { tokens } from '../../design/tokens';

const NotificationContainer = ({ notifications, removeNotification, markAsRead }) => {
  
  if (!notifications || notifications.length === 0) return null;

  const containerStyle = {
    position: 'fixed',
    top: tokens.spacing[4],
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 9998,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing[2],
    maxWidth: '400px',
    pointerEvents: 'none'
  };

  const notificationStyle = {
    backgroundColor: tokens.colors.background.primary,
    border: `1px solid ${tokens.colors.border.light}`,
    borderRadius: tokens.borderRadius.lg,
    padding: tokens.spacing[4],
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    alignItems: 'flex-start',
    gap: tokens.spacing[3],
    minWidth: '300px',
    maxWidth: '400px',
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.medium,
    transition: 'all 0.3s ease',
    transform: 'translateX(0)',
    opacity: 1,
    cursor: 'pointer',
    pointerEvents: 'auto',
    textAlign: 'center'
  };

  const iconStyle = {
    fontSize: tokens.typography.fontSize.lg,
    flexShrink: 0,
    marginTop: '2px'
  };

  const contentStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing[1]
  };

  const titleStyle = {
    fontSize: tokens.typography.fontSize.base,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
    margin: 0
  };

  const messageStyle = {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.secondary,
    margin: 0,
    lineHeight: tokens.typography.lineHeight.relaxed
  };

  const getTextStyles = (notification, type) => {
    if (notification.color || type === 'success') {
      return {
        titleColor: '#ffffff',
        messageColor: '#ffffff'
      };
    }
    return {
      titleColor: tokens.colors.text.primary,
      messageColor: tokens.colors.text.secondary
    };
  };

  const actionStyle = {
    marginTop: tokens.spacing[2],
    padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
    backgroundColor: tokens.colors.primary[500],
    color: 'white',
    border: 'none',
    borderRadius: tokens.borderRadius.base,
    fontSize: tokens.typography.fontSize.sm,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  };

  const closeButtonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: tokens.spacing[2],
    borderRadius: tokens.borderRadius.base,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: tokens.typography.fontSize.base,
    color: tokens.colors.text.tertiary,
    opacity: 1,
    transition: 'opacity 0.2s ease'
  };

  // Hex 색상을 rgba로 변환하는 헬퍼 함수
  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const getTypeStyles = (type, notification) => {
    // 카테고리별 색상이 있으면 우선 사용
    if (notification.color) {
      return {
        borderLeft: `4px solid ${notification.color}`,
        backgroundColor: hexToRgba(notification.color, 0.9)
      };
    }
    
    // 기본 타입별 색상
    switch (type) {
      case 'success':
        return {
          borderLeft: `4px solid ${tokens.colors.success}`,
          backgroundColor: hexToRgba(tokens.colors.success, 0.1)
        };
      case 'error':
        return {
          borderLeft: `4px solid ${tokens.colors.error}`,
          backgroundColor: '#fee2e2'
        };
      case 'warning':
        return {
          borderLeft: `4px solid ${tokens.colors.warning}`,
          backgroundColor: '#fef3c7'
        };
      case 'info':
        return {
          borderLeft: `4px solid ${tokens.colors.primary[500]}`,
          backgroundColor: tokens.colors.gray[100]
        };
      default:
        return {
          borderLeft: `4px solid ${tokens.colors.gray[400]}`,
          backgroundColor: tokens.colors.background.primary
        };
    }
  };

  const handleNotificationClick = (notification) => {
    if (notification.action && notification.action.onClick) {
      notification.action.onClick();
    }
    
    if (markAsRead) {
      markAsRead(notification.id);
    }
  };

  const handleClose = (e, notificationId) => {
    e.stopPropagation();
    if (removeNotification) {
      removeNotification(notificationId);
    }
  };

  return (
    <div style={containerStyle}>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          style={{
            ...notificationStyle,
            ...getTypeStyles(notification.type, notification)
          }}
          onClick={() => handleNotificationClick(notification)}
        >
          <span style={iconStyle}>{notification.emoji}</span>
          
          <div style={contentStyle}>
            <h4 style={{ ...titleStyle, color: getTextStyles(notification, notification.type).titleColor }}>{notification.title}</h4>
            <p style={{ ...messageStyle, color: getTextStyles(notification, notification.type).messageColor }}>{notification.message}</p>
            
            {notification.action && (
              <button
                style={actionStyle}
                onClick={(e) => {
                  e.stopPropagation();
                  if (notification.action.onClick) {
                    notification.action.onClick();
                  }
                }}
              >
                {notification.action.label}
              </button>
            )}
          </div>
          
          {!notification.hideCloseButton && (
            <button
              style={closeButtonStyle}
              onClick={(e) => handleClose(e, notification.id)}
              aria-label="알림 닫기"
              title="알림 닫기"
            >
              ✕
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;
