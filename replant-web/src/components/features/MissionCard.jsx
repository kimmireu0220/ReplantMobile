import React from 'react';
import { tokens } from '../../design/tokens';
import { useCategory } from '../../hooks/useCategory';
import Card from '../ui/Card';
import Progress from '../ui/Progress';
import { getDifficultyBadgeStyle } from '../../utils/difficultyStyles';
import VerificationButton from './VerificationButton';
import PhotoPreview from './PhotoPreview';
import VideoPlayer from './VideoPlayer';
import { missionVerificationTypes } from '../../data/missions';

const MissionCard = ({
  mission,
  onToggle,
  showProgress = false,
  className = '',
}) => {
  const { getCategoryById } = useCategory();
  const categoryInfo = getCategoryById(mission.category);

  // 카테고리 대표 색상 활용 유틸
  const toRgba = (hex, alpha = 1) => {
    if (!hex) return `rgba(34, 197, 94, ${alpha})`; // 기본값: primary-500
    const normalized = hex.replace('#', '');
    const bigint = parseInt(normalized.length === 3
      ? normalized.split('').map((c) => c + c).join('')
      : normalized, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const categoryColor = categoryInfo?.color; // Supabase/폴백 데이터의 대표색

  const cardStyle = {
    position: 'relative',
    border: `2px solid ${categoryInfo?.color || tokens.colors.border.light}`,
    borderRadius: tokens.borderRadius.lg,
    padding: tokens.spacing[4],
    backgroundColor: tokens.colors.background.primary,
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    overflow: 'hidden'
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing[3],
    marginBottom: tokens.spacing[3]
  };

  const categoryStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing[2],
    padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
    borderRadius: tokens.borderRadius.full,
    // 카테고리 대표 색을 반영해 가독성 향상
    backgroundColor: categoryColor ? toRgba(categoryColor, 0.18) : 'var(--color-primary-100, #dcfce7)',
    border: `1px solid ${categoryColor || 'var(--color-primary-300, #86efac)'}`,
    color: categoryColor || 'var(--color-text-primary, #111827)',
    fontSize: tokens.typography.fontSize.xs,
    fontWeight: tokens.typography.fontWeight.semibold
  };

  const titleStyle = {
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing[2],
    lineHeight: tokens.typography.lineHeight.tight
  };

  const descriptionStyle = {
    fontSize: tokens.typography.fontSize.base,
    color: tokens.colors.text.secondary,
    lineHeight: tokens.typography.lineHeight.relaxed,
    marginBottom: tokens.spacing[3]
  };

  const footerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: tokens.spacing[3]
  };

  const completedStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing[2],
    color: tokens.colors.success,
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.medium
  };

  const photoSectionStyle = {
    marginTop: tokens.spacing[3],
    padding: tokens.spacing[3],
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.md
  };

  const photoTitleStyle = {
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.medium,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.spacing[2]
  };

  const difficultyStyle = (difficulty) => {
    const base = getDifficultyBadgeStyle(difficulty);
    return {
      ...base,
      // 다크에서 텍스트 대비를 보장하기 위해 약간 강화
      color: `var(--color-text-primary, ${base.color})`,
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



  const handleVerificationSubmit = async (missionId, verificationData) => {
    try {
      const result = await onToggle(missionId, verificationData);
      return result;
    } catch (error) {
      // Error handled by component
    }
  };

  return (
    <Card
      variant="outlined"
      className={`mission-card ${className}`}
      style={cardStyle}
    >
      <div style={headerStyle}>
        <div style={categoryStyle}>
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

      <h3 style={titleStyle}>{mission.title}</h3>
      <p style={descriptionStyle}>{mission.description}</p>

      {/* 제출 미디어 상태 표시 */}
      {(() => {
        const verificationType = missionVerificationTypes[mission.mission_id]?.type;
        // 영상 인증: photo_url에 영상 URL이 저장되므로 영상 우선 표시
        if (verificationType === 'video' && (mission.video_url || mission.photo_url)) {
          return (
            <div style={photoSectionStyle}>
              <h4 style={photoTitleStyle}>제출된 영상</h4>
              <VideoPlayer videoUrl={mission.video_url || mission.photo_url} />
            </div>
          );
        }
        // 사진/스크린샷 인증: 사진 표시
        if (mission.photo_url) {
          return (
            <div style={photoSectionStyle}>
              <h4 style={photoTitleStyle}>제출된 사진</h4>
              <PhotoPreview photoUrl={mission.photo_url} />
            </div>
          );
        }
        // 기타 타입은 미미디어 제출 없음
        return null;
      })()}

      {/* 진행률 표시 */}
      {showProgress && (
        <div style={{ marginBottom: tokens.spacing[3] }}>
          <Progress
            value={mission.completed ? 100 : 0}
            max={100}
            variant="primary"
          />
        </div>
      )}

      {/* 액션 버튼 */}
      <div style={footerStyle}>
        {!mission.completed ? (
          <VerificationButton
            mission={mission}
            verificationType={missionVerificationTypes[mission.mission_id]?.type || 'photo'}
            buttonText={missionVerificationTypes[mission.mission_id]?.buttonText || '사진 제출하기'}
            onSubmit={handleVerificationSubmit}
          />
        ) : (
          <div style={completedStyle}>
            <span>✅ 완료됨</span>
            {mission.photo_submitted_at && (
              <small style={{ fontSize: tokens.typography.fontSize.xs }}>
                {new Date(mission.photo_submitted_at).toLocaleDateString()}
              </small>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default MissionCard;