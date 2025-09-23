import React, { useState, memo } from 'react';
import { tokens } from '../../design/tokens';
import Card from '../ui/Card';
import Progress from '../ui/Progress';
import { getCharacterImageUrl } from '../../utils/characterImageUtils';

const CharacterLevelDisplay = ({
  character = null,        // 다중 캐릭터 지원을 위한 새 prop
  characterLevel = null,   // 기존 호환성을 위한 레거시 prop
  showDetails = true,
  variant = 'detailed',
  className = '',
  showEmotionButton = false, // 감정 표현 버튼 표시 여부
}) => {
  const [isWaving, setIsWaving] = useState(false);
  const [isHappy, setIsHappy] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  // 다중 캐릭터 지원: character prop이 있으면 우선 사용, 없으면 characterLevel 사용
  const characterData = character || characterLevel;
  
  if (!characterData) {
    return (
      <div className={`replant-character-level-error ${className}`} style={{
        padding: tokens.spacing[4],
        textAlign: 'center',
        color: tokens.colors.text.secondary,
        fontSize: tokens.typography.fontSize.sm
      }}>
        캐릭터 데이터를 불러올 수 없습니다.
      </div>
    );
  }

  const { level, experience, maxExperience, appearance, categoryInfo } = characterData;
  const title = appearance?.title || characterData.title || `레벨 ${level}`;
  const progressPercentage = (experience / maxExperience) * 100;
  
  // 카테고리 정보가 있는 경우 카테고리 색상 사용
  const primaryColor = categoryInfo?.color || tokens.colors.primary[500];

  // 감정 표현 이미지 매핑 (Supabase 스토리지 기반)
  const getEmotionImage = (level, emotion = 'default') => {
    return getCharacterImageUrl(level, emotion);
  };

  // 이미지 로딩 핸들러
  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
  };

  // 감정 표현 버튼 핸들러
  const handleEmotionButton = () => {
    setIsWaving(true);
    setTimeout(() => {
      setIsWaving(false);
    }, 1000); // 1초 후 기본 상태로 복귀
  };

  // 기쁨 표현 버튼 핸들러
  const handleHappyButton = () => {
    setIsHappy(true);
    setTimeout(() => {
      setIsHappy(false);
    }, 1000); // 1초 후 기본 상태로 복귀
  };

  if (variant === 'compact') {
    const compactStyle = {
      display: 'flex',
      alignItems: 'center',
      gap: tokens.spacing[3],
      padding: tokens.spacing[3],
      backgroundColor: tokens.colors.background.secondary,
      borderRadius: tokens.borderRadius.lg,
    };

    const levelBadgeStyle = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '40px',
      height: '40px',
      borderRadius: tokens.borderRadius.full,
      backgroundColor: primaryColor,
      color: tokens.colors.text.inverse,
      fontSize: tokens.typography.fontSize.lg,
      fontWeight: tokens.typography.fontWeight.bold,
    };

    const infoStyle = {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: tokens.spacing[1],
    };

    const titleStyle = {
      fontSize: tokens.typography.fontSize.sm,
      fontWeight: tokens.typography.fontWeight.semibold,
      color: tokens.colors.text.primary,
    };

    return (
      <div className={`replant-character-level-compact ${className}`} style={compactStyle}>
        <div style={levelBadgeStyle}>
          {level}
        </div>
        <div style={infoStyle}>
          <div style={titleStyle}>{title}</div>
          <Progress
            value={experience}
            max={maxExperience}
            size="sm"
            color={primaryColor}
          />
        </div>
      </div>
    );
  }

  // Detailed variant
  const headerStyle = {
    textAlign: 'center',
    marginBottom: tokens.spacing[6],
  };

  const characterImageStyle = {
    width: '80px',
    height: '80px',
    objectFit: 'contain',
    marginBottom: tokens.spacing[4],
    opacity: imageLoading ? 0.5 : 1,
    transition: 'opacity 0.15s ease, transform 0.15s ease',
    transform: isWaving || isHappy ? 'scale(1.1)' : 'scale(1)'
  };

  const levelDisplayStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing[2],
    marginBottom: tokens.spacing[2],
  };

  const levelNumberStyle = {
    fontSize: tokens.typography.fontSize['3xl'],
    fontWeight: tokens.typography.fontWeight.bold,
    color: primaryColor,
  };

  const levelLabelStyle = {
    fontSize: tokens.typography.fontSize.lg,
    color: tokens.colors.text.secondary,
    fontWeight: tokens.typography.fontWeight.medium,
  };

  const titleDisplayStyle = {
    fontSize: tokens.typography.fontSize.xl,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing[12], // 여백을 훨씬 더 넉넉하게 조정 (8 → 12)
  };

  const progressSectionStyle = {
    marginTop: tokens.spacing[8], // 경험치 섹션 상단에 여백 추가
    marginBottom: showDetails ? tokens.spacing[6] : 0,
  };


  const statsGridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: '1fr 1fr',
    gap: tokens.spacing[4],
  };

  const statItemStyle = {
    textAlign: 'center',
    padding: tokens.spacing[4],
    backgroundColor: 'transparent', // 배경색 제거
    borderRadius: tokens.borderRadius.lg,
  };

  const statValueStyle = {
    fontSize: tokens.typography.fontSize['2xl'],
    fontWeight: tokens.typography.fontWeight.bold,
    color: primaryColor,
    marginBottom: tokens.spacing[1],
  };

  const statLabelStyle = {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.secondary,
  };

  return (
    <Card variant="elevated" padding="lg" className={`replant-character-level-detailed ${className}`}>
      <div style={headerStyle}>
        <img 
          src={getEmotionImage(level, isWaving ? 'waving' : isHappy ? 'happy' : 'default')} 
          alt={`캐릭터 레벨 ${level}`}
          style={characterImageStyle}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        
        <div style={levelDisplayStyle}>
          <span style={levelNumberStyle}>{level}</span>
          <span style={levelLabelStyle}>레벨</span>
        </div>
        
        <div style={titleDisplayStyle}>{title}</div>
        
        {showEmotionButton && (
          <div style={{ textAlign: 'center', marginBottom: tokens.spacing[4], display: 'flex', gap: tokens.spacing[2], justifyContent: 'center' }}>
            <button
              onClick={handleEmotionButton}
              disabled={isWaving || isHappy}
              style={{
                padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
                backgroundColor: isWaving ? tokens.colors.background.secondary : primaryColor,
                color: isWaving ? tokens.colors.text.secondary : tokens.colors.text.inverse,
                border: 'none',
                borderRadius: tokens.borderRadius.full,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                cursor: isWaving ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: isWaving ? 0.7 : 1
              }}
            >
              {isWaving ? '인사 중...' : '손 흔들기'}
            </button>
            <button
              onClick={handleHappyButton}
              disabled={isWaving || isHappy}
              style={{
                padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
                backgroundColor: isHappy ? tokens.colors.background.secondary : tokens.colors.accent.yellow,
                color: isHappy ? tokens.colors.text.secondary : tokens.colors.text.inverse,
                border: 'none',
                borderRadius: tokens.borderRadius.full,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                cursor: isHappy ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: isHappy ? 0.7 : 1
              }}
            >
              {isHappy ? '기뻐하는 중...' : '기쁨 표현'}
            </button>
          </div>
        )}
      </div>

      <div style={progressSectionStyle}>
        <Progress
          value={experience}
          max={maxExperience}
          size="lg"
          color={primaryColor}
          showLabel={true}
          label={`${experience.toLocaleString()} / ${maxExperience.toLocaleString()} EXP`}
        />
      </div>

      {showDetails && (
        <div style={statsGridStyle}>
          <div style={{
            ...statItemStyle,
            backgroundColor: 'unset', // 모든 배경색 재설정
            background: 'none', // 추가 보장
          }} className="no-hover-animation stat-card">
            <div style={statValueStyle}>{characterData.stats?.missionsCompleted || 0}</div>
            <div style={statLabelStyle}>완료한 미션</div>
          </div>
          <div style={{
            ...statItemStyle,
            backgroundColor: 'unset',
            background: 'none',
          }} className="no-hover-animation stat-card">
            <div style={statValueStyle}>{characterData.stats?.streak || 0}</div>
            <div style={statLabelStyle}>연속일</div>
          </div>
          <div style={{
            ...statItemStyle,
            backgroundColor: 'unset',
            background: 'none',
          }} className="no-hover-animation stat-card">
            <div style={statValueStyle}>{Math.round(progressPercentage)}%</div>
            <div style={statLabelStyle}>완료도</div>
          </div>
          <div style={{
            ...statItemStyle,
            backgroundColor: 'unset',
            background: 'none',
          }} className="no-hover-animation stat-card">
            <div style={statValueStyle}>{maxExperience - experience}</div>
            <div style={statLabelStyle}>다음 레벨까지</div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default memo(CharacterLevelDisplay);