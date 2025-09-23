import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import NicknamePage from '../NicknamePage';

// useNavigate 모킹
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// SupabaseContext 모킹
const mockCheckNicknameDuplicate = jest.fn();
const mockCreateUserWithNickname = jest.fn();
jest.mock('../../contexts/SupabaseContext', () => ({
  useSupabase: () => ({
    checkNicknameDuplicate: mockCheckNicknameDuplicate,
    createUserWithNickname: mockCreateUserWithNickname,
  }),
}));

// supabase util 모킹 (임시 닉네임 생성)
jest.mock('../../config/supabase', () => ({
  generateTemporaryNickname: () => '랜덤닉',
}));

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe('NicknamePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('빈 입력에서 시작하기 클릭 시 에러를 표시한다', () => {
    renderWithRouter(<NicknamePage />);
    fireEvent.click(screen.getByRole('button', { name: '시작하기' }));
    expect(screen.getByText('닉네임을 입력해주세요.')).toBeInTheDocument();
  });

  test('특수문자 포함 닉네임은 클라이언트 유효성 검사에 실패한다', async () => {
    renderWithRouter(<NicknamePage />);
    const input = screen.getByPlaceholderText('닉네임을 입력하세요 (2-20자)');
    fireEvent.change(input, { target: { value: 'ab**' } });
    fireEvent.click(screen.getByRole('button', { name: '시작하기' }));

    await waitFor(() => {
      expect(screen.getByText('닉네임은 한글, 영문, 숫자만 사용 가능합니다.')).toBeInTheDocument();
    });
  });

  test('중복 닉네임이면 에러를 표시한다', async () => {
    mockCheckNicknameDuplicate.mockResolvedValue({ data: true, error: null });
    renderWithRouter(<NicknamePage />);
    const input = screen.getByPlaceholderText('닉네임을 입력하세요 (2-20자)');
    fireEvent.change(input, { target: { value: 'tester' } });
    fireEvent.click(screen.getByRole('button', { name: '시작하기' }));

    await waitFor(() => {
      expect(screen.getByText('이미 사용 중인 닉네임입니다.')).toBeInTheDocument();
    });
  });

  test('중복이 아니면 사용자 생성 후 홈으로 이동한다', async () => {
    mockCheckNicknameDuplicate.mockResolvedValue({ data: false, error: null });
    mockCreateUserWithNickname.mockResolvedValue({ data: 'user-999', error: null });

    renderWithRouter(<NicknamePage />);
    const input = screen.getByPlaceholderText('닉네임을 입력하세요 (2-20자)');
    fireEvent.change(input, { target: { value: 'tester' } });
    fireEvent.click(screen.getByRole('button', { name: '시작하기' }));

    await waitFor(() => {
      expect(localStorage.getItem('userNickname')).toBe('tester');
      expect(localStorage.getItem('userId')).toBe('user-999');
      expect(mockNavigate).toHaveBeenCalledWith('/home', { replace: true });
    });
  });

  test('자동 생성 버튼 클릭 시 임시 닉네임이 입력된다', () => {
    renderWithRouter(<NicknamePage />);
    const autoBtn = screen.getByRole('button', { name: '자동으로 닉네임 생성' });
    fireEvent.click(autoBtn);
    expect(screen.getByDisplayValue('랜덤닉')).toBeInTheDocument();
  });
});


