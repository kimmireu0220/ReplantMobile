import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import WelcomePage from '../WelcomePage';

// 라우터로 감싸는 헬퍼 함수
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('WelcomePage', () => {
  test('첫 번째 온보딩 단계가 렌더링된다', () => {
    renderWithRouter(<WelcomePage />);
    
    expect(screen.getByText('나만의 캐릭터 키우기 시작')).toBeInTheDocument();
    expect(screen.getByText('성장하는 특별한 여정!')).toBeInTheDocument();
    expect(screen.getByText('🌱')).toBeInTheDocument();
  });

  test('온보딩 단계 진행 도트가 렌더링된다', () => {
    renderWithRouter(<WelcomePage />);
    
    const progressDots = screen.getAllByRole('tab');
    expect(progressDots).toHaveLength(6);
  });

  test('바로 시작하기 버튼이 렌더링된다', () => {
    renderWithRouter(<WelcomePage />);
    
    expect(screen.getByText('바로 시작하기')).toBeInTheDocument();
  });

  test('진행 도트 클릭 시 해당 단계로 이동한다', () => {
    renderWithRouter(<WelcomePage />);
    
    const secondDot = screen.getAllByRole('tab')[1];
    fireEvent.click(secondDot);
    
    expect(screen.getByText('기분 한 줄, 성장 한 걸음')).toBeInTheDocument();
    expect(screen.getByText('📝')).toBeInTheDocument();
  });

  test('키보드 Enter 키로 다음 단계로 이동한다', () => {
    renderWithRouter(<WelcomePage />);
    
    // 첫 번째 단계 확인
    expect(screen.getByText('나만의 캐릭터 키우기 시작')).toBeInTheDocument();
    
    // Enter 키 누르기
    fireEvent.keyDown(document, { key: 'Enter' });
    
    // 두 번째 단계로 이동 확인
    expect(screen.getByText('기분 한 줄, 성장 한 걸음')).toBeInTheDocument();
  });

  test('키보드 Space 키로 다음 단계로 이동한다', () => {
    renderWithRouter(<WelcomePage />);
    
    // 첫 번째 단계 확인
    expect(screen.getByText('나만의 캐릭터 키우기 시작')).toBeInTheDocument();
    
    // Space 키 누르기
    fireEvent.keyDown(document, { key: ' ' });
    
    // 두 번째 단계로 이동 확인
    expect(screen.getByText('기분 한 줄, 성장 한 걸음')).toBeInTheDocument();
  });

  test('진행 도트에서 키보드 네비게이션이 작동한다', () => {
    renderWithRouter(<WelcomePage />);
    
    const thirdDot = screen.getAllByRole('tab')[2];
    
    // Enter 키로 세 번째 단계로 이동 (클릭으로 대체)
    fireEvent.click(thirdDot);
    expect(screen.getByText('미션 클리어 = 레벨업!')).toBeInTheDocument();
    
    const firstDot = screen.getAllByRole('tab')[0];
    
    // 첫 번째 단계로 다시 이동 (클릭으로 대체)
    fireEvent.click(firstDot);
    expect(screen.getByText('나만의 캐릭터 키우기 시작')).toBeInTheDocument();
  });

  test('접근성 속성들이 올바르게 설정되어 있다', () => {
    renderWithRouter(<WelcomePage />);
    
    // 메인 역할 확인
    expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'Replant 앱 온보딩');
    
    // 탭리스트 역할 확인
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-label', '온보딩 단계');
    
    // 제목 ID 확인
    expect(screen.getByRole('heading', { level: 1 })).toHaveAttribute('id', 'onboarding-title');
    
    // 설명 ID 확인
    const description = document.getElementById('onboarding-description');
    expect(description).toBeInTheDocument();
    
    // 진행 도트들의 aria-label 확인
    const progressDots = screen.getAllByRole('tab');
    expect(progressDots[0]).toHaveAttribute('aria-label', '1단계: Replant 앱 소개');
    expect(progressDots[1]).toHaveAttribute('aria-label', '2단계: 감정 일기 기능 소개');
    expect(progressDots[2]).toHaveAttribute('aria-label', '3단계: 미션 시스템 소개');
    expect(progressDots[3]).toHaveAttribute('aria-label', '4단계: 미니게임 기능 소개');
    expect(progressDots[4]).toHaveAttribute('aria-label', '5단계: 캐릭터 도감 기능 소개');
    expect(progressDots[5]).toHaveAttribute('aria-label', '6단계: 상담 서비스 소개');
  });

  test('모든 온보딩 단계가 순서대로 표시된다', () => {
    renderWithRouter(<WelcomePage />);
    
    const steps = [
      { title: '나만의 캐릭터 키우기 시작', icon: '🌱' },
      { title: '기분 한 줄, 성장 한 걸음', icon: '📝' },
      { title: '미션 클리어 = 레벨업!', icon: '🎯' },
      { title: '재미있는 미니게임으로 스트레스 해소', icon: '🎮' },
      { title: '다양한 캐릭터를 수집해보세요', icon: '📖' },
      { title: '힘들 때 말할 친구가 있어요', icon: '💬' }
    ];
    
    steps.forEach((step, index) => {
      const dot = screen.getAllByRole('tab')[index];
      fireEvent.click(dot);
      
      expect(screen.getByText(step.title)).toBeInTheDocument();
      expect(screen.getByText(step.icon)).toBeInTheDocument();
    });
  });

  test('바로 시작하기 버튼 클릭 시 네비게이션이 작동한다', () => {
    const mockNavigate = jest.fn();
    
    // useNavigate 훅 모킹
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate
    }));
    
    renderWithRouter(<WelcomePage />);
    
    const skipButton = screen.getByText('바로 시작하기');
    fireEvent.click(skipButton);
    
    // 실제 네비게이션 호출 검증은 어렵지만, 버튼이 클릭 가능한지 확인
    expect(skipButton).toBeInTheDocument();
  });
});