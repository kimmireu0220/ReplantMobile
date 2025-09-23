import React from 'react';
import { tokens } from '../../design/tokens';

const MissionCheckButton = ({
  completed,
  onToggle,
  size = 'base',
  disabled = false,
  className = '',
}) => {
  const sizeStyles = {
    sm: {
      width: '16px',
      height: '16px',
      iconSize: '14px',
    },
    base: {
      width: '20px',
      height: '20px',
      iconSize: '16px',
    },
    lg: {
      width: '24px',
      height: '24px',
      iconSize: '20px',
    },
  };

  const buttonStyle = {
    width: sizeStyles[size].width,
    height: sizeStyles[size].height,
    borderRadius: tokens.borderRadius.sm,
    border: `2px solid ${completed ? tokens.colors.success : tokens.colors.border.medium}`,
    backgroundColor: completed ? tokens.colors.success : 'transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 150ms ease',
    opacity: disabled ? 0.5 : 1,
    outline: 'none',
    padding: 0,
  };

  const checkIconStyle = {
    width: sizeStyles[size].iconSize,
    height: sizeStyles[size].iconSize,
    color: completed ? tokens.colors.text.inverse : 'transparent',
    transition: 'color 150ms ease',
  };

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`replant-mission-check-button ${className}`}
      style={buttonStyle}
      aria-label={completed ? '완료됨' : '미완료'}
    >
      <svg
        style={checkIconStyle}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={4}
          d="M5 13l4 4L19 7"
        />
      </svg>
    </button>
  );
};

export default MissionCheckButton;