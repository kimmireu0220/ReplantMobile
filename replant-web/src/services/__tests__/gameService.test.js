import { gameService } from '../gameService';
import { supabase, getCurrentUserId } from '../index';
import { createSuccessResponse, createErrorResponse } from '../../test-utils/mockSupabase';

// Mock dependencies
jest.mock('../index', () => ({
  supabase: {
    from: jest.fn(),
  },
  getCurrentUserId: jest.fn()
}));

describe('GameService', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    getCurrentUserId.mockResolvedValue('test-user-id');
    
    // Supabase 체이닝 모킹 설정
    supabase.from.mockImplementation((table) => ({
      insert: jest.fn(() => ({
        data: null,
        error: null
      })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn(() => ({
                data: null,
                error: null
              }))
            }))
          })),
          order: jest.fn(() => ({
            limit: jest.fn(() => ({
              data: null,
              error: null
            }))
          }))
        }))
      }))
    }));
  });

  describe('saveGameResult', () => {
    const gameData = {
      score: 850,
      distance: 1500,
      durationMs: 120000,
      characterId: 'exercise'
    };

    it('게임 결과를 성공적으로 저장한다', async () => {
      const mockInsert = jest.fn(() => createSuccessResponse(null));
      
      supabase.from.mockReturnValue({
        insert: mockInsert
      });

      const result = await gameService.saveGameResult('memory', gameData);

      expect(getCurrentUserId).toHaveBeenCalled();
      expect(supabase.from).toHaveBeenCalledWith('game_results');
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: 'test-user-id',
        game_type: 'memory',
        final_score: 850,
        total_distance: 1500,
        game_duration_seconds: 120,
        character_id: 'exercise'
      });
      expect(result.success).toBe(true);
    });

    it('기본값으로 게임 결과를 저장한다', async () => {
      const mockInsert = jest.fn(() => createSuccessResponse(null));
      
      supabase.from.mockReturnValue({
        insert: mockInsert
      });

      const result = await gameService.saveGameResult('puzzle', { score: 500 });

      expect(mockInsert).toHaveBeenCalledWith({
        user_id: 'test-user-id',
        game_type: 'puzzle',
        final_score: 500,
        total_distance: 0,
        game_duration_seconds: 0,
        character_id: null
      });
      expect(result.success).toBe(true);
    });

    it('데이터베이스 에러 시 실패를 반환한다', async () => {
      const mockInsert = jest.fn(() => createErrorResponse('Insert failed'));
      
      supabase.from.mockReturnValue({
        insert: mockInsert
      });

      const result = await gameService.saveGameResult('memory', gameData);

      expect(result.success).toBe(false);
      expect(result.error.message).toBe('Insert failed');
    });

    it('사용자 ID를 가져올 수 없을 때 에러를 반환한다', async () => {
      getCurrentUserId.mockRejectedValue(new Error('No user ID'));

      const result = await gameService.saveGameResult('memory', gameData);

      expect(result.success).toBe(false);
      expect(result.error.message).toBe('No user ID');
    });
  });

  describe('getHighScore', () => {
    it('게임별 최고점수를 성공적으로 조회한다', async () => {
      const mockData = [{ final_score: 1200 }];
      const mockQuery = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => ({
                limit: jest.fn(() => createSuccessResponse(mockData))
              }))
            }))
          }))
        }))
      };

      supabase.from.mockReturnValue(mockQuery);

      const result = await gameService.getHighScore('memory');

      expect(getCurrentUserId).toHaveBeenCalled();
      expect(supabase.from).toHaveBeenCalledWith('game_results');
      expect(mockQuery.select).toHaveBeenCalledWith('final_score');
      expect(result).toBe(1200);
    });

    it('기록이 없을 때 0을 반환한다', async () => {
      const mockQuery = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => ({
                limit: jest.fn(() => createSuccessResponse([]))
              }))
            }))
          }))
        }))
      };

      supabase.from.mockReturnValue(mockQuery);

      const result = await gameService.getHighScore('puzzle');

      expect(result).toBe(0);
    });

    it('데이터베이스 에러 시 0을 반환한다', async () => {
      const mockQuery = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => ({
                limit: jest.fn(() => createErrorResponse('Query failed'))
              }))
            }))
          }))
        }))
      };

      supabase.from.mockReturnValue(mockQuery);

      const result = await gameService.getHighScore('memory');

      expect(result).toBe(0);
    });

    it('예외 발생 시 0을 반환한다', async () => {
      getCurrentUserId.mockRejectedValue(new Error('Network error'));

      const result = await gameService.getHighScore('memory');

      expect(result).toBe(0);
    });
  });

  describe('getAllHighScores', () => {
    it('모든 게임의 최고점수를 성공적으로 조회한다', async () => {
      const mockData = [
        { game_type: 'memory', final_score: 1200 },
        { game_type: 'puzzle', final_score: 800 },
        { game_type: 'memory', final_score: 1000 }, // 더 낮은 점수
        { game_type: 'obstacle', final_score: 1500 }
      ];

      const mockQuery = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => createSuccessResponse(mockData))
          }))
        }))
      };

      supabase.from.mockReturnValue(mockQuery);

      const result = await gameService.getAllHighScores();

      expect(result).toEqual({
        obstacle: 1500,
        puzzle: 800,
        memory: 1200,
        quiz: 0 // 데이터 없음
      });
    });

    it('기록이 없을 때 모든 점수를 0으로 반환한다', async () => {
      const mockQuery = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => createSuccessResponse([]))
          }))
        }))
      };

      supabase.from.mockReturnValue(mockQuery);

      const result = await gameService.getAllHighScores();

      expect(result).toEqual({
        obstacle: 0,
        puzzle: 0,
        memory: 0,
        quiz: 0
      });
    });

    it('데이터베이스 에러 시 빈 객체를 반환한다', async () => {
      const mockQuery = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => createErrorResponse('Query failed'))
          }))
        }))
      };

      supabase.from.mockReturnValue(mockQuery);

      const result = await gameService.getAllHighScores();

      expect(result).toEqual({});
    });
  });

  describe('isNewHighScore', () => {
    it('새로운 최고 기록일 때 true를 반환한다', async () => {
      // getHighScore가 800을 반환하도록 모킹
      jest.spyOn(gameService, 'getHighScore').mockResolvedValue(800);

      const result = await gameService.isNewHighScore('memory', 1000);

      expect(gameService.getHighScore).toHaveBeenCalledWith('memory');
      expect(result).toBe(true);
    });

    it('기존 기록과 같거나 낮을 때 false를 반환한다', async () => {
      jest.spyOn(gameService, 'getHighScore').mockResolvedValue(1000);

      const result1 = await gameService.isNewHighScore('memory', 800);
      const result2 = await gameService.isNewHighScore('memory', 1000);

      expect(result1).toBe(false);
      expect(result2).toBe(false);
    });

    it('에러 발생 시 false를 반환한다', async () => {
      jest.spyOn(gameService, 'getHighScore').mockRejectedValue(new Error('Query failed'));

      const result = await gameService.isNewHighScore('memory', 1000);

      expect(result).toBe(false);
    });
  });

  describe('saveAndCheckRecord', () => {
    const gameData = {
      score: 1200,
      distance: 2000,
      durationMs: 180000
    };

    it('게임 결과를 저장하고 새 기록 여부를 확인한다', async () => {
      jest.spyOn(gameService, 'isNewHighScore').mockResolvedValue(true);
      jest.spyOn(gameService, 'saveGameResult').mockResolvedValue({ success: true });

      const result = await gameService.saveAndCheckRecord('memory', gameData);

      expect(gameService.isNewHighScore).toHaveBeenCalledWith('memory', 1200);
      expect(gameService.saveGameResult).toHaveBeenCalledWith('memory', gameData);
      expect(result).toEqual({
        success: true,
        isNewHigh: true,
        error: undefined
      });
    });

    it('기존 기록이 더 높을 때 새 기록이 아님을 표시한다', async () => {
      jest.spyOn(gameService, 'isNewHighScore').mockResolvedValue(false);
      jest.spyOn(gameService, 'saveGameResult').mockResolvedValue({ success: true });

      const result = await gameService.saveAndCheckRecord('puzzle', gameData);

      expect(result.success).toBe(true);
      expect(result.isNewHigh).toBe(false);
    });

    it('저장 실패 시 에러 정보를 포함한다', async () => {
      const saveError = new Error('Save failed');
      jest.spyOn(gameService, 'isNewHighScore').mockResolvedValue(true);
      jest.spyOn(gameService, 'saveGameResult').mockResolvedValue({ 
        success: false, 
        error: saveError 
      });

      const result = await gameService.saveAndCheckRecord('obstacle', gameData);

      expect(result.success).toBe(false);
      expect(result.isNewHigh).toBe(true);
      expect(result.error).toBe(saveError);
    });

    it('예외 발생 시 실패를 반환한다', async () => {
      const error = new Error('Unexpected error');
      jest.spyOn(gameService, 'isNewHighScore').mockRejectedValue(error);

      const result = await gameService.saveAndCheckRecord('quiz', gameData);

      expect(result).toEqual({
        success: false,
        isNewHigh: false,
        error: error
      });
    });
  });
});