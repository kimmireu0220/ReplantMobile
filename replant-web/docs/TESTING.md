# Testing Guide

Replant 프로젝트의 테스트 작성 및 실행 가이드입니다.

## 📋 테스트 전략

### 테스트 피라미드
- **Unit Tests (70%)**: 개별 함수, 컴포넌트, 서비스
- **Integration Tests (20%)**: 컴포넌트 간 상호작용, API 통합
- **E2E Tests (10%)**: 사용자 시나리오 기반 전체 플로우

### 커버리지 목표
- **Branches**: 70% 이상
- **Functions**: 70% 이상  
- **Lines**: 70% 이상
- **Statements**: 70% 이상

## 🛠️ 테스트 도구 및 설정

### 기본 테스트 스택
- **Jest**: 테스트 러너 및 어서션
- **React Testing Library**: React 컴포넌트 테스트
- **@testing-library/jest-dom**: 추가 매처

### 설정 파일
- `package.json`: Jest 설정 및 커버리지 임계값
- `src/setupTests.js`: 테스트 환경 초기설정
- `src/test-utils/`: 테스트 유틸리티

## 🚀 테스트 실행

### 기본 명령어
```bash
# 모든 테스트 실행
npm test

# 워치 모드 실행
npm run test:watch

# 커버리지와 함께 실행
npm run test:coverage

# CI 환경용 (워치 모드 없이)
npm run test:ci

# 디버그 모드 실행
npm run test:debug
```

### 특정 테스트 실행
```bash
# 특정 파일
npm test -- Button.test.js

# 특정 패턴
npm test -- --testNamePattern="renders correctly"

# 변경된 파일만
npm test -- --onlyChanged
```

## 📁 테스트 파일 구조

```
src/
├── components/
│   ├── ui/
│   │   ├── Button.jsx
│   │   └── __tests__/
│   │       └── Button.test.js
│   └── features/
│       ├── MissionCard.jsx
│       └── __tests__/
│           └── MissionCard.test.js
├── services/
│   ├── missionService.js
│   └── __tests__/
│       └── missionService.test.js
├── hooks/
│   ├── useMission.js
│   └── __tests__/
│       └── useMission.test.js
└── test-utils/
    ├── mockSupabase.js
    └── renderWithProviders.js
```

## 🧪 테스트 작성 가이드

### 컴포넌트 테스트 예시

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button Component', () => {
  test('renders correctly with text', () => {
    render(<Button>Click me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  test('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});
```

### 서비스 테스트 예시

```javascript
import { missionService } from '../missionService';
import { mockSupabase } from '../../test-utils/mockSupabase';

// Supabase 모킹
jest.mock('../config/supabase', () => mockSupabase);

describe('MissionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getUserMissions returns user missions', async () => {
    const mockMissions = [
      { id: '1', title: 'Test Mission', completed: false }
    ];
    
    mockSupabase.from.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValueOnce({ 
        data: mockMissions, 
        error: null 
      })
    });

    const missions = await missionService.getUserMissions();
    
    expect(missions).toEqual(mockMissions);
    expect(mockSupabase.from).toHaveBeenCalledWith('missions');
  });
});
```

### Hook 테스트 예시

```javascript
import { renderHook, act } from '@testing-library/react';
import { useMission } from '../useMission';

describe('useMission Hook', () => {
  test('should complete mission successfully', async () => {
    const { result } = renderHook(() => useMission());

    await act(async () => {
      await result.current.completeMission('mission-1');
    });

    expect(result.current.missions).toContainEqual(
      expect.objectContaining({
        mission_id: 'mission-1',
        completed: true
      })
    );
  });
});
```

## 🔧 테스트 유틸리티

### MockSupabase
```javascript
// src/test-utils/mockSupabase.js
export const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
  })),
  auth: {
    getSession: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
  },
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn(),
      getPublicUrl: jest.fn(),
    })),
  },
};
```

### RenderWithProviders
```javascript
// src/test-utils/renderWithProviders.js
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../contexts/ThemeContext';
import { SupabaseProvider } from '../contexts/SupabaseContext';

export const renderWithProviders = (ui, options = {}) => {
  const AllTheProviders = ({ children }) => (
    <BrowserRouter>
      <SupabaseProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </SupabaseProvider>
    </BrowserRouter>
  );

  return render(ui, { wrapper: AllTheProviders, ...options });
};
```

## 🎯 테스트 모범 사례

### DO ✅
- **접근성 우선**: `getByRole`, `getByLabelText` 등 사용
- **사용자 중심**: 사용자가 보고 경험하는 것을 테스트
- **의미있는 테스트**: 실제 버그를 잡을 수 있는 테스트 작성
- **격리된 테스트**: 각 테스트는 독립적이어야 함
- **명확한 네이밍**: 테스트 이름만으로 의도 파악 가능

### DON'T ❌
- **구현 세부사항 테스트**: 내부 state, 컴포넌트 구조에 의존
- **과도한 모킹**: 실제 동작과 다른 결과 초래
- **취약한 선택자**: `querySelector`, `getElementsByClassName` 사용
- **비동기 처리 무시**: `waitFor`, `findBy` 없이 비동기 테스트

## 🔍 특수 테스트 케이스

### PWA 테스트
```javascript
// Service Worker 테스트
test('service worker registers correctly', async () => {
  // Service Worker 등록 테스트
});

// 오프라인 기능 테스트
test('works offline', async () => {
  // 네트워크 차단 후 기능 테스트
});
```

### 접근성 테스트
```javascript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('should not have accessibility violations', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### 반응형 테스트
```javascript
test('displays correctly on mobile', () => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 375, // Mobile width
  });

  render(<ResponsiveComponent />);
  
  // 모바일 레이아웃 검증
});
```

## 📊 커버리지 분석

### 커버리지 제외 설정
```javascript
// jest 설정에서 제외할 파일/패턴
"collectCoverageFrom": [
  "src/**/*.{js,jsx}",
  "!src/index.js",
  "!src/setupTests.js",
  "!src/**/*.test.js",
  "!src/**/__tests__/**",
  "!src/constants/**",
  "!src/data/**"
]
```

### 커버리지 보고서 확인
```bash
# 커버리지 실행 후 보고서 열기
npm run test:coverage
open coverage/lcov-report/index.html
```

## 🐛 디버깅 가이드

### 디버그 모드 실행
```bash
# 디버그 정보와 함께 실행
npm run test:debug -- --runInBand

# 특정 테스트만 디버그
npm test -- --testNamePattern="specific test" --runInBand
```

### 테스트 실패 디버깅
```javascript
// 화면 출력으로 디버그
import { screen } from '@testing-library/react';

test('debug test', () => {
  render(<MyComponent />);
  
  // DOM 구조 출력
  screen.debug();
  
  // 특정 요소 출력
  const element = screen.getByTestId('test-element');
  screen.debug(element);
});
```

## 📚 관련 문서

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [접근성 테스트](https://github.com/nickcolley/jest-axe)