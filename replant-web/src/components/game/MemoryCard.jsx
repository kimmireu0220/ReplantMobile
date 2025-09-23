import React from 'react';
import { tokens } from '../../design/tokens';

const MemoryCard = ({
  id,
  isFlipped,
  isMatched,
  isMismatched = false,
  onClick,
  faceUrl,
  badge,
  ariaLabel,
  size = 88,
  disabled = false,
}) => {
  // 반픽셀로 계산될 경우 흐릿해지는 것을 방지하기 위해 정수 px 보장
  const intSize = Math.round(size);
  const cardStyle = {
    width: `${intSize}px`,
    height: `${intSize}px`,
    perspective: '800px',
  };

  const innerStyle = {
    position: 'relative',
    width: '100%',
    height: '100%',
    transition: 'transform 0.3s ease',
    transformStyle: 'preserve-3d',
    transform: isFlipped || isMatched ? 'rotateY(180deg)' : 'rotateY(0deg)'
  };

  const commonFace = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: tokens.borderRadius.lg,
    backfaceVisibility: 'hidden',
    boxShadow: isMismatched ? `0 0 0 3px ${tokens.colors.error}` : 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const backStyle = {
    ...commonFace,
    background: tokens.colors.background.secondary,
    border: `2px solid ${tokens.colors.primary[500]}`,
    color: tokens.colors.primary[600],
    fontSize: tokens.typography.fontSize['2xl'],
    filter: 'none',
    WebkitFilter: 'none'
  };

  const frontStyle = {
    ...commonFace,
    background: tokens.colors.background.tertiary,
    transform: 'rotateY(180deg)',
    filter: 'none',
    WebkitFilter: 'none'
  };

  const imageStyle = {
    width: `${Math.round(intSize * 0.72)}px`,
    height: `${Math.round(intSize * 0.72)}px`,
    objectFit: 'contain',
    imageRendering: 'pixelated',
    filter: 'none',
    WebkitFilter: 'none'
  };

  // 카드 뒷면 조커 아이콘 크기를 카드 크기에 비례하도록 조정
  const jokerIconStyle = {
    fontSize: `${Math.round(intSize * 0.6)}px`,
    lineHeight: 1,
    filter: 'none',
    WebkitFilter: 'none'
  };

  // 배지: 흐림/회색/투명도 제거, 선명하게 표시
  const badgeStyle = {
    position: 'absolute',
    right: Math.round(intSize * 0.06),
    bottom: Math.round(intSize * 0.04),
    fontSize: `${Math.round(intSize * 0.24)}px`,
    lineHeight: 1,
    filter: 'none',
    WebkitFilter: 'none',
    opacity: 1,
    mixBlendMode: 'normal',
    textShadow: 'none',
    WebkitFontSmoothing: 'auto',
    MozOsxFontSmoothing: 'auto',
    pointerEvents: 'none',
    zIndex: 2,
  };

  const handleClick = () => {
    if (!disabled) {
      onClick(id);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
      aria-pressed={isFlipped}
      disabled={disabled}
      style={{
        padding: 0,
        border: 'none',
        background: 'transparent',
        cursor: disabled ? 'default' : 'pointer',
        opacity: 1,
        filter: 'none',
        WebkitFilter: 'none',
      }}
    >
      <div style={cardStyle}>
        <div style={innerStyle}>
          <div style={backStyle} aria-hidden="true">
            <span role="img" aria-label="joker" style={jokerIconStyle}>🃏</span>
          </div>
          <div style={frontStyle} aria-hidden="true">
            {faceUrl ? (
              <img src={faceUrl} alt="" style={imageStyle} />
            ) : (
              <span role="img" aria-label="seed">🌱</span>
            )}
            {badge && <span style={badgeStyle}>{badge}</span>}
          </div>
        </div>
      </div>
    </button>
  );
};

export default React.memo(MemoryCard);


