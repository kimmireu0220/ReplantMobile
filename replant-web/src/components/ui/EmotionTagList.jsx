import React from 'react';
import { useEmotion } from '../../hooks/useEmotion';
import { tokens } from '../../design/tokens';

const EmotionTagList = ({ selectedEmotion, onSelect, size = 'md' }) => {
  const { emotions, loading, error } = useEmotion();

  const sizeStyles = {
    sm: { padding: '4px 8px', fontSize: '12px' },
    md: { padding: '6px 12px', fontSize: '14px' },
    lg: { padding: '8px 16px', fontSize: '16px' }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        padding: tokens.spacing[4] 
      }}>
        감정 데이터를 불러오는 중...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        color: tokens.colors.error, 
        padding: tokens.spacing[4] 
      }}>
        감정 데이터를 불러올 수 없습니다.
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: tokens.spacing[2],
      padding: tokens.spacing[3]
    }}>
      {emotions.map((emotion) => (
        <button
          key={emotion.id}
          type="button"
          onClick={() => onSelect(emotion.id)}
          style={{
            ...sizeStyles[size],
            borderRadius: tokens.borderRadius.md,
            border: selectedEmotion === emotion.id 
              ? `2px solid ${emotion.color}` 
              : `1px solid ${tokens.colors.border.light}`,
            backgroundColor: selectedEmotion === emotion.id 
              ? `${emotion.color}20` 
              : tokens.colors.background.secondary,
            color: selectedEmotion === emotion.id 
              ? emotion.color 
              : tokens.colors.text.secondary,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[1],
            transition: 'all 0.2s ease',
            fontWeight: selectedEmotion === emotion.id ? '600' : '400'
          }}
          aria-label={`${emotion.label} 감정 선택`}
        >
          <span style={{ fontSize: sizeStyles[size].fontSize }}>
            {emotion.emoji}
          </span>
          <span>{emotion.label}</span>
        </button>
      ))}
    </div>
  );
};

export default EmotionTagList;