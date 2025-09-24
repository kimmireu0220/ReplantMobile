// 템플릿 서비스 - JSON 파일에서 직접 로드
import { logError } from '../utils/logger';

// 미션 템플릿 로드
export const loadMissionTemplates = async () => {
  try {
    // 항상 JSON 파일에서 최신 템플릿 로드
    const missionTemplatesData = require('../data/missionTemplates.json');
    return missionTemplatesData;
  } catch (error) {
    logError('미션 템플릿 로드 실패', error);
    return [];
  }
};

// 캐릭터 템플릿 로드
export const loadCharacterTemplates = async () => {
  try {
    // 항상 JSON 파일에서 최신 템플릿 로드
    const characterTemplatesData = require('../data/characterTemplates.json');
    return characterTemplatesData;
  } catch (error) {
    logError('캐릭터 템플릿 로드 실패', error);
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
    logError('템플릿 로드 실패', error);
    return {
      success: false,
      error: error.message
    };
  }
};

