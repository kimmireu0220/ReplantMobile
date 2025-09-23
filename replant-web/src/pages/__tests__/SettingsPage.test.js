import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import SettingsPage from '../SettingsPage';

// useNavigate 모킹
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// supabase.logoutUser 모킹
const mockLogoutUser = jest.fn();
jest.mock('../../config/supabase', () => ({
  ...jest.requireActual('../../config/supabase'),
  logoutUser: () => mockLogoutUser(),
}));

// useNotification 모킹
const mockShowInfo = jest.fn();
const mockShowError = jest.fn();
jest.mock('../../hooks', () => ({
  ...jest.requireActual('../../hooks'),
  useNotification: () => ({
    showInfo: mockShowInfo,
    showError: mockShowError,
  }),
}));

// NicknameEditModal 모킹: 열림 상태와 콜백을 노출
const modalPropsSpy = { lastProps: null };
jest.mock('../../components/ui/NicknameEditModal', () => (props) => {
  modalPropsSpy.lastProps = props;
  return props.isOpen ? (
    <div data-testid="nickname-modal">
      <button onClick={() => props.onSuccess && props.onSuccess('new', 'old')}>success</button>
      <button onClick={() => props.onError && props.onError('err')}>error</button>
      <button onClick={() => props.onClose && props.onClose()}>close</button>
    </div>
  ) : null;
});

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe('SettingsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    modalPropsSpy.lastProps = null;
  });

  test('닉네임 변경 클릭 시 모달이 열린다', () => {
    renderWithRouter(<SettingsPage />);
    fireEvent.click(screen.getByText('닉네임 변경'));
    expect(screen.getByTestId('nickname-modal')).toBeInTheDocument();
    expect(modalPropsSpy.lastProps?.isOpen).toBe(true);
  });

  test('모달 성공 콜백 시 상태 메시지가 업데이트된다', () => {
    renderWithRouter(<SettingsPage />);
    fireEvent.click(screen.getByText('닉네임 변경'));
    fireEvent.click(screen.getByText('success'));
    expect(screen.getByText('닉네임이 성공적으로 변경되었습니다.')).toBeInTheDocument();
  });

  test('모달 에러 콜백 시 에러 알림(showError)이 호출된다', () => {
    renderWithRouter(<SettingsPage />);
    fireEvent.click(screen.getByText('닉네임 변경'));
    fireEvent.click(screen.getByText('error'));
    expect(mockShowError).toHaveBeenCalledWith('닉네임 변경 실패', 'err');
  });

  test('로그아웃 클릭 시 logoutUser 호출 후 /start로 네비게이션', () => {
    renderWithRouter(<SettingsPage />);
    fireEvent.click(screen.getByText('로그아웃'));
    expect(mockLogoutUser).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/start', { replace: true });
  });
});


