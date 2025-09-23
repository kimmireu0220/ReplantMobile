import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import CompletedMissionsPage from '../CompletedMissionsPage';

// services 모킹
const mockGetCompletedMissions = jest.fn();
jest.mock('../../services/missionService', () => ({
  missionService: {
    getCompletedMissions: (...args) => mockGetCompletedMissions(...args),
  }
}));

// 리스트 아이템 단순 모킹
jest.mock('../../components/mission', () => ({
  CompletedMissionItem: ({ mission }) => (
    <div data-testid="completed-item">{mission.title || mission.id}</div>
  ),
}));

const renderWithRoute = (initialPath = '/completed') => {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <CompletedMissionsPage />
    </MemoryRouter>
  );
};

describe('CompletedMissionsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('로딩 후 비어있는 상태(카테고리 없음)를 표시한다', async () => {
    mockGetCompletedMissions.mockResolvedValueOnce({ data: [], error: null });

    renderWithRoute('/completed');

    expect(screen.getByText('로딩 중...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('로딩 중...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('완료한 미션이 없습니다')).toBeInTheDocument();
    expect(screen.getByText('미션을 완료하면 여기에 표시됩니다')).toBeInTheDocument();
  });

  test('카테고리 쿼리(예: reading)와 함께 비어있는 상태 문구를 표시한다', async () => {
    mockGetCompletedMissions.mockResolvedValueOnce({ data: [], error: null });

    renderWithRoute('/completed?category=reading');

    await waitFor(() => {
      expect(screen.queryByText('로딩 중...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('독서 완료한 미션이 없습니다')).toBeInTheDocument();
    expect(screen.getByText('독서 미션을 완료하면 여기에 표시됩니다')).toBeInTheDocument();
  });

  test('목록과 통계 정보를 렌더링한다', async () => {
    mockGetCompletedMissions.mockResolvedValueOnce({
      data: [
        { id: 'm1', title: 'M1', experience: 50 },
        { id: 'm2', title: 'M2', experience: 30 },
      ],
      error: null,
    });

    renderWithRoute('/completed?category=exercise');

    await waitFor(() => {
      expect(screen.queryByText('로딩 중...')).not.toBeInTheDocument();
    });

    const items = screen.getAllByTestId('completed-item');
    expect(items).toHaveLength(2);

    // 통계: 완료한 미션 수와 총 경험치
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('80')).toBeInTheDocument();
    expect(screen.getByText('총 경험치')).toBeInTheDocument();
  });

  test('에러 상태에서 "다시 시도" 클릭 시 재요청하고 성공 시 목록을 표시한다', async () => {
    // 1차: 에러 반환
    mockGetCompletedMissions.mockResolvedValueOnce({ data: null, error: 'err' });
    // 2차: 성공 반환
    mockGetCompletedMissions.mockResolvedValueOnce({ data: [{ id: 'm1', experience: 10 }], error: null });

    renderWithRoute('/completed?category=creativity');

    await waitFor(() => {
      expect(screen.getByText('완료한 미션을 불러오는데 실패했습니다.')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));

    await waitFor(() => {
      expect(screen.getAllByTestId('completed-item')).toHaveLength(1);
    });
  });
});


