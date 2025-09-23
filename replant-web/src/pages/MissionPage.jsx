import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { tokens } from '../design/tokens';
import { createPageLayout, userInfo } from '../styles/layouts';
import { getCurrentUserNickname } from '../config/supabase';
import { useMission } from '../hooks/useMission';
import { useCategory } from '../hooks/useCategory';
import { useCharacter } from '../hooks/useCharacter';
import { useNotification } from '../hooks/useNotification';
import MissionList from '../components/mission/MissionList';
import MissionProgress from '../components/mission/MissionProgress';
import CategoryFilter from '../components/mission/CategoryFilter';
import { NotificationContainer, ThemeToggle } from '../components/ui';
import { PageTitle, ScreenReaderOnly } from '../components/ui/ScreenReaderOnly';
import { logger } from '../utils/logger';

const MissionPage = () => {
  const [searchParams] = useSearchParams();
  const { addExperienceByCategory, loadCharacters, loading: characterLoading } = useCharacter();
  const { notifications, showMissionComplete, showLevelUp, showCharacterUnlocked, removeNotification, markAsRead } = useNotification();
  const { missions, isLoading, error, completeMissionWithPhoto, uncompleteMission } = useMission(addExperienceByCategory);
  const { loading: categoriesLoading } = useCategory();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const nickname = getCurrentUserNickname();

  // URL 파라미터에서 카테고리 읽기
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [searchParams]);

  // 미션 완료 처리 함수 (알림 포함)
  const handleMissionComplete = async (missionId, photoUrl) => {
    try {
      const mission = missions.find(m => m.mission_id === missionId);
      if (!mission) return;

      const result = await completeMissionWithPhoto(missionId, photoUrl);
      
      if (result && result.success) {
        // 경험치 정보를 mission 객체에 추가
        const missionWithExperience = {
          ...mission,
          experience: result.experience || mission.experience || 50
        };
        
        // 중앙 상단에 1개 알림만 표시
        if (result.unlocked) {
          // 캐릭터 해제 알림
          const handleCharacterUnlockClick = () => {
            // 페이지 이동 로직 제거
          };
          showCharacterUnlocked(mission.category, handleCharacterUnlockClick);
        } else if (result.levelUp) {
          // 레벨업 알림
          const handleLevelUpClick = () => {
            // 페이지 이동 로직 제거
          };
          showLevelUp(result.newLevel || 1, mission.category, handleLevelUpClick);
        } else {
          // 일반 미션 완료 알림
          const handleMissionCompleteClick = () => {
            // 페이지 이동 로직 제거
          };
          showMissionComplete(missionWithExperience, handleMissionCompleteClick);
        }
        
        // 캐릭터 데이터 재로드 (백엔드 동기화 보장)
        try {
          await loadCharacters();
        } catch (error) {
          // showToast('캐릭터 정보 업데이트에 실패했습니다.', 'error'); // Removed useToast
        }
      }
    } catch (error) {
      // Error handled by hook
    }
  };

  // 미션 완료 취소 처리 함수
  const handleMissionUncomplete = async (missionId) => {
    try {
      await uncompleteMission(missionId);
    } catch (error) {
      logger.error('미션 완료 취소 중 오류:', error);
    }
  };

  // 페이지 레이아웃 (리팩토링됨)
  const pageLayout = createPageLayout({
    content: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: tokens.spacing[6]
    },
    header: {
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      marginBottom: tokens.spacing[2]
    }
  });

  const cardStyle = {
    backgroundColor: tokens.colors.background.primary,
    borderRadius: tokens.borderRadius.lg,
    padding: tokens.spacing[6],
    boxShadow: tokens.shadow.base,
    border: 'none'
  };

  const pageTitleStyle = {
    fontSize: tokens.typography.fontSize['2xl'],
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing[2]
  };

  const pageSubtitleStyle = {
    fontSize: tokens.typography.fontSize.base,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.spacing[4]
  };

  const loadingStyle = {
    textAlign: 'center',
    padding: tokens.spacing[10]
  };

  const emptyStateStyle = {
    textAlign: 'center',
    padding: tokens.spacing[10]
  };

  const emptyIconStyle = {
    fontSize: 'clamp(2.5rem, 6vw, 3rem)', // 40px ~ 48px responsive
    marginBottom: tokens.spacing[4]
  };

  const emptyTitleStyle = {
    fontSize: tokens.typography.fontSize.xl,
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing[2]
  };

  const emptyTextStyle = {
    fontSize: tokens.typography.fontSize.base,
    color: tokens.colors.text.secondary
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const getFilteredMissions = () => {
    const extractNumericOrder = (missionId) => {
      if (!missionId) return Number.MAX_SAFE_INTEGER;
      const match = String(missionId).match(/(\d+)/);
      return match ? parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;
    };

    const sortWithinCategory = (list) => {
      return [...list].sort((a, b) => {
        if (a.category !== b.category) {
          // 카테고리가 다르면 기존 순서를 유지해 UX 변화를 최소화
          return 0;
        }
        const aNum = extractNumericOrder(a.mission_id);
        const bNum = extractNumericOrder(b.mission_id);
        return aNum - bNum;
      });
    };

    if (selectedCategory === 'all') {
      return sortWithinCategory(missions);
    }
    const filtered = missions.filter(mission => mission.category === selectedCategory);
    return sortWithinCategory(filtered);
  };

  const getProgressStats = () => {
    // 전체 미션을 사용하여 진행률 계산 (필터링되지 않은)
    const completed = missions.filter(mission => mission.completed).length;
    const total = missions.length;
    return { completed, total };
  };

  const getCategoryDisplayName = (category) => {
    const categoryMap = {
      'exercise': '운동',
      'cleaning': '청소',
      'reading': '독서',
      'selfcare': '자기돌봄',
      'social': '사회활동',
      'creativity': '창의활동',
      'all': '전체'
    };
    return categoryMap[category] || category;
  };

  if (isLoading || categoriesLoading) {
    return (
      <div style={pageLayout.container} role="main" aria-label="미션">
        <PageTitle title="미션" />
        <div style={pageLayout.content}>
          <div style={cardStyle}>
            <div style={loadingStyle}>
              <div style={{ fontSize: '24px', marginBottom: tokens.spacing[3] }}>🎯</div>
              <p>미션 데이터를 불러오는 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={pageLayout.container} role="main" aria-label="미션">
        <PageTitle title="미션" />
        <div style={pageLayout.content}>
          <div style={cardStyle}>
            <div style={emptyStateStyle}>
              <div style={emptyIconStyle}>⚠️</div>
              <h3 style={emptyTitleStyle}>오류가 발생했습니다</h3>
              <p style={emptyTextStyle}>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredMissions = getFilteredMissions();
  const progressStats = getProgressStats();

  return (
    <div style={pageLayout.container} role="main" aria-label="미션">
      <PageTitle title="미션" />
      <div style={pageLayout.content}>
        <div style={pageLayout.header}>
          <div></div> {/* 왼쪽 빈 공간 */}
          {nickname && (
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
              <div style={{ ...userInfo, whiteSpace: 'nowrap' }}>
                <span>👤</span>
                <span>{nickname}</span>
              </div>
              <ThemeToggle showLabel={false} showSystem={false} style={{ display: 'inline-flex' }} />
            </div>
          )}
        </div>

        <div style={cardStyle}>
          <h2 style={pageTitleStyle}>🎯 미션</h2>
          <p style={pageSubtitleStyle}>
            다양한 카테고리의 미션을 완료하여 캐릭터를 성장시켜보세요
          </p>

          {/* 진행률 표시 */}
          {missions.length > 0 && (
            <div style={{ marginTop: tokens.spacing[6], marginBottom: tokens.spacing[6] }}>
              <ScreenReaderOnly id="mission-progress-live" aria-live="polite">
                진행률 {progressStats.completed}개 완료, 총 {progressStats.total}개
              </ScreenReaderOnly>
              <MissionProgress
                completed={progressStats.completed}
                total={progressStats.total}
              />
            </div>
          )}

          {/* 카테고리 필터 */}
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelect={handleCategoryChange}
          />

          {/* 필터와 리스트 사이 여백 확대 */}
          <div style={{ height: tokens.spacing[4] }} />

          {/* 카테고리 변경 라이브 안내 */}
          <ScreenReaderOnly aria-live="polite" id="mission-category-live">
            {selectedCategory === 'all' 
              ? `전체 카테고리 선택됨, 총 ${filteredMissions.length}개 미션`
              : `${getCategoryDisplayName(selectedCategory)} 카테고리 선택됨, ${filteredMissions.length}개 미션`}
          </ScreenReaderOnly>

          {/* 미션 목록 */}
          {filteredMissions.length === 0 ? (
            <div style={emptyStateStyle} role="status" aria-live="polite">
              <div style={emptyIconStyle}>
                {selectedCategory === 'all' ? '🎯' : '📚'}
              </div>
              <h3 style={emptyTitleStyle}>
                {selectedCategory === 'all' 
                  ? '아직 미션이 없어요' 
                  : '이 카테고리의 미션이 없어요'}
              </h3>
              <p style={emptyTextStyle}>
                {selectedCategory === 'all'
                  ? '새로운 미션이 곧 추가될 예정입니다!'
                  : '다른 카테고리의 미션을 확인해보세요!'}
              </p>
            </div>
          ) : (
            <MissionList
              missions={filteredMissions}
              onComplete={handleMissionComplete}
              onUncomplete={handleMissionUncomplete}
              isLoading={isLoading || characterLoading}
            />
          )}
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

export default MissionPage; 