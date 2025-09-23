import { tokens } from '../design/tokens';

/**
 * 공통 레이아웃 스타일 시스템
 * 21개 파일에서 중복되던 스타일 패턴을 통합
 */

// 기본 페이지 컨테이너 스타일
export const pageContainer = {
  minHeight: '100vh',
  backgroundColor: tokens.colors.background.primary,
  padding: tokens.spacing[4],
  paddingBottom: tokens.spacing[8]
};

// 콘텐츠 래퍼 (최대 너비 제한)
export const contentWrapper = {
  maxWidth: tokens.components.container.maxWidth,
  margin: '0 auto',
  width: '100%'
};

// 공통 헤더 스타일
export const header = {
  base: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: tokens.spacing[6]
  },
  centered: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: tokens.spacing[6]
  },
  spaceBetween: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing[6]
  }
};

// 유저 정보 표시 영역
export const userInfo = {
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing[2],
  padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
  backgroundColor: tokens.colors.background.secondary,
  borderRadius: tokens.borderRadius.lg,
  border: `1px solid ${tokens.colors.border.light}`,
  fontSize: tokens.typography.fontSize.sm,
  color: tokens.colors.text.primary,
  fontWeight: tokens.typography.fontWeight.medium
};

// 센터드 콘텐츠 (로딩, 에러 상태 등)
export const centeredContent = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '400px',
  textAlign: 'center',
  padding: tokens.spacing[6]
};

// 스켈레톤 로딩 기본 스타일
export const skeleton = {
  base: {
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.lg,
    animation: 'pulse 1.5s ease-in-out infinite'
  },
  image: {
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.full,
    animation: 'pulse 1.5s ease-in-out infinite'
  },
  text: {
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.lg,
    animation: 'pulse 1.5s ease-in-out infinite',
    height: 'clamp(16px, 3vw, 20px)',
    marginBottom: tokens.spacing[2]
  },
  progress: {
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.full,
    animation: 'pulse 1.5s ease-in-out infinite',
    height: 'clamp(20px, 4vw, 24px)',
    marginBottom: tokens.spacing[4]
  }
};

// 그리드 레이아웃 패턴들
export const grids = {
  twoColumn: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: tokens.spacing[4]
  },
  threeColumn: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: tokens.spacing[4]
  },
  responsive: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: tokens.spacing[4]
  }
};

// 에러/빈 상태 스타일
export const emptyState = {
  container: {
    ...centeredContent,
    color: tokens.colors.text.secondary
  },
  icon: {
    fontSize: '48px',
    marginBottom: tokens.spacing[4]
  },
  title: {
    fontSize: tokens.typography.fontSize.xl,
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing[2]
  },
  description: {
    fontSize: tokens.typography.fontSize.base,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.spacing[6]
  }
};

// CSS 애니메이션 (인라인 스타일용)
export const animations = {
  pulse: `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `
};

// 컴포지트 스타일 헬퍼
export const createPageLayout = (options = {}) => ({
  container: {
    ...pageContainer,
    ...options.container
  },
  content: {
    ...contentWrapper,
    ...options.content
  },
  header: {
    ...header.base,
    ...options.header
  }
});