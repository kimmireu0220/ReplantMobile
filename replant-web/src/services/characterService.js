import { supabase, getCurrentUserId, ensureNicknameSession } from '../config/supabase';
import { validateAndNormalizeCategory } from '../utils/categoryUtils';
import { categoryService } from './categoryService';

class CharacterService {

  async getCharacterTemplates() {
    try {
      await ensureNicknameSession();
      
      const { data, error } = await supabase
        .from('character_templates')
        .select('*')
        .order('level');
      
      if (error) {
        return null;
      }
      
      return data;
    } catch (error) {
      return null;
    }
  }

  async getCharacterTemplateByLevel(level) {
    try {
      await ensureNicknameSession();
      
      const { data, error } = await supabase
        .from('character_templates')
        .select('*')
        .eq('level', level)
        .single();
      
      if (error) {
        return null;
      }
      
      return data;
    } catch (error) {
      return null;
    }
  }

  async getUserCharacters() {
    try {
      await ensureNicknameSession();
      
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('사용자 ID를 가져올 수 없습니다.');
      }

      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        return await this.initializeUserCharacters(userId);
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  async initializeUserCharacters(userId) {
    try {
      const { data: template, error: templateError } = await supabase
        .from('character_templates')
        .select('*')
        .eq('level', 1)
        .single();

      if (templateError) {
        throw templateError;
      }

      // 백엔드에서 카테고리 목록 조회
      const categories = await categoryService.getCategories();
      const categoryIds = categories.map(category => category.id);

      const charactersToInsert = categoryIds.map(categoryId => ({
        user_id: userId,
        category_id: categoryId,
        name: template.name,
        level: 1,
        experience: 0,
        max_experience: 500,
        total_experience: 0,
        unlocked: false,
        unlocked_date: null,
        stats: { streak: 0, daysActive: 0, longestStreak: 0, missionsCompleted: 0 }
      }));
      
      const { data: newCharacters, error: insertError } = await supabase
        .from('characters')
        .upsert(charactersToInsert, { 
          onConflict: 'user_id,category_id',
          ignoreDuplicates: true 
        })
        .select('*');

      if (insertError) {
        throw insertError;
      }
      
      return newCharacters;
    } catch (error) {
      throw error;
    }
  }

  async updateCharacter(categoryId, updates) {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('사용자 ID를 가져올 수 없습니다.');
      }

      const normalizedCategoryId = validateAndNormalizeCategory(categoryId, '캐릭터');

      const { data, error } = await supabase
        .from('characters')
        .update(updates)
        .eq('user_id', userId)
        .eq('category_id', normalizedCategoryId)
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  async addExperienceToCharacter(categoryId, experiencePoints) {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('사용자 ID를 가져올 수 없습니다.');
      }

      const normalizedCategoryId = validateAndNormalizeCategory(categoryId, '캐릭터');

      const { data: currentCharacter } = await supabase
        .from('characters')
        .select('*')
        .eq('user_id', userId)
        .eq('category_id', normalizedCategoryId)
        .single();

      if (!currentCharacter) {
        throw new Error('캐릭터를 찾을 수 없습니다.');
      }

      const { data: levelupResult, error: levelupError } = await supabase.rpc('auto_levelup_character', {
        character_id: currentCharacter.id,
        experience_gained: experiencePoints
      });

      if (levelupError) {
        throw levelupError;
      }

      const result = levelupResult;
      const levelUp = result.leveled_up || false;
      const newName = result.new_name || currentCharacter.name;

      const { data: updatedCharacter, error: fetchError } = await supabase
        .from('characters')
        .select('*')
        .eq('id', currentCharacter.id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      const newStats = {
        ...updatedCharacter.stats,
        missionsCompleted: (updatedCharacter.stats?.missionsCompleted || 0) + 1
      };

      let unlocked = updatedCharacter.unlocked;
      let unlockedDate = updatedCharacter.unlocked_date;
      
      if (!updatedCharacter.unlocked && newStats.missionsCompleted === 1) {
        unlocked = true;
        unlockedDate = new Date().toISOString();
      }

      const { data: finalCharacter, error: updateError } = await supabase
        .from('characters')
        .update({
          stats: newStats,
          unlocked: unlocked,
          unlocked_date: unlockedDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentCharacter.id)
        .select('*')
        .single();

      if (updateError) {
        throw updateError;
      }

      const wasUnlocked = currentCharacter.unlocked;
      const isNowUnlocked = finalCharacter.unlocked;
      const newlyUnlocked = !wasUnlocked && isNowUnlocked;

      return {
        success: true,
        character: finalCharacter,
        levelUp: levelUp,
        unlocked: newlyUnlocked,
        newName: newName
      };
    } catch (error) {
      throw error;
    }
  }

  // 캐릭터 해제
  async unlockCharacter(categoryId) {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('사용자 ID를 가져올 수 없습니다.');
      }

      const normalizedCategoryId = validateAndNormalizeCategory(categoryId, '캐릭터');

      const unlockAchievement = {
        id: `unlock_${normalizedCategoryId}`,
        type: 'unlock',
        unlockedDate: new Date().toISOString(),
        title: `캐릭터 해제!`,
        description: `새로운 캐릭터를 해제했습니다.`
      };

      const { data: currentCharacter, error: fetchError } = await supabase
        .from('characters')
        .select('achievements')
        .eq('user_id', userId)
        .eq('category_id', normalizedCategoryId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      const currentAchievements = currentCharacter.achievements || [];
      const updatedAchievements = [...currentAchievements, unlockAchievement];

      const { data, error } = await supabase
        .from('characters')
        .update({
          unlocked: true,
          unlocked_date: new Date().toISOString(),
          achievements: updatedAchievements,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('category_id', normalizedCategoryId)
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        character: data
      };
    } catch (error) {
      throw error;
    }
  }

  async updateUserActivity() {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('사용자 ID를 가져올 수 없습니다.');
      }

      const { error } = await supabase
        .from('users')
        .update({
          last_active_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }

  async setMainCharacter(categoryId) {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('사용자 ID를 가져올 수 없습니다.');
      }

      const normalizedCategoryId = validateAndNormalizeCategory(categoryId, '캐릭터');

      const { data: character, error: fetchError } = await supabase
        .from('characters')
        .select('unlocked')
        .eq('user_id', userId)
        .eq('category_id', normalizedCategoryId)
        .single();

      if (fetchError) {
        throw new Error('캐릭터를 찾을 수 없습니다.');
      }

      if (!character.unlocked) {
        throw new Error('해제되지 않은 캐릭터는 대표 캐릭터로 설정할 수 없습니다.');
      }

      // 현재 사용자 설정을 가져와서 업데이트
      const { data: currentUser, error: userError } = await supabase
        .from('users')
        .select('settings')
        .eq('id', userId)
        .single();

      if (userError) {
        throw userError;
      }

      const currentSettings = currentUser.settings || {};
      const updatedSettings = {
        ...currentSettings,
        selectedCharacterId: normalizedCategoryId,
        lastUpdated: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('users')
        .update({
          settings: updatedSettings,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select('settings')
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        settings: data.settings
      };
    } catch (error) {
      throw error;
    }
  }

  async getMainCharacter() {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('사용자 ID를 가져올 수 없습니다.');
      }

      const { data: user, error: userError } = await supabase
        .from('users')
        .select('settings')
        .eq('id', userId)
        .single();

      if (userError) {
        throw userError;
      }

      const settings = user.settings || {};
      const selectedCharacterId = settings.selectedCharacterId;

      if (!selectedCharacterId) {
        return null;
      }

      const { data: character, error: characterError } = await supabase
        .from('characters')
        .select('*')
        .eq('user_id', userId)
        .eq('category_id', selectedCharacterId)
        .single();

      if (characterError) {
        return null;
      }

      return character;
    } catch (error) {
      return null;
    }
  }

  async getUserSettings() {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('사용자 ID를 가져올 수 없습니다.');
      }

      const { data: user, error } = await supabase
        .from('users')
        .select('settings')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      return user.settings || {};
    } catch (error) {
      return {};
    }
  }

  async updateCharacterName(categoryId, newName) {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('사용자 ID를 가져올 수 없습니다.');
      }

      const normalizedCategoryId = validateAndNormalizeCategory(categoryId, '캐릭터');

      if (!newName || newName.trim().length === 0) {
        throw new Error('캐릭터 이름은 비어있을 수 없습니다.');
      }

      if (newName.length > 20) {
        throw new Error('캐릭터 이름은 20자를 초과할 수 없습니다.');
      }

      const { data, error } = await supabase
        .from('characters')
        .update({ 
          name: newName.trim(), 
          updated_at: new Date().toISOString() 
        })
        .eq('category_id', normalizedCategoryId)
        .eq('user_id', userId)
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  async resetCharacterNameToDefault(categoryId) {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('사용자 ID를 가져올 수 없습니다.');
      }

      const normalizedCategoryId = validateAndNormalizeCategory(categoryId, '캐릭터');

      const { data: currentCharacter, error: fetchError } = await supabase
        .from('characters')
        .select('*')
        .eq('user_id', userId)
        .eq('category_id', normalizedCategoryId)
        .single();

      if (fetchError) {
        throw new Error('캐릭터를 찾을 수 없습니다.');
      }

      const { error: resetError } = await supabase.rpc('reset_character_name_to_default', {
        character_id: currentCharacter.id
      });

      if (resetError) {
        throw resetError;
      }

      const { data: updatedCharacter, error: updateError } = await supabase
        .from('characters')
        .select('*')
        .eq('id', currentCharacter.id)
        .single();

      if (updateError) {
        throw updateError;
      }

      return updatedCharacter;
    } catch (error) {
      throw error;
    }
  }
}

export const characterService = new CharacterService(); 