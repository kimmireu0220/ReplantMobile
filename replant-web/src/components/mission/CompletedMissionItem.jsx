import React from 'react';
import { tokens } from '../../design/tokens';
import { getCategoryColor } from '../../utils/categoryUtils';

const CompletedMissionItem = ({ mission }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryDisplayName = (category) => {
    const categoryMap = {
      'exercise': '운동',
      'cleaning': '청소',
      'reading': '독서',
      'selfcare': '자기돌봄',
      'social': '사회활동',
      'creativity': '창의활동'
    };
    return categoryMap[category] || category;
  };

  // 카테고리 색상 가져오기
  const categoryColor = getCategoryColor(mission.category);

  const itemStyle = {
    padding: tokens.spacing[4],
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.lg,
    marginBottom: tokens.spacing[3],
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s ease',
    border: `1px solid ${categoryColor}20` // 카테고리 색상의 연한 테두리
  };

  const missionInfoStyle = {
    flex: 1,
    marginRight: tokens.spacing[3]
  };

  const titleStyle = {
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing[1]
  };

  const descriptionStyle = {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.spacing[2],
    lineHeight: 1.4
  };

  const metaStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing[2]
  };

  const categoryStyle = {
    fontSize: tokens.typography.fontSize.xs,
    color: categoryColor, // 카테고리 색상 적용
    backgroundColor: categoryColor + '20', // 카테고리 색상의 연한 배경
    padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
    borderRadius: tokens.borderRadius.full,
    fontWeight: tokens.typography.fontWeight.medium,
    border: `1px solid ${categoryColor}30` // 카테고리 색상의 연한 테두리
  };

  const dateStyle = {
    fontSize: tokens.typography.fontSize.xs,
    color: tokens.colors.text.tertiary
  };

  const experienceStyle = {
    color: categoryColor, // 카테고리 색상 적용
    fontWeight: tokens.typography.fontWeight.bold,
    fontSize: tokens.typography.fontSize.sm,
    backgroundColor: categoryColor + '20', // 카테고리 색상의 연한 배경
    padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
    borderRadius: tokens.borderRadius.full,
    border: `1px solid ${categoryColor}30` // 카테고리 색상의 연한 테두리
  };

  return (
    <div style={itemStyle}>
      <div style={missionInfoStyle}>
        <h3 style={titleStyle}>{mission.title}</h3>
        <p style={descriptionStyle}>{mission.description}</p>
        <div style={metaStyle}>
          <span style={categoryStyle}>
            {getCategoryDisplayName(mission.category)}
          </span>
          <span style={dateStyle}>
            {formatDate(mission.completed_at)}
          </span>
        </div>
      </div>
      <div style={experienceStyle}>
        +{mission.experience || 0} EXP
      </div>
    </div>
  );
};

export default CompletedMissionItem; 