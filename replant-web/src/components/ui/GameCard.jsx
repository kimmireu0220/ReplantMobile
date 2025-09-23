import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokens } from '../../design/tokens';
import { gameService } from '../../services';

const GameCard = ({ 
  title, 
  description, 
  icon, 
  path, 
  available = true,
  disabled = false,
  gameType // 새로 추가: 게임 타입 ('obstacle', 'puzzle', 'memory', 'quiz')
}) => {
  const navigate = useNavigate();
  const [highScore, setHighScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // 최고점수 로드
  useEffect(() => {
    const loadHighScore = async () => {
      if (!gameType || !available) {
        setIsLoading(false);
        return;
      }
      
      try {
        const score = await gameService.getHighScore(gameType);
        setHighScore(score);
      } catch (error) {
        console.error(`Failed to load high score for ${gameType}:`, error);
        setHighScore(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadHighScore();
  }, [gameType, available]);

  const handleClick = () => {
    if (disabled || !available) return;
    navigate(path);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  // 카드 기본 스타일
  const cardStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacing[6],
    borderRadius: tokens.borderRadius.lg,
    backgroundColor: available ? tokens.colors.background.secondary : tokens.colors.background.disabled,
    border: `2px solid ${available ? tokens.colors.border.primary : tokens.colors.border.disabled}`,
    cursor: available && !disabled ? 'pointer' : 'not-allowed',
    transition: 'all 0.2s ease-in-out',
    minHeight: '180px',
    position: 'relative',
    opacity: available ? 1 : 0.6,
    textAlign: 'center',
    ':hover': available && !disabled ? {
      backgroundColor: tokens.colors.background.hover,
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
    } : {},
    ':focus': {
      outline: `2px solid ${tokens.colors.primary.main}`,
      outlineOffset: '2px'
    }
  };

  // 아이콘 스타일
  const iconStyle = {
    fontSize: '3.5rem',
    marginBottom: tokens.spacing[4],
    filter: available ? 'none' : 'grayscale(100%)',
    transition: 'transform 0.2s ease-in-out'
  };

  // 제목 스타일
  const titleStyle = {
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: available ? tokens.colors.text.primary : tokens.colors.text.disabled,
    marginBottom: tokens.spacing[2],
    lineHeight: tokens.typography.lineHeight.tight
  };

  // 설명 스타일
  const descriptionStyle = {
    fontSize: tokens.typography.fontSize.sm,
    color: available ? tokens.colors.text.secondary : tokens.colors.text.disabled,
    lineHeight: tokens.typography.lineHeight.relaxed,
    marginBottom: tokens.spacing[2]
  };

  // 최고점수 스타일
  const highScoreStyle = {
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: available ? tokens.colors.primary.main : tokens.colors.text.disabled,
    marginBottom: tokens.spacing[3],
    padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
    backgroundColor: available ? tokens.colors.primary.light + '20' : tokens.colors.gray[200],
    borderRadius: tokens.borderRadius.md,
    border: `1px solid ${available ? tokens.colors.primary.light : tokens.colors.gray[300]}`
  };

  // 상태 배지 스타일
  const badgeStyle = {
    position: 'absolute',
    top: tokens.spacing[2],
    right: tokens.spacing[2],
    backgroundColor: available ? tokens.colors.success.light : tokens.colors.warning.light,
    color: available ? tokens.colors.success.dark : tokens.colors.warning.dark,
    padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
    borderRadius: tokens.borderRadius.full,
    fontSize: tokens.typography.fontSize.xs,
    fontWeight: tokens.typography.fontWeight.medium
  };

  // 버튼 스타일
  const buttonStyle = {
    backgroundColor: available ? tokens.colors.primary.main : tokens.colors.gray[400],
    color: tokens.colors.white,
    border: 'none',
    borderRadius: tokens.borderRadius.md,
    padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.medium,
    cursor: available && !disabled ? 'pointer' : 'not-allowed',
    ':focus': {
      outline: `2px solid ${tokens.colors.primary.light}`,
      outlineOffset: '2px'
    }
  };

  return (
    <div
      style={cardStyle}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${title} ${available ? '플레이하기' : '준비중'}`}
      aria-disabled={!available || disabled}
    >
      {/* 상태 배지 */}
      <div style={badgeStyle}>
        {available ? '✅ 플레이 가능' : '🚧 준비중'}
      </div>

      {/* 게임 아이콘 */}
      <div 
        style={{
          ...iconStyle,
          transform: available && !disabled ? 'scale(1)' : 'scale(1)',
        }} 
        className="game-icon"
        aria-hidden="true"
      >
        {icon}
      </div>

      {/* 게임 제목 */}
      <h3 style={titleStyle}>
        {title}
      </h3>

      {/* 게임 설명 */}
      <p style={descriptionStyle}>
        {description}
      </p>

      {/* 최고점수 표시 */}
      {available && gameType && (
        <div style={highScoreStyle}>
          {isLoading ? (
            "📊 로딩중..."
          ) : (
            `🏆 최고점수: ${highScore.toLocaleString()}점`
          )}
        </div>
      )}

      {/* 플레이 버튼 */}
      <button
        style={buttonStyle}
        disabled={!available || disabled}
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
        aria-label={`${title} ${available ? '플레이하기' : '준비중'}`}
      >
        {available ? '플레이하기' : '준비중'}
      </button>
    </div>
  );
};

export default GameCard;