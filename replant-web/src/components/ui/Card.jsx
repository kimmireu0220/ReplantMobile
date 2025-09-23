import React, { memo, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { tokens } from '../../design/tokens';
import { CardPropTypes } from '../../utils/propTypes';

const Card = forwardRef(({
  children,
  variant = 'default',
  padding = 'base',
  clickable = false,
  onClick,
  className = '',
  style = {},
  // 접근성 props
  ariaLabel,
  ariaDescribedBy,
  role,
  id,
}, ref) => {
  const baseStyles = {
    position: 'relative',
    borderRadius: tokens.components.card.borderRadius,
    backgroundColor: tokens.colors.background.primary,
    cursor: clickable ? 'pointer' : 'default',
  };

  const variantStyles = {
    default: {
      border: `1px solid ${tokens.colors.border.light}`,
      boxShadow: `0 2px 8px var(--color-shadow-light)`,
    },
    elevated: {
      border: `1px solid ${tokens.colors.border.light}`,
      boxShadow: `0 4px 16px var(--color-shadow-medium)`,
    },
    outlined: {
      border: `1px solid ${tokens.colors.border.light}`,
      boxShadow: `0 2px 8px var(--color-shadow-light)`,
    },
    mission: {
      border: `1px solid ${tokens.colors.border.medium}`,
      boxShadow: `0 3px 12px var(--color-shadow-light)`,
    },
    dex: {
      border: `1px solid ${tokens.colors.border.light}`,
      boxShadow: `0 2px 10px var(--color-shadow-light)`,
    },
  };

  const paddingStyles = {
    sm: {
      padding: tokens.spacing[3],
    },
    base: {
      padding: tokens.components.card.padding,
    },
    lg: {
      padding: tokens.spacing[6],
    },
  };

  const cardStyle = {
    ...baseStyles,
    ...variantStyles[variant],
    ...paddingStyles[padding],
    ...style,
  };

  return (
    <div
      ref={ref}
      id={id}
      className={`replant-card ${className}`}
      style={cardStyle}
      onClick={clickable ? onClick : undefined}
      role={role || (clickable ? 'button' : undefined)}
      tabIndex={clickable ? 0 : undefined}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      onKeyDown={clickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick && onClick();
        }
      } : undefined}
    >
      {children}
    </div>
  );
});

// PropTypes 정의 (clickable prop 및 접근성 props 추가)
const ExtendedCardPropTypes = {
  ...CardPropTypes,
  clickable: PropTypes.bool,
  onClick: PropTypes.func,
  // 접근성 props
  ariaLabel: PropTypes.string,
  ariaDescribedBy: PropTypes.string,
  role: PropTypes.string,
  id: PropTypes.string,
};

Card.propTypes = ExtendedCardPropTypes;

export default memo(Card);