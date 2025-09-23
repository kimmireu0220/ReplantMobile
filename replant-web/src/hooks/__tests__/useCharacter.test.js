import { renderHook, act, waitFor } from '@testing-library/react';
import { useCharacter } from '../useCharacter';

// Mock dependencies
jest.mock('../../services/characterService', () => ({
  characterService: {
    getUserSettings: jest.fn(),
    getCharacterTemplates: jest.fn(),
    getUserCharacters: jest.fn(),
    setMainCharacter: jest.fn(),
    addExperienceToCharacter: jest.fn(),
    updateCharacterLevel: jest.fn(),
  }
}));

jest.mock('../../data/characters', () => ({
  getUnlockedCharacters: jest.fn(),
  getHighestLevelCharacter: jest.fn(),
}));

jest.mock('../../config/supabase', () => ({
  getCurrentUserNickname: jest.fn(() => 'testuser'),
}));

// Mock useCategory hook
jest.mock('../useCategory', () => ({
  useCategory: () => ({
    getCategoryById: jest.fn(id => ({ 
      id, 
      name: `Category ${id}`,
      emoji: '📚',
      color: '#4F46E5',
      description: `Test category ${id}`
    }))
  })
}));

describe('useCharacter', () => {
  let characterService;
  let getUnlockedCharacters;
  let getHighestLevelCharacter;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Get mocked functions
    characterService = require('../../services/characterService').characterService;
    getUnlockedCharacters = require('../../data/characters').getUnlockedCharacters;
    getHighestLevelCharacter = require('../../data/characters').getHighestLevelCharacter;

    
    // Setup default mocks
    characterService.getUserSettings.mockResolvedValue({
      nickname: 'testuser',
      selectedCharacterId: 'exercise'
    });
    
    characterService.getCharacterTemplates.mockResolvedValue([
      {
        level: 1,
        name: '씨앗',
        title: '새싹 꿈나무',
        default_image: 'level1/default.png',
        waving_image: 'level1/waving.png',
        happy_image: 'level1/happy.png',
        description: '새싹 단계',
        experience_required: 0
      },
      {
        level: 5,
        name: '성장한 식물',
        title: '성장한 꿈나무',
        default_image: 'level5/default.png',
        waving_image: 'level5/waving.png',
        happy_image: 'level5/happy.png',
        description: '성장 단계',
        experience_required: 100
      }
    ]);
    
    characterService.getUserCharacters.mockResolvedValue([
      { 
        id: 'exercise', 
        category_id: 'exercise', 
        unlocked: true, 
        level: 5, 
        total_experience: 100,
        unlocked_date: new Date().toISOString(),
        achievements: [],
        stats: { missionsCompleted: 10, daysActive: 5, streak: 3, longestStreak: 7 }
      },
      { 
        id: 'reading', 
        category_id: 'reading', 
        unlocked: false, 
        level: 1, 
        total_experience: 0,
        unlocked_date: null,
        achievements: [],
        stats: { missionsCompleted: 0, daysActive: 0, streak: 0, longestStreak: 0 }
      }
    ]);
    
    getUnlockedCharacters.mockReturnValue([
      { 
        id: 'exercise', 
        category: 'exercise', 
        unlocked: true, 
        level: 5, 
        total_experience: 100 
      }
    ]);
    
    getHighestLevelCharacter.mockReturnValue(
      { 
        id: 'exercise', 
        category: 'exercise', 
        unlocked: true, 
        level: 5, 
        total_experience: 100 
      }
    );
    
    characterService.setMainCharacter.mockResolvedValue({ success: true });
    characterService.addExperienceToCharacter.mockResolvedValue({ success: true });
    characterService.updateCharacterLevel.mockResolvedValue({ success: true });
  });

  test('초기화 시 loading이 true여야 한다', () => {
    const { result } = renderHook(() => useCharacter());
    expect(result.current.loading).toBe(true);
  });

  test('사용자 설정과 캐릭터 데이터를 성공적으로 로드해야 한다', async () => {
    const { result } = renderHook(() => useCharacter());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.characters).toBeDefined();
    expect(result.current.selectedCharacter).toBeDefined();
    expect(result.current.nickname).toBe('testuser');
  });

  test('캐릭터 선택이 올바르게 작동해야 한다', async () => {
    const { result } = renderHook(() => useCharacter());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // 캐릭터가 존재하고 해제된 상태인지 확인
    const characterId = 'exercise';
    const character = result.current.characters[characterId];
    
    expect(character).toBeDefined();
    expect(character.unlocked).toBe(true);
    
    await act(async () => {
      const success = await result.current.setSelectedCharacter(characterId);
      expect(success).toBe(true);
    });
    
    expect(characterService.setMainCharacter).toHaveBeenCalledWith(characterId);
  });

  test('경험치 추가가 올바르게 작동해야 한다', async () => {
    const { result } = renderHook(() => useCharacter());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    await act(async () => {
      const success = await result.current.addExperience('exercise', 50);
      expect(success.success).toBe(true);
    });
    
    expect(characterService.addExperienceToCharacter).toHaveBeenCalledWith('exercise', 50);
  });

  test('에러 발생 시 적절히 처리해야 한다', async () => {
    // 모든 서비스 호출을 에러로 설정
    characterService.getUserSettings.mockRejectedValue(new Error('Network error'));
    characterService.getCharacterTemplates.mockRejectedValue(new Error('Network error'));
    characterService.getUserCharacters.mockRejectedValue(new Error('Network error'));
    
    const { result } = renderHook(() => useCharacter());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.characters).toEqual({});
  });

  test('캐릭터가 선택되지 않은 경우 기본 캐릭터를 반환해야 한다', async () => {
    characterService.getUserSettings.mockResolvedValue({
      nickname: 'testuser',
      selectedCharacterId: null
    });
    
    const { result } = renderHook(() => useCharacter());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.selectedCharacter).toBeNull();
    expect(result.current.getTopCharacter()).toBeDefined();
  });
});