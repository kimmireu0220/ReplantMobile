import React from 'react';
import { tokens } from '../../design/tokens';

const MissionProgress = ({ missions, completed, total }) => {
  // completed와 total이 직접 전달된 경우 사용, 아니면 missions 배열에서 계산
  let completedCount, totalCount;
  
  if (completed !== undefined && total !== undefined) {
    completedCount = completed;
    totalCount = total;
  } else {
    // 안전한 missions 배열 확보
    const safeMissions = missions || [];
    completedCount = safeMissions.filter(mission => mission.completed).length;
    totalCount = safeMissions.length;
  }
  
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return tokens.colors.success;
    if (percentage >= 60) return tokens.colors.info;
    if (percentage >= 40) return tokens.colors.warning;
    if (percentage >= 20) return tokens.colors.primary[600];
    return tokens.colors.error;
  };

  const getProgressMessage = (percentage) => {
    if (percentage === 100) return '🎉 모든 미션을 완료했어요!';
    if (percentage >= 80) return '🔥 거의 다 완료했어요!';
    if (percentage >= 60) return '💪 잘 하고 있어요!';
    if (percentage >= 50) return '👍 절반을 넘었어요!';
    if (percentage >= 30) return '🌟 시작이 반이에요!';
    if (percentage >= 10) return '🚀 첫 걸음을 내딛었어요!';
    return '🎯 미션을 시작해보세요!';
  };

  return (
    <div className="card">
      <h2 style={{ fontSize: tokens.typography.fontSize.lg, marginBottom: tokens.spacing[3] }}>📊 진행률</h2>
      
      <div style={{ marginTop: '16px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: tokens.spacing[2]
        }}>
          <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.text.secondary }}>
            완료한 미션
          </span>
          <span style={{ 
            fontSize: tokens.typography.fontSize.lg, 
            fontWeight: tokens.typography.fontWeight.bold,
            color: getProgressColor(progressPercentage)
          }}>
            {completedCount} / {totalCount}
          </span>
        </div>
        
        <div style={{
          width: '100%',
          height: '12px',
          backgroundColor: tokens.colors.gray[200],
          borderRadius: tokens.borderRadius.full,
          overflow: 'hidden',
          marginBottom: tokens.spacing[3]
        }}>
          <div style={{
            width: `${progressPercentage}%`,
            height: '100%',
            backgroundColor: getProgressColor(progressPercentage),
            transition: 'width 0.15s ease'
          }} />
        </div>
        
        <div style={{ 
          textAlign: 'center',
          fontSize: tokens.typography.fontSize.sm,
          color: tokens.colors.text.secondary,
          fontStyle: 'italic'
        }}>
          {getProgressMessage(progressPercentage)}
        </div>
      </div>
    </div>
  );
};

export default MissionProgress; 