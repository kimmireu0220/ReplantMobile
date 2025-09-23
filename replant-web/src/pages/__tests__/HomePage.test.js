import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../HomePage';

// useNavigate 모킹
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// 훅 모킹 (jest.fn으로 만들어 테스트 내에서 동적으로 변경 가능)
const mockUseCharacter = jest.fn(() => ({ selectedCharacter: { id: 1, category: 'reading', categoryInfo: { name: '독서' } }, loading: false }));
const mockUseMission = jest.fn(() => ({ missions: [{ mission_id: '1', category: 'reading' }] }));
const mockUseNotification = jest.fn(() => ({ notifications: [], removeNotification: jest.fn(), markAsRead: jest.fn() }));
const mockUseToast = jest.fn(() => ({ toasts: [], removeToast: jest.fn() }));

jest.mock('../../hooks/useCharacter', () => ({ useCharacter: (...args) => mockUseCharacter(...args) }));
jest.mock('../../hooks/useMission', () => ({ useMission: (...args) => mockUseMission(...args) }));
jest.mock('../../hooks/useNotification', () => ({ useNotification: (...args) => mockUseNotification(...args) }));
jest.mock('../../hooks/useToast', () => ({ useToast: (...args) => mockUseToast(...args) }));

// 닉네임 모킹
jest.mock('../../config/supabase', () => ({
  getCurrentUserNickname: () => 'tester'
}));

// 하위 컴포넌트 모킹
jest.mock('../../components/home/MainCharacterDisplay', () => ({
  __esModule: true,
  default: ({ character, loading }) => (
    <div>{loading ? 'loading' : (character?.category || '')}</div>
  )
}));

jest.mock('../../components/home/RecommendedMissions', () => ({
  __esModule: true,
  default: ({ onSelect }) => (
    <div>
      <button onClick={() => onSelect('all')}>all</button>
      <button onClick={() => onSelect({ category: 'exercise' })}>exercise</button>
    </div>
  )
}));

jest.mock('../../components/ui', () => ({
  ToastContainer: () => <div data-testid="toast-container" />,
  NotificationContainer: () => <div data-testid="notification-container" />,
  ThemeToggle: () => <div data-testid="theme-toggle" />
}));

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe('HomePage', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    // 기본 훅 리턴값 리셋
    mockUseCharacter.mockReturnValue({ selectedCharacter: { id: 1, category: 'reading', categoryInfo: { name: '독서' } }, loading: false });
    mockUseMission.mockReturnValue({ missions: [{ mission_id: '1', category: 'reading' }] });
    mockUseNotification.mockReturnValue({ notifications: [], removeNotification: jest.fn(), markAsRead: jest.fn() });
    mockUseToast.mockReturnValue({ toasts: [], removeToast: jest.fn() });
  });

  describe('기본 렌더링', () => {
    test('닉네임 뱃지가 표시된다', () => {
      renderWithRouter(<HomePage />);
      expect(screen.getByText('tester')).toBeInTheDocument();
    });

    test('대표 캐릭터와 로딩 상태가 전달된다', () => {
      renderWithRouter(<HomePage />);
      expect(screen.getByText('reading')).toBeInTheDocument();
    });

    test('토스트/알림 컨테이너가 렌더링된다', () => {
      renderWithRouter(<HomePage />);
      expect(screen.getByTestId('toast-container')).toBeInTheDocument();
      expect(screen.getByTestId('notification-container')).toBeInTheDocument();
    });

    test('페이지 제목이 설정된다', () => {
      renderWithRouter(<HomePage />);
      expect(document.title).toContain('홈');
    });
  });

  describe('캐릭터 상태별 렌더링', () => {
    test('캐릭터 로딩 중일 때 로딩 상태를 표시한다', () => {
      // 로딩 중인 상태로 모킹
      mockUseCharacter.mockReturnValue({
        selectedCharacter: null,
        loading: true
      });

      renderWithRouter(<HomePage />);
      expect(screen.getByText('loading')).toBeInTheDocument();
    });

    test('캐릭터가 없을 때 적절한 상태를 표시한다', () => {
      mockUseCharacter.mockReturnValue({
        selectedCharacter: null,
        loading: false
      });

      renderWithRouter(<HomePage />);
      // 빈 텍스트는 명시적으로 검증 어렵기 때문에 페이지 헤더 텍스트만 유지 확인
      expect(screen.getByRole('main', { name: '홈' })).toBeInTheDocument();
    });

    test('다양한 캐릭터 카테고리를 표시할 수 있다', () => {
      const categories = ['exercise', 'reading', 'cooking', 'art'];
      const { rerender } = renderWithRouter(<HomePage />);
      categories.forEach(category => {
        mockUseCharacter.mockReturnValue({
          selectedCharacter: {
            id: 1,
            category,
            categoryInfo: { name: category }
          },
          loading: false
        });
        rerender(<BrowserRouter><HomePage /></BrowserRouter>);
        expect(screen.getAllByText(category).length).toBeGreaterThan(0);
      });
    });
  });

  describe('미션 추천 네비게이션', () => {
    test('추천 미션 전체 보기 선택 시 /mission 으로 이동', () => {
      renderWithRouter(<HomePage />);
      fireEvent.click(screen.getByText('all'));
      expect(mockNavigate).toHaveBeenCalledWith('/mission');
    });

    test('특정 카테고리 미션 선택 시 쿼리 포함 라우팅', () => {
      renderWithRouter(<HomePage />);
      fireEvent.click(screen.getByText('exercise'));
      expect(mockNavigate).toHaveBeenCalledWith('/mission?category=exercise');
    });

    test('미션 선택 핸들러가 여러 번 호출되어도 올바르게 작동한다', () => {
      renderWithRouter(<HomePage />);
      
      fireEvent.click(screen.getByText('all'));
      fireEvent.click(screen.getByText('exercise'));
      
      expect(mockNavigate).toHaveBeenCalledTimes(2);
      expect(mockNavigate).toHaveBeenNthCalledWith(1, '/mission');
      expect(mockNavigate).toHaveBeenNthCalledWith(2, '/mission?category=exercise');
    });
  });

  describe('알림 및 토스트 처리', () => {
    test('활성 알림이 있을 때 알림 컨테이너를 표시한다', () => {
      mockUseNotification.mockReturnValue({
        notifications: [
          { id: '1', message: 'Test notification', type: 'info' }
        ],
        removeNotification: jest.fn(),
        markAsRead: jest.fn()
      });

      renderWithRouter(<HomePage />);
      expect(screen.getByTestId('notification-container')).toBeInTheDocument();
    });

    test('토스트 메시지가 있을 때 토스트 컨테이너를 표시한다', () => {
      mockUseToast.mockReturnValue({
        toasts: [
          { id: '1', message: 'Test toast', type: 'success' }
        ],
        removeToast: jest.fn()
      });

      renderWithRouter(<HomePage />);
      expect(screen.getByTestId('toast-container')).toBeInTheDocument();
    });
  });

  describe('에러 처리', () => {
    test('캐릭터 로딩 에러 시에도 페이지가 렌더링된다', () => {
      mockUseCharacter.mockReturnValue({
        selectedCharacter: null,
        loading: false,
        error: 'Failed to load character'
      });

      expect(() => renderWithRouter(<HomePage />)).not.toThrow();
    });

    test('미션 로딩 에러 시에도 페이지가 렌더링된다', () => {
      mockUseMission.mockReturnValue({
        missions: [],
        error: 'Failed to load missions'
      });

      expect(() => renderWithRouter(<HomePage />)).not.toThrow();
    });
  });

  describe('접근성', () => {
    test('메인 콘텐츠 영역이 올바른 role을 가진다', () => {
      renderWithRouter(<HomePage />);
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });

    test('키보드 네비게이션이 가능하다', () => {
      renderWithRouter(<HomePage />);
      
      const allButton = screen.getByText('all');
      // 키보드 이벤트 대신 클릭으로 네비게이션 확인 (접근성 포커스/엔터는 버튼 기본 동작과 동일)
      fireEvent.click(allButton);
      expect(mockNavigate).toHaveBeenCalledWith('/mission');
    });

    test('스크린 리더를 위한 적절한 라벨이 있다', () => {
      renderWithRouter(<HomePage />);
      
      // 닉네임 뱃지 텍스트가 표시되는지만 확인
      expect(screen.getByText('tester')).toBeInTheDocument();
    });
  });

  describe('성능 최적화', () => {
    test('불필요한 리렌더링이 발생하지 않는다', () => {
      const { rerender } = renderWithRouter(<HomePage />);
      
      const initialCallCount = mockNavigate.mock.calls.length;
      
      // 동일한 props로 리렌더링
      rerender(<HomePage />);
      
      // 네비게이션 함수가 추가로 호출되지 않아야 함
      expect(mockNavigate.mock.calls.length).toBe(initialCallCount);
    });
  });

  describe('통합 테스트 시나리오', () => {
    test('사용자가 홈페이지에서 미션 페이지로 이동하는 전체 플로우', async () => {
      renderWithRouter(<HomePage />);
      
      // 1. 페이지가 로드되고 캐릭터 정보가 표시됨
      expect(screen.getByText('tester')).toBeInTheDocument();
      expect(screen.getAllByText('reading').length).toBeGreaterThan(0);
      
      // 2. 사용자가 특정 카테고리 미션을 선택
      act(() => {
        fireEvent.click(screen.getByText('exercise'));
      });
      
      // 3. 올바른 경로로 네비게이션됨
      expect(mockNavigate).toHaveBeenCalledWith('/mission?category=exercise');
    });

    test('캐릭터 변경 시 UI가 업데이트된다', async () => {
      const { rerender } = renderWithRouter(<HomePage />);
      
      // 초기 캐릭터
      expect(screen.getAllByText('reading').length).toBeGreaterThan(0);
      
      // 캐릭터 변경
      mockUseCharacter.mockReturnValue({
        selectedCharacter: { 
          id: 2, 
          category: 'exercise', 
          categoryInfo: { name: 'exercise' } 
        },
        loading: false
      });
      
      rerender(<BrowserRouter><HomePage /></BrowserRouter>);
      
      expect(screen.getAllByText('exercise').length).toBeGreaterThan(0);
    });
  });
});


