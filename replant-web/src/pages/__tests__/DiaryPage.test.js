import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import DiaryPage from '../DiaryPage';

// 훅 모킹
const mockSaveDiary = jest.fn();
const mockUpdateDiary = jest.fn();
const mockDeleteDiary = jest.fn();

const makeUseDiaryMock = ({
  diaries = [],
  isLoading = false,
} = {}) => () => ({
  diaries,
  isLoading,
  saveDiary: mockSaveDiary,
  updateDiary: mockUpdateDiary,
  deleteDiary: mockDeleteDiary,
});

jest.mock('../../hooks/useDiary', () => ({
  useDiary: jest.fn(makeUseDiaryMock()),
}));

// 닉네임 표시 모킹
jest.mock('../../config/supabase', () => ({
  getCurrentUserNickname: () => 'tester',
}));

// 폼/카드 모킹
jest.mock('../../components/features/EmotionDiaryForm', () => ({
  __esModule: true,
  default: ({ onSubmit, onCancel }) => (
    <div>
      <div data-testid="form">form</div>
      <button onClick={() => onSubmit({ emotion_id: 1, content: 'hi' })}>submit-form</button>
      <button onClick={onCancel}>cancel-form</button>
    </div>
  ),
}));

jest.mock('../../components/features/EmotionDiaryCard', () => ({
  __esModule: true,
  default: ({ entry, onEdit, onDelete }) => (
    <div>
      <div data-testid={`card-${entry.id}`}>{entry.content}</div>
      <button onClick={() => onEdit(entry)}>edit-card</button>
      <button onClick={() => onDelete(entry.id)}>delete-card</button>
    </div>
  ),
}));

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe('DiaryPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 기본 모킹 리셋
    const { useDiary } = require('../../hooks/useDiary');
    useDiary.mockImplementation(makeUseDiaryMock());
  });

  test('닉네임 배지가 표시되고, 빈 상태에서 새 일기 버튼이 보인다', () => {
    renderWithRouter(<DiaryPage />);
    expect(screen.getByText('tester')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /새 일기 작성하기/ })).toBeInTheDocument();
    expect(screen.getByText('아직 작성된 일기가 없어요')).toBeInTheDocument();
  });

  test('로딩 상태가 표시된다', () => {
    const { useDiary } = require('../../hooks/useDiary');
    useDiary.mockImplementation(makeUseDiaryMock({ isLoading: true }));
    renderWithRouter(<DiaryPage />);
    expect(screen.getByText('일기를 불러오는 중...')).toBeInTheDocument();
  });

  test('새 일기 작성 버튼 클릭 시 폼이 보이고 저장 시 saveDiary가 호출된다', async () => {
    renderWithRouter(<DiaryPage />);
    fireEvent.click(screen.getByRole('button', { name: /새 일기 작성하기/ }));

    expect(screen.getByTestId('form')).toBeInTheDocument();
    fireEvent.click(screen.getByText('submit-form'));

    await waitFor(() => {
      expect(mockSaveDiary).toHaveBeenCalledWith({ emotion_id: 1, content: 'hi' });
    });
  });

  test('일기 목록에서 편집 클릭 시 폼이 열리고, 제출 시 updateDiary가 호출된다', async () => {
    const { useDiary } = require('../../hooks/useDiary');
    useDiary.mockImplementation(
      makeUseDiaryMock({
        diaries: [{ id: 10, emotion_id: 2, content: '내용' }],
      })
    );

    renderWithRouter(<DiaryPage />);
    expect(screen.getByTestId('card-10')).toBeInTheDocument();
    fireEvent.click(screen.getByText('edit-card'));

    expect(screen.getByTestId('form')).toBeInTheDocument();
    fireEvent.click(screen.getByText('submit-form'));

    await waitFor(() => {
      expect(mockUpdateDiary).toHaveBeenCalledWith(10, { emotion_id: 1, content: 'hi' });
    });
  });

  test('삭제 확인이 true면 deleteDiary가 호출되고, false면 호출되지 않는다', async () => {
    const { useDiary } = require('../../hooks/useDiary');
    useDiary.mockImplementation(
      makeUseDiaryMock({
        diaries: [{ id: 7, emotion_id: 1, content: '삭제될 내용' }],
      })
    );

    // confirm true
    const confirmSpy = jest.spyOn(window, 'confirm').mockImplementation(() => true);
    const firstRender = renderWithRouter(<DiaryPage />);
    fireEvent.click(firstRender.getByText('delete-card'));
    await waitFor(() => {
      expect(mockDeleteDiary).toHaveBeenCalledWith(7);
    });
    confirmSpy.mockRestore();
    // 이전 렌더 정리
    firstRender.unmount();

    // confirm false
    const confirmSpy2 = jest.spyOn(window, 'confirm').mockImplementation(() => false);
    const secondRender = renderWithRouter(<DiaryPage />);
    fireEvent.click(secondRender.getByText('delete-card'));
    await new Promise((r) => setTimeout(r, 0));
    expect(mockDeleteDiary).toHaveBeenCalledTimes(1); // 이전 true 케이스 1회만 호출
    confirmSpy2.mockRestore();
  });
});


