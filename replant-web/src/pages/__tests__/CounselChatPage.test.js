import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import CounselChatPage from '../CounselChatPage';

// MessageBubble 단순화 모킹
jest.mock('../../components/counsel/MessageBubble', () => (props) => (
  <div data-testid="bubble" data-user={props.isUser ? '1' : '0'}>
    {props.message}
  </div>
));

// counselService 모킹 (각 테스트에서 구현 변경)
const mockGenerateSessionId = jest.fn();
const mockGetSessionMessages = jest.fn();
const mockSaveMessage = jest.fn();
jest.mock('../../services/counselService', () => ({
  counselService: {
    generateSessionId: (...args) => mockGenerateSessionId(...args),
    getSessionMessages: (...args) => mockGetSessionMessages(...args),
    saveMessage: (...args) => mockSaveMessage(...args),
  }
}));

// 스크롤 API 안전화
beforeAll(() => {
  // eslint-disable-next-line no-undef
  Element.prototype.scrollIntoView = Element.prototype.scrollIntoView || jest.fn();
});

const renderWithRoute = (path = '/counsel/chat?type=chatbot') => {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <CounselChatPage />
    </MemoryRouter>
  );
};

describe('CounselChatPage', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    mockGenerateSessionId.mockReturnValue('session_test');
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('초기 진입(챗봇): 기존 메시지가 없으면 환영 메시지를 저장하고 표시한다', async () => {
    mockGetSessionMessages.mockResolvedValueOnce([]);
    mockSaveMessage.mockImplementation((_sid, message, isUser) => Promise.resolve({
      id: 1,
      message,
      is_user: !!isUser,
      timestamp: new Date().toISOString(),
    }));

    renderWithRoute('/counsel/chat?type=chatbot');

    // 환영 메시지 일부 텍스트 확인
    await waitFor(() => {
      expect(screen.getByText(/Replant AI 상담봇/)).toBeInTheDocument();
    });

    expect(mockGetSessionMessages).toHaveBeenCalledWith('session_test');
    expect(mockSaveMessage).toHaveBeenCalled();
  });

  test('메시지 전송 시 입력 중 인디케이터가 표시되고, 타이머 후 봇 응답이 나타난다', async () => {
    mockGetSessionMessages.mockResolvedValueOnce([]);
    mockSaveMessage.mockImplementation((_sid, message, isUser) => Promise.resolve({
      id: Date.now(),
      message,
      is_user: !!isUser,
      timestamp: new Date().toISOString(),
    }));

    renderWithRoute('/counsel/chat?type=chatbot');

    // 환영 메시지 렌더 대기
    await waitFor(() => expect(screen.getByText(/상담봇/)).toBeInTheDocument());

    // 입력하고 전송
    fireEvent.change(screen.getByPlaceholderText('메시지를 입력하세요...'), { target: { value: '안녕' } });
    fireEvent.click(screen.getByRole('button', { name: '전송' }));

    // 입력 중 인디케이터
    await waitFor(() => {
      expect(screen.getByText('메시지를 입력 중...')).toBeInTheDocument();
    });

    // 타이머 진행 → 봇 응답 표시되며 인디케이터 사라짐
    jest.advanceTimersByTime(4000);

    await waitFor(() => {
      expect(screen.queryByText('메시지를 입력 중...')).not.toBeInTheDocument();
      // 사용자/봇 버블이 최소 2개 이상 존재
      expect(screen.getAllByTestId('bubble').length).toBeGreaterThanOrEqual(2);
    });
  });

  test('기존 메시지가 있으면 저장 없이 기존 메시지를 포맷해 표시한다', async () => {
    mockGetSessionMessages.mockResolvedValueOnce([
      { id: 'a', message: '이전-1', is_user: true, timestamp: new Date().toISOString() },
      { id: 'b', message: '이전-2', is_user: false, timestamp: new Date().toISOString() },
    ]);
    mockSaveMessage.mockClear();

    renderWithRoute('/counsel/chat?type=counselor');

    // 헤더 텍스트 (상담사)
    expect(await screen.findByText('전문 상담사')).toBeInTheDocument();

    // 기존 메시지 표시 (2개)
    const bubbles = await screen.findAllByTestId('bubble');
    expect(bubbles).toHaveLength(2);

    // 초기 저장 호출되지 않음
    expect(mockSaveMessage).not.toHaveBeenCalled();
  });
});


