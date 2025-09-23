import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tokens } from '../design/tokens';
import { createPageLayout, userInfo } from '../styles/layouts';
import { useCharacter } from '../hooks/useCharacter';
import { useNotification } from '../hooks/useNotification';
import { useToast } from '../hooks/useToast';
import { Card, Button, Progress, ToastContainer, NotificationContainer, LoadingState } from '../components/ui';
import { PageTitle } from '../components/ui/ScreenReaderOnly';
import CharacterNameEdit from '../components/character/CharacterNameEdit';
import { getCharacterImageUrl } from '../utils/characterImageUtils';

import { characterService } from '../services/characterService';
import { missionService } from '../services/missionService';
import { getCurrentUserNickname } from '../config/supabase';


const CharacterDetailPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [isWaving, setIsWaving] = useState(false);
  const [isHappy, setIsHappy] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [completedMissionsCount, setCompletedMissionsCount] = useState(0);

  const { 
    characters,
    selectedCharacter,
    loading,  // loading 상태 추가
    setSelectedCharacter
  } = useCharacter();
  const { notifications, removeNotification, markAsRead } = useNotification();
  const { toasts, showToast, removeToast } = useToast();
  const nickname = getCurrentUserNickname();
  
  // 카테고리 ID로 캐릭터 찾기
  const character = characters[categoryId];
  
  // 현재 캐릭터가 대표 캐릭터인지 확인
  const isMainCharacter = selectedCharacter?.category === categoryId;

  // 실제 완료된 미션 수 가져오기
  useEffect(() => {
    const loadCompletedMissionsCount = async () => {
      if (!categoryId) return;
      
      try {
        const { data, error } = await missionService.getCompletedMissions(null, { category: categoryId });
        if (!error && data) {
          setCompletedMissionsCount(data.length);
        }
      } catch (error) {
        // Error handled silently
      }
    };

    loadCompletedMissionsCount();
  }, [categoryId]);

  // 페이지 레이아웃 스타일 (리팩토링됨)
  const pageLayout = createPageLayout();


  // 로딩 중일 때 (리팩토링된 로딩 상태)
  if (loading) {
    return (
      <div style={pageLayout.container} role="main" aria-label="캐릭터 상세정보">
        <PageTitle title="캐릭터 상세정보" />
        <div style={pageLayout.content}>
          <div style={pageLayout.header}>
            {nickname && (
              <div style={userInfo}>
                <span>👤</span>
                <span>{nickname}</span>
              </div>
            )}
          </div>

          <LoadingState 
            message="캐릭터 정보를 불러오는 중..."
            description="잠시만 기다려주세요"
            showSkeleton={true}
            skeletonType="character"
          />
        </div>
      </div>
    );
  }

  // 캐릭터가 존재하지 않는 경우 (로딩 완료 후)
  if (!character) {
    return (
      <div style={pageLayout.container} role="main" aria-label="캐릭터 상세정보">
        <PageTitle title="캐릭터 상세정보" />
        <div style={pageLayout.content}>
          <div style={{ textAlign: 'center', padding: tokens.spacing[8] }} role="status" aria-live="polite">
            표시할 캐릭터가 없습니다.
          </div>
        </div>
      </div>
    );
  }



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

  // 대표 캐릭터 설정 핸들러
  const handleSetAsMainCharacter = async () => {
    if (!character?.unlocked || isMainCharacter) {
      return;
    }
    
    try {
      const success = await setSelectedCharacter(character.category);
      if (success) {
        showToast('대표 캐릭터가 설정되었습니다!', 'success');
      } else {
        showToast('대표 캐릭터 설정에 실패했습니다.', 'error');
      }
    } catch (error) {
      showToast('오류가 발생했습니다.', 'error');
    }
  };





  // 새로운 헤더 스타일
  const simpleHeaderStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: tokens.spacing[6],
    padding: `${tokens.spacing[4]} 0`
  };

  const headerTitleStyle = {
    fontSize: tokens.typography.fontSize.xl,
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary,
    margin: 0
  };

  // 캐릭터 카드 스타일
  const characterCardStyle = {
    padding: tokens.spacing[6],
    textAlign: 'center',
    marginBottom: tokens.spacing[6]
  };

  const imageContainerStyle = {
    width: '110px',
    height: '110px',
    borderRadius: tokens.borderRadius.full,
    backgroundColor: (character.categoryInfo?.color || tokens.colors.primary[500]) + '20',
    border: `4px solid ${character.categoryInfo?.color || tokens.colors.primary[500]}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: tokens.spacing[4],
    position: 'relative',
    boxShadow: `0 8px 32px ${(character.categoryInfo?.color || tokens.colors.primary[500])}30`
  };

  const characterImageStyle = {
    width: '80px',
    height: '80px',
    objectFit: 'contain',
    opacity: imageLoading ? 0.3 : 1,
    transition: 'opacity 0.3s ease, transform 0.3s ease',
    transform: isWaving || isHappy ? 'scale(1.1)' : 'scale(1)',
    filter: imageLoading ? 'blur(2px)' : 'none'
  };

  // 이미지 로딩 오버레이 스타일
  const imageLoadingOverlayStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '24px',
    color: tokens.colors.text.secondary,
    opacity: imageLoading ? 1 : 0,
    transition: 'opacity 0.3s ease',
    pointerEvents: 'none'
  };

  const categoryEmojiStyle = {
    fontSize: tokens.typography.fontSize['2xl']
  };

  const categoryNameStyle = {
    fontSize: tokens.typography.fontSize.xl,
    fontWeight: tokens.typography.fontWeight.bold,
    color: character.categoryInfo?.color || tokens.colors.primary[500]
  };

  // 카테고리와 레벨을 같은 줄에 배치하는 스타일
  const categoryAndLevelStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing[2],
    marginBottom: tokens.spacing[6], // 여백 증가: 4 → 6
    flexWrap: 'wrap'
  };

  // 구분자 스타일
  const separatorStyle = {
    fontSize: tokens.typography.fontSize.base,
    color: tokens.colors.text.secondary,
    marginLeft: tokens.spacing[1],
    marginRight: tokens.spacing[1]
  };

  const levelNumberStyle = {
    fontSize: tokens.typography.fontSize['3xl'],
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary
  };

  const levelLabelStyle = {
    fontSize: tokens.typography.fontSize.lg,
    color: tokens.colors.text.secondary,
    fontWeight: tokens.typography.fontWeight.medium
  };

  // 캐릭터 이름 스타일 (중앙 정렬 강화)
  const characterNameStyle = {
    marginBottom: tokens.spacing[4],
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%'
  };

  // 통계 섹션 스타일
  const statsSectionStyle = {
    marginBottom: tokens.spacing[6]
  };

  const sectionTitleStyle = {
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing[4]
  };

  const statsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: tokens.spacing[4]
  };

  const statCardStyle = {
    padding: tokens.spacing[4],
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.lg,
    textAlign: 'center'
  };

  const statValueStyle = {
    fontSize: tokens.typography.fontSize['2xl'],
    fontWeight: tokens.typography.fontWeight.bold,
    color: character.categoryInfo?.color || tokens.colors.primary[500],
    marginBottom: tokens.spacing[1]
  };

  const statLabelStyle = {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.primary,
    fontWeight: tokens.typography.fontWeight.medium
  };

  // 경험치 섹션 스타일
  const experienceSectionStyle = {
    marginBottom: tokens.spacing[6]
  };



  // 액션 버튼 스타일
  const actionButtonsStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing[3]
  };

  return (
    <div style={pageLayout.container} role="main" aria-label="캐릭터 상세정보">
      <PageTitle title="캐릭터 상세정보" />
      <div style={pageLayout.content}>
        <header style={simpleHeaderStyle}>
          <h1 style={headerTitleStyle}>캐릭터 상세정보</h1>
        </header>

        <NotificationContainer notifications={notifications} removeNotification={removeNotification} />
        <ToastContainer toasts={toasts} removeToast={removeToast} />

        <Card style={characterCardStyle}>
          {/* 대표 캐릭터 설정 버튼 - 카드 우측 끝 */}
          {character.unlocked && (
            <div style={{
              position: 'absolute',
              top: tokens.spacing[4],
              right: tokens.spacing[4],
              zIndex: tokens.zIndex.dropdown
            }}>
              {isMainCharacter ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                  backgroundColor: character.categoryInfo?.color || tokens.colors.primary[500],
                  color: '#ffffff',
                  borderRadius: tokens.borderRadius.base,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  boxShadow: `0 2px 8px ${(character.categoryInfo?.color || tokens.colors.primary[500])}40`,
                  border: `1px solid rgba(255, 255, 255, 0.3)`
                }}>
                  대표 캐릭터
                </div>
              ) : (
                <button
                  onClick={handleSetAsMainCharacter}
                  style={{
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    color: character.categoryInfo?.color || tokens.colors.primary[500],
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    transition: 'opacity 0.2s ease',
                    boxShadow: 'none',
                    '--focus-ring-width': '0px',
                    '--focus-outline-width': '0px'
                  }}

                  onFocus={(e) => {
                    e.target.style.outline = 'none';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  대표캐릭터 설정
                </button>
              )}
            </div>
          )}
          <div style={imageContainerStyle}>
            <img 
              src={getEmotionImage(character.level, isWaving ? 'waving' : isHappy ? 'happy' : 'default')} 
              alt={`${character.categoryInfo?.name || '캐릭터'} 레벨 ${character.level}`}
              style={characterImageStyle}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
            {imageLoading && (
              <div style={imageLoadingOverlayStyle}>
                <div style={{ fontSize: '32px', marginBottom: tokens.spacing[2] }}>✨</div>
                <div style={{ fontSize: tokens.typography.fontSize.sm }}>로딩 중...</div>
              </div>
            )}
          </div>

          <div style={characterNameStyle}>
            <CharacterNameEdit
              character={character}
              isEditing={isEditingName}
              onEditToggle={setIsEditingName}
              onSave={async (newName) => {
                try {
                  await characterService.updateCharacterName(categoryId, newName);
                  showToast('캐릭터 이름이 변경되었습니다!', 'success');
                  // 페이지 새로고침으로 데이터 업데이트
                  window.location.reload();
                } catch (error) {
                  showToast('이름 변경에 실패했습니다.', 'error');
                }
              }}
              onCancel={() => {
                showToast('이름 변경이 취소되었습니다.', 'info');
              }}
              onRestoreDefault={async () => {
                try {
                  await characterService.resetCharacterNameToDefault(categoryId);
                  showToast('기본 이름으로 복원되었습니다!', 'success');
                  // 페이지 새로고침으로 데이터 업데이트
                  window.location.reload();
                } catch (error) {
                  showToast('기본값 복원에 실패했습니다.', 'error');
                }
              }}
            />
          </div>

          <div style={categoryAndLevelStyle}>
            <span style={categoryEmojiStyle}>{character.categoryInfo?.emoji || '❓'}</span>
            <span style={categoryNameStyle}>{character.categoryInfo?.name || '알 수 없는 캐릭터'}</span>
            <span style={separatorStyle}>•</span>
            <span style={levelNumberStyle}>{character.level}</span>
            <span style={levelLabelStyle}>레벨</span>
          </div>

          {/* 감정 표현 버튼 */}
          <div style={{ textAlign: 'center', marginBottom: tokens.spacing[4], display: 'flex', gap: tokens.spacing[4], justifyContent: 'center' }}>
            <button
              onClick={handleEmotionButton}
              disabled={isWaving || isHappy}
              style={{
                padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
                backgroundColor: isWaving ? tokens.colors.background.secondary : (character.categoryInfo?.color || tokens.colors.primary[500]) + 'CC',
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
                backgroundColor: isHappy ? tokens.colors.background.secondary : (character.categoryInfo?.color || tokens.colors.primary[500]) + 'CC',
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

          {/* 경험치 정보 */}
          <div style={experienceSectionStyle}>
            <h3 style={sectionTitleStyle}>경험치</h3>
            <Progress
              value={Math.min(character.experience, character.maxExperience)}
              max={character.maxExperience}
              size="lg"
              color={character.categoryInfo?.color || tokens.colors.primary[500]}
              showLabel={true}
              label={`${character.experience.toLocaleString()} / ${character.maxExperience.toLocaleString()} EXP`}
            />
          </div>

          {/* 통계 정보 */}
          <div style={statsSectionStyle}>
            <h3 style={sectionTitleStyle}>활동 통계</h3>
            <div style={statsGridStyle}>
              <div 
                style={{
                  ...statCardStyle,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: `1px solid ${tokens.colors.border.light}`,
                }}
                onClick={() => navigate(`/completed-missions?category=${character.category}`)}

              >
                <div style={statValueStyle}>{completedMissionsCount}</div>
                <div style={statLabelStyle}>완료한 미션</div>
              </div>
              <div style={statCardStyle}>
                <div style={statValueStyle}>{character.stats.streak}</div>
                <div style={statLabelStyle}>연속일</div>
              </div>
              <div style={statCardStyle}>
                <div style={statValueStyle}>{character.stats.longestStreak}</div>
                <div style={statLabelStyle}>최고 기록</div>
              </div>
              <div style={statCardStyle}>
                <div style={statValueStyle}>{character.totalExperience}</div>
                <div style={statLabelStyle}>총 경험치</div>
              </div>
            </div>
          </div>
        </Card>

        {/* 액션 버튼들 */}
        <div style={actionButtonsStyle}>
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate(`/mission?category=${character.category}`)}
            style={{
              backgroundColor: (character.categoryInfo?.color || tokens.colors.primary[500]) + 'CC'
            }}
          >
            {character.categoryInfo?.name || '캐릭터'} 미션 수행하기
          </Button>
        </div>
      </div>
      <NotificationContainer
        notifications={notifications}
        removeNotification={removeNotification}
        markAsRead={markAsRead}
      />
    </div>
  );
};

export default CharacterDetailPage; 