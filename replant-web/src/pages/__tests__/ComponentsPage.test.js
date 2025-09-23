import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import ComponentsPage from '../ComponentsPage';

// UI containers & heavy components 모킹
jest.mock('../../components/ui/ToastContainer', () => ({ toasts }) => (
  <div data-testid="toast-container">toasts:{toasts?.length || 0}</div>
));

jest.mock('../../components/ui/NotificationContainer', () => ({ notifications }) => (
  <div data-testid="notification-container">notifications:{notifications?.length || 0}</div>
));

// IntersectionObserver를 사용하는 컴포넌트 우회
jest.mock('../../components/ui/ImageWithFallback', () => (props) => (
  <img data-testid="image-with-fallback" alt={props.alt || 'image'} />
));

const modalSpy = { lastProps: null };
jest.mock('../../components/ui/NicknameEditModal', () => (props) => {
  modalSpy.lastProps = props;
  return props.isOpen ? <div data-testid="nickname-modal" /> : null;
});

jest.mock('../../components/navigation/SlidingSidebar', () => ({ isOpen }) => (
  <div data-testid="sliding-sidebar">open:{String(!!isOpen)}</div>
));

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe('ComponentsPage', () => {
  beforeEach(() => {
    modalSpy.lastProps = null;
  });

  test('기본 렌더: 헤더와 UI 탭 콘텐츠(Button 데모) 표시', () => {
    renderWithRouter(<ComponentsPage />);
    expect(screen.getByText('🧩 Replant 컴포넌트 데모')).toBeInTheDocument();
    expect(screen.getByText('Button')).toBeInTheDocument();
  });

  test('UI 탭: 닉네임 변경 모달 버튼 클릭 시 모달이 열린다', () => {
    renderWithRouter(<ComponentsPage />);
    fireEvent.click(screen.getByRole('button', { name: '닉네임 변경 모달 열기' }));
    expect(screen.getByTestId('nickname-modal')).toBeInTheDocument();
    expect(modalSpy.lastProps?.isOpen).toBe(true);
  });

  test('네비게이션 탭: 사이드바 열기/닫기 동작', () => {
    renderWithRouter(<ComponentsPage />);
    fireEvent.click(screen.getByRole('button', { name: /네비게이션/ }));

    // 열기
    fireEvent.click(screen.getByRole('button', { name: '사이드바 열기' }));
    expect(screen.getByTestId('sliding-sidebar')).toHaveTextContent('open:true');

    // 닫기
    fireEvent.click(screen.getByRole('button', { name: '사이드바 닫기' }));
    expect(screen.getByTestId('sliding-sidebar')).toHaveTextContent('open:false');
  });

  test('알림 탭: 성공 알림 클릭 시 NotificationContainer에 1건 표시', () => {
    renderWithRouter(<ComponentsPage />);
    fireEvent.click(screen.getByRole('button', { name: /알림/ }));
    fireEvent.click(screen.getByRole('button', { name: '성공 알림' }));
    expect(screen.getByTestId('notification-container')).toHaveTextContent('notifications:1');
  });

  test('UI 탭: 버튼 클릭 시 ToastContainer에 토스트가 추가된다', () => {
    renderWithRouter(<ComponentsPage />);
    // 기본 탭이 UI이므로 바로 클릭
    fireEvent.click(screen.getByRole('button', { name: '기본' }));
    expect(screen.getByTestId('toast-container')).toHaveTextContent('toasts:1');
  });
});


