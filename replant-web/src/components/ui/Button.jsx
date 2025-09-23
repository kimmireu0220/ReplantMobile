import React, { memo, useRef } from 'react';
import { tokens } from '../../design/tokens';
import { ButtonPropTypes } from '../../utils/propTypes';
import { useTouchFeedback } from '../../hooks/useTouchFeedback';

const Button = ({
  children,
  variant = 'primary',
  size = 'base',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  style = {},
  // 접근성 props
  ariaLabel,
  ariaDescribedBy,
  ariaPressed,
  ariaExpanded,
  id,
}) => {
  const buttonRef = useRef(null);
  const { handleTouchStart, handleTouchEnd } = useTouchFeedback(buttonRef);
  
  const isInteractive = !disabled && !loading;
  
  // 앱 전용 터치 이벤트 핸들러
  const handleButtonTouchStart = () => {
    if (isInteractive) {
      handleTouchStart();
    }
  };

  const handleButtonTouchEnd = () => {
    if (isInteractive) {
      handleTouchEnd();
    }
  };

  const handleButtonClick = (e) => {
    if (isInteractive) {
      if (onClick) onClick(e);
    }
  };

  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: tokens.borderRadius.lg,
    fontWeight: tokens.typography.fontWeight.medium,
    fontSize: tokens.typography.fontSize.sm,
    transition: 'opacity 0.15s ease',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    border: 'none',
    outline: 'none',
    position: 'relative',
    opacity: disabled ? 0.5 : 1,
  };

  const sizeStyles = {
    sm: {
      height: tokens.components.button.height.sm,
      padding: tokens.components.button.padding.sm,
      fontSize: tokens.typography.fontSize.xs,
    },
    base: {
      height: tokens.components.button.height.base,
      padding: tokens.components.button.padding.base,
      fontSize: tokens.typography.fontSize.sm,
    },
    lg: {
      height: tokens.components.button.height.lg,
      padding: tokens.components.button.padding.lg,
      fontSize: tokens.typography.fontSize.base,
    },
  };

  const getVariantStyles = (variant) => {
    const styles = {
      primary: {
        backgroundColor: tokens.colors.primary[600],
        color: tokens.colors.text.inverse,
        boxShadow: `${tokens.shadow.base}, 0 4px 12px ${tokens.colors.mainCharacter.shadow}`,
      },
      secondary: {
        backgroundColor: tokens.colors.gray[100],
        color: tokens.colors.text.primary,
        boxShadow: tokens.shadow.base,
      },
      ghost: {
        backgroundColor: 'transparent',
        color: tokens.colors.text.secondary,
        boxShadow: 'none',
      },
      danger: {
        backgroundColor: tokens.colors.error,
        color: tokens.colors.text.inverse,
        border: 'none',
        boxShadow: tokens.shadow.base,
      },
    };
    return styles[variant] || styles.primary;
  };

  const buttonStyle = {
    ...baseStyles,
    ...sizeStyles[size],
    ...getVariantStyles(variant),
    ...style,
  };

  return (
    <button
      ref={buttonRef}
      id={id}
      type={type}
      onClick={handleButtonClick}
      onTouchStart={handleButtonTouchStart}
      onTouchEnd={handleButtonTouchEnd}
      disabled={disabled || loading}
      className={`replant-button ${className}`}
      style={{
        ...buttonStyle,
        // 앱 전용 스타일
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
      }}
      // 접근성 속성
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-pressed={ariaPressed}
      aria-expanded={ariaExpanded}
      aria-busy={loading}
      role={type === 'button' ? 'button' : undefined}
    >
      {loading && (
        <div
          style={{
            width: '16px',
            height: '16px',
            border: '2px solid transparent',
            borderTop: '2px solid currentColor',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginRight: '8px',
          }}
        />
      )}
      {children}
    </button>
  );
};

// PropTypes 정의
Button.propTypes = ButtonPropTypes;

export default memo(Button);