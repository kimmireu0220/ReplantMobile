import React from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { tokens } from '../../design/tokens';

const emotionEmojis = {
  happy: '😊',
  sad: '😢',
  angry: '😠',
  anxious: '😰',
  calm: '😌',
  excited: '🤩',
  tired: '😴',
  neutral: '😐'
};

const emotionLabels = {
  happy: '행복한',
  sad: '슬픈',
  angry: '화난',
  anxious: '불안한',
  calm: '평온한',
  excited: '설레는',
  tired: '피곤한',
  neutral: '보통'
};

const DiaryItem = ({ diary, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'yyyy년 MM월 dd일 EEEE', { locale: ko });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'HH:mm');
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(diary);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(diary.id);
    }
  };

  const emotionKey = diary.emotion_id ?? diary.emotion;
  const createdAt = diary.created_at ?? diary.createdAt;

  return (
    <div className="card" style={{ 
      marginBottom: '16px',
      position: 'relative',
      padding: '16px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '24px' }}>
            {emotionEmojis[emotionKey] || '😐'}
          </span>
          <span style={{ 
            fontSize: '14px', 
            color: tokens.colors.text.secondary,
            fontWeight: 'bold'
          }}>
            {emotionLabels[emotionKey] || '알 수 없음'}
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', color: tokens.colors.text.tertiary }}>
            {formatDate(createdAt)}
          </div>
          <div style={{ fontSize: '12px', color: tokens.colors.text.tertiary }}>
            {formatTime(createdAt)}
          </div>
        </div>
      </div>
      
      <div style={{ 
        lineHeight: '1.6',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        marginBottom: '12px'
      }}>
        {diary.content}
      </div>

      {/* 수정/삭제 버튼 */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '8px',
        marginTop: '12px'
      }}>
        <button
          onClick={handleEdit}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '0.5rem',
            fontWeight: '500',
            fontSize: '0.75rem',
            transition: 'opacity 0.15s, transform 0.15s',
            cursor: 'pointer',
            border: 'none',
            outline: 'none',
            position: 'relative',
            opacity: 1,
            transform: 'translateY(0px)',
            height: '44px',
            padding: '0.5rem 0.75rem',
            backgroundColor: 'transparent',
            boxShadow: 'none',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation'
          }}
        >
          <span style={{ fontSize: '14px' }}>✏️</span>
          수정
        </button>
        
        <button
          onClick={handleDelete}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '0.5rem',
            fontWeight: '500',
            fontSize: '0.75rem',
            transition: 'opacity 0.15s, transform 0.15s',
            cursor: 'pointer',
            border: 'none',
            outline: 'none',
            position: 'relative',
            opacity: 1,
            transform: 'translateY(0px)',
            height: '44px',
            padding: '0.5rem 0.75rem',
            backgroundColor: 'transparent',
            boxShadow: 'none',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation'
          }}
        >
          <span style={{ fontSize: '14px' }}>🗑️</span>
          삭제
        </button>
      </div>
    </div>
  );
};

export default DiaryItem; 