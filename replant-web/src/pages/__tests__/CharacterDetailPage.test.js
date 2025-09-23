import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import CharacterDetailPage from '../CharacterDetailPage';

// Router mocks
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ categoryId: 'exercise' }),
  useNavigate: () => mockNavigate,
}));

// Notification/Toast hooks
const mockShowToast = jest.fn();
jest.mock('../../hooks/useToast', () => ({
  useToast: () => ({ toasts: [], showToast: mockShowToast, removeToast: jest.fn() })
}));

jest.mock('../../hooks/useNotification', () => ({
  useNotification: () => ({ notifications: [], removeNotification: jest.fn(), markAsRead: jest.fn() })
}));

// 이미지 유틸 모킹 (스토리지 접근 우회)
jest.mock('../../utils/characterImageUtils', () => ({
  getCharacterImageUrl: () => '/img.png',
}));

// UI containers
jest.mock('../../components/ui', () => ({
  ToastContainer: () => <div data-testid="toast-container" />,
  NotificationContainer: () => <div data-testid="notification-container" />,
  Card: ({ children, ...rest }) => <div data-testid="card" {...rest}>{children}</div>,
  Button: ({ children, ...rest }) => <button {...rest}>{children}</button>,
  Progress: () => <div data-testid="progress" />,
  LoadingState: ({ message }) => <div>{message}</div>,
}));

// Character name editor
jest.mock('../../components/character/CharacterNameEdit', () => ({
  __esModule: true,
  default: () => <div data-testid="name-edit" />
}));

// missionService for completed count
jest.mock('../../services/missionService', () => ({
  missionService: {
    getCompletedMissions: jest.fn(async () => ({ data: [{ id: 1 }, { id: 2 }, { id: 3 }], error: null }))
  }
}));

// characterService methods used by name edit, but not exercised here
jest.mock('../../services/characterService', () => ({
  characterService: {
    updateCharacterName: jest.fn(),
    resetCharacterNameToDefault: jest.fn(),
  }
}));

// Supabase nickname
jest.mock('../../config/supabase', () => ({
  getCurrentUserNickname: () => 'tester'
}));

// useCharacter hook
const mockSetSelectedCharacter = jest.fn();
const mockUseCharacter = jest.fn();
jest.mock('../../hooks/useCharacter', () => ({
  useCharacter: (...args) => mockUseCharacter(...args),
}));

const baseCharacters = {
  exercise: {
    id: 'c1',
    category: 'exercise',
    unlocked: true,
    level: 3,
    experience: 120,
    maxExperience: 300,
    stats: { streak: 2, longestStreak: 5 },
    totalExperience: 500,
    categoryInfo: { name: '운동', emoji: '🏃', color: '#22c55e' },
  },
};

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe('CharacterDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCharacter.mockImplementation(() => ({
      characters: baseCharacters,
      selectedCharacter: { category: 'reading' },
      loading: false,
      setSelectedCharacter: mockSetSelectedCharacter.mockResolvedValue(true),
    }));
  });

  test('로딩 상태에서 스켈레톤 메시지를 표시한다', () => {
    mockUseCharacter.mockImplementation(() => ({
      characters: {},
      selectedCharacter: null,
      loading: true,
      setSelectedCharacter: mockSetSelectedCharacter,
    }));
    renderWithRouter(<CharacterDetailPage />);
    expect(screen.getByText('캐릭터 정보를 불러오는 중...')).toBeInTheDocument();
  });

  test('대표 캐릭터가 아니면 "대표캐릭터 설정" 버튼이 보이고 동작한다', async () => {
    renderWithRouter(<CharacterDetailPage />);
    expect(screen.getByText('캐릭터 상세정보')).toBeInTheDocument();

    const setMainBtn = screen.getByText('대표캐릭터 설정');
    fireEvent.click(setMainBtn);

    await waitFor(() => {
      expect(mockSetSelectedCharacter).toHaveBeenCalledWith('exercise');
      expect(mockShowToast).toHaveBeenCalledWith('대표 캐릭터가 설정되었습니다!', 'success');
    });
  });

  test('완료한 미션 카드 클릭 시 완료 미션 페이지로 이동한다', () => {
    renderWithRouter(<CharacterDetailPage />);
    // 첫 번째 통계 카드가 클릭 타겟
    const completedStat = screen.getAllByText(/완료한 미션|연속일|최고 기록|총 경험치/)[0];
    // 보다 정확히 card를 찾기 위해 container 내 버튼 대신 stat 영역의 부모를 클릭
    const clickableCard = completedStat.closest('div');
    fireEvent.click(clickableCard);

    expect(mockNavigate).toHaveBeenCalledWith('/completed-missions?category=exercise');
  });

  test('미션 버튼 클릭 시 해당 카테고리 미션 페이지로 이동한다', () => {
    renderWithRouter(<CharacterDetailPage />);
    fireEvent.click(screen.getByText(/미션 수행하기/));
    expect(mockNavigate).toHaveBeenCalledWith('/mission?category=exercise');
  });
});


