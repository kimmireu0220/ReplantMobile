import React, { useMemo } from 'react';
import { tokens } from '../../design/tokens';
import { getDifficultyBadgeStyle } from '../../utils/difficultyStyles';
import { useCategory } from '../../hooks/useCategory';
import { useTheme } from '../../contexts/ThemeContext';
import Card from '../ui/Card';
import Button from '../ui/Button';

const RecommendedMissions = ({ missions = [], character, onSelect, className = '' }) => {
  const { getCategoryById } = useCategory();
  const { actualTheme } = useTheme();
  const isDark = actualTheme === 'dark';

  // 추천 미션 로직: 대표 캐릭터 카테고리에 맞는 미션 최대 2개 + 부족한 경우 랜덤
  const recommendedMissions = useMemo(() => {
    if (!missions || missions.length === 0) {
      return [];
    }

    // 대표 캐릭터의 카테고리
    const characterCategory = character?.category;
    
    if (!characterCategory) {
      // 대표 캐릭터가 없으면 랜덤으로 2개 선택
      const shuffled = [...missions].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 2);
    }

    // 대표 캐릭터 카테고리에 맞는 미션들 (완료되지 않은 것만)
    const categoryMissions = missions.filter(mission => 
      mission.category === characterCategory && !mission.completed
    );

    // 랜덤 미션들 (완료되지 않은 것만, 대표 캐릭터 카테고리 제외)
    const randomMissions = missions.filter(mission => 
      mission.category !== characterCategory && !mission.completed
    );

    let result = [];

    // 1. 대표 캐릭터 카테고리 미션을 최대 2개까지 추가
    if (categoryMissions.length > 0) {
      const shuffledCategoryMissions = [...categoryMissions].sort(() => Math.random() - 0.5);
      result.push(...shuffledCategoryMissions.slice(0, 2));
    }

    // 2. 부족한 경우 랜덤 미션으로 채우기
    if (result.length < 2 && randomMissions.length > 0) {
      const shuffledRandomMissions = [...randomMissions].sort(() => Math.random() - 0.5);
      const remainingCount = 2 - result.length;
      result.push(...shuffledRandomMissions.slice(0, remainingCount));
    }

    return result;
  }, [missions, character]);

  const headerStyle = {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: tokens.spacing[2]
  };

  const titleStyle = {
    fontSize: tokens.typography.fontSize.xl,
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing[2]
  };

  const subtitleStyle = {
    fontSize: tokens.typography.fontSize.base,
    color: tokens.colors.text.secondary
  };

  const missionGridStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing[3]
  };



  const missionCardStyle = (categoryInfo) => ({
    padding: tokens.spacing[4],
    borderRadius: tokens.borderRadius.lg,
    border: `1px solid ${categoryInfo?.color || tokens.colors.border.light}`,
    backgroundColor: tokens.colors.background.primary,
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    boxShadow: `0 2px 8px var(--color-shadow-light)`,
    position: 'relative',
    overflow: 'hidden'
  });

  const missionHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing[3],
    marginBottom: tokens.spacing[3]
  };

  const categoryStyle = (categoryInfo) => ({
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing[2],
    padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
    borderRadius: tokens.borderRadius.full,
    // 라이트 모드 유지, 다크 모드에서 대비 강화
    backgroundColor: isDark
      ? 'rgba(255, 255, 255, 0.08)'
      : `${categoryInfo?.color || tokens.colors.gray[500]}20`,
    color: isDark
      ? tokens.colors.text.primary
      : (categoryInfo?.color || tokens.colors.text.secondary),
    border: isDark
      ? `1px solid ${categoryInfo?.color || 'var(--color-border-light, #e5e7eb)'}`
      : 'none',
    fontSize: tokens.typography.fontSize.xs,
    fontWeight: tokens.typography.fontWeight.medium
  });

  const difficultyStyle = (difficulty) => {
    const base = getDifficultyBadgeStyle(difficulty);
    if (!isDark) return base;
    // 다크 모드에서 대비를 확실히 높임: 배경을 더 진하고 텍스트는 더 밝게 덮어씀
    const overrides = {
      easy: {
        backgroundColor: 'rgba(34, 197, 94, 0.15)',
        color: 'var(--color-text-primary, #f1f5f9)',
        border: '1px solid var(--color-primary-400, #22c55e)'
      },
      medium: {
        backgroundColor: 'rgba(251, 191, 36, 0.15)',
        color: 'var(--color-text-primary, #f1f5f9)',
        border: '1px solid var(--color-warning, #fbbf24)'
      },
      hard: {
        backgroundColor: 'rgba(248, 113, 113, 0.15)',
        color: 'var(--color-text-primary, #f1f5f9)',
        border: '1px solid var(--color-error, #f87171)'
      }
    };
    return {
      ...base,
      ...(overrides[difficulty] || overrides.medium),
      fontWeight: tokens.typography.fontWeight.semibold
    };
  };

  const experienceStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing[1],
    fontSize: tokens.typography.fontSize.xs,
    color: tokens.colors.text.secondary,
    padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
    borderRadius: tokens.borderRadius.full,
    backgroundColor: tokens.colors.background.secondary,
    fontWeight: tokens.typography.fontWeight.medium
  };

  const missionTitleStyle = {
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing[2],
    lineHeight: tokens.typography.lineHeight.tight
  };

  const missionDescriptionStyle = {
    fontSize: tokens.typography.fontSize.base,
    color: tokens.colors.text.secondary,
    lineHeight: tokens.typography.lineHeight.relaxed,
    marginBottom: tokens.spacing[3]
  };



  const handleMissionClick = (mission) => {
    if (onSelect) {
      onSelect(mission);
    }
  };

  if (!missions || missions.length === 0) {
    return (
      <Card variant="default" padding="lg" className={className}>
        <div style={headerStyle}>
          <div>
            <h2 style={titleStyle}>🎯 추천 미션</h2>
            <p style={subtitleStyle}>오늘 해보면 좋을 미션들을 추천해드려요</p>
          </div>
        </div>
        <div style={{
          textAlign: 'center',
          padding: tokens.spacing[8],
          color: tokens.colors.text.secondary
        }}>
          추천할 미션이 없습니다.
        </div>
      </Card>
    );
  }

  return (
    <Card variant="default" padding="lg" className={className}>
      <div style={headerStyle}>
        <h2 style={titleStyle}>🎯 추천 미션</h2>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <p style={subtitleStyle}>오늘 해보면 좋을 미션들을 추천해드려요</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelect && onSelect('all')}
          >
            전체 보기
          </Button>
        </div>
      </div>

      <div style={missionGridStyle}>
        {recommendedMissions.map((mission) => {
          const categoryInfo = getCategoryById(mission.category);
          
          return (
            <div
              key={mission.id}
              style={missionCardStyle(categoryInfo)}
              onClick={() => handleMissionClick(mission)}
            >
              <div style={missionHeaderStyle}>
                <div style={categoryStyle(categoryInfo)}>
                  <span>{categoryInfo?.emoji || '🎯'}</span>
                  <span>{categoryInfo?.name || '카테고리'}</span>
                </div>
                
                <span style={difficultyStyle(mission.difficulty)}>
                  {mission.difficulty === 'easy' ? '쉬움' : 
                   mission.difficulty === 'medium' ? '보통' : '어려움'}
                </span>
                
                <div style={experienceStyle}>
                  <span>🏆</span>
                  <span>{mission.experience} XP</span>
                </div>
              </div>

              <h3 style={missionTitleStyle}>{mission.title}</h3>
              <p style={missionDescriptionStyle}>{mission.description}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default RecommendedMissions;