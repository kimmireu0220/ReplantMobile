import React from 'react';
import { tokens } from '../../design/tokens';
import { useEmotion } from '../../hooks/useEmotion';
import Card from '../ui/Card';
import Button from '../ui/Button';

const EmotionDiaryCard = ({
  entry,
  onEdit,
  onDelete,
  className = '',
}) => {
  const { getEmotionById } = useEmotion();
  const emotion = getEmotionById(entry.emotion_id);
  const date = new Date(entry.date);
  const formattedDate = date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: tokens.spacing[4],
  };

  const emotionInfoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing[3],
  };

  const emotionIconStyle = {
    fontSize: '32px',
    lineHeight: 1,
  };

  const emotionTextStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing[1],
  };

  const emotionLabelStyle = {
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: emotion?.color || tokens.colors.text.primary,
  };

  const dateStyle = {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.secondary,
  };

  const contentStyle = {
    fontSize: tokens.typography.fontSize.base,
    lineHeight: tokens.typography.lineHeight.relaxed,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing[4],
    whiteSpace: 'pre-wrap',
  };

  const actionsStyle = {
    display: 'flex',
    gap: tokens.spacing[2],
    justifyContent: 'flex-end',
  };

  const ariaLabel = `${emotion?.label || '감정'}, ${formattedDate} 일기`;

  return (
    <Card 
      variant="outlined" 
      className={`replant-emotion-diary-card ${className}`}
      style={{ borderColor: tokens.colors.border.medium }}
      ariaLabel={ariaLabel}
    >
      <div style={headerStyle}>
        <div style={emotionInfoStyle}>
          <span style={emotionIconStyle}>{emotion?.emoji || '💭'}</span>
          <div style={emotionTextStyle}>
            <span style={emotionLabelStyle}>{emotion?.label || '감정'}</span>
            <span style={dateStyle}>{formattedDate}</span>
          </div>
        </div>
      </div>

      <div style={contentStyle}>
        {entry.content}
      </div>

      {(onEdit || onDelete) && (
        <div style={{
          ...actionsStyle,
          borderTop: `1px solid ${tokens.colors.border.light}`,
          paddingTop: tokens.spacing[3],
          marginTop: tokens.spacing[3]
        }}>
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(entry)}
              style={{
                // 초록색(Primary) 강조 제거: 중립 텍스트 컬러 사용
                color: tokens.colors.text.primary,
                fontWeight: tokens.typography.fontWeight.medium,
                border: 'none'
              }}
            >
              ✏️ 수정
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(entry.id)}
              style={{
                backgroundColor: 'transparent',
                color: tokens.colors.text.primary,
                fontWeight: tokens.typography.fontWeight.medium,
                border: 'none',
                boxShadow: 'none'
              }}
            >
              🗑️ 삭제
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};

export default EmotionDiaryCard;