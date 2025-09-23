import { renderHook, act } from '@testing-library/react';
import { useMission } from '../useMission';
import { missionService } from '../../services/missionService';

// Mock dependencies
jest.mock('../../services/missionService', () => ({
  missionService: {
    getUserMissions: jest.fn(),
    completeMissionWithPhoto: jest.fn(),
    uncompleteMission: jest.fn(),
  }
}));

jest.mock('../../utils/ErrorHandler', () => ({
  handleError: jest.fn((error, operation) => ({
    type: 'unknown',
    message: `Handled error: ${error.message}`,
    originalError: error,
    report: { operation, timestamp: new Date().toISOString() }
  })),
}));

const { handleError } = require('../../utils/ErrorHandler');

describe('useMission', () => {
  const mockAddExperienceByCategory = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up default mock implementations
    missionService.getUserMissions.mockResolvedValue([
      { 
        mission_id: '1', 
        title: 'Test Mission', 
        category: 'exercise', 
        completed: false,
        experience: 50 
      },
      { 
        mission_id: '2', 
        title: 'Completed Mission', 
        category: 'reading', 
        completed: true,
        experience: 30 
      }
    ]);
    
    missionService.completeMissionWithPhoto.mockResolvedValue({
      completed_at: new Date().toISOString(),
      photo_submitted_at: new Date().toISOString()
    });
    
    missionService.uncompleteMission.mockResolvedValue({ success: true });
  });

  test('초기화 시 미션 데이터를 로드해야 한다', async () => {
    const { result } = renderHook(() => useMission(mockAddExperienceByCategory));
    
    expect(result.current.isLoading).toBe(true);
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.missions).toHaveLength(2);
    expect(result.current.missions[0].title).toBe('Test Mission');
  });

  test('미션 완료가 올바르게 작동해야 한다', async () => {
    mockAddExperienceByCategory.mockResolvedValue({ success: true, levelUp: false });
    
    const { result } = renderHook(() => useMission(mockAddExperienceByCategory));
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      const response = await result.current.completeMissionWithPhoto('1', null);
      expect(response.success).toBe(true);
      expect(response.category).toBe('exercise');
    });
    
    expect(missionService.completeMissionWithPhoto).toHaveBeenCalledWith('1', null);
  });

  test('미션 완료 해제가 올바르게 작동해야 한다', async () => {
    const { result } = renderHook(() => useMission(mockAddExperienceByCategory));
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.uncompleteMission('2');
    });
    
    expect(missionService.uncompleteMission).toHaveBeenCalledWith('2');
  });

  test('에러 발생 시 적절히 처리해야 한다', async () => {
    const testError = new Error('Network error');
    
    // handleError mock 재설정
    handleError.mockReturnValue({
      type: 'network',
      message: 'Handled error: Network error',
      originalError: testError,
      report: {}
    });
    
    missionService.getUserMissions.mockRejectedValue(testError);
    
    const { result } = renderHook(() => useMission(mockAddExperienceByCategory));
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(result.current.error).toBe('Handled error: Network error');
    expect(handleError).toHaveBeenCalledWith(testError, '미션 데이터 로드');
  });

  test('중복 로딩 호출을 방지해야 한다', async () => {
    const { result } = renderHook(() => useMission(mockAddExperienceByCategory));
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    await act(async () => {
      // 동시에 여러 번 호출 (reloadMissions 사용)
      result.current.reloadMissions();
      result.current.reloadMissions();
      result.current.reloadMissions();
      
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // 초기 로드 + 한 번의 명시적 호출만 있어야 함
    expect(missionService.getUserMissions).toHaveBeenCalledTimes(2);
  });

  test('미션 완료 시 경험치가 추가되어야 한다', async () => {
    mockAddExperienceByCategory.mockResolvedValue({ success: true, levelUp: false });
    
    const { result } = renderHook(() => useMission(mockAddExperienceByCategory));
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.completeMissionWithPhoto('1', null);
    });
    
    expect(mockAddExperienceByCategory).toHaveBeenCalledWith('exercise', 50);
  });

  test('미션이 없을 때 빈 배열을 반환해야 한다', async () => {
    missionService.getUserMissions.mockResolvedValue([]);
    
    const { result } = renderHook(() => useMission(mockAddExperienceByCategory));
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(result.current.missions).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});