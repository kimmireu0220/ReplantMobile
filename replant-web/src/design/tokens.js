/**
 * Replant Design System Tokens
 * Linear.app inspired design system with mobile-first approach
 */

export const tokens = {
  // Color palette
  colors: {
    // Primary brand colors (실제 사용되는 것만)
    primary: {
      100: 'var(--color-primary-100, #dcfce7)',
      200: 'var(--color-primary-200, #bbf7d0)',
      300: 'var(--color-primary-300, #86efac)',
      400: 'var(--color-primary-400, #4ade80)',
      500: 'var(--color-primary-500, #22c55e)', // 메인 색상 ⭐
      600: 'var(--color-primary-600, #16a34a)',
    },
    
    // Neutral grays (CSS 변수로 확장, 기존 값 완벽 보존)
    gray: {
      // 50 제거 - 미사용
      100: 'var(--color-gray-100, #f3f4f6)',  // 배경, 이미지 플레이스홀더 (4회 사용)
      200: 'var(--color-gray-200, #e5e7eb)',  // 배경, 테두리 (6회 사용)
      300: 'var(--color-gray-300, #d1d5db)',  // 테두리 (5회 사용)
      400: 'var(--color-gray-400, #9ca3af)',  // 텍스트, 아이콘 (6회 사용)
      500: 'var(--color-gray-500, #6b7280)',  // 기본 텍스트 (1회 사용)
      600: 'var(--color-gray-600, #4b5563)',  // 텍스트 (3회 사용)
      // 700, 800 제거 - 미사용
      900: 'var(--color-gray-900, #111827)',  // 코드 배경 (1회 사용)
    },
    
    // Semantic colors (CSS 변수로 확장)
    success: 'var(--color-success, #22c55e)',
    warning: 'var(--color-warning, #f59e0b)',
    error: 'var(--color-error, #ef4444)',
    info: 'var(--color-info, #3b82f6)',
    secondary: {
      500: 'var(--color-secondary-500, #64748b)', // 실제 사용되는 유일한 값
    },
    
    // Emotion colors (CSS 변수로 확장, 다크모드 접근성 고려)
    emotions: {
      happy: 'var(--color-emotion-happy, #b45309)',      // 😊 행복 → 다크모드: 더 밝은 노란색
      excited: 'var(--color-emotion-excited, #c2410c)',    // 🤩 신나는 → 다크모드: 더 밝은 주황색
      calm: 'var(--color-emotion-calm, #0e7490)',       // 😌 평온한 → 다크모드: 더 밝은 청록색
      grateful: 'var(--color-emotion-grateful, #7c3aed)',   // 🙏 감사한 → 다크모드: 더 밝은 보라색
      sad: 'var(--color-emotion-sad, #6b7280)',        // 😢 슬픈 → 다크모드: 그레이 유지
      angry: 'var(--color-emotion-angry, #dc2626)',      // 😠 화난 → 다크모드: 더 밝은 빨간색
      anxious: 'var(--color-emotion-anxious, #b45309)',    // 😰 불안한 → 다크모드: 더 밝은 노란색
      tired: 'var(--color-emotion-tired, #64748b)',      // 😴 피곤한 → 다크모드: 그레이 유지
    },
    
    // Background colors (CSS 변수로 확장)
    background: {
      primary: 'var(--color-background-primary, #ffffff)',
      secondary: 'var(--color-background-secondary, #f9fafb)',
      tertiary: 'var(--color-background-tertiary, #f3f4f6)',
      overlay: 'rgba(0, 0, 0, 0.5)', // 투명도는 그대로 유지
    },
    
    // Text colors (CSS 변수로 확장)
    text: {
      primary: 'var(--color-text-primary, #333333)',
      secondary: 'var(--color-text-secondary, #6b7280)',
      tertiary: 'var(--color-text-tertiary, #9ca3af)',
      inverse: 'var(--color-text-inverse, #ffffff)',
    },
    
    // Border colors (CSS 변수로 확장)
    border: {
      light: 'var(--color-border-light, #e5e7eb)',
      medium: 'var(--color-border-medium, #d1d5db)',
      dark: 'var(--color-border-dark, #9ca3af)',
    },
    
    // 난이도별 테두리 색상 추가
    difficulty: {
      easy: '#22c55e',    // 초록색 (쉬움)
      medium: '#f59e0b',  // 주황색 (보통) 
      hard: '#ef4444',    // 빨간색 (어려움)
    },
    
    // Accent colors for character categories (실제 사용되는 것만)
    accent: {
      blue: 'var(--color-accent-blue, #2563eb)',     // 독서
      green: 'var(--color-accent-green, #15803d)',    // 청소
      orange: 'var(--color-accent-orange, #c2410c)',   // 사회활동
      purple: 'var(--color-accent-purple, #7c3aed)',   // 자기돌봄
      yellow: 'var(--color-accent-yellow, #b45309)',   // 즐겨찾기
    },
    
    // Main character indicator colors
    mainCharacter: {
      background: '#22c55e',    // Primary green
      text: '#ffffff',          // White text
      shadow: 'rgba(34, 197, 94, 0.4)', // Green shadow
      border: 'rgba(255, 255, 255, 0.3)', // White border
    },
  },
  
  // Typography scale
  typography: {
    fontFamily: {
      sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      mono: ['SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'monospace'],
    },
    
    // 고정 크기 (후방 호환성)
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
    },
    
    // 반응형 토큰은 실제로 사용되지 않아 제거
    
    fontWeight: {
      // light 제거 - 미사용
      normal: 400,    // 3회 사용
      medium: 500,    // 48회 사용 ⭐
      semibold: 600,  // 34회 사용 ⭐  
      bold: 700,      // 29회 사용 ⭐
      // thin, extralight, extrabold, black 제거 - 미사용
    },
    
    lineHeight: {
      // none, snug, loose 제거 - 미사용
      tight: 1.25,    // 2회 사용
      normal: 1.5,    // 3회 사용
      relaxed: 1.75,  // 11회 사용
      // responsive, korean 설정 제거 - 미사용
    },
    
    // 자주 사용되는 텍스트 스타일 조합
    textStyles: {
      heading: {
        fontWeight: 700,
        lineHeight: 1.25,
      },
      subheading: {
        fontWeight: 600,
        lineHeight: 1.5,
      },
      body: {
        fontWeight: 500,
        lineHeight: 1.5,
      },
      bodyNormal: {
        fontWeight: 400,
        lineHeight: 1.5,
      },
    },
  },
  
  // Spacing scale (실제 사용되는 토큰만 유지)
  spacing: {
    0: '0',         // 3회 사용
    1: '0.25rem',   // 4px - 30회 사용 ⭐ 
    2: '0.5rem',    // 8px - 95회 사용 ⭐⭐
    3: '0.75rem',   // 12px - 73회 사용 ⭐
    4: '1rem',      // 16px - 108회 사용 ⭐⭐
    5: '1.25rem',   // 20px - 9회 사용
    6: '1.5rem',    // 24px - 58회 사용 ⭐
    8: '2rem',      // 32px - 25회 사용
    10: '2.5rem',   // 40px - 2회 사용
    12: '3rem',     // 48px - 8회 사용
    16: '4rem',     // 64px - 3회 사용
    // 추가 spacing 값들
    xl: '2.5rem',   // 40px - QuizModal에서 사용
    xxl: '3rem',    // 48px - QuizModal에서 사용
    xxxl: '4rem',   // 64px - QuizModal에서 사용
    // 7, 9, 11, 13-15, 17-24, 20+ 제거 - 미사용
  },
  
  // Border radius (실제 사용되는 토큰만 유지)
  borderRadius: {
    // none, sm 제거 - 미사용
    base: '0.25rem',  // 4px - 1회 사용
    md: '0.375rem',   // 6px - 3회 사용
    lg: '0.5rem',     // 8px - 9회 사용 ⭐
    // xl, 2xl 제거 - 미사용
    full: '9999px',   // 12회 사용 ⭐
    // 3xl 제거 - 미사용
  },
  
  // Shadows
  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  
  // Responsive breakpoints
  breakpoints: {
    mobile: '320px',
    tablet: '768px', 
    desktop: '1024px',
    wide: '1440px'
  },

  // Responsive values
  responsive: {
    spacing: {
      mobile: '1rem',
      tablet: '1.5rem',
      desktop: '2rem'
    },
    sidebar: {
      mobile: '100%',
      tablet: '320px',
      desktop: '280px'
    },
    hamburger: {
      mobile: '1rem',
      tablet: '1.5rem', 
      desktop: '1rem'
    }
  },
  
  // Z-index scale (실제 사용되는 토큰만 유지)
  zIndex: {
    dropdown: 1000,  // 사용
    sticky: 1020,    // 사용
    fixed: 1030,     // 사용
    modal: 1040,     // 사용
    // popover: 1050 제거 - 미사용
    tooltip: 1060,   // 사용
  },
  
  // Animation durations (실제 사용되는 토큰만 유지)
  animation: {
    fast: '150ms',    // 3회 사용
    normal: '250ms',  // 4회 사용 ⭐
    // slow 제거 - 미사용
  },
  
  // Component specific tokens (실제 사용되는 토큰만 유지)
  components: {
    touchTargets: {
      minimum: '44px',  // 사용 - ErrorBoundary에서 참조
      // comfortable, premium, spacing, zone 제거 - 미사용
    },
    
    card: {
      padding: '1rem',           // 사용 - Card 컴포넌트에서 참조
      borderRadius: '0.75rem',   // 사용 - Card 컴포넌트에서 참조
      // shadow, marginBottom 제거 - 미사용
    },
    
    button: {
      height: {
        sm: '44px',   // 사용 - Button 컴포넌트에서 참조
        base: '48px', // 사용 - Button 컴포넌트에서 참조
        lg: '56px',   // 사용 - Button 컴포넌트에서 참조
      },
      padding: {
        sm: '0.5rem 0.75rem',   // 사용 - Button 컴포넌트에서 참조
        base: '0.75rem 1rem',   // 사용 - Button 컴포넌트에서 참조
        lg: '1rem 1.5rem',      // 사용 - Button 컴포넌트에서 참조
      },
      // minWidth, touchAction, tapHighlightColor 제거 - 미사용
    },
    
    input: {
      height: '48px',         // 사용 - EmotionDiaryForm에서 참조
      padding: '0.75rem',     // 사용 - EmotionDiaryForm에서 참조
      borderRadius: '0.5rem', // 사용 - EmotionDiaryForm에서 참조
      // minHeight 제거 - 미사용
    },
    
    container: {
      maxWidth: '600px',  // 사용 - 여러 페이지에서 참조
      padding: '1rem',    // 사용 - ComponentsPage에서 참조
      // Safe Area 설정들 제거 - 미사용
    },
    
    // mobile 전체 제거 - 미사용
  },
  
  // 앱 전용 토큰
  app: {
    touch: {
      feedback: {
        opacity: 0.7,
        scale: 0.98,
        duration: 150,
      },
      enabled: true,
    },
    platform: {
      ios: {
        safeArea: true,
      },
      android: {
        elevation: 2,
      },
    },
  },
};



export default tokens;