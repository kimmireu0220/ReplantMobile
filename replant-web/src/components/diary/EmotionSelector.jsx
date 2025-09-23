import React from 'react';
import { useEmotion } from '../../hooks/useEmotion';
import { tokens } from '../../design/tokens';

const EmotionSelector = ({ selectedEmotion, onSelect, size = 'md' }) => {
  const { emotions, loading, error } = useEmotion();

  const sizeStyles = {
    sm: { width: '40px', height: '40px', fontSize: '16px' },
    md: { width: '50px', height: '50px', fontSize: '20px' },
    lg: { width: '60px', height: '60px', fontSize: '24px' }
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
      gap: tokens.spacing[3],
      justifyContent: 'center',
      padding: tokens.spacing[4]
    }}>
      {emotions.map((emotion) => (
        <button
          key={emotion.id}
          type="button"
          onClick={() => onSelect(emotion.id)}
          style={{
            ...sizeStyles[size],
            borderRadius: '50%',
            border: selectedEmotion === emotion.id 
              ? `3px solid ${emotion.color}` 
              : `2px solid ${tokens.colors.border.light}`,
            backgroundColor: selectedEmotion === emotion.id 
              ? `${emotion.color}20` 
              : tokens.colors.background.secondary,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            transform: selectedEmotion === emotion.id ? 'scale(1.1)' : 'scale(1)',
            boxShadow: selectedEmotion === emotion.id 
              ? `0 4px 12px ${emotion.color}40` 
              : 'none'
          }}
          aria-label={`${emotion.label} 감정 선택`}
          title={emotion.label}
        >
          <span style={{ fontSize: sizeStyles[size].fontSize }}>
            {emotion.emoji}
          </span>
        </button>
      ))}
    </div>
  );
};

export default EmotionSelector; 