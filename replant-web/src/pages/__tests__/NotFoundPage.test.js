import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import NotFoundPage from '../NotFoundPage';

// useNavigate 훅 모킹
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// supabase 모킹 - 닉네임이 없는 경우로 설정
jest.mock('../../config/supabase', () => ({
  getCurrentUserNickname: jest.fn(() => null)
}));

// 라우터로 감싸는 헬퍼 함수
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('NotFoundPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  test('404 페이지가 올바르게 렌더링된다', () => {
    renderWithRouter(<NotFoundPage />);
    
    expect(screen.getByText('페이지를 찾을 수 없습니다')).toBeInTheDocument();
    expect(screen.getByText('요청하신 페이지가 존재하지 않거나 이동되었습니다.')).toBeInTheDocument();
    expect(screen.getByText('🔍')).toBeInTheDocument();
    expect(screen.getByText('홈으로 돌아가기')).toBeInTheDocument();
  });

  test('닉네임이 없을 때 사용자 정보가 표시되지 않는다', () => {
    renderWithRouter(<NotFoundPage />);
    
    // 닉네임이 null이므로 사용자 정보가 렌더링되지 않음
    expect(screen.queryByText('👤')).not.toBeInTheDocument();
  });

  test('홈으로 돌아가기 버튼 클릭 시 /start로 네비게이션된다 (닉네임 없음)', () => {
    renderWithRouter(<NotFoundPage />);
    
    const homeButton = screen.getByText('홈으로 돌아가기');
    fireEvent.click(homeButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/start');
  });

  test('Enter 키 눌러서 /start로 돌아가기 (닉네임 없음)', () => {
    renderWithRouter(<NotFoundPage />);
    
    fireEvent.keyDown(document, { key: 'Enter' });
    
    expect(mockNavigate).toHaveBeenCalledWith('/start');
  });

  test('Space 키 눌러서 /start로 돌아가기 (닉네임 없음)', () => {
    renderWithRouter(<NotFoundPage />);
    
    fireEvent.keyDown(document, { key: ' ' });
    
    expect(mockNavigate).toHaveBeenCalledWith('/start');
  });

  test('minimal 레이아웃 모드일 때 /start로 네비게이션된다', () => {
    renderWithRouter(<NotFoundPage layoutMode="minimal" />);
    
    const homeButton = screen.getByText('홈으로 돌아가기');
    fireEvent.click(homeButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/start');
  });

  test('접근성 속성이 올바르게 설정되어 있다', () => {
    renderWithRouter(<NotFoundPage />);
    
    const mainElement = screen.getByRole('main');
    expect(mainElement).toHaveAttribute('aria-label', '페이지를 찾을 수 없습니다');
  });
});