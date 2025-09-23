import React from 'react';
import { tokens } from '../../design/tokens';

const Checkbox = ({
  checked = false,
  onChange,
  disabled = false,
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    sm: 16,
    md: 20,
    lg: 24
  };

  const checkboxSize = sizeMap[size];

  const checkboxStyle = {
    width: checkboxSize,
    height: checkboxSize,
    border: `3px solid ${tokens.colors.border.medium}`,
    borderRadius: tokens.borderRadius.sm,
    backgroundColor: tokens.colors.background.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    opacity: disabled ? 0.5 : 1,
    position: 'relative',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  };

  const checkmarkStyle = {
    color: tokens.colors.success.main,
    fontSize: checkboxSize * 0.8,
    fontWeight: 'bold',
    lineHeight: 1,
    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  return (
    <div
      style={checkboxStyle}
      onClick={handleClick}
      className={`replant-checkbox ${className}`}
      role="checkbox"
      aria-checked={checked}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(e);
        }
      }}
    >
      {checked && (
        <span style={checkmarkStyle}>✓</span>
      )}
    </div>
  );
};

export default Checkbox;
