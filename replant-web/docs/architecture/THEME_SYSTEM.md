# Replant 테마 시스템 (다크모드) 아키텍처

## 개요
Replant는 Material Design 원칙을 준수하는 라이트/다크 테마를 지원합니다. 본 문서는 구현 원칙과 핵심 구조, 사용 가이드를 간결히 정리합니다.

## 핵심 원칙
- 단일 소스: CSS 변수와 `src/design/tokens.js` 토큰으로 일관성 유지
- 접근성 우선: WCAG AA 이상 대비, 모션/고대비 선호도 준수
- 성능 고려: 필요한 변수만 정의하고 조건부 스타일 최소화

## 핵심 변수 구조
```css
:root {
  /* 배경 */
  --color-background-body: #ffffff;
  --color-background-primary: #ffffff;
  --color-background-secondary: #f6f7f9;

  /* 텍스트 */
  --color-text-primary: rgba(0, 0, 0, 0.87);
  --color-text-secondary: rgba(0, 0, 0, 0.60);
  --color-text-tertiary: rgba(0, 0, 0, 0.38);

  /* 섀도우 */
  --color-shadow-light: rgba(0, 0, 0, 0.2);
  --color-shadow-medium: rgba(0, 0, 0, 0.4);
}

[data-theme="dark"] {
  --color-background-body: #121212;
  --color-background-primary: #1e1e1e;
  --color-background-secondary: #232323;

  --color-text-primary: rgba(255, 255, 255, 0.87);
  --color-text-secondary: rgba(255, 255, 255, 0.60);
  --color-text-tertiary: rgba(255, 255, 255, 0.38);
}
```

## 디자인 토큰 연동
```javascript
// src/design/tokens.js 요약
export const tokens = {
  colors: {
    background: {
      body: 'var(--color-background-body)',
      primary: 'var(--color-background-primary)',
      secondary: 'var(--color-background-secondary)'
    },
    text: {
      primary: 'var(--color-text-primary)',
      secondary: 'var(--color-text-secondary)',
      tertiary: 'var(--color-text-tertiary)'
    },
    shadow: {
      light: 'var(--color-shadow-light)',
      medium: 'var(--color-shadow-medium)'
    }
  },
  spacing: { /* ... */ },
  borderRadius: { /* ... */ }
};
```

## 컴포넌트 사용 가이드
```jsx
// CSS 변수/토큰 기반 스타일 사용 권장
import { tokens } from '../../src/design/tokens';

const Card = ({ children }) => (
  <div
    style={{
      backgroundColor: tokens.colors.background.primary,
      color: tokens.colors.text.primary,
      boxShadow: `0 2px 8px ${tokens.colors.shadow.light}`
    }}
  >
    {children}
  </div>
);
```

### 조건부 다크모드 스타일
```jsx
import { useTheme } from '../../src/contexts/ThemeContext';
import { tokens } from '../../src/design/tokens';

const Surface = ({ children }) => {
  const { actualTheme } = useTheme();
  const isDark = actualTheme === 'dark';

  const style = {
    backgroundColor: tokens.colors.background.primary,
    color: tokens.colors.text.primary,
    ...(isDark && { border: '1px solid rgba(255, 255, 255, 0.08)' })
  };

  return <div style={style}>{children}</div>;
};
```

## 접근성 가이드
```css
/* 고대비 선호 */
@media (prefers-contrast: high) {
  :root {
    --color-text-primary: #000000;
    --color-text-secondary: #333333;
  }
  [data-theme="dark"] {
    --color-text-primary: #ffffff;
    --color-text-secondary: #e0e0e0;
  }
}

/* 모션 감소 선호 */
@media (prefers-reduced-motion: reduce) {
  * { transition: none !important; }
}
```

## 테마 토글
```jsx
import ThemeToggle from '../../src/components/ui/ThemeToggle';

<ThemeToggle />
// 또는 세그먼트 변형
<ThemeToggle variant="segmented" showLabel showSystem />
```

## 관련 문서
- docs/README.md – 프로젝트 개요
- docs/CONTRIBUTING.md – 개발 가이드라인
- src/design/tokens.js – 디자인 토큰 정의

