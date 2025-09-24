import AsyncStorage from '@react-native-async-storage/async-storage';
import { getData, setData, getStorageKeys } from './storage';

// 닉네임 중복 확인
export const checkNicknameDuplicate = async (nickname) => {
  try {
    const storageKeys = getStorageKeys(nickname);
    const existingNickname = await AsyncStorage.getItem(storageKeys.USER_NICKNAME);
    return existingNickname === nickname;
  } catch (error) {
    console.error('닉네임 중복 확인 실패:', error);
    return false;
  }
};

// 닉네임으로 사용자 생성
export const createUserWithNickname = async (nickname, deviceId) => {
  try {
    // 닉네임 중복 확인
    const isDuplicate = await checkNicknameDuplicate(nickname);
    if (isDuplicate) {
      throw new Error('이미 사용 중인 닉네임입니다.');
    }
    
    // 닉네임 저장
    const storageKeys = getStorageKeys(nickname);
    await AsyncStorage.setItem(storageKeys.USER_NICKNAME, nickname);
    
    // 사용자 데이터 초기화
    const userId = `user_${Date.now()}`;
    await initializeUserData(userId);
    
    return {
      success: true,
      userId,
      nickname
    };
  } catch (error) {
    console.error('사용자 생성 실패:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// 닉네임으로 사용자 조회
export const getUserByNickname = async (nickname) => {
  try {
    const storageKeys = getStorageKeys(nickname);
    const storedNickname = await AsyncStorage.getItem(storageKeys.USER_NICKNAME);
    if (storedNickname === nickname) {
      return `user_${Date.now()}`; // 임시 사용자 ID
    }
    return null;
  } catch (error) {
    console.error('사용자 조회 실패:', error);
    return null;
  }
};

// 기존 사용자 데이터 마이그레이션 (3개 카테고리 유지)
export const migrateUserData = async (nickname) => {
  try {
    const storageKeys = getStorageKeys(nickname);
    
    // 기존 미션 데이터 가져오기
    const existingMissions = await getData(storageKeys.MISSIONS);
    if (existingMissions.length === 0) return { success: true, message: '마이그레이션할 데이터가 없습니다.' };
    
    // 유효한 카테고리만 유지 (self_management, communication, career)
    const validCategories = ['self_management', 'communication', 'career'];
    const migratedMissions = existingMissions.map(mission => ({
      ...mission,
      category: validCategories.includes(mission.category) ? mission.category : 'career'
    }));
    
    await setData(storageKeys.MISSIONS, migratedMissions);
    
    // 캐릭터 데이터는 레벨 기반이므로 변경 없음
    
    return {
      success: true,
      message: '데이터 마이그레이션이 완료되었습니다.',
      migratedMissions: migratedMissions.length
    };
  } catch (error) {
    console.error('데이터 마이그레이션 실패:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// 사용자 데이터 초기화
export const initializeUserData = async (userId, nickname) => {
  try {
    // 미션 템플릿에서 초기 미션 생성
    const storageKeys = getStorageKeys(nickname);
    
    // 항상 JSON 파일에서 최신 템플릿 로드
    const missionTemplates = require('../data/missionTemplates.json');
    // 템플릿에서 미션 생성 (전체 템플릿 데이터 사용)
    const missions = missionTemplates.map(template => ({
      id: `mission_${Date.now()}_${template.id}`,
      mission_id: template.mission_id,
      title: template.title,
      description: template.description,
      emoji: template.emoji,
      category: template.category_id,
      difficulty: template.difficulty,
      experience: template.experience,
      completed: false
    }));
    await setData(storageKeys.MISSIONS, missions);
    
    // 캐릭터 템플릿에서 초기 캐릭터 생성
    let characterTemplates = await getData(storageKeys.CHARACTER_TEMPLATES);
    if (characterTemplates.length === 0) {
      // JSON 파일에서 템플릿 로드
      const characterTemplatesData = require('../data/characterTemplates.json');
      await setData(storageKeys.CHARACTER_TEMPLATES, characterTemplatesData);
      characterTemplates = characterTemplatesData;
    }
    if (characterTemplates.length > 0) {
      const initialCharacter = {
        id: `character_${Date.now()}`,
        user_id: userId,
        name: characterTemplates[0].name,
        title: characterTemplates[0].title,
        level: 1,
        experience: 0,
        max_experience: 1000,
        total_experience: 0,
        unlocked: true,
        category_id: 'general'
      };
      await setData(storageKeys.CHARACTERS, [initialCharacter]);
    }
    
    // 다이어리는 빈 배열로 시작
    await setData(storageKeys.DIARIES, []);
    
    return {
      success: true,
      message: '사용자 데이터가 초기화되었습니다.'
    };
  } catch (error) {
    console.error('사용자 데이터 초기화 실패:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
