import { getData, updateData, STORAGE_KEYS } from './storage';

// 캐릭터 자동 레벨업
export const autoLevelupCharacter = async (characterId, experienceGained) => {
  try {
    const characters = await getData(STORAGE_KEYS.CHARACTERS);
    const character = characters.find(c => c.id === characterId);
    
    if (!character) {
      throw new Error('캐릭터를 찾을 수 없습니다.');
    }
    
    // 경험치 추가
    const newExperience = (character.experience || 0) + experienceGained;
    
    // 레벨업 계산 (1000 경험치당 1레벨)
    const newLevel = Math.floor(newExperience / 1000) + 1;
    const oldLevel = character.level || 1;
    
    // 캐릭터 업데이트
    const updatedCharacter = {
      ...character,
      experience: newExperience,
      level: newLevel,
      total_experience: (character.total_experience || 0) + experienceGained
    };
    
    await updateData(STORAGE_KEYS.CHARACTERS, characterId, updatedCharacter);
    
    return {
      success: true,
      newLevel,
      experience: newExperience,
      levelUp: newLevel > oldLevel,
      character: updatedCharacter
    };
  } catch (error) {
    console.error('캐릭터 레벨업 실패:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// 캐릭터 생성
export const createCharacter = async (characterData) => {
  try {
    const characters = await getData(STORAGE_KEYS.CHARACTERS);
    const newCharacter = {
      id: `character_${Date.now()}`,
      ...characterData,
      created_at: new Date().toISOString()
    };
    
    const updatedCharacters = [...characters, newCharacter];
    await setData(STORAGE_KEYS.CHARACTERS, updatedCharacters);
    
    return {
      success: true,
      character: newCharacter
    };
  } catch (error) {
    console.error('캐릭터 생성 실패:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// 캐릭터 조회
export const getCharacter = async (characterId) => {
  try {
    const characters = await getData(STORAGE_KEYS.CHARACTERS);
    return characters.find(c => c.id === characterId);
  } catch (error) {
    console.error('캐릭터 조회 실패:', error);
    return null;
  }
};

// 모든 캐릭터 조회
export const getAllCharacters = async () => {
  try {
    return await getData(STORAGE_KEYS.CHARACTERS);
  } catch (error) {
    console.error('캐릭터 목록 조회 실패:', error);
    return [];
  }
};
