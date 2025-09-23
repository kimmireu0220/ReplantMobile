import React, { useState, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { tokens } from '../../design/tokens';

const HamburgerButton = forwardRef(({ isOpen, onClick, className = '', ...props }, ref) => {
  const { isDemo = false } = props;

  const buttonStyle = {
    position: 'fixed',
    top: tokens.responsive?.hamburger?.mobile || '1rem',
    left: tokens.responsive?.hamburger?.mobile || '1rem',
    width: '44px',
    height: '44px',
    backgroundColor: tokens.colors.background.primary,
    border: `1px solid ${tokens.colors.border.light}`,
    borderRadius: tokens.borderRadius.lg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 1000,
    boxShadow: tokens.shadow.base,
    transition: 'all 0.15s ease',
    outline: 'none',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'manipulation',
  };

  const demoBadgeStyle = {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    backgroundColor: tokens.colors.primary[600],
    color: 'white',
    fontSize: '10px',
    fontWeight: 'bold',
    padding: '2px 6px',
    borderRadius: '8px',
    zIndex: 1,
    border: '1px solid white',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  };

  const lineStyle = {
    display: 'block',
    position: 'relative',
    width: '22px', // Slightly larger for better visibility
    height: '2.5px', // Slightly thicker for better touch devices
    backgroundColor: tokens.colors.text.primary,
    borderRadius: '1px', // Rounded ends for modern look
    transition: `all ${tokens.animation.normal} cubic-bezier(0.2, 0, 0, 1)`,
  };

  const lineBeforeStyle = {
    position: 'absolute',
    top: isOpen ? '0' : '-6px',
    left: '0',
    width: '22px',
    height: '2.5px',
    backgroundColor: tokens.colors.text.primary,
    borderRadius: '1px',
    transition: `all ${tokens.animation.normal} cubic-bezier(0.2, 0, 0, 1)`,
    transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
    transformOrigin: 'center',
  };

  const lineAfterStyle = {
    position: 'absolute',
    top: isOpen ? '0' : '6px',
    left: '0',
    width: '22px',
    height: '2.5px',
    backgroundColor: tokens.colors.text.primary,
    borderRadius: '1px',
    transition: `all ${tokens.animation.normal} cubic-bezier(0.2, 0, 0, 1)`,
    transform: isOpen ? 'rotate(-45deg)' : 'rotate(0deg)',
    transformOrigin: 'center',
  };

  const [isPressed, setIsPressed] = useState(false);

  const finalButtonStyle = {
    ...buttonStyle,
    backgroundColor: isPressed 
      ? tokens.colors.gray[100] 
      : tokens.colors.background.primary,
    boxShadow: isPressed 
      ? tokens.shadow.md 
      : tokens.shadow.lg,
    transform: isPressed ? 'scale(0.95)' : 'scale(1)',
  };

  const handleKeyDown = (event) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      setIsPressed(true);
    }
  };

  const handleKeyUp = (event) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      setIsPressed(false);
      if (typeof onClick === 'function') {
        onClick(event);
      }
    }
  };

  const handleBlur = () => {
    setIsPressed(false);
  };

  return (
    <button
      style={finalButtonStyle}
      onClick={onClick}
      type="button"
      className={`hamburger-button ${className}`}
      ref={ref}
      aria-label={isOpen ? '메뉴 닫기' : '메뉴 열기'}
      aria-expanded={isOpen}
      aria-controls="sidebar-menu"
      data-demo={isDemo}
      data-environment={isDemo ? 'demo' : 'main'}

      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onBlur={handleBlur}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onTouchCancel={() => setIsPressed(false)}
    >
      {isDemo && (
        <span style={demoBadgeStyle}>
          DEMO
        </span>
      )}
      <span
        style={{
          ...lineStyle,
          opacity: isOpen ? '0' : '1',
        }}
      >
        <span style={lineBeforeStyle} />
        <span style={lineAfterStyle} />
      </span>
    </button>
  );
});

HamburgerButton.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default HamburgerButton;