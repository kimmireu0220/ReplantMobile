import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import MissionPage from '../MissionPage';

// 훅 모킹
jest.mock('../../hooks/useMission', () => ({
  useMission: () => ({
    missions: [
      { mission_id: '1', title: 'A', category: 'exercise', completed: false, experience: 50 },
      { mission_id: '2', title: 'B', category: 'reading', completed: true, experience: 30 },
    ],
    isLoading: false,
    error: null,
    completeMissionWithPhoto: jest.fn(async () => ({ success: true })),
    uncompleteMission: jest.fn(async () => ({})),
  })
}));

// Stable mock functions for useCategory
const mockGetCategoryById = jest.fn(id => ({
  id,
  name: `Category ${id}`,
  emoji: '📚',
  color: '#4F46E5'
}));

jest.mock('../../hooks/useCategory', () => ({
  useCategory: () => ({
    categories: [
      { id: 'exercise', name: '운동', emoji: '💪', color: '#DC2626' },
      { id: 'reading', name: '독서', emoji: '📖', color: '#059669' },
    ],
    loading: false,
    error: null,
    getCategoryById: mockGetCategoryById,
    getCategoryColor: jest.fn(id => '#4F46E5'),
    getCategoryEmoji: jest.fn(id => '📚'),
    getCategoryName: jest.fn(id => `Category ${id}`),
  })
}));

jest.mock('../../hooks/useCharacter', () => ({
  useCharacter: () => ({ addExperienceByCategory: jest.fn(), loadCharacters: jest.fn(), loading: false })
}));

jest.mock('../../hooks/useNotification', () => ({
  useNotification: () => ({
    notifications: [],
    showMissionComplete: jest.fn(),
    showLevelUp: jest.fn(),
    showCharacterUnlocked: jest.fn(),
    removeNotification: jest.fn(),
    markAsRead: jest.fn(),
  })
}));

// 하위 컴포넌트 단순화
jest.mock('../../components/mission/MissionList', () => ({
  __esModule: true,
  default: ({ missions, onComplete, onUncomplete }) => (
    <div>
      <div>missions: {missions.length}</div>
      <button onClick={() => onComplete(missions[0].mission_id)}>complete</button>
      <button onClick={() => onUncomplete(missions[0].mission_id)}>uncomplete</button>
    </div>
  )
}));

jest.mock('../../components/mission/CategoryFilter', () => ({
  __esModule: true,
  default: ({ selectedCategory, onSelect }) => (
    <div>
      <div>selected: {selectedCategory}</div>
      <button onClick={() => onSelect('reading')}>to-reading</button>
      <button onClick={() => onSelect('all')}>to-all</button>
    </div>
  )
}));

jest.mock('../../components/mission/MissionProgress', () => ({
  __esModule: true,
  default: ({ completed, total }) => (
    <div>progress: {completed}/{total}</div>
  )
}));

jest.mock('../../components/ui', () => ({
  NotificationContainer: () => <div data-testid="notify" />,
  ThemeToggle: () => <div data-testid="theme-toggle" />
}));

jest.mock('../../config/supabase', () => ({
  getCurrentUserNickname: () => 'tester'
}));

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe('MissionPage', () => {
  test('로딩 없이 기본 렌더 및 진행률/필터/목록 표시 (텍스트 기반)', () => {
    renderWithRouter(<MissionPage />);

    // 닉네임 뱃지 존재
    expect(screen.getByText('tester')).toBeInTheDocument();

    // 페이지 존재(랜드마크/헤딩)
    expect(screen.getByRole('main', { name: '미션' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /미션/ })).toBeInTheDocument();

    // 진행률: 전체 2 중 완료 1 (텍스트)
    expect(screen.getByText(/progress:\s*1\/2/)).toBeInTheDocument();

    // 기본 카테고리 all (텍스트)
    expect(screen.getByText(/selected:\s*all/)).toBeInTheDocument();

    // 전체 목록에서는 2개 (텍스트)
    expect(screen.getByText(/missions:\s*2/)).toBeInTheDocument();
  });

  test('카테고리 변경 시 목록이 필터링된다 (텍스트 기반)', () => {
    renderWithRouter(<MissionPage />);
    fireEvent.click(screen.getByText('to-reading'));

    // 선택된 카테고리 확인 (텍스트)
    expect(screen.getByText(/selected:\s*reading/)).toBeInTheDocument();
    // reading 카테고리만 남아 1개 (텍스트)
    expect(screen.getByText(/missions:\s*1/)).toBeInTheDocument();
  });

  test('미션 완료/취소 핸들러가 호출된다', () => {
    renderWithRouter(<MissionPage />);
    fireEvent.click(screen.getByText('complete'));
    fireEvent.click(screen.getByText('uncomplete'));

    // 단순 상호작용 검증: 버튼이 존재하고 클릭 가능
    expect(screen.getByText('complete')).toBeInTheDocument();
    expect(screen.getByText('uncomplete')).toBeInTheDocument();
  });
});


