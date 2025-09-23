import React, { useState } from 'react';
import { tokens } from '../../design/tokens';
import Card from '../ui/Card';
import Progress from '../ui/Progress';
import { getCharacterImageUrl, getCharacterEmoji } from '../../utils/characterImageUtils';

const CharacterCard = ({ 
  character, 
  isSelected = false, 
  showDetails = false,
  onSelect,
  className = '' 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const cardStyle = {
    position: 'relative',
    border: `2px solid ${isSelected ? character.categoryInfo?.color || tokens.colors.primary[500] : tokens.colors.border.light}`,
    borderRadius: tokens.borderRadius.lg,
    padding: tokens.spacing[4],
    backgroundColor: tokens.colors.background.primary,
    cursor: (onSelect && character.unlocked) ? 'pointer' : 'default',
    overflow: 'hidden'
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: tokens.spacing[3]
  };

  const categoryStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing[2],
    padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
    borderRadius: tokens.borderRadius.full,
    backgroundColor: `${character.categoryInfo?.color || tokens.colors.gray[500]}20`,
    color: character.categoryInfo?.color || tokens.colors.text.secondary,
    fontSize: tokens.typography.fontSize.xs,
    fontWeight: tokens.typography.fontWeight.medium
  };


  // 원형 캐릭터 이미지 컨테이너 (캐릭터 상세정보 페이지와 동일)
  const characterImageContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: tokens.spacing[4]
  };

  // 원형 프레임 스타일 (캐릭터 상세정보 페이지와 동일)
  const characterImageFrameStyle = {
    width: '110px',
    height: '110px',
    borderRadius: tokens.borderRadius.full,
    backgroundColor: (character.categoryInfo?.color || tokens.colors.primary[500]) + '20',
    border: `4px solid ${character.categoryInfo?.color || tokens.colors.primary[500]}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    boxShadow: `0 8px 32px ${(character.categoryInfo?.color || tokens.colors.primary[500])}30`
  };

  // 이미지 스타일 (캐릭터 상세정보 페이지와 동일)
  const imageStyle = {
    width: '80px',
    height: '80px',
    objectFit: 'contain',
    display: imageLoading ? 'none' : 'block',
    // 잠금된 캐릭터는 흑백 처리 및 투명도 조정
    filter: character.unlocked ? 'none' : 'grayscale(100%)',
    opacity: character.unlocked ? (imageLoading ? 0.5 : 1) : 0.6
  };

  // 로딩 스타일
  const loadingStyle = {
    display: imageLoading ? 'flex' : 'none',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    color: tokens.colors.text.secondary,
    fontSize: tokens.typography.fontSize.sm
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

  const characterNameStyle = {
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing[2],
    lineHeight: tokens.typography.lineHeight.tight,
    textAlign: 'center'
  };

  const levelStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing[2],
    marginBottom: tokens.spacing[3]
  };

  const levelTextStyle = {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.secondary
  };

  // 레벨을 별로 표시하는 함수
  const renderLevelStars = (level) => {
    const stars = [];
    for (let i = 0; i < level; i++) {
      stars.push('⭐️');
    }
    return stars.join('');
  };

  // 경험치 섹션 스타일
  const experienceSectionStyle = {
    marginBottom: tokens.spacing[3]
  };

  const statsStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: tokens.spacing[2],
    marginTop: tokens.spacing[3]
  };

  const statItemStyle = {
    textAlign: 'center',
    padding: tokens.spacing[2],
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.base
  };

  const statValueStyle = {
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary
  };

  const statLabelStyle = {
    fontSize: tokens.typography.fontSize.xs,
    color: tokens.colors.text.secondary,
    marginTop: tokens.spacing[1]
  };

  // 잠금 오버레이 스타일 (잠긴 캐릭터용)
  const lockOverlayStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '24px',
    opacity: 0.9,
    zIndex: 2,
    pointerEvents: 'none'
  };

  const handleClick = () => {
    // 잠긴 캐릭터는 클릭해도 상세정보 페이지로 넘어가지 않음
    if (!character.unlocked) {
      return;
    }
    
    if (onSelect) {
      onSelect(character);
    }
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  // 캐릭터 이미지 URL 생성
  const getImageUrl = () => getCharacterImageUrl(character.level, 'default');

  // 폴백 이모지 생성
  const getFallbackEmoji = () => {
    return getCharacterEmoji(character.level, character.category);
  };

  return (
    <Card
      variant="outlined"
      className={`character-card ${className}`}
      style={cardStyle}
      onClick={handleClick}
      clickable={!!onSelect && character.unlocked}
    >
      <div style={headerStyle}>
        <div style={categoryStyle}>
          <span>{character.categoryInfo?.emoji || '❓'}</span>
          <span>{character.categoryInfo?.name || '카테고리'}</span>
        </div>
      </div>

      {/* 원형 캐릭터 이미지 영역 */}
      <div style={characterImageContainerStyle}>
        <div style={characterImageFrameStyle}>
          <div style={loadingStyle}>
            <span>🔄</span>
          </div>
          <div style={fallbackStyle}>
            <span>{getFallbackEmoji()}</span>
          </div>
          <img
            src={getImageUrl()}
            alt={`${character.name} 캐릭터`}
            style={imageStyle}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          
          {/* 잠금 오버레이 */}
          {!character.unlocked && (
            <div style={lockOverlayStyle}>
              🔒
            </div>
          )}
        </div>
      </div>

      <h3 style={characterNameStyle}>{character.name}</h3>

      <div style={levelStyle}>
        <div style={{
          ...levelTextStyle,
          fontSize: tokens.typography.fontSize.base,
          fontWeight: tokens.typography.fontWeight.bold,
          color: character.categoryInfo?.color || tokens.colors.primary[500]
        }}>
          {renderLevelStars(character.level)}
        </div>
      </div>

      {/* 경험치 프로그레스 바 */}
      <div style={experienceSectionStyle}>
        <Progress
          value={character.experience}
          max={character.maxExperience}
          size="sm"
          color={character.categoryInfo?.color || tokens.colors.primary[500]}
          showLabel={true}
          label={`${character.experience.toLocaleString()} / ${character.maxExperience.toLocaleString()} EXP`}
        />
      </div>

      {showDetails && character.stats && (
        <div style={statsStyle}>
          <div style={statItemStyle}>
            <div style={statValueStyle}>{character.stats.missionsCompleted || 0}</div>
            <div style={statLabelStyle}>완료 미션</div>
          </div>
          <div style={statItemStyle}>
            <div style={statValueStyle}>{character.stats.streak || 0}</div>
            <div style={statLabelStyle}>연속 달성</div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default CharacterCard;
