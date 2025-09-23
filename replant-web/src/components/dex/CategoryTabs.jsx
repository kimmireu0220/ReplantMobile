import React from 'react';
import { tokens } from '../../design/tokens';
import { useCategory } from '../../hooks/useCategory';

const CategoryTabs = ({ selectedCategory, onSelect, className = '' }) => {
  const { categories, loading, error } = useCategory();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        padding: tokens.spacing[4] 
      }}>
        카테고리 데이터를 불러오는 중...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        color: tokens.colors.error, 
        padding: tokens.spacing[4] 
      }}>
        카테고리 데이터를 불러올 수 없습니다.
      </div>
    );
  }

  const containerStyle = {
    display: 'flex',
    gap: tokens.spacing[2],
    overflowX: 'auto',
    padding: tokens.spacing[3],
    scrollbarWidth: 'none', // Firefox
    msOverflowStyle: 'none' // IE/Edge
  };

  const tabStyle = (isSelected, categoryColor = null) => ({
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing[2],
    padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
    borderRadius: tokens.borderRadius.full,
    border: isSelected 
      ? `2px solid ${categoryColor || tokens.colors.primary[500]}`
      : `1px solid ${tokens.colors.border.light}`,
    backgroundColor: isSelected 
      ? `${(categoryColor || tokens.colors.primary[500])}20`
      : tokens.colors.background.secondary,
    color: isSelected 
      ? (categoryColor || tokens.colors.primary[500])
      : tokens.colors.text.secondary,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: isSelected ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
    flexShrink: 0
  });

  return (
    <div 
      style={containerStyle} 
      className={`category-tabs ${className}`}
    >
      {/* 전체 탭 */}
      <button
        onClick={() => onSelect('all')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[2],
          padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
          borderRadius: tokens.borderRadius.full,
          border: selectedCategory === 'all' 
            ? `2px solid var(--color-category-all-border-selected, #374151)`
            : `1px solid var(--color-category-all-border, #d1d5db)`,
          backgroundColor: selectedCategory === 'all' 
            ? `var(--color-category-all-bg-selected, rgba(55, 65, 81, 0.1))`
            : `var(--color-category-all-bg, #f3f4f6)`,
          color: selectedCategory === 'all'
            ? `var(--color-category-all-text-selected, #374151)`
            : `var(--color-category-all-text, #374151)`,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          fontSize: tokens.typography.fontSize.sm,
          fontWeight: selectedCategory === 'all' ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
          flexShrink: 0
        }}
        aria-label="전체 카테고리 선택"
      >
        <span style={{ fontSize: '16px' }}>📚</span>
        <span>전체</span>
      </button>
      
      {/* 개별 카테고리 탭들 */}
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelect(category.id)}
          style={tabStyle(selectedCategory === category.id, category.color)}
          aria-label={`${category.name} 카테고리 선택`}
        >
          <span style={{ fontSize: '16px' }}>{category.emoji}</span>
          <span>{category.name}</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryTabs;