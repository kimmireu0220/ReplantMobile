import { tokens } from '../design/tokens';

// 난이도 뱃지/칩 스타일 공통 유틸
export const getDifficultyBadgeStyle = (difficulty) => {
  const base = {
    padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
    borderRadius: tokens.borderRadius.full,
    fontSize: tokens.typography.fontSize.xs,
    fontWeight: tokens.typography.fontWeight.medium,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing[1]
  };

  const map = {
    easy: {
      // CSS 변수를 사용하되 기존 값을 fallback으로 보존
      backgroundColor: 'var(--color-primary-100, #dcfce7)',
      color: 'var(--color-primary-600, #16a34a)',
      border: `1px solid var(--color-primary-500, #22c55e)`
    },
    medium: {
      backgroundColor: 'var(--color-warning-light, #fef3c7)', 
      color: 'var(--color-warning-dark, #92400e)',
      border: `1px solid var(--color-warning, #f59e0b)`
    },
    hard: {
      backgroundColor: 'var(--color-error-light, #fee2e2)',
      color: 'var(--color-error-dark, #991b1b)', 
      border: `1px solid var(--color-error, #ef4444)`
    }
  };

  return { ...base, ...(map[difficulty] || map.medium) };
};

const difficultyStyles = { getDifficultyBadgeStyle };

export default difficultyStyles;


