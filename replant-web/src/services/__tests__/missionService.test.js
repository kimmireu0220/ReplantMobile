import { missionService } from '../missionService';
import { supabase, getCurrentUserId, ensureNicknameSession } from '../../config/supabase';
import { validateAndNormalizeCategory } from '../../utils/categoryUtils';

// Mock dependencies
jest.mock('../../config/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          data: null,
          error: null
        })),
        order: jest.fn(() => ({
          data: null,
          error: null
        })),
        single: jest.fn(() => ({
          data: null,
          error: null
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
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          data: null,
          error: null
        }))
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          error: null
        }))
      }))
    }))
  },
  getCurrentUserId: jest.fn(),
  ensureNicknameSession: jest.fn()
}));

jest.mock('../../utils/categoryUtils', () => ({
  validateAndNormalizeCategory: jest.fn()
}));

describe('MissionService', () => {
  let mockSelect, mockEq, mockUpdate, mockInsert, mockDelete;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup common mocks
    mockSelect = jest.fn();
    mockEq = jest.fn();
    mockUpdate = jest.fn();
    mockInsert = jest.fn();
    mockDelete = jest.fn();

    // Reset default implementations
    ensureNicknameSession.mockResolvedValue();
    getCurrentUserId.mockResolvedValue('test-user-id');
    validateAndNormalizeCategory.mockReturnValue('test-category');
  });

  describe('getUserMissions', () => {
    it('should return existing missions when data exists', async () => {

      // Create new array with 30 items for proper test
      const fullMissions = Array.from({ length: 30 }, (_, i) => ({
        id: i + 1,
        user_id: 'test-user-id',
        title: `Mission ${i + 1}`
      }));

      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          data: fullMissions,
          error: null
        })
      });

      supabase.from.mockReturnValue({
        select: mockSelect
      });

      const result = await missionService.getUserMissions();

      expect(ensureNicknameSession).toHaveBeenCalled();
      expect(getCurrentUserId).toHaveBeenCalled();
      expect(supabase.from).toHaveBeenCalledWith('missions');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('user_id', 'test-user-id');
      expect(result).toEqual(fullMissions);
    });

    it('should initialize missions when no data exists', async () => {
      const mockTemplates = [
        { mission_id: 1, title: 'Template 1', category_id: 'category1', experience: 50 },
        { mission_id: 2, title: 'Template 2', category_id: 'category2', experience: 100 }
      ];
      const mockNewMissions = [
        { id: 1, user_id: 'test-user-id', title: 'Template 1' },
        { id: 2, user_id: 'test-user-id', title: 'Template 2' }
      ];

      // First call returns empty array
      mockSelect.mockReturnValueOnce({
        eq: mockEq.mockReturnValue({
          data: [],
          error: null
        })
      });

      // Mock template fetch
      supabase.from.mockImplementation((table) => {
        if (table === 'mission_templates') {
          return {
            select: jest.fn(() => ({
              order: jest.fn(() => ({
                data: mockTemplates,
                error: null
              }))
            }))
          };
        }
        if (table === 'missions') {
          return {
            select: mockSelect,
            insert: mockInsert.mockReturnValue({
              select: jest.fn(() => ({
                data: mockNewMissions,
                error: null
              }))
            })
          };
        }
        return { select: mockSelect };
      });

      const result = await missionService.getUserMissions();

      expect(result).toEqual(mockNewMissions);
    });

    it('should backfill missing missions when template count is higher', async () => {
      const existingMissions = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        user_id: 'test-user-id',
        mission_id: i + 1,
        title: `Mission ${i + 1}`
      }));

      // Mock templates - more templates than existing missions
      const mockTemplateIds = Array.from({ length: 30 }, (_, i) => ({
        mission_id: i + 1
      }));

      const mockMissingTemplates = Array.from({ length: 5 }, (_, i) => ({
        mission_id: i + 26,
        title: `Template ${i + 26}`,
        description: `Description ${i + 26}`,
        emoji: '🎯',
        category_id: `category${i + 26}`,
        difficulty: 'medium',
        experience: 50
      }));

      // Mock final reloaded data after backfill
      const mockReloadedMissions = Array.from({ length: 30 }, (_, i) => ({
        id: i + 1,
        user_id: 'test-user-id',
        mission_id: i + 1,
        title: `Mission ${i + 1}`
      }));

      // First call returns existing missions
      mockSelect
        .mockReturnValueOnce({
          eq: mockEq.mockReturnValue({
            data: existingMissions,
            error: null
          })
        })
        .mockReturnValueOnce({
          data: mockTemplateIds,
          error: null
        })
        .mockReturnValueOnce({
          in: jest.fn(() => ({
            data: mockMissingTemplates,
            error: null
          }))
        })
        .mockReturnValueOnce({
          eq: mockEq.mockReturnValue({
            data: mockReloadedMissions,
            error: null
          })
        });

      supabase.from.mockImplementation((table) => {
        if (table === 'mission_templates') {
          return { select: mockSelect };
        }
        if (table === 'missions') {
          return {
            select: mockSelect,
            insert: mockInsert.mockReturnValue({
              select: jest.fn(() => ({
                data: mockMissingTemplates,
                error: null
              }))
            })
          };
        }
        return { select: mockSelect };
      });

      const result = await missionService.getUserMissions();

      expect(result).toEqual(mockReloadedMissions);
    });

    it('should throw error when user ID is not available', async () => {
      getCurrentUserId.mockResolvedValue(null);

      await expect(missionService.getUserMissions()).rejects.toThrow('사용자 ID를 가져올 수 없습니다.');
    });

    it('should throw error on database error', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => { throw new Error('Database error'); })
        }))
      });

      await expect(missionService.getUserMissions()).rejects.toThrow('Database error');
    });
  });

  describe('initializeUserMissions', () => {
    const mockTemplates = [
      { 
        mission_id: 1, 
        title: 'Template 1', 
        description: 'Description 1',
        emoji: '🎯',
        category_id: 'category1', 
        difficulty: 'easy',
        experience: 50 
      },
      { 
        mission_id: 2, 
        title: 'Template 2', 
        description: 'Description 2',
        emoji: '🏆',
        category_id: 'category2', 
        difficulty: 'medium',
        experience: 100 
      }
    ];

    it('should initialize user missions successfully', async () => {
      const mockNewMissions = [
        { id: 1, user_id: 'test-user-id', mission_id: 1, title: 'Template 1' },
        { id: 2, user_id: 'test-user-id', mission_id: 2, title: 'Template 2' }
      ];

      supabase.from.mockImplementation((table) => {
        if (table === 'mission_templates') {
          return {
            select: jest.fn(() => ({
              order: jest.fn(() => ({
                data: mockTemplates,
                error: null
              }))
            }))
          };
        }
        if (table === 'missions') {
          return {
            insert: mockInsert.mockReturnValue({
              select: jest.fn(() => ({
                data: mockNewMissions,
                error: null
              }))
            })
          };
        }
        return {};
      });

      const result = await missionService.initializeUserMissions('test-user-id');

      expect(validateAndNormalizeCategory).toHaveBeenCalledWith('category1', '미션');
      expect(validateAndNormalizeCategory).toHaveBeenCalledWith('category2', '미션');
      expect(result).toEqual(mockNewMissions);
    });

    it('should throw error when no mission templates exist', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn(() => ({
          order: jest.fn(() => ({
            data: [],
            error: null
          }))
        }))
      });

      await expect(missionService.initializeUserMissions('test-user-id'))
        .rejects.toThrow('미션 템플릿이 없습니다.');
    });

    it('should throw error on template fetch error', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn(() => ({
          order: jest.fn(() => { throw new Error('Template error'); })
        }))
      });

      await expect(missionService.initializeUserMissions('test-user-id')).rejects.toThrow('Template error');
    });

    it('should throw error when inserted missions count mismatch', async () => {
      const incompleteInsert = [{ id: 1, user_id: 'test-user-id', title: 'Template 1' }];

      supabase.from.mockImplementation((table) => {
        if (table === 'mission_templates') {
          return {
            select: jest.fn(() => ({
              order: jest.fn(() => ({
                data: mockTemplates, // 2 templates
                error: null
              }))
            }))
          };
        }
        if (table === 'missions') {
          return {
            insert: mockInsert.mockReturnValue({
              select: jest.fn(() => ({
                data: incompleteInsert, // only 1 inserted
                error: null
              }))
            })
          };
        }
        return {};
      });

      await expect(missionService.initializeUserMissions('test-user-id'))
        .rejects.toThrow('미션 초기화 불완전: 예상 2개, 실제 1개');
    });
  });

  describe('completeMission', () => {
    const mockCompletedMission = {
      id: 1,
      user_id: 'test-user-id',
      mission_id: 1,
      completed: true,
      completed_at: expect.any(String)
    };

    it('should complete mission successfully', async () => {
      mockUpdate.mockReturnValue({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => ({
                data: mockCompletedMission,
                error: null
              }))
            }))
          }))
        }))
      });

      supabase.from.mockReturnValue({
        update: mockUpdate
      });

      const result = await missionService.completeMission(1);

      expect(getCurrentUserId).toHaveBeenCalled();
      expect(supabase.from).toHaveBeenCalledWith('missions');
      expect(mockUpdate).toHaveBeenCalledWith({
        completed: true,
        completed_at: expect.any(String),
        updated_at: expect.any(String)
      });
      expect(result).toEqual(mockCompletedMission);
    });

    it('should throw error when user ID is not available', async () => {
      getCurrentUserId.mockResolvedValue(null);

      await expect(missionService.completeMission(1))
        .rejects.toThrow('사용자 ID를 가져올 수 없습니다.');
    });

    it('should throw error on database error', async () => {
      supabase.from.mockReturnValue({
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn(() => { throw new Error('Update failed'); })
              }))
            }))
          }))
        }))
      });

      await expect(missionService.completeMission(1)).rejects.toThrow('Update failed');
    });
  });

  describe('completeMissionWithPhoto', () => {
    const photoUrl = 'https://example.com/photo.jpg';
    const mockCompletedMission = {
      id: 1,
      user_id: 'test-user-id',
      mission_id: 1,
      photo_url: photoUrl,
      completed: true,
      completed_at: expect.any(String),
      photo_submitted_at: expect.any(String)
    };

    it('should complete mission with photo successfully', async () => {
      mockUpdate.mockReturnValue({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => ({
                data: mockCompletedMission,
                error: null
              }))
            }))
          }))
        }))
      });

      supabase.from.mockReturnValue({
        update: mockUpdate
      });

      const result = await missionService.completeMissionWithPhoto(1, photoUrl);

      expect(mockUpdate).toHaveBeenCalledWith({
        photo_url: photoUrl,
        photo_submitted_at: expect.any(String),
        video_url: photoUrl,
        video_submitted_at: expect.any(String),
        completed: true,
        completed_at: expect.any(String),
        updated_at: expect.any(String)
      });
      expect(result).toEqual(mockCompletedMission);
    });
  });

  describe('uncompleteMission', () => {
    const mockUncompletedMission = {
      id: 1,
      user_id: 'test-user-id',
      mission_id: 1,
      completed: false,
      completed_at: null
    };

    it('should uncomplete mission successfully', async () => {
      mockUpdate.mockReturnValue({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => ({
                data: mockUncompletedMission,
                error: null
              }))
            }))
          }))
        }))
      });

      supabase.from.mockReturnValue({
        update: mockUpdate
      });

      const result = await missionService.uncompleteMission(1);

      expect(mockUpdate).toHaveBeenCalledWith({
        completed: false,
        completed_at: null,
        updated_at: expect.any(String)
      });
      expect(result).toEqual(mockUncompletedMission);
    });
  });

  describe('getCompletedMissions', () => {
    const mockCompletedMissions = [
      { id: 1, user_id: 'test-user-id', completed: true, category: 'health' },
      { id: 2, user_id: 'test-user-id', completed: true, category: 'fitness' }
    ];

    it('should get completed missions successfully', async () => {
      const mockQuery = {
        eq: jest.fn().mockReturnThis(),
        order: jest.fn(() => ({
          data: mockCompletedMissions,
          error: null
        }))
      };

      mockSelect.mockReturnValue(mockQuery);
      supabase.from.mockReturnValue({
        select: mockSelect
      });

      const result = await missionService.getCompletedMissions('test-user-id');

      expect(ensureNicknameSession).toHaveBeenCalled();
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', 'test-user-id');
      expect(mockQuery.eq).toHaveBeenCalledWith('completed', true);
      expect(mockQuery.order).toHaveBeenCalledWith('completed_at', { ascending: false });
      expect(result).toEqual({ data: mockCompletedMissions, error: null });
    });

    it('should filter by category when provided', async () => {
      const mockQuery = {
        eq: jest.fn().mockReturnThis(),
        order: jest.fn(() => ({
          data: [mockCompletedMissions[0]], // only health category
          error: null
        }))
      };

      mockSelect.mockReturnValue(mockQuery);
      supabase.from.mockReturnValue({
        select: mockSelect
      });

      const result = await missionService.getCompletedMissions('test-user-id', { category: 'health' });

      expect(mockQuery.eq).toHaveBeenCalledWith('category', 'health');
      expect(result.data).toHaveLength(1);
    });

    it('should use current user ID when not provided', async () => {
      const mockQuery = {
        eq: jest.fn().mockReturnThis(),
        order: jest.fn(() => ({
          data: mockCompletedMissions,
          error: null
        }))
      };

      mockSelect.mockReturnValue(mockQuery);
      supabase.from.mockReturnValue({
        select: mockSelect
      });

      await missionService.getCompletedMissions();

      expect(getCurrentUserId).toHaveBeenCalled();
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', 'test-user-id');
    });

    it('should return empty array on error', async () => {
      const mockQuery = {
        eq: jest.fn().mockReturnThis(),
        order: jest.fn(() => ({
          data: null,
          error: { message: 'Database error' }
        }))
      };

      mockSelect.mockReturnValue(mockQuery);
      supabase.from.mockReturnValue({
        select: mockSelect
      });

      const result = await missionService.getCompletedMissions('test-user-id');

      expect(result.data).toEqual([]);
      expect(result.error).toBeTruthy();
    });
  });

  describe('getMissionStats', () => {
    const mockCompletedMissions = [
      { id: 1, experience: 50 },
      { id: 2, experience: 100 },
      { id: 3, experience: 75 }
    ];

    it('should get mission stats successfully', async () => {
      mockSelect.mockReturnValue({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            data: mockCompletedMissions,
            error: null
          }))
        }))
      });

      supabase.from.mockReturnValue({
        select: mockSelect
      });

      const result = await missionService.getMissionStats('test-user-id');

      expect(ensureNicknameSession).toHaveBeenCalled();
      expect(result).toEqual({
        completedCount: 3,
        totalExperience: 225,
        error: null
      });
    });

    it('should handle empty data', async () => {
      mockSelect.mockReturnValue({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            data: [],
            error: null
          }))
        }))
      });

      supabase.from.mockReturnValue({
        select: mockSelect
      });

      const result = await missionService.getMissionStats('test-user-id');

      expect(result).toEqual({
        completedCount: 0,
        totalExperience: 0,
        error: null
      });
    });

    it('should return zero stats on error', async () => {
      mockSelect.mockReturnValue({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            data: null,
            error: { message: 'Database error' }
          }))
        }))
      });

      supabase.from.mockReturnValue({
        select: mockSelect
      });

      const result = await missionService.getMissionStats('test-user-id');

      expect(result.completedCount).toBe(0);
      expect(result.totalExperience).toBe(0);
      expect(result.error).toBeTruthy();
    });
  });

  describe('deleteUserMissions', () => {
    it('should delete user missions successfully', async () => {
      mockDelete.mockReturnValue({
        eq: jest.fn(() => ({
          error: null
        }))
      });

      supabase.from.mockReturnValue({
        delete: mockDelete
      });

      await expect(missionService.deleteUserMissions('test-user-id')).resolves.not.toThrow();

      expect(supabase.from).toHaveBeenCalledWith('missions');
      expect(mockDelete).toHaveBeenCalled();
    });

    it('should throw error on database error', async () => {
      supabase.from.mockReturnValue({
        delete: jest.fn(() => ({
          eq: jest.fn(() => { throw new Error('Delete failed'); })
        }))
      });

      await expect(missionService.deleteUserMissions('test-user-id')).rejects.toThrow('Delete failed');
    });
  });
});