import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import StartPage from '../StartPage';

// useNavigate 훅 모킹
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// supabase.rpc 모킹
const mockRpc = jest.fn();
jest.mock('../../config/supabase', () => ({
  supabase: { rpc: (...args) => mockRpc(...args) },
}));

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('StartPage', () => {
  beforeEach(() => {
    mockRpc.mockReset();
    mockNavigate.mockReset();
    localStorage.clear();
  });

  test('초기 상태에서 시작하기 버튼은 닉네임이 없으면 비활성화된다', () => {
    renderWithRouter(<StartPage />);
    const startButton = screen.getByRole('button', { name: '시작하기' });
    expect(startButton).toBeDisabled();
  });

  test('유효하지 않은 닉네임이면 에러 메시지를 표시한다', async () => {
    // validate_nickname RPC: invalid
    mockRpc.mockImplementation((fn) => {
      if (fn === 'validate_nickname') {
        return Promise.resolve({ data: { isValid: false, message: '닉네임은 2자 이상이어야 합니다.' } });
      }
      return Promise.resolve({ data: null });
    });

    renderWithRouter(<StartPage />);

    const input = screen.getByPlaceholderText('닉네임을 입력하세요 (2-20자)');
    fireEvent.change(input, { target: { value: 'a' } });
    const startButton = screen.getByRole('button', { name: '시작하기' });
    expect(startButton).toBeEnabled();

    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText('닉네임은 2자 이상이어야 합니다.')).toBeInTheDocument();
    });
  });

  test('유효한 닉네임이고 사용자가 존재하면 홈으로 이동한다', async () => {
    mockRpc.mockImplementation((fn, args) => {
      if (fn === 'validate_nickname') {
        return Promise.resolve({ data: { isValid: true, message: '' } });
      }
      if (fn === 'get_user_by_nickname') {
        expect(args).toEqual({ nickname_param: 'tester' });
        return Promise.resolve({ data: 'user-123', error: null });
      }
      return Promise.resolve({ data: null });
    });

    renderWithRouter(<StartPage />);

    const input = screen.getByPlaceholderText('닉네임을 입력하세요 (2-20자)');
    fireEvent.change(input, { target: { value: 'tester' } });
    const startButton = screen.getByRole('button', { name: '시작하기' });
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(localStorage.getItem('userNickname')).toBe('tester');
      expect(localStorage.getItem('userId')).toBe('user-123');
      expect(mockNavigate).toHaveBeenCalledWith('/home', { replace: true });
    });
  });

  test('유효한 닉네임이지만 사용자가 없으면 에러 메시지를 표시한다', async () => {
    mockRpc.mockImplementation((fn) => {
      if (fn === 'validate_nickname') {
        return Promise.resolve({ data: { isValid: true, message: '' } });
      }
      if (fn === 'get_user_by_nickname') {
        return Promise.resolve({ data: null, error: null });
      }
      return Promise.resolve({ data: null });
    });

    renderWithRouter(<StartPage />);

    const input = screen.getByPlaceholderText('닉네임을 입력하세요 (2-20자)');
    fireEvent.change(input, { target: { value: 'someone' } });
    fireEvent.click(screen.getByRole('button', { name: '시작하기' }));

    await waitFor(() => {
      expect(
        screen.getByText('존재하지 않는 닉네임입니다. 닉네임을 새로 생성해보세요.')
      ).toBeInTheDocument();
    });
  });

  test('RPC 호출 중 오류가 발생하면 에러 메시지를 표시한다', async () => {
    mockRpc.mockImplementation((fn) => {
      if (fn === 'validate_nickname') {
        return Promise.resolve({ data: { isValid: true, message: '' } });
      }
      if (fn === 'get_user_by_nickname') {
        return Promise.resolve({ data: null, error: new Error('rpc failed') });
      }
      return Promise.resolve({ data: null });
    });

    renderWithRouter(<StartPage />);

    const input = screen.getByPlaceholderText('닉네임을 입력하세요 (2-20자)');
    fireEvent.change(input, { target: { value: 'errorcase' } });
    fireEvent.click(screen.getByRole('button', { name: '시작하기' }));

    await waitFor(() => {
      expect(screen.getByText('사용자 확인 중 오류가 발생했습니다.')).toBeInTheDocument();
    });
  });
});


