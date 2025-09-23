import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokens } from '../../design/tokens';
import Progress from '../ui/Progress';
import Logo from '../ui/Logo';
import { getCharacterImageUrl, getCharacterEmoji } from '../../utils/characterImageUtils';

const MainCharacterDisplay = ({
  character,
  loading = false,
  className = ''
}) => {
  const navigate = useNavigate();
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // 빈 상태 스타일들 - 최상단으로 이동
  const emptyStateStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '280px',
    textAlign: 'center',
    padding: tokens.spacing[6],
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.lg
  };

  const emptyIconStyle = {
    fontSize: '64px',
    marginBottom: tokens.spacing[4]
  };

  const emptyTextStyle = {
    fontSize: tokens.typography.fontSize.base,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.spacing[4]
  };

  // 로딩 상태 스타일
  const loadingStateStyle = {
    ...emptyStateStyle,
    color: tokens.colors.text.secondary
  };

  // 로딩 중일 때
  if (loading) {
    return (
      <div style={loadingStateStyle}>
        <div style={emptyIconStyle}>✨</div>
        <p style={emptyTextStyle}>
          캐릭터 정보를 불러오는 중...
        </p>
      </div>
    );
  }

  if (!character) {
    return (
      <div style={emptyStateStyle}>
        <Logo size={32} style={emptyIconStyle} />
        <p style={emptyTextStyle}>
          첫 번째 미션을 완료하여 캐릭터 잠금을 해제하세요
        </p>
      </div>
    );
  }

  const {
    categoryInfo,
    level,
    experience,
    maxExperience,
    stats
  } = character;

  // 캐릭터 이미지 매핑 (Supabase 스토리지 기반)
  const getCharacterImage = (level) => {
    return getCharacterImageUrl(level, 'default');
  };

  // 폴백 이모지 생성
  const getFallbackEmoji = () => {
    return getCharacterEmoji(level, character.category);
  };

  // 이미지 로딩 핸들러
  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  // 컨테이너 스타일
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: tokens.spacing[6],
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.lg,
    position: 'relative',
    minHeight: '280px'
  };

  // 원형 캐릭터 이미지 컨테이너 스타일 (캐릭터 상세정보 페이지와 동일)
  const imageContainerStyle = {
    width: '110px',
    height: '110px',
    borderRadius: tokens.borderRadius.full,
    backgroundColor: (categoryInfo?.color || tokens.colors.primary[500]) + '20',
    border: `4px solid ${categoryInfo?.color || tokens.colors.primary[500]}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.spacing[4],
    position: 'relative',
    boxShadow: `0 8px 32px ${(categoryInfo?.color || tokens.colors.primary[500])}30`,
    transition: 'all 0.2s ease',
    overflow: 'hidden'
  };

  // 캐릭터 이미지 스타일 (캐릭터 상세정보 페이지와 동일)
  const characterImageStyle = {
    width: '80px',
    height: '80px',
    objectFit: 'contain',
    transition: 'opacity 0.15s ease, transform 0.15s ease',
    opacity: imageLoading ? 0.5 : 1,
    display: imageLoading ? 'none' : 'block'
  };

  // 로딩 스타일
  const loadingStyle = {
    display: imageLoading ? 'flex' : 'none',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    color: tokens.colors.text.secondary,
    fontSize: tokens.typography.fontSize['3xl']
  };

  // 폴백 스타일 (원형)
  const fallbackStyle = {
    display: imageError ? 'flex' : 'none',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: tokens.colors.background.secondary,
    color: tokens.colors.text.secondary,
    fontSize: tokens.typography.fontSize['3xl'],
    borderRadius: '50%'
  };

  // 캐릭터 정보 스타일
  const infoStyle = {
    textAlign: 'center',
    marginBottom: tokens.spacing[4]
  };

  const characterNameStyle = {
    fontSize: tokens.typography.fontSize.xl,
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing[2]
  };

  const levelStyle = {
    fontSize: tokens.typography.fontSize.lg,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.spacing[3]
  };

  // 경험치 진행률 컨테이너 스타일
  const progressContainerStyle = {
    width: '100%',
    marginBottom: tokens.spacing[4]
  };

  // 경험치 수치 표시 스타일
  const experienceTextStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing[2],
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.secondary,
    fontWeight: tokens.typography.fontWeight.medium
  };

  const experienceValueStyle = {
    color: tokens.colors.text.primary,
    fontWeight: tokens.typography.fontWeight.normal
  };

  const percentageStyle = {
    color: (categoryInfo?.color || tokens.colors.primary[500]),
    fontWeight: tokens.typography.fontWeight.bold
  };

  const statsStyle = {
    display: 'flex',
    justifyContent: 'space-around',
    width: '100%',
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.secondary
  };

  const statItemStyle = {
    textAlign: 'center'
  };

  const statValueStyle = {
    fontSize: tokens.typography.fontSize.base,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
    display: 'block'
  };

  const handleClick = () => {
    navigate(`/character/detail/${character.category}`);
  };

  // 경험치 퍼센트 계산 (최대 레벨에서는 100%로 제한)
  const experiencePercentage = maxExperience > 0 
    ? Math.min(Math.round((experience / maxExperience) * 100), 100) 
    : 0;

  return (
    <div 
      style={containerStyle} 
      className={`main-character-display ${className}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`${categoryInfo?.name} 캐릭터 상세 정보 보기`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* 원형 캐릭터 이미지 영역 */}
      <div style={imageContainerStyle} className="character-image-container">
        <div style={loadingStyle}>
          <span>🔄</span>
        </div>
        <div style={fallbackStyle}>
          <span>{getFallbackEmoji()}</span>
        </div>
        <img 
          src={getCharacterImage(level)} 
          alt={`레벨 ${level} ${categoryInfo?.name} 캐릭터`}
          style={characterImageStyle}
          className="character-image"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </div>

      <div style={infoStyle}>
        <div style={characterNameStyle}>
          {character.name || categoryInfo?.name}
        </div>
        <div style={levelStyle}>
          <span style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
            <span>{categoryInfo?.emoji || '🎯'}</span>
            <span>{categoryInfo?.name || '카테고리'}</span>
            <span style={{ color: tokens.colors.text.tertiary }}>·</span>
            <span>{level} 레벨</span>
          </span>
        </div>
      </div>

      {/* 경험치 진행률 섹션 */}
      <div style={progressContainerStyle}>
        {/* 진행률 바 */}
        <Progress 
          value={Math.min(experience, maxExperience)} 
          max={maxExperience} 
          variant="primary"
          color={categoryInfo?.color || tokens.colors.primary[500]}
          className="character-progress"
          size="lg"
        />
        
        {/* 경험치 수치 표시 */}
        <div style={experienceTextStyle}>
          <span style={experienceValueStyle}>
            {experience.toLocaleString()} / {maxExperience.toLocaleString()} EXP
          </span>
          <span style={percentageStyle}>
            {experiencePercentage >= 100 ? 'MAX' : `${experiencePercentage}%`}
          </span>
        </div>
      </div>

      <div style={statsStyle}>
        <div style={statItemStyle}>
          <span style={statValueStyle}>{stats.missionsCompleted}</span>
          완료 미션
        </div>
        <div style={statItemStyle}>
          <span style={statValueStyle}>{stats.streak}</span>
          연속 일수
        </div>
        <div style={statItemStyle}>
          <span style={statValueStyle}>{stats.longestStreak}</span>
          최고 기록
        </div>
      </div>
    </div>
  );
};

export default MainCharacterDisplay;