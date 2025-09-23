import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import CounselStartPage from '../CounselStartPage';

// useNavigate 훅 모킹
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// supabase 모킹
jest.mock('../../config/supabase', () => ({
  getCurrentUserNickname: jest.fn(() => null) // nickname이 없는 상태로 테스트
}));

// 라우터로 감싸는 헬퍼 함수
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('CounselStartPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  test('페이지가 올바르게 렌더링된다', () => {
    renderWithRouter(<CounselStartPage />);
    
    // 제목은 이모지가 포함되어 있어 포함 매처 사용 (여러 곳에 있을 수 있으므로 all로 검사)
    expect(screen.getAllByText((t) => t.includes('상담 서비스')).length).toBeGreaterThan(0);
    expect(screen.getByText(/고민이나 감정을 털어놓고 싶을 때/)).toBeInTheDocument();
  });

  test('전문 상담사 카드가 렌더링된다', () => {
    renderWithRouter(<CounselStartPage />);
    
    // 아이콘 이모지는 환경에 따라 깨질 수 있으므로 제목과 설명으로 검증
    expect(screen.getByText('전문 상담사와 대화하기')).toBeInTheDocument();
    expect(screen.getByText(/전문 상담사와 1:1로 대화하며/)).toBeInTheDocument();
    expect(screen.getByText('상담사 연결하기')).toBeInTheDocument();
  });

  test('AI 챗봇 카드가 렌더링된다', () => {
    renderWithRouter(<CounselStartPage />);
    
    // 아이콘 이모지는 환경에 따라 깨질 수 있으므로 제목과 설명으로 검증
    expect(screen.getByText('AI 챗봇과 대화하기')).toBeInTheDocument();
    expect(screen.getByText(/24시간 언제든지 AI 챗봇과/)).toBeInTheDocument();
    expect(screen.getByText('챗봇과 대화하기')).toBeInTheDocument();
  });

  test('상담사 카드 클릭 시 올바른 경로로 네비게이션된다', () => {
    renderWithRouter(<CounselStartPage />);
    
    // 버튼을 직접 클릭하여 네비게이션 검증
    fireEvent.click(screen.getByText('상담사 연결하기'));
    
    expect(mockNavigate).toHaveBeenCalledWith('/counsel/chat?type=counselor');
  });

  test('챗봇 카드 클릭 시 올바른 경로로 네비게이션된다', () => {
    renderWithRouter(<CounselStartPage />);
    
    // 버튼을 직접 클릭하여 네비게이션 검증
    fireEvent.click(screen.getByText('챗봇과 대화하기'));
    
    expect(mockNavigate).toHaveBeenCalledWith('/counsel/chat?type=chatbot');
  });

  test('상담사 연결하기 버튼 클릭 시 네비게이션된다', () => {
    renderWithRouter(<CounselStartPage />);
    
    const counselorButton = screen.getByText('상담사 연결하기');
    fireEvent.click(counselorButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/counsel/chat?type=counselor');
  });

  test('챗봇과 대화하기 버튼 클릭 시 네비게이션된다', () => {
    renderWithRouter(<CounselStartPage />);
    
    const chatbotButton = screen.getByText('챗봇과 대화하기');
    fireEvent.click(chatbotButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/counsel/chat?type=chatbot');
  });

  test('닉네임이 없을 때 사용자 정보가 표시되지 않는다', () => {
    renderWithRouter(<CounselStartPage />);
    
    // 닉네임이 null이므로 사용자 정보가 렌더링되지 않음
    expect(screen.queryByText('👤')).not.toBeInTheDocument();
  });
});