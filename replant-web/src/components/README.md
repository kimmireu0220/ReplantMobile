# Replant Component System

Replant의 도메인 기반 React 컴포넌트 모음입니다. 모든 컴포넌트는 접근성과 반응형 디자인을 고려하여 설계되었습니다.

## 폴더 구조

```
components/
├── ui/             # 기본 UI 컴포넌트
│   ├── Button.jsx
│   ├── Card.jsx
│   ├── Toast.jsx
│   └── ...
├── features/       # 기능별 컴포넌트
│   ├── MissionCard.jsx
│   ├── EmotionDiaryCard.jsx
│   └── ...
├── layout/         # 레이아웃 컴포넌트
├── navigation/     # 내비게이션 컴포넌트
├── home/          # 홈 페이지 컴포넌트
├── dex/           # 캐릭터 도감 컴포넌트
├── character/     # 캐릭터 관련 컴포넌트
├── diary/         # 일기 관련 컴포넌트
├── mission/       # 미션 관련 컴포넌트
├── counsel/       # 상담 관련 컴포넌트
└── demo/          # 데모 컴포넌트
```

## 주요 UI 컴포넌트

### Button

다양한 스타일과 상태를 지원하는 버튼 컴포넌트입니다.

```jsx
import { Button } from '../components/ui';

<Button 
  variant="primary"     // primary, secondary, outline, danger
  size="base"          // small, base, large
  disabled={false}
  loading={false}
  onClick={handleClick}
  ariaLabel="버튼 설명"
>
  버튼 텍스트
</Button>
```

**Props**:
- `variant`: 버튼 스타일 (`primary`, `secondary`, `outline`, `danger`)
- `size`: 버튼 크기 (`small`, `base`, `large`)
- `disabled`: 비활성 상태
- `loading`: 로딩 상태
- `onClick`: 클릭 이벤트 핸들러
- `ariaLabel`: 접근성을 위한 라벨
- `ariaDescribedBy`: 추가 설명 요소 ID
- `ariaPressed`: 토글 버튼의 눌림 상태
- `ariaExpanded`: 확장 가능한 컨트롤의 상태

### Card

콘텐츠를 담는 카드 컴포넌트입니다.

```jsx
import { Card } from '../components/ui';

<Card 
  variant="default"    // default, elevated, outlined, mission, dex
  padding="base"       // none, small, base, large
  clickable={true}
  onClick={handleClick}
  ariaLabel="카드 설명"
>
  카드 내용
</Card>
```

**Props**:
- `variant`: 카드 스타일 (`default`, `elevated`, `outlined`, `mission`, `dex`)
- `padding`: 내부 패딩 (`none`, `small`, `base`, `large`)
- `clickable`: 클릭 가능 여부
- `onClick`: 클릭 이벤트 핸들러
- `ariaLabel`: 접근성을 위한 라벨
- `role`: ARIA 역할

### Toast

알림 메시지를 표시하는 토스트 컴포넌트입니다.

```jsx
import { Toast, ToastContainer } from '../components/ui';

// Toast는 useToast 훅과 함께 사용
const { showSuccess, showError } = useToast();

showSuccess('성공 메시지');
showError('에러 메시지');

// ToastContainer를 앱 최상위에 배치
<ToastContainer />
```

## 기능 컴포넌트

### MissionCard

미션 정보를 표시하는 카드 컴포넌트입니다.

```jsx
import { MissionCard } from '../components/features';

<MissionCard
  mission={mission}
  onComplete={handleComplete}
  onPhotoSubmit={handlePhotoSubmit}
  showCategory={true}
/>
```

### EmotionDiaryCard

감정 일기 항목을 표시하는 카드 컴포넌트입니다.

```jsx
import { EmotionDiaryCard } from '../components/features';

<EmotionDiaryCard
  diary={diary}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

### CharacterCard

캐릭터 정보를 표시하는 카드 컴포넌트입니다.

```jsx
import { CharacterCard } from '../components/dex';

<CharacterCard
  character={character}
  onClick={handleClick}
  showLevel={true}
  unlocked={character.unlocked}
/>
```

## 레이아웃 컴포넌트

### AppLayout

앱 전체의 기본 레이아웃을 제공합니다.

```jsx
import { AppLayout } from '../components/layout';

<AppLayout>
  <YourPageContent />
</AppLayout>
```

### GameLayout

게임 화면을 위한 전체 화면 레이아웃입니다.

```jsx
import { GameLayout } from '../components/layout';

<GameLayout>
  <YourGameContent />
</GameLayout>
```

## 내비게이션 컴포넌트

### SlidingSidebar

슬라이딩 사이드바 메뉴입니다.

```jsx
import { SlidingSidebar, HamburgerButton } from '../components/navigation';

<HamburgerButton 
  isOpen={sidebarOpen}
  onClick={toggleSidebar}
/>
<SlidingSidebar 
  isOpen={sidebarOpen}
  onClose={closeSidebar}
/>
```

## 사용법 가이드

### 네임드 임포트 사용

```jsx
// UI 컴포넌트
import { Button, Card, Toast } from '../components/ui';

// 기능별 컴포넌트
import { MissionCard, EmotionDiaryCard } from '../components/features';

// 도메인별 컴포넌트
import { MainCharacterDisplay } from '../components/home';
import { CategoryTabs } from '../components/dex';
import { CharacterNameEdit } from '../components/character';
```

### 접근성 고려사항

모든 컴포넌트는 다음 접근성 기준을 따릅니다:

- **키보드 내비게이션**: Tab, Enter, Space 키 지원
- **스크린 리더**: 적절한 ARIA 라벨과 역할
- **고대비 모드**: 충분한 색상 대비
- **포커스 관리**: 명확한 포커스 표시

### 반응형 디자인

- **모바일 우선**: 모든 컴포넌트는 모바일에서 먼저 최적화
- **터치 친화적**: 충분한 터치 타겟 크기 (44px 이상)
- **적응형 레이아웃**: 화면 크기에 따른 자동 조정

## 테마 시스템 연동

모든 컴포넌트는 디자인 토큰을 통해 라이트/다크 테마를 지원합니다:

```jsx
import { tokens } from '../design/tokens';

const styles = {
  backgroundColor: tokens.colors.background.primary,
  color: tokens.colors.text.primary,
};
```

## 데모 및 테스트

- **인터랙티브 데모**: `/components` 경로에서 모든 컴포넌트 데모 확인
- **컴포넌트 테스트**: `src/components/**/__tests__/` 에서 테스트 코드 확인
- **스토리북**: 각 컴포넌트의 다양한 상태와 Props 조합 테스트

## 성능 최적화

- **React.memo**: 불필요한 리렌더링 방지
- **Lazy Loading**: 필요시에만 컴포넌트 로드
- **Virtual Scrolling**: 긴 목록의 성능 최적화
- **Code Splitting**: 페이지별 번들 분할

## 관련 문서

- [디자인 토큰](../design/tokens.js) - 일관된 스타일링
- [접근성 가이드](../design/accessibility.js) - 접근성 규칙
- [테마 시스템](../../docs/architecture/THEME_SYSTEM.md) - 다크모드 지원
- [API 문서](../../docs/API.md) - 서비스 레이어 연동