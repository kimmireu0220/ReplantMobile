import { renderHook, act, waitFor } from '@testing-library/react';
import { useEmotion } from '../useEmotion';
import { emotionService } from '../../services/emotionService';

// Mock emotionService
jest.mock('../../services/emotionService', () => ({
  emotionService: {
    getEmotions: jest.fn()
  }
}));

describe('useEmotion', () => {
  const mockEmotionsData = [
    {
      id: 1,
      name: '기쁨',
      color: '#FFD700',
      emoji: '😊',
      description: '행복하고 즐거운 감정'
    },
    {
      id: 2,
      name: '슬픔',
      color: '#4682B4',
      emoji: '😢',
      description: '우울하고 슬픈 감정'
    },
    {
      id: 3,
      name: '분노',
      color: '#DC143C',
      emoji: '😠',
      description: '화가 나는 감정'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('초기화 시 loading이 true여야 한다', () => {
    emotionService.getEmotions.mockImplementation(() => new Promise(() => {})); // 무한 대기

    const { result } = renderHook(() => useEmotion());

    expect(result.current.loading).toBe(true);
    expect(result.current.emotions).toEqual([]);
    expect(result.current.error).toBe(null);
  });

  it('감정 데이터를 성공적으로 로드해야 한다', async () => {
    emotionService.getEmotions.mockResolvedValue(mockEmotionsData);

    const { result } = renderHook(() => useEmotion());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.emotions).toEqual(mockEmotionsData);
    expect(result.current.error).toBe(null);
    expect(emotionService.getEmotions).toHaveBeenCalledTimes(1);
  });

  it('감정 데이터 로드 실패 시 에러 상태를 설정해야 한다', async () => {
    const errorMessage = 'Failed to fetch emotions';
    emotionService.getEmotions.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useEmotion());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.emotions).toEqual([]);
    expect(result.current.error).toBe(errorMessage);
    expect(emotionService.getEmotions).toHaveBeenCalledTimes(1);
  });

  it('ID로 감정을 찾을 수 있어야 한다', async () => {
    emotionService.getEmotions.mockResolvedValue(mockEmotionsData);

    const { result } = renderHook(() => useEmotion());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const emotion = result.current.getEmotionById(2);
    
    expect(emotion).toEqual({
      id: 2,
      name: '슬픔',
      color: '#4682B4',
      emoji: '😢',
      description: '우울하고 슬픈 감정'
    });
  });

  it('존재하지 않는 ID로 감정을 찾을 때 undefined를 반환해야 한다', async () => {
    emotionService.getEmotions.mockResolvedValue(mockEmotionsData);

    const { result } = renderHook(() => useEmotion());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const emotion = result.current.getEmotionById(999);
    
    expect(emotion).toBeUndefined();
  });

  it('감정의 색상을 올바르게 반환해야 한다', async () => {
    emotionService.getEmotions.mockResolvedValue(mockEmotionsData);

    const { result } = renderHook(() => useEmotion());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const color1 = result.current.getEmotionColor(1);
    const color2 = result.current.getEmotionColor(3);
    
    expect(color1).toBe('#FFD700');
    expect(color2).toBe('#DC143C');
  });

  it('존재하지 않는 감정 ID의 색상 요청 시 기본 색상을 반환해야 한다', async () => {
    emotionService.getEmotions.mockResolvedValue(mockEmotionsData);

    const { result } = renderHook(() => useEmotion());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const defaultColor = result.current.getEmotionColor(999);
    
    expect(defaultColor).toBe('#6B7280');
  });

  it('감정 데이터를 다시 로드할 수 있어야 한다', async () => {
    emotionService.getEmotions.mockResolvedValue(mockEmotionsData);

    const { result } = renderHook(() => useEmotion());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(emotionService.getEmotions).toHaveBeenCalledTimes(1);

    // 데이터 재로드
    act(() => {
      result.current.reloadEmotions();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(emotionService.getEmotions).toHaveBeenCalledTimes(2);
  });

  it('재로드 중 에러가 발생하면 에러 상태를 업데이트해야 한다', async () => {
    emotionService.getEmotions.mockResolvedValueOnce(mockEmotionsData);

    const { result } = renderHook(() => useEmotion());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.emotions).toEqual(mockEmotionsData);
    expect(result.current.error).toBe(null);

    // 재로드 시 에러 발생
    const errorMessage = 'Reload failed';
    emotionService.getEmotions.mockRejectedValue(new Error(errorMessage));

    act(() => {
      result.current.reloadEmotions();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.emotions).toEqual([]);
    expect(result.current.error).toBe(errorMessage);
  });

  it('빈 감정 리스트에서 감정을 찾을 때 올바르게 처리해야 한다', async () => {
    emotionService.getEmotions.mockResolvedValue([]);

    const { result } = renderHook(() => useEmotion());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const emotion = result.current.getEmotionById(1);
    const color = result.current.getEmotionColor(1);
    
    expect(emotion).toBeUndefined();
    expect(color).toBe('#6B7280'); // 기본 색상
  });

  it('여러 번 렌더링되어도 함수 참조가 안정적이어야 한다', async () => {
    emotionService.getEmotions.mockResolvedValue(mockEmotionsData);

    const { result, rerender } = renderHook(() => useEmotion());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const initialGetEmotionById = result.current.getEmotionById;
    const initialGetEmotionColor = result.current.getEmotionColor;
    const initialReloadEmotions = result.current.reloadEmotions;

    rerender();

    expect(result.current.getEmotionById).toBe(initialGetEmotionById);
    expect(result.current.getEmotionColor).toBe(initialGetEmotionColor);
    expect(result.current.reloadEmotions).toBe(initialReloadEmotions);
  });
});