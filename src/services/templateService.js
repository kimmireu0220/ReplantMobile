import { getData, setData, STORAGE_KEYS } from './storage';

// 미션 템플릿 로드
export const loadMissionTemplates = async () => {
  try {
    const missionTemplates = await getData(STORAGE_KEYS.MISSION_TEMPLATES);
    if (missionTemplates.length === 0) {
      // JSON 파일에서 로드
      const missionTemplatesData = require('../data/missionTemplates.json');
      await setData(STORAGE_KEYS.MISSION_TEMPLATES, missionTemplatesData);
      return missionTemplatesData;
    }
    return missionTemplates;
  } catch (error) {
    console.error('미션 템플릿 로드 실패:', error);
    return [];
  }
};

// 캐릭터 템플릿 로드
export const loadCharacterTemplates = async () => {
  try {
    const characterTemplates = await getData(STORAGE_KEYS.CHARACTER_TEMPLATES);
    if (characterTemplates.length === 0) {
      // JSON 파일에서 로드
      const characterTemplatesData = require('../data/characterTemplates.json');
      await setData(STORAGE_KEYS.CHARACTER_TEMPLATES, characterTemplatesData);
      return characterTemplatesData;
    }
    return characterTemplates;
  } catch (error) {
    console.error('캐릭터 템플릿 로드 실패:', error);
    return [];
  }
};

// 모든 템플릿 로드
export const loadTemplates = async () => {
  try {
    const missionTemplates = await loadMissionTemplates();
    const characterTemplates = await loadCharacterTemplates();
    
    return {
      success: true,
      missionTemplates,
      characterTemplates
    };
  } catch (error) {
    console.error('템플릿 로드 실패:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// 미션 템플릿 조회
export const getMissionTemplates = async () => {
  try {
    return await getData(STORAGE_KEYS.MISSION_TEMPLATES);
  } catch (error) {
    console.error('미션 템플릿 조회 실패:', error);
    return [];
  }
};

// 캐릭터 템플릿 조회
export const getCharacterTemplates = async () => {
  try {
    return await getData(STORAGE_KEYS.CHARACTER_TEMPLATES);
  } catch (error) {
    console.error('캐릭터 템플릿 조회 실패:', error);
    return [];
  }
};
