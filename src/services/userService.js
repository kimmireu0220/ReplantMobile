import AsyncStorage from '@react-native-async-storage/async-storage';
import { getData, setData, getStorageKeys } from './storage';
import { createCharacter } from './characterService';

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

// 사용자 데이터 초기화
export const initializeUserData = async (userId) => {
  try {
    // 유저가 처음 닉네임을 입력한 시점
    const userCreatedAt = new Date().toISOString();
    
    // 미션 템플릿에서 초기 미션 생성
    const storageKeys = getStorageKeys(nickname);
    
    // 템플릿이 없으면 먼저 로드
    let missionTemplates = await getData(storageKeys.MISSION_TEMPLATES);
    if (missionTemplates.length === 0) {
      // JSON 파일에서 템플릿 로드
      const missionTemplatesData = require('../data/missionTemplates.json');
      await setData(storageKeys.MISSION_TEMPLATES, missionTemplatesData);
      missionTemplates = missionTemplatesData;
    }
    if (missionTemplates.length === 0) {
      // 템플릿이 없으면 기본 미션 생성
      const defaultMissions = [
        {
          id: `mission_${Date.now()}_1`,
          mission_id: 'cl1',
          title: '방 정리하기',
          description: '작은 공간이라도 깔끔하게 정리해보세요',
          emoji: '🧹',
          category: 'cleaning',
          difficulty: 'medium',
          experience: 70,
          completed: false,
          created_at: userCreatedAt
        }
      ];
      await setData(storageKeys.MISSIONS, defaultMissions);
    } else {
      // 템플릿에서 미션 생성 (전체 60개 모두 선택)
      const missions = missionTemplates.map(template => ({
        id: `mission_${Date.now()}_${template.id}`,
        mission_id: template.mission_id,
        title: template.title,
        description: template.description,
        emoji: template.emoji,
        category: template.category_id,
        difficulty: template.difficulty,
        experience: template.experience,
        completed: false,
        created_at: userCreatedAt
      }));
      await setData(storageKeys.MISSIONS, missions);
    }
    
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
        unlocked_date: userCreatedAt,
        category_id: 'general',
        created_at: userCreatedAt
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
