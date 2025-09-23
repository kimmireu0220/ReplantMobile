import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Toast from '../Toast';

// Mock the ScreenReaderOnly component
jest.mock('../ScreenReaderOnly', () => ({
  StatusAnnouncement: ({ message, type, visible }) => 
    visible ? <div data-testid="status-announcement">{message}</div> : null
}));

// Mock timers for testing auto-dismiss functionality
jest.useFakeTimers();

describe('Toast', () => {
  const defaultProps = {
    message: 'Test message',
    type: 'success',
    visible: true,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('기본 Toast가 렌더링된다', () => {
    render(<Toast {...defaultProps} />);
    
    expect(screen.getByText('Test message')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  test('다양한 type의 Toast가 렌더링된다', () => {
    const { rerender } = render(<Toast {...defaultProps} type="success" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    rerender(<Toast {...defaultProps} type="error" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    
    rerender(<Toast {...defaultProps} type="warning" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    
    rerender(<Toast {...defaultProps} type="info" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  test('close 버튼이 작동한다', async () => {
    const mockOnClose = jest.fn();
    render(<Toast {...defaultProps} onClose={mockOnClose} />);
    
    const closeButton = screen.getByLabelText(/닫기/);
    fireEvent.click(closeButton);
    
    await act(async () => {
      jest.advanceTimersByTime(300); // 애니메이션 시간
    });
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('자동 close가 작동한다', async () => {
    const mockOnClose = jest.fn();
    render(
      <Toast 
        {...defaultProps} 
        onClose={mockOnClose} 
        duration={3000}
      />
    );
    
    expect(mockOnClose).not.toHaveBeenCalled();
    
    await act(async () => {
      jest.advanceTimersByTime(3000);
    });
    
    await act(async () => {
      jest.advanceTimersByTime(300); // 애니메이션 시간
    });
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('visible이 false일 때 렌더링되지 않는다', () => {
    const { container } = render(
      <Toast 
        {...defaultProps} 
        visible={false}
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  test('onClick 이벤트가 작동한다', () => {
    const mockOnClick = jest.fn();
    render(
      <Toast 
        {...defaultProps} 
        onClick={mockOnClick}
      />
    );
    
    const toast = screen.getByRole('status');
    fireEvent.click(toast);
    
    expect(mockOnClick).toHaveBeenCalled();
  });

  test('긴 메시지가 올바르게 표시된다', () => {
    const longMessage = 'This is a very long message that should be displayed properly in the toast component without any issues';
    render(<Toast {...defaultProps} message={longMessage} />);
    
    expect(screen.getByText(longMessage)).toBeInTheDocument();
  });

  test('접근성 속성이 올바르게 설정된다', () => {
    render(<Toast {...defaultProps} type="success" />);
    
    const toast = screen.getByRole('status');
    expect(toast).toHaveAttribute('aria-live', 'polite');
    expect(toast).toHaveAttribute('aria-atomic', 'true');
  });

  test('error와 warning 타입은 alert 역할을 가진다', () => {
    const { rerender } = render(<Toast {...defaultProps} type="error" />);
    
    let toast = screen.getByRole('alert');
    expect(toast).toHaveAttribute('aria-live', 'assertive');
    
    rerender(<Toast {...defaultProps} type="warning" />);
    toast = screen.getByRole('alert');
    expect(toast).toHaveAttribute('aria-live', 'assertive');
  });

  test('타입별 아이콘이 올바르게 표시된다', () => {
    const { rerender } = render(<Toast {...defaultProps} type="success" />);
    expect(screen.getByText('✅')).toBeInTheDocument();
    
    rerender(<Toast {...defaultProps} type="error" />);
    expect(screen.getByText('❌')).toBeInTheDocument();
    
    rerender(<Toast {...defaultProps} type="warning" />);
    expect(screen.getByText('⚠️')).toBeInTheDocument();
    
    rerender(<Toast {...defaultProps} type="info" />);
    expect(screen.getByText('ℹ️')).toBeInTheDocument();
  });

  test('Toast 컴포넌트 unmount 시 타이머가 정리된다', async () => {
    const mockOnClose = jest.fn();
    const { unmount } = render(
      <Toast 
        {...defaultProps} 
        onClose={mockOnClose} 
        duration={3000}
      />
    );
    
    unmount();
    
    await act(async () => {
      jest.advanceTimersByTime(3000);
    });
    
    await act(async () => {
      jest.advanceTimersByTime(300);
    });
    
    // unmount 후에는 onClose가 호출되지 않아야 함
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});