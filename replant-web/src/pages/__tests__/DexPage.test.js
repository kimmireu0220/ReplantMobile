import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import DexPage from '../DexPage';

// useNavigate 모킹
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// 닉네임 모킹
jest.mock('../../config/supabase', () => ({
  getCurrentUserNickname: () => 'tester',
}));

// 훅 모킹 (기본값)
const baseCharacters = {
  exercise: { id: 1, category: 'exercise', unlocked: true, categoryInfo: { name: '운동' } },
  reading: { id: 2, category: 'reading', unlocked: false, categoryInfo: { name: '독서' } },
  creativity: { id: 3, category: 'creativity', unlocked: true, categoryInfo: { name: '창의활동' } },
};

const mockUseCharacter = jest.fn();
jest.mock('../../hooks/useCharacter', () => ({
  useCharacter: (...args) => mockUseCharacter(...args),
}));

// Stable mock functions to prevent infinite loops
const mockGetCategoryById = jest.fn(id => ({
  id,
  name: `Category ${id}`,
  emoji: '📚',
  color: '#4F46E5'
}));

const mockUseCategory = {
  categories: [
    { id: 'all', name: '전체', emoji: '🌟', color: '#4F46E5' },
    { id: 'exercise', name: '운동', emoji: '💪', color: '#DC2626' },
    { id: 'reading', name: '독서', emoji: '📖', color: '#059669' },
  ],
  loading: false,
  error: null,
  getCategoryById: mockGetCategoryById,
  getCategoryColor: jest.fn(id => '#4F46E5'),
  getCategoryEmoji: jest.fn(id => '📚'),
  getCategoryName: jest.fn(id => `Category ${id}`),
  reloadCategories: jest.fn()
};

jest.mock('../../hooks/useCategory', () => ({
  useCategory: () => mockUseCategory,
}));

// 하위 컴포넌트 모킹
jest.mock('../../components/dex/CategoryTabs', () => ({
  __esModule: true,
  default: ({ onSelect, selectedCategory }) => (
    <div>
      <div>selected: {selectedCategory}</div>
      <button onClick={() => onSelect('all')}>to-all</button>
      <button onClick={() => onSelect('exercise')}>to-exercise</button>
      <button onClick={() => onSelect('reading')}>to-reading</button>
    </div>
  ),
}));

jest.mock('../../components/dex/CharacterCard', () => ({
  __esModule: true,
  default: ({ character, onSelect }) => (
    <button onClick={() => onSelect(character)}>
      {character.category} {character.unlocked ? 'unlocked' : 'locked'}
    </button>
  ),
}));

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe('DexPage', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockUseCharacter.mockReset().mockImplementation(() => ({
      characters: baseCharacters,
      selectedCharacter: null,
      loading: false,
    }));
    
    // Reset category hook mock functions  
    mockGetCategoryById.mockClear();
    mockUseCategory.getCategoryColor.mockClear();
    mockUseCategory.getCategoryEmoji.mockClear();
    mockUseCategory.getCategoryName.mockClear();
    mockUseCategory.reloadCategories.mockClear();
  });

  test('닉네임 배지가 표시된다', () => {
    renderWithRouter(<DexPage />);
    expect(screen.getByText('tester')).toBeInTheDocument();
  });

  test('초기 all 상태에서 잠금/해제 섹션 제목이 표시된다', () => {
    renderWithRouter(<DexPage />);
    expect(screen.getByText('수집한 캐릭터')).toBeInTheDocument();
    expect(screen.getByText('발견할 캐릭터')).toBeInTheDocument();
  });

  test('카테고리 전환 시 목록이 필터링된다', () => {
    renderWithRouter(<DexPage />);
    // reading으로 전환
    fireEvent.click(screen.getByText('to-reading'));
    expect(screen.getByText(/selected:\s*reading/)).toBeInTheDocument();

    // 읽기용으로 카드 텍스트 확인
    expect(screen.getByText(/reading\s+(unlocked|locked)/)).toBeInTheDocument();
    expect(screen.queryByText(/exercise\s+(unlocked|locked)/)).not.toBeInTheDocument();
    expect(screen.queryByText(/creativity\s+(unlocked|locked)/)).not.toBeInTheDocument();
  });

  test('캐릭터 카드 클릭 시 상세 페이지로 이동한다', () => {
    renderWithRouter(<DexPage />);
    fireEvent.click(screen.getByText(/exercise\s+(unlocked|locked)/));
    expect(mockNavigate).toHaveBeenCalledWith('/character/detail/exercise');
  });

  test('로딩 상태에서는 로딩 메시지를 표시한다', () => {
    mockUseCharacter.mockImplementation(() => ({
      characters: baseCharacters,
      selectedCharacter: null,
      loading: true,
    }));

    renderWithRouter(<DexPage />);
    expect(screen.getByText('도감 정보를 불러오는 중...')).toBeInTheDocument();
  });
});


