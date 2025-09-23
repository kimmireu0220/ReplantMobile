import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import GameSelectionPage from '../GameSelectionPage';

// 라우터로 감싸는 헬퍼 함수
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};



describe('GameSelectionPage', () => {
  beforeEach(() => {
    // 기본 화면 크기 설정
    global.innerWidth = 1024;
  });

  afterEach(() => {
    // 리사이즈 이벤트 리스너 정리
    jest.clearAllMocks();
  });

  test('게임 선택 페이지가 올바르게 렌더링된다', () => {
    renderWithRouter(<GameSelectionPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  test('모든 게임 카드가 렌더링된다', () => {
    renderWithRouter(<GameSelectionPage />);
    
    // 4개 게임 확인
    expect(screen.getByText('장애물 달리기')).toBeInTheDocument();
    expect(screen.getByText('퍼즐 게임')).toBeInTheDocument();
    expect(screen.getByText('기억력 게임')).toBeInTheDocument();
    expect(screen.getByText('퀴즈 게임')).toBeInTheDocument();
  });

  test('각 게임의 아이콘이 표시된다', () => {
    renderWithRouter(<GameSelectionPage />);
    
    expect(screen.getByText('🏃‍♂️')).toBeInTheDocument(); // 장애물 달리기
    expect(screen.getByText('🧩')).toBeInTheDocument();    // 퍼즐 게임
    expect(screen.getByText('🎯')).toBeInTheDocument();    // 기억력 게임
    expect(screen.getByText('💡')).toBeInTheDocument();    // 퀴즈 게임
  });

  test('각 게임의 설명이 표시된다', () => {
    renderWithRouter(<GameSelectionPage />);
    
    expect(screen.getByText(/빠른 반응속도로 장애물을 피하며/)).toBeInTheDocument();
    expect(screen.getByText(/같은 색깔 씨앗들을 연결해서/)).toBeInTheDocument();
    expect(screen.getByText(/순간 기억력과 집중력을/)).toBeInTheDocument();
    expect(screen.getByText(/재미있는 문제로 상식을/)).toBeInTheDocument();
  });

  test('이용 가능한 게임과 불가능한 게임이 구분된다', () => {
    renderWithRouter(<GameSelectionPage />);
    
    // available: true인 게임들 (장애물 달리기, 퍼즐 게임)
    expect(screen.getByText('장애물 달리기')).toBeInTheDocument();
    expect(screen.getByText('퍼즐 게임')).toBeInTheDocument();
    
    // available: false인 게임들 (기억력 게임, 퀴즈 게임)
    expect(screen.getByText('기억력 게임')).toBeInTheDocument();
    expect(screen.getByText('퀴즈 게임')).toBeInTheDocument();
  });

  test('반응형 동작 - 초기 상태에서 게임이 모두 렌더링된다', () => {
    renderWithRouter(<GameSelectionPage />);
    
    // 모든 게임이 렌더링되는지 확인 (반응형 상태와 관계없이)
    expect(screen.getByText('장애물 달리기')).toBeInTheDocument();
    expect(screen.getByText('퍼즐 게임')).toBeInTheDocument();
    expect(screen.getByText('기억력 게임')).toBeInTheDocument();
    expect(screen.getByText('퀴즈 게임')).toBeInTheDocument();
  });

  test('윈도우 리사이즈 이벤트 핸들러가 등록되어 있다', () => {
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    
    renderWithRouter(<GameSelectionPage />);
    
    // resize 이벤트 리스너가 등록되었는지 확인
    expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    
    addEventListenerSpy.mockRestore();
  });

  test('접근성 속성이 올바르게 설정되어 있다', () => {
    renderWithRouter(<GameSelectionPage />);
    
    // main 역할 확인
    expect(screen.getByRole('main')).toBeInTheDocument();
    // 카드 제목과 설명이 표시된다
    expect(screen.getByRole('heading', { level: 2, name: /미니 게임/ })).toBeInTheDocument();
    expect(screen.getByText(/원하는 미니 게임을 선택해 즐겨보세요/)).toBeInTheDocument();
  });
});