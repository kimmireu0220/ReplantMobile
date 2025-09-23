import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { tokens } from '../../design/tokens';
import { ProgressPropTypes } from '../../utils/propTypes';

const Progress = ({
  value,
  max = 100,
  size = 'base',
  color = tokens.colors.primary[500],
  showLabel = false,
  label,
  className = '',
  // 상태 텍스트(우측 퍼센트/MAX) 색상 오버라이드
  statusColor,
  // 접근성 props
  ariaLabel,
  ariaDescribedBy,
  id,
}) => {
  // 진행률 계산 (최대 100%로 제한)
  const percentage = max === 0 ? 0 : Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeStyles = {
    sm: {
      height: '4px',
      fontSize: tokens.typography.fontSize.xs,
    },
    base: {
      height: '6px',
      fontSize: tokens.typography.fontSize.sm,
    },
    lg: {
      height: '8px',
      fontSize: tokens.typography.fontSize.base,
    },
  };

  const containerStyle = {
    width: '100%',
    backgroundColor: 'transparent',
    background: 'none',
  };

  const trackStyle = {
    width: '100%',
    height: sizeStyles[size].height,
    backgroundColor: 'var(--progress-track, #e5e7eb)',
    background: 'var(--progress-track, #e5e7eb)',
    borderRadius: tokens.borderRadius.full,
    overflow: 'hidden',
    border: 'none',
    outline: 'none',
  };

  const fillStyle = {
    height: '100%',
    width: `${percentage}%`,
    backgroundColor: `var(--progress-fill, ${color})`,
    borderRadius: tokens.borderRadius.full,
    transition: 'width 150ms ease',
  };

  const labelStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing[1],
    fontSize: sizeStyles[size].fontSize,
    color: tokens.colors.text.secondary,
    fontWeight: tokens.typography.fontWeight.normal,
  };

  // 우측 상태 텍스트 스타일: MAX일 때 진행 색상 사용, 아니면 보조 텍스트 색상
  const statusTextStyle = {
    color: statusColor || (percentage >= 100 ? color : tokens.colors.text.secondary),
    fontWeight: percentage >= 100
      ? tokens.typography.fontWeight.bold
      : tokens.typography.fontWeight.normal,
  };

  return (
    <div 
      id={id}
      className={`replant-progress ${className}`} 
      style={containerStyle}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={ariaLabel || label || `진행률 ${Math.round(percentage)}%`}
      aria-describedby={ariaDescribedBy}
    >
      <div style={trackStyle}>
        <div style={fillStyle} />
      </div>
      {(showLabel || label) && (
        <div style={labelStyle}>
          <span>{label || '진행률'}</span>
          <span style={statusTextStyle}>{percentage >= 100 ? 'MAX' : `${Math.round(percentage)}%`}</span>
        </div>
      )}
    </div>
  );
};

// PropTypes 정의 (color, label prop 및 접근성 props 추가)
const ExtendedProgressPropTypes = {
  ...ProgressPropTypes,
  color: PropTypes.string,
  label: PropTypes.string,
  statusColor: PropTypes.string,
  // 접근성 props
  ariaLabel: PropTypes.string,
  ariaDescribedBy: PropTypes.string,
  id: PropTypes.string,
};

Progress.propTypes = ExtendedProgressPropTypes;

export default memo(Progress);