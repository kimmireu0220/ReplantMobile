import { characterService } from '../characterService';
import { supabase, getCurrentUserId, ensureNicknameSession } from '../../config/supabase';
import { validateAndNormalizeCategory } from '../../utils/categoryUtils';
import { categoryService } from '../categoryService';

// Mock dependencies
jest.mock('../../config/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          data: null,
          error: null
        })),
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: null,
            error: null
          }))
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
      upsert: jest.fn(() => ({
        select: jest.fn(() => ({
          data: null,
          error: null
        }))
      }))
    })),
    rpc: jest.fn(() => ({
      data: null,
      error: null
    }))
  },
  getCurrentUserId: jest.fn(),
  ensureNicknameSession: jest.fn()
}));

jest.mock('../../utils/categoryUtils', () => ({
  validateAndNormalizeCategory: jest.fn()
}));

jest.mock('../categoryService', () => ({
  categoryService: {
    getCategories: jest.fn()
  }
}));

describe('CharacterService', () => {
  let mockSelect, mockOrder, mockEq, mockSingle, mockUpdate, mockUpsert, mockRpc;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup common mocks
    mockSelect = jest.fn();
    mockOrder = jest.fn();
    mockEq = jest.fn();
    mockSingle = jest.fn();
    mockUpdate = jest.fn();
    mockUpsert = jest.fn();
    mockRpc = jest.fn();

    // Reset supabase mock structure
    supabase.from.mockReturnValue({
      select: mockSelect,
      update: mockUpdate,
      upsert: mockUpsert
    });
    supabase.rpc = mockRpc;
    
    ensureNicknameSession.mockResolvedValue();
    getCurrentUserId.mockResolvedValue('test-user-id');
    validateAndNormalizeCategory.mockReturnValue('test-category');
  });

  describe('getCharacterTemplates', () => {
    it('should return character templates successfully', async () => {
      const mockTemplates = [
        { id: 1, name: 'Template 1', level: 1 },
        { id: 2, name: 'Template 2', level: 2 }
      ];

      mockSelect.mockReturnValue({
        order: mockOrder.mockReturnValue({
          data: mockTemplates,
          error: null
        })
      });

      const result = await characterService.getCharacterTemplates();

      expect(ensureNicknameSession).toHaveBeenCalled();
      expect(supabase.from).toHaveBeenCalledWith('character_templates');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockOrder).toHaveBeenCalledWith('level');
      expect(result).toEqual(mockTemplates);
    });

    it('should return null on error', async () => {
      mockSelect.mockReturnValue({
        order: mockOrder.mockReturnValue({
          data: null,
          error: { message: 'Database error' }
        })
      });

      const result = await characterService.getCharacterTemplates();

      expect(result).toBeNull();
    });

    it('should return null on exception', async () => {
      ensureNicknameSession.mockRejectedValue(new Error('Session error'));

      const result = await characterService.getCharacterTemplates();

      expect(result).toBeNull();
    });
  });

  describe('getCharacterTemplateByLevel', () => {
    it('should return character template by level', async () => {
      const mockTemplate = { id: 1, name: 'Template 1', level: 1 };
      const level = 1;

      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          single: mockSingle.mockReturnValue({
            data: mockTemplate,
            error: null
          })
        })
      });

      const result = await characterService.getCharacterTemplateByLevel(level);

      expect(ensureNicknameSession).toHaveBeenCalled();
      expect(supabase.from).toHaveBeenCalledWith('character_templates');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('level', level);
      expect(mockSingle).toHaveBeenCalled();
      expect(result).toEqual(mockTemplate);
    });

    it('should return null on error', async () => {
      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          single: mockSingle.mockReturnValue({
            data: null,
            error: { message: 'Not found' }
          })
        })
      });

      const result = await characterService.getCharacterTemplateByLevel(1);

      expect(result).toBeNull();
    });
  });

  describe('getUserCharacters', () => {
    it('should return user characters when they exist', async () => {
      const mockCharacters = [
        { id: 1, user_id: 'test-user-id', name: 'Character 1' },
        { id: 2, user_id: 'test-user-id', name: 'Character 2' }
      ];

      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          data: mockCharacters,
          error: null
        })
      });

      const result = await characterService.getUserCharacters();

      expect(ensureNicknameSession).toHaveBeenCalled();
      expect(getCurrentUserId).toHaveBeenCalled();
      expect(supabase.from).toHaveBeenCalledWith('characters');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('user_id', 'test-user-id');
      expect(result).toEqual(mockCharacters);
    });

    it('should initialize characters when none exist', async () => {
      const mockNewCharacters = [
        { id: 1, user_id: 'test-user-id', name: 'New Character' }
      ];

      // First call returns empty array
      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          data: [],
          error: null
        })
      });

      // Mock initializeUserCharacters dependencies
      const mockTemplate = { name: 'Default Name', level: 1 };
      const mockCategories = [{ id: 'cat1' }, { id: 'cat2' }];
      
      categoryService.getCategories.mockResolvedValue(mockCategories);
      
      // Mock template fetch
      supabase.from.mockImplementation((table) => {
        if (table === 'character_templates') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => ({
                  data: mockTemplate,
                  error: null
                }))
              }))
            }))
          };
        }
        if (table === 'characters') {
          if (mockSelect.mock.calls.length === 1) {
            // First call - return empty
            return {
              select: mockSelect,
              upsert: mockUpsert.mockReturnValue({
                select: jest.fn(() => ({
                  data: mockNewCharacters,
                  error: null
                }))
              })
            };
          }
        }
        return { select: mockSelect };
      });

      const result = await characterService.getUserCharacters();

      expect(categoryService.getCategories).toHaveBeenCalled();
      expect(result).toEqual(mockNewCharacters);
    });

    it('should throw error when user ID is not available', async () => {
      getCurrentUserId.mockResolvedValue(null);

      await expect(characterService.getUserCharacters()).rejects.toThrow('사용자 ID를 가져올 수 없습니다.');
    });

    it('should throw error on database error', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => { throw new Error('Database error'); })
        }))
      });

      await expect(characterService.getUserCharacters()).rejects.toThrow('Database error');
    });
  });

  describe('updateCharacter', () => {
    const mockUpdates = { name: 'Updated Name', level: 2 };
    const mockUpdatedCharacter = { 
      id: 1, 
      user_id: 'test-user-id', 
      category_id: 'test-category',
      ...mockUpdates 
    };

    it('should update character successfully', async () => {
      mockUpdate.mockReturnValue({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => ({
                data: mockUpdatedCharacter,
                error: null
              }))
            }))
          }))
        }))
      });

      const result = await characterService.updateCharacter('test-category', mockUpdates);

      expect(getCurrentUserId).toHaveBeenCalled();
      expect(validateAndNormalizeCategory).toHaveBeenCalledWith('test-category', '캐릭터');
      expect(supabase.from).toHaveBeenCalledWith('characters');
      expect(mockUpdate).toHaveBeenCalledWith(mockUpdates);
      expect(result).toEqual(mockUpdatedCharacter);
    });

    it('should throw error when user ID is not available', async () => {
      getCurrentUserId.mockResolvedValue(null);

      await expect(characterService.updateCharacter('test-category', mockUpdates))
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

      await expect(characterService.updateCharacter('test-category', mockUpdates)).rejects.toThrow('Update failed');
    });
  });

  describe('addExperienceToCharacter', () => {
    const mockCurrentCharacter = {
      id: 1,
      user_id: 'test-user-id',
      category_id: 'test-category',
      name: 'Test Character',
      level: 1,
      experience: 100,
      unlocked: false,
      stats: { missionsCompleted: 0 }
    };

    it('should add experience and handle level up', async () => {
      const experiencePoints = 50;
      const mockLevelupResult = {
        leveled_up: true,
        new_name: 'Upgraded Character'
      };
      const mockUpdatedCharacter = {
        ...mockCurrentCharacter,
        experience: 150,
        level: 2,
        name: 'Upgraded Character'
      };

      // Mock character fetch
      mockSelect.mockReturnValueOnce({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({
              data: mockCurrentCharacter,
              error: null
            }))
          }))
        }))
      });

      // Mock RPC call
      mockRpc.mockResolvedValueOnce({
        data: mockLevelupResult,
        error: null
      });

      // Mock updated character fetch
      mockSelect.mockReturnValueOnce({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: mockUpdatedCharacter,
            error: null
          }))
        }))
      });

      // Mock final update
      mockUpdate.mockReturnValue({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: { ...mockUpdatedCharacter, unlocked: true, stats: { missionsCompleted: 1 } },
              error: null
            }))
          }))
        }))
      });

      const result = await characterService.addExperienceToCharacter('test-category', experiencePoints);

      expect(getCurrentUserId).toHaveBeenCalled();
      expect(validateAndNormalizeCategory).toHaveBeenCalledWith('test-category', '캐릭터');
      expect(mockRpc).toHaveBeenCalledWith('auto_levelup_character', {
        character_id: mockCurrentCharacter.id,
        experience_gained: experiencePoints
      });
      expect(result.success).toBe(true);
      expect(result.levelUp).toBe(true);
      expect(result.unlocked).toBe(true);
      expect(result.newName).toBe('Upgraded Character');
    });

    it('should throw error when character not found', async () => {
      mockSelect.mockReturnValue({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({
              data: null,
              error: null
            }))
          }))
        }))
      });

      await expect(characterService.addExperienceToCharacter('test-category', 50))
        .rejects.toThrow('캐릭터를 찾을 수 없습니다.');
    });

    it('should throw error when user ID is not available', async () => {
      getCurrentUserId.mockResolvedValue(null);

      await expect(characterService.addExperienceToCharacter('test-category', 50))
        .rejects.toThrow('사용자 ID를 가져올 수 없습니다.');
    });
  });

  describe('updateCharacterName', () => {
    const newName = 'New Character Name';
    const mockUpdatedCharacter = {
      id: 1,
      user_id: 'test-user-id',
      category_id: 'test-category',
      name: newName
    };

    it('should update character name successfully', async () => {
      mockUpdate.mockReturnValue({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => ({
                data: mockUpdatedCharacter,
                error: null
              }))
            }))
          }))
        }))
      });

      const result = await characterService.updateCharacterName('test-category', newName);

      expect(getCurrentUserId).toHaveBeenCalled();
      expect(validateAndNormalizeCategory).toHaveBeenCalledWith('test-category', '캐릭터');
      expect(mockUpdate).toHaveBeenCalledWith({
        name: newName,
        updated_at: expect.any(String)
      });
      expect(result).toEqual(mockUpdatedCharacter);
    });

    it('should throw error for empty name', async () => {
      await expect(characterService.updateCharacterName('test-category', ''))
        .rejects.toThrow('캐릭터 이름은 비어있을 수 없습니다.');
    });

    it('should throw error for name too long', async () => {
      const longName = 'a'.repeat(21);
      await expect(characterService.updateCharacterName('test-category', longName))
        .rejects.toThrow('캐릭터 이름은 20자를 초과할 수 없습니다.');
    });

    it('should trim whitespace from name', async () => {
      const nameWithWhitespace = '  Short Name  '; // Use shorter name to avoid length error
      const expectedTrimmedName = 'Short Name';

      mockUpdate.mockReturnValue({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => ({
                data: { ...mockUpdatedCharacter, name: expectedTrimmedName },
                error: null
              }))
            }))
          }))
        }))
      });

      await characterService.updateCharacterName('test-category', nameWithWhitespace);

      expect(mockUpdate).toHaveBeenCalledWith({
        name: expectedTrimmedName,
        updated_at: expect.any(String)
      });
    });
  });

  describe('setMainCharacter', () => {
    const mockCharacter = { unlocked: true };
    const mockUser = { settings: {} };
    const mockUpdatedSettings = {
      settings: {
        selectedCharacterId: 'test-category',
        lastUpdated: expect.any(String)
      }
    };

    it('should set main character successfully', async () => {
      // Mock character fetch
      mockSelect.mockReturnValueOnce({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({
              data: mockCharacter,
              error: null
            }))
          }))
        }))
      });

      // Mock user fetch
      mockSelect.mockReturnValueOnce({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: mockUser,
            error: null
          }))
        }))
      });

      // Mock user update
      mockUpdate.mockReturnValue({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: mockUpdatedSettings,
              error: null
            }))
          }))
        }))
      });

      const result = await characterService.setMainCharacter('test-category');

      expect(validateAndNormalizeCategory).toHaveBeenCalledWith('test-category', '캐릭터');
      expect(result.success).toBe(true);
      expect(result.settings).toEqual(mockUpdatedSettings.settings);
    });

    it('should throw error for locked character', async () => {
      mockSelect.mockReturnValue({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({
              data: { unlocked: false },
              error: null
            }))
          }))
        }))
      });

      await expect(characterService.setMainCharacter('test-category'))
        .rejects.toThrow('해제되지 않은 캐릭터는 대표 캐릭터로 설정할 수 없습니다.');
    });
  });

  describe('getMainCharacter', () => {
    it('should return main character', async () => {
      const mockUser = { 
        settings: { selectedCharacterId: 'test-category' } 
      };
      const mockCharacter = {
        id: 1,
        user_id: 'test-user-id',
        category_id: 'test-category'
      };

      // Mock user fetch
      mockSelect.mockReturnValueOnce({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: mockUser,
            error: null
          }))
        }))
      });

      // Mock character fetch
      mockSelect.mockReturnValueOnce({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({
              data: mockCharacter,
              error: null
            }))
          }))
        }))
      });

      const result = await characterService.getMainCharacter();

      expect(result).toEqual(mockCharacter);
    });

    it('should return null when no selected character', async () => {
      const mockUser = { settings: {} };

      mockSelect.mockReturnValue({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: mockUser,
            error: null
          }))
        }))
      });

      const result = await characterService.getMainCharacter();

      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      mockSelect.mockReturnValue({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: null,
            error: { message: 'User not found' }
          }))
        }))
      });

      const result = await characterService.getMainCharacter();

      expect(result).toBeNull();
    });
  });
});