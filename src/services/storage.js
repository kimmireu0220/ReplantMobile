import AsyncStorage from '@react-native-async-storage/async-storage';

// 로컬 저장소 키 상수
export const STORAGE_KEYS = {
  MISSIONS: 'missions',
  DIARIES: 'diaries',
  CHARACTERS: 'characters',
  USER_NICKNAME: 'userNickname',
  MISSION_TEMPLATES: 'mission_templates',
  CHARACTER_TEMPLATES: 'character_templates',
  REPRESENTATIVE_CHARACTER: 'representative_character',
};

// 사용자별 스토리지 키 생성 함수
export const getStorageKeys = (nickname) => {
  return {
    MISSIONS: `missions_${nickname}`,
    DIARIES: `diaries_${nickname}`,
    CHARACTERS: `characters_${nickname}`,
    USER_NICKNAME: `userNickname_${nickname}`,
    MISSION_TEMPLATES: 'mission_templates', // 템플릿은 공유
    CHARACTER_TEMPLATES: 'character_templates', // 템플릿은 공유
    REPRESENTATIVE_CHARACTER: `representative_character_${nickname}`,
  };
};

// 기본 CRUD 함수들
export const getData = async (key) => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`데이터 조회 실패 (${key}):`, error);
    return [];
  }
};

export const setData = async (key, data) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`데이터 저장 실패 (${key}):`, error);
    return false;
  }
};

export const addData = async (key, item) => {
  try {
    const existingData = await getData(key);
    const newData = [...existingData, { ...item, id: Date.now().toString() }];
    await setData(key, newData);
    return newData[newData.length - 1];
  } catch (error) {
    console.error(`데이터 추가 실패 (${key}):`, error);
    throw error;
  }
};

export const updateData = async (key, id, updates) => {
  try {
    const existingData = await getData(key);
    const updatedData = existingData.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    await setData(key, updatedData);
    return updatedData.find(item => item.id === id);
  } catch (error) {
    console.error(`데이터 수정 실패 (${key}):`, error);
    throw error;
  }
};

export const deleteData = async (key, id) => {
  try {
    const existingData = await getData(key);
    const filteredData = existingData.filter(item => item.id !== id);
    await setData(key, filteredData);
    return true;
  } catch (error) {
    console.error(`데이터 삭제 실패 (${key}):`, error);
    throw error;
  }
};

// 기기별 데이터 삭제 함수
export const clearDeviceBasedData = async () => {
  try {
    const deviceId = await getDeviceId();
    const keysToRemove = [
      `missions_${deviceId}`,
      `diaries_${deviceId}`,
      `characters_${deviceId}`,
      `userNickname_${deviceId}`,
    ];
    
    for (const key of keysToRemove) {
      await AsyncStorage.removeItem(key);
    }
    
    console.log('기존 기기별 데이터 삭제 완료');
  } catch (error) {
    console.error('기기별 데이터 삭제 실패:', error);
  }
};

// 기기 ID 생성/조회
export const getDeviceId = async () => {
  try {
    let deviceId = await AsyncStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = 'device_' + Math.random().toString(36).substr(2, 9);
      await AsyncStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  } catch (error) {
    console.error('Device ID 가져오기 실패:', error);
    return 'device_' + Math.random().toString(36).substr(2, 9);
  }
};
