import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ErrorBoundary, ErrorState, ERROR_TYPES, setupGlobalErrorHandling } from '../ErrorBoundary';

// 에러를 던지는 테스트 컴포넌트
const ThrowError = ({ shouldThrow = false, errorMessage = 'Test error' }) => {
  if (shouldThrow) {
    throw new Error(errorMessage);
  }
  return <div>No error</div>;
};

// 콘솔 에러 모킹 (에러 바운더리 테스트 시 콘솔 출력 방지)
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('ErrorState', () => {
  it('기본 에러 상태를 렌더링한다', () => {
    render(<ErrorState />);
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('알 수 없는 오류')).toBeInTheDocument();
    expect(screen.getByText(/알 수 없는 오류가 발생했습니다/)).toBeInTheDocument();
    expect(screen.getByText('❓')).toBeInTheDocument();
    expect(screen.getByText('다시 시도')).toBeInTheDocument();
  });

  it('네트워크 에러 타입을 올바르게 표시한다', () => {
    render(<ErrorState errorType={ERROR_TYPES.NETWORK} />);
    
    expect(screen.getByText('네트워크 연결 오류')).toBeInTheDocument();
    expect(screen.getByText('인터넷 연결을 확인해주세요.')).toBeInTheDocument();
    expect(screen.getByText('📶')).toBeInTheDocument();
    expect(screen.getByText('다시 시도')).toBeInTheDocument();
  });

  it('서버 에러 타입을 올바르게 표시한다', () => {
    render(<ErrorState errorType={ERROR_TYPES.SERVER} />);
    
    expect(screen.getByText('서버 오류')).toBeInTheDocument();
    expect(screen.getByText(/일시적인 서버 문제가 발생했습니다/)).toBeInTheDocument();
    expect(screen.getByText('🔧')).toBeInTheDocument();
  });

  it('권한 에러 타입을 올바르게 표시한다', () => {
    render(<ErrorState errorType={ERROR_TYPES.PERMISSION} />);
    
    expect(screen.getByText('접근 권한 없음')).toBeInTheDocument();
    expect(screen.getByText('이 기능에 접근할 권한이 없습니다.')).toBeInTheDocument();
    expect(screen.getByText('🔒')).toBeInTheDocument();
    expect(screen.getByText('확인')).toBeInTheDocument();
  });

  it('커스텀 제목과 메시지를 표시한다', () => {
    const customTitle = '커스텀 에러 제목';
    const customMessage = '커스텀 에러 메시지입니다.';
    
    render(
      <ErrorState 
        customTitle={customTitle}
        customMessage={customMessage}
      />
    );
    
    expect(screen.getByText(customTitle)).toBeInTheDocument();
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('커스텀 아이콘을 표시한다', () => {
    const customIcon = '🎯';
    
    render(<ErrorState customIcon={customIcon} />);
    
    expect(screen.getByText(customIcon)).toBeInTheDocument();
  });

  it('커스텀 액션 라벨을 표시한다', () => {
    const actionLabel = '커스텀 액션';
    
    render(<ErrorState actionLabel={actionLabel} />);
    
    expect(screen.getByText(actionLabel)).toBeInTheDocument();
  });

  it('onRetry 핸들러가 올바르게 호출된다', () => {
    const mockOnRetry = jest.fn();
    
    render(<ErrorState errorType={ERROR_TYPES.NETWORK} onRetry={mockOnRetry} />);
    
    const button = screen.getByText('다시 시도');
    fireEvent.click(button);
    
    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  it('onAction 핸들러가 올바르게 호출된다', () => {
    const mockOnAction = jest.fn();
    
    render(<ErrorState errorType={ERROR_TYPES.CLIENT} onAction={mockOnAction} />);
    
    const button = screen.getByText('확인');
    fireEvent.click(button);
    
    expect(mockOnAction).toHaveBeenCalledTimes(1);
  });

  it('에러 상세 정보를 표시할 수 있다', () => {
    const errorDetails = 'Detailed error information';
    
    render(
      <ErrorState 
        showDetails={true}
        errorDetails={errorDetails}
      />
    );
    
    expect(screen.getByText('상세 정보 보기')).toBeInTheDocument();
  });

  it('에러 상세 정보를 토글할 수 있다', () => {
    const errorDetails = 'Detailed error information';
    
    render(
      <ErrorState 
        showDetails={true}
        errorDetails={errorDetails}
      />
    );
    
    const toggleButton = screen.getByText('상세 정보 보기');
    fireEvent.click(toggleButton);
    
    expect(screen.getByText('상세 정보 숨기기')).toBeInTheDocument();
    expect(screen.getByText(errorDetails)).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('상세 정보 숨기기'));
    
    expect(screen.getByText('상세 정보 보기')).toBeInTheDocument();
    expect(screen.queryByText(errorDetails)).not.toBeInTheDocument();
  });

  it('다양한 크기 옵션을 지원한다', () => {
    const { container: smallContainer } = render(<ErrorState size="small" />);
    expect(smallContainer.querySelector('.error-state')).toHaveStyle({ minHeight: '200px' });
    
    const { container: mediumContainer } = render(<ErrorState size="medium" />);
    expect(mediumContainer.querySelector('.error-state')).toHaveStyle({ minHeight: '300px' });
    
    const { container: largeContainer } = render(<ErrorState size="large" />);
    expect(largeContainer.querySelector('.error-state')).toHaveStyle({ minHeight: '400px' });
  });

  it('접근성 role="alert"를 가지고 있다', () => {
    render(<ErrorState />);
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('터치 이벤트를 처리한다', () => {
    const mockOnAction = jest.fn();
    
    render(<ErrorState onAction={mockOnAction} />);
    
    const button = screen.getByText('다시 시도');
    fireEvent.touchStart(button);
    
    expect(mockOnAction).toHaveBeenCalled();
  });
});

describe('ErrorBoundary', () => {
  it('에러가 없을 때 자식 컴포넌트를 정상적으로 렌더링한다', () => {
    render(
      <ErrorBoundary>
        <div>정상 컨텐츠</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByText('정상 컨텐츠')).toBeInTheDocument();
  });

  it('자식 컴포넌트에서 에러가 발생하면 에러 UI를 표시한다', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} errorMessage="Test error occurred" />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('앱 오류')).toBeInTheDocument();
    expect(screen.getByText('예상치 못한 오류가 발생했습니다.')).toBeInTheDocument();
    expect(screen.getByText('🐛')).toBeInTheDocument();
  });

  it('커스텀 폴백 UI를 사용할 수 있다', () => {
    const customFallback = (error, errorInfo, retry) => (
      <div data-testid="custom-fallback">
        커스텀 에러 UI: {error?.message}
        <button onClick={retry}>다시 시도</button>
      </div>
    );
    
    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} errorMessage="Custom error" />
      </ErrorBoundary>
    );
    
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.getByText('커스텀 에러 UI: Custom error')).toBeInTheDocument();
  });

  it('재시도 기능이 작동한다', () => {
    // 에러 상태를 외부에서 제어할 수 있는 컴포넌트
    let throwError = true;
    const TestComponent = () => {
      if (throwError) {
        throw new Error('Test error');
      }
      return <div>No error</div>;
    };
    
    render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    );
    
    // 처음에는 에러 UI가 표시됨
    expect(screen.getByText('앱 오류')).toBeInTheDocument();
    
    // 에러 조건을 해제
    throwError = false;
    
    // 재시도 버튼 클릭
    const retryButton = screen.getByText('새로고침');
    fireEvent.click(retryButton);
    
    // 에러가 해결되면 정상 컨텐츠가 표시되어야 함
    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('다양한 크기 옵션을 전달할 수 있다', () => {
    render(
      <ErrorBoundary size="small">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    const errorContainer = screen.getByRole('alert');
    expect(errorContainer).toHaveStyle({ minHeight: '200px' });
  });

  it('클래스명을 전달할 수 있다', () => {
    render(
      <ErrorBoundary className="custom-error-class">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    const errorContainer = screen.getByRole('alert');
    expect(errorContainer).toHaveClass('custom-error-class');
  });
});

describe('setupGlobalErrorHandling', () => {
  let mockEventListener;
  let mockDispatchEvent;

  beforeEach(() => {
    mockEventListener = jest.fn();
    mockDispatchEvent = jest.fn();
    
    window.addEventListener = mockEventListener;
    window.dispatchEvent = mockDispatchEvent;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('전역 에러 핸들링을 설정한다', () => {
    setupGlobalErrorHandling();
    
    expect(mockEventListener).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
    expect(mockEventListener).toHaveBeenCalledWith('error', expect.any(Function));
  });

  it('처리되지 않은 Promise rejection을 처리한다', () => {
    setupGlobalErrorHandling();
    
    // addEventListener의 두 번째 인수(핸들러)를 가져와서 테스트
    const [, unhandledRejectionHandler] = mockEventListener.mock.calls.find(
      ([event]) => event === 'unhandledrejection'
    );
    
    const mockReason = new Error('Unhandled promise rejection');
    const mockEvent = { reason: mockReason };
    
    unhandledRejectionHandler(mockEvent);
    
    expect(mockDispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'globalError',
        detail: expect.objectContaining({
          type: ERROR_TYPES.JAVASCRIPT,
          error: mockReason,
          source: 'unhandledrejection'
        })
      })
    );
  });

  it('일반 JavaScript 에러를 처리한다', () => {
    setupGlobalErrorHandling();
    
    const [, errorHandler] = mockEventListener.mock.calls.find(
      ([event]) => event === 'error'
    );
    
    const mockError = new Error('JavaScript error');
    const mockEvent = {
      error: mockError,
      filename: 'test.js',
      lineno: 10,
      colno: 5
    };
    
    errorHandler(mockEvent);
    
    expect(mockDispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'globalError',
        detail: expect.objectContaining({
          type: ERROR_TYPES.JAVASCRIPT,
          error: mockError,
          source: 'javascript',
          filename: 'test.js',
          lineno: 10,
          colno: 5
        })
      })
    );
  });
});