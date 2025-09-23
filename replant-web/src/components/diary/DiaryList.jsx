import React from 'react';
import DiaryItem from './DiaryItem';
import { tokens } from '../../design/tokens';

const DiaryList = ({ diaries, isLoading, onEdit, onDelete }) => {
  if (isLoading) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '24px', marginBottom: '12px' }}>⏳</div>
          <p>일기를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!diaries || diaries.length === 0) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
          <h3>아직 작성된 일기가 없어요</h3>
          <p style={{ color: tokens.colors.text.secondary, marginTop: '8px' }}>
            오늘의 감정을 기록해보세요!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2>📚 내 일기 모음</h2>
      <div style={{ marginTop: '16px' }}>
        {diaries.map((diary) => (
          <DiaryItem 
            key={diary.id} 
            diary={diary} 
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default DiaryList; 