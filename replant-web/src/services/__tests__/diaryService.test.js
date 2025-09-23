import { diaryService } from '../diaryService';
import { supabase, getCurrentUserId, ensureNicknameSession } from '../../config/supabase';

// Mock dependencies
jest.mock('../../config/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            data: null,
            error: null
          })),
          single: jest.fn(() => ({
            data: null,
            error: null
          })),
          limit: jest.fn(() => ({
            data: null,
            error: null
          })),
          gte: jest.fn(() => ({
            lte: jest.fn(() => ({
              data: null,
              error: null
            }))
          })),
          data: null,
          error: null
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: null,
            error: null
          }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => ({
                data: null,
                error: null
              }))
            }))
          }))
        }))
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            error: null
          }))
        }))
      }))
    }))
  },
  getCurrentUserId: jest.fn(),
  ensureNicknameSession: jest.fn()
}));

describe('DiaryService', () => {
  let mockSelect, mockEq, mockOrder, mockSingle, mockInsert, mockUpdate, mockDelete, mockLimit, mockGte, mockLte;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup common mocks
    mockSelect = jest.fn();
    mockEq = jest.fn();
    mockOrder = jest.fn();
    mockSingle = jest.fn();
    mockInsert = jest.fn();
    mockUpdate = jest.fn();
    mockDelete = jest.fn();
    mockLimit = jest.fn();
    mockGte = jest.fn();
    mockLte = jest.fn();

    // Reset default implementations
    ensureNicknameSession.mockResolvedValue();
    getCurrentUserId.mockResolvedValue('test-user-id');
  });

  describe('getUserDiaries', () => {
    const mockDiaries = [
      { id: 1, user_id: 'test-user-id', date: '2024-01-02', content: 'Diary 2' },
      { id: 2, user_id: 'test-user-id', date: '2024-01-01', content: 'Diary 1' }
    ];

    it('should get user diaries successfully', async () => {
      mockOrder.mockReturnValue({
        data: mockDiaries,
        error: null
      });

      mockEq.mockReturnValue({
        order: mockOrder
      });

      mockSelect.mockReturnValue({
        eq: mockEq
      });

      supabase.from.mockReturnValue({
        select: mockSelect
      });

      const result = await diaryService.getUserDiaries();

      expect(ensureNicknameSession).toHaveBeenCalled();
      expect(getCurrentUserId).toHaveBeenCalled();
      expect(supabase.from).toHaveBeenCalledWith('diaries');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('user_id', 'test-user-id');
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toEqual(mockDiaries);
    });

    it('should return empty array when no data', async () => {
      mockOrder.mockReturnValue({
        data: null,
        error: null
      });

      mockEq.mockReturnValue({
        order: mockOrder
      });

      mockSelect.mockReturnValue({
        eq: mockEq
      });

      supabase.from.mockReturnValue({
        select: mockSelect
      });

      const result = await diaryService.getUserDiaries();

      expect(result).toEqual([]);
    });

    it('should throw error when user ID is not available', async () => {
      getCurrentUserId.mockResolvedValue(null);

      await expect(diaryService.getUserDiaries()).rejects.toThrow('사용자 ID를 가져올 수 없습니다.');
    });

    it('should throw error on database error', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => { throw new Error('Database error'); })
          }))
        }))
      });

      await expect(diaryService.getUserDiaries()).rejects.toThrow('Database error');
    });
  });

  describe('getDiaryByDate', () => {
    const mockDiary = {
      id: 1,
      user_id: 'test-user-id',
      date: '2024-01-01',
      content: 'Test diary'
    };

    it('should get diary by date successfully', async () => {
      mockSingle.mockReturnValue({
        data: mockDiary,
        error: null
      });

      const mockEqChain = {
        eq: jest.fn(() => ({
          single: mockSingle
        }))
      };

      mockEq.mockReturnValue(mockEqChain);

      mockSelect.mockReturnValue({
        eq: mockEq
      });

      supabase.from.mockReturnValue({
        select: mockSelect
      });

      const result = await diaryService.getDiaryByDate('2024-01-01');

      expect(getCurrentUserId).toHaveBeenCalled();
      expect(supabase.from).toHaveBeenCalledWith('diaries');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('user_id', 'test-user-id');
      expect(mockEqChain.eq).toHaveBeenCalledWith('date', '2024-01-01');
      expect(mockSingle).toHaveBeenCalled();
      expect(result).toEqual(mockDiary);
    });

    it('should return null when diary not found (PGRST116 error)', async () => {
      mockSingle.mockReturnValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' }
      });

      const mockEqChain = {
        eq: jest.fn(() => ({
          single: mockSingle
        }))
      };

      mockEq.mockReturnValue(mockEqChain);

      mockSelect.mockReturnValue({
        eq: mockEq
      });

      supabase.from.mockReturnValue({
        select: mockSelect
      });

      const result = await diaryService.getDiaryByDate('2024-01-01');

      expect(result).toBeNull();
    });

    it('should throw error on other database errors', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => { throw Object.assign(new Error('Database error'), { code: 'OTHER_ERROR' }); })
            }))
          }))
        }))
      });

      await expect(diaryService.getDiaryByDate('2024-01-01')).rejects.toThrow('Database error');
    });
  });

  describe('saveDiary', () => {
    const mockSavedDiary = {
      id: 1,
      user_id: 'test-user-id',
      date: '2024-01-01',
      emotion_id: 'happy',
      content: 'Test diary content'
    };

    it('should save diary successfully', async () => {
      mockSingle.mockReturnValue({
        data: mockSavedDiary,
        error: null
      });

      mockSelect.mockReturnValue({
        single: mockSingle
      });

      mockInsert.mockReturnValue({
        select: mockSelect
      });

      supabase.from.mockReturnValue({
        insert: mockInsert
      });

      const result = await diaryService.saveDiary('2024-01-01', 'happy', 'Test diary content');

      expect(getCurrentUserId).toHaveBeenCalled();
      expect(supabase.from).toHaveBeenCalledWith('diaries');
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: 'test-user-id',
        date: '2024-01-01',
        emotion_id: 'happy',
        content: 'Test diary content',
        created_at: expect.any(String),
        updated_at: expect.any(String)
      });
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockSingle).toHaveBeenCalled();
      expect(result).toEqual(mockSavedDiary);
    });

    it('should throw error when user ID is not available', async () => {
      getCurrentUserId.mockResolvedValue(null);

      await expect(diaryService.saveDiary('2024-01-01', 'happy', 'Test diary content'))
        .rejects.toThrow('사용자 ID를 가져올 수 없습니다.');
    });

    it('should throw error on database error', async () => {
      supabase.from.mockReturnValue({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => { throw new Error('Insert failed'); })
          }))
        }))
      });

      await expect(diaryService.saveDiary('2024-01-01', 'happy', 'Test diary content')).rejects.toThrow('Insert failed');
    });
  });

  describe('updateDiary', () => {
    const mockUpdatedDiary = {
      id: 1,
      user_id: 'test-user-id',
      date: '2024-01-01',
      emotion_id: 'excited',
      content: 'Updated diary content'
    };

    it('should update diary successfully', async () => {
      mockSingle.mockReturnValue({
        data: mockUpdatedDiary,
        error: null
      });

      mockSelect.mockReturnValue({
        single: mockSingle
      });

      const mockEqChain = {
        eq: jest.fn(() => ({
          select: mockSelect
        }))
      };

      mockEq.mockReturnValue(mockEqChain);

      mockUpdate.mockReturnValue({
        eq: mockEq
      });

      supabase.from.mockReturnValue({
        update: mockUpdate
      });

      const result = await diaryService.updateDiary(1, '2024-01-01', 'excited', 'Updated diary content');

      expect(getCurrentUserId).toHaveBeenCalled();
      expect(supabase.from).toHaveBeenCalledWith('diaries');
      expect(mockUpdate).toHaveBeenCalledWith({
        date: '2024-01-01',
        emotion_id: 'excited',
        content: 'Updated diary content',
        updated_at: expect.any(String)
      });
      expect(mockEq).toHaveBeenCalledWith('user_id', 'test-user-id');
      expect(mockEqChain.eq).toHaveBeenCalledWith('id', 1);
      expect(result).toEqual(mockUpdatedDiary);
    });

    it('should throw error when user ID is not available', async () => {
      getCurrentUserId.mockResolvedValue(null);

      await expect(diaryService.updateDiary(1, '2024-01-01', 'excited', 'Updated diary content'))
        .rejects.toThrow('사용자 ID를 가져올 수 없습니다.');
    });
  });

  describe('deleteDiary', () => {
    it('should delete diary successfully', async () => {
      const mockEqChain = {
        eq: jest.fn(() => ({
          error: null
        }))
      };

      mockEq.mockReturnValue(mockEqChain);

      mockDelete.mockReturnValue({
        eq: mockEq
      });

      supabase.from.mockReturnValue({
        delete: mockDelete
      });

      const result = await diaryService.deleteDiary(1);

      expect(getCurrentUserId).toHaveBeenCalled();
      expect(supabase.from).toHaveBeenCalledWith('diaries');
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('user_id', 'test-user-id');
      expect(mockEqChain.eq).toHaveBeenCalledWith('id', 1);
      expect(result).toBe(true);
    });

    it('should throw error when user ID is not available', async () => {
      getCurrentUserId.mockResolvedValue(null);

      await expect(diaryService.deleteDiary(1))
        .rejects.toThrow('사용자 ID를 가져올 수 없습니다.');
    });

    it('should throw error on database error', async () => {
      supabase.from.mockReturnValue({
        delete: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => { throw new Error('Delete failed'); })
          }))
        }))
      });

      await expect(diaryService.deleteDiary(1)).rejects.toThrow('Delete failed');
    });
  });

  describe('getEmotionStats', () => {
    const mockDiaries = [
      { emotion_id: 'happy' },
      { emotion_id: 'happy' },
      { emotion_id: 'sad' },
      { emotion_id: 'excited' },
      { emotion_id: 'happy' }
    ];

    it('should get emotion statistics successfully', async () => {
      mockEq.mockReturnValue({
        data: mockDiaries,
        error: null
      });

      mockSelect.mockReturnValue({
        eq: mockEq
      });

      supabase.from.mockReturnValue({
        select: mockSelect
      });

      const result = await diaryService.getEmotionStats();

      expect(getCurrentUserId).toHaveBeenCalled();
      expect(supabase.from).toHaveBeenCalledWith('diaries');
      expect(mockSelect).toHaveBeenCalledWith('emotion_id');
      expect(mockEq).toHaveBeenCalledWith('user_id', 'test-user-id');
      expect(result).toEqual({
        happy: 3,
        sad: 1,
        excited: 1
      });
    });

    it('should return empty stats when no data', async () => {
      mockEq.mockReturnValue({
        data: [],
        error: null
      });

      mockSelect.mockReturnValue({
        eq: mockEq
      });

      supabase.from.mockReturnValue({
        select: mockSelect
      });

      const result = await diaryService.getEmotionStats();

      expect(result).toEqual({});
    });
  });

  describe('getRecentDiaries', () => {
    const mockRecentDiaries = [
      { id: 3, date: '2024-01-03', content: 'Recent diary 3' },
      { id: 2, date: '2024-01-02', content: 'Recent diary 2' },
      { id: 1, date: '2024-01-01', content: 'Recent diary 1' }
    ];

    it('should get recent diaries with default limit', async () => {
      mockLimit.mockReturnValue({
        data: mockRecentDiaries,
        error: null
      });

      mockOrder.mockReturnValue({
        limit: mockLimit
      });

      mockEq.mockReturnValue({
        order: mockOrder
      });

      mockSelect.mockReturnValue({
        eq: mockEq
      });

      supabase.from.mockReturnValue({
        select: mockSelect
      });

      const result = await diaryService.getRecentDiaries();

      expect(getCurrentUserId).toHaveBeenCalled();
      expect(mockLimit).toHaveBeenCalledWith(7); // default limit
      expect(result).toEqual(mockRecentDiaries);
    });

    it('should get recent diaries with custom limit', async () => {
      mockLimit.mockReturnValue({
        data: mockRecentDiaries.slice(0, 5),
        error: null
      });

      mockOrder.mockReturnValue({
        limit: mockLimit
      });

      mockEq.mockReturnValue({
        order: mockOrder
      });

      mockSelect.mockReturnValue({
        eq: mockEq
      });

      supabase.from.mockReturnValue({
        select: mockSelect
      });

      const result = await diaryService.getRecentDiaries(5);

      expect(mockLimit).toHaveBeenCalledWith(5);
      expect(result).toHaveLength(3); // mockRecentDiaries.slice(0, 5) length
    });

    it('should return empty array when no data', async () => {
      mockLimit.mockReturnValue({
        data: null,
        error: null
      });

      mockOrder.mockReturnValue({
        limit: mockLimit
      });

      mockEq.mockReturnValue({
        order: mockOrder
      });

      mockSelect.mockReturnValue({
        eq: mockEq
      });

      supabase.from.mockReturnValue({
        select: mockSelect
      });

      const result = await diaryService.getRecentDiaries();

      expect(result).toEqual([]);
    });
  });

  describe('getMonthlyDiaryCount', () => {
    const mockMonthlyDiaries = [
      { date: '2024-01-01' },
      { date: '2024-01-15' },
      { date: '2024-01-30' }
    ];

    it('should get monthly diary count successfully', async () => {
      mockLte.mockReturnValue({
        data: mockMonthlyDiaries,
        error: null
      });

      mockGte.mockReturnValue({
        lte: mockLte
      });

      mockEq.mockReturnValue({
        gte: mockGte
      });

      mockSelect.mockReturnValue({
        eq: mockEq
      });

      supabase.from.mockReturnValue({
        select: mockSelect
      });

      const result = await diaryService.getMonthlyDiaryCount(2024, 1);

      expect(getCurrentUserId).toHaveBeenCalled();
      expect(supabase.from).toHaveBeenCalledWith('diaries');
      expect(mockSelect).toHaveBeenCalledWith('date');
      expect(mockEq).toHaveBeenCalledWith('user_id', 'test-user-id');
      expect(mockGte).toHaveBeenCalledWith('date', '2024-01-01');
      expect(mockLte).toHaveBeenCalledWith('date', '2024-01-31');
      expect(result).toBe(3);
    });

    it('should handle single digit month correctly', async () => {
      mockLte.mockReturnValue({
        data: mockMonthlyDiaries,
        error: null
      });

      mockGte.mockReturnValue({
        lte: mockLte
      });

      mockEq.mockReturnValue({
        gte: mockGte
      });

      mockSelect.mockReturnValue({
        eq: mockEq
      });

      supabase.from.mockReturnValue({
        select: mockSelect
      });

      await diaryService.getMonthlyDiaryCount(2024, 5);

      expect(mockGte).toHaveBeenCalledWith('date', '2024-05-01');
      expect(mockLte).toHaveBeenCalledWith('date', '2024-05-31');
    });

    it('should return 0 when no diaries found', async () => {
      mockLte.mockReturnValue({
        data: [],
        error: null
      });

      mockGte.mockReturnValue({
        lte: mockLte
      });

      mockEq.mockReturnValue({
        gte: mockGte
      });

      mockSelect.mockReturnValue({
        eq: mockEq
      });

      supabase.from.mockReturnValue({
        select: mockSelect
      });

      const result = await diaryService.getMonthlyDiaryCount(2024, 1);

      expect(result).toBe(0);
    });

    it('should throw error when user ID is not available', async () => {
      getCurrentUserId.mockResolvedValue(null);

      await expect(diaryService.getMonthlyDiaryCount(2024, 1))
        .rejects.toThrow('사용자 ID를 가져올 수 없습니다.');
    });
  });
});