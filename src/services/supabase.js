import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// React Native에서 URL.protocol 에러 해결을 위한 폴리필
if (typeof URL !== 'undefined' && URL.prototype) {
  const originalURL = URL;
  // eslint-disable-next-line no-global-assign
  URL = function(url, base) {
    const urlObj = new originalURL(url, base);
    // protocol 속성을 읽기 전용으로 만들기
    Object.defineProperty(urlObj, 'protocol', {
      get: function() {
        return this._protocol || 'https:';
      },
      set: function(value) {
        this._protocol = value;
      },
      enumerable: true,
      configurable: true
    });
    return urlObj;
  };
  URL.prototype = originalURL.prototype;
}

// 환경 변수 (나중에 .env 파일로 관리)
// 실제 Supabase 프로젝트 설정
const supabaseUrl = 'https://lhnkpabpnyifwiaqwyvy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxobmtwYWJwbnlpZndpYXF3eXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDc2MjMsImV4cCI6MjA2OTcyMzYyM30.Oz-F8CboFZsqy6Ogc4iy4GFZ_pN0K4VU6raUm2uiVoU';

// device_id 관리 함수들
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

export const resetDeviceId = async () => {
  try {
    await AsyncStorage.removeItem('deviceId');
    return await getDeviceId(); // 새로운 device_id 생성
  } catch (error) {
    console.error('Device ID 재설정 실패:', error);
    return await getDeviceId();
  }
};

export const getCurrentDeviceId = async () => {
  return await getDeviceId();
};

// Supabase 클라이언트 생성 (React Native 호환)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // React Native에서 안전한 인증 설정
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  global: {
    // 모든 요청에 동적으로 헤더를 주입하기 위해 fetch를 래핑한다
    fetch: async (url, options = {}) => {
      try {
        const nickname = await AsyncStorage.getItem('userNickname');
        const deviceId = await getDeviceId();
        
        const headers = new Headers(options.headers || {});
        // 한글/특수문자 안전 전송을 위해 base64 인코딩 사용
        if (nickname) {
          // React Native에서 btoa 폴리필 사용
          const b64 = global.btoa ? global.btoa(unescape(encodeURIComponent(nickname))) : 
            // eslint-disable-next-line no-undef
            Buffer.from(unescape(encodeURIComponent(nickname)), 'binary').toString('base64');
          headers.set('x-nickname-b64', b64);
        }
        // 디바이스 기반 정책/로그를 위해 항상 포함
        headers.set('x-device-id', deviceId);
        return fetch(url, { ...options, headers });
      } catch (error) {
        console.error('Supabase fetch error:', error);
        return fetch(url, options);
      }
    }
  }
});

// 닉네임을 Supabase 세션에 설정
export const setNicknameInSession = async (nickname) => {
  try {
    // Supabase 세션에 닉네임 설정
    const { error } = await supabase.rpc('set_nickname_session', {
      nickname_param: nickname
    });
    
    if (error) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
};

// 모든 데이터베이스 작업 전에 호출할 헬퍼 함수
export const ensureNicknameSession = async () => {
  const nickname = await AsyncStorage.getItem('userNickname');
  if (nickname) {
    return await setNicknameInSession(nickname);
  }
  return false;
};

// 닉네임 생성 함수
export const generateTemporaryNickname = () => {
  const adjectives = ['행복한', '즐거운', '신나는', '멋진', '훌륭한', '완벽한', '특별한', '유니크한'];
  const nouns = ['사용자', '플레이어', '게이머', '친구', '동료', '파트너', '메이트'];
  
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNumber = Math.floor(Math.random() * 1000);
  
  return `${randomAdjective}${randomNoun}${randomNumber}`;
};

// 닉네임 유효성 검사
export const validateNickname = (nickname) => {
  if (!nickname || nickname.trim().length === 0) {
    return { isValid: false, message: '닉네임을 입력해주세요.' };
  }
  
  if (nickname.length < 2) {
    return { isValid: false, message: '닉네임은 2자 이상이어야 합니다.' };
  }
  
  if (nickname.length > 20) {
    return { isValid: false, message: '닉네임은 20자 이하여야 합니다.' };
  }
  
  // 특수문자 제한 (한글, 영문, 숫자만 허용)
  const nicknameRegex = /^[가-힣a-zA-Z0-9]+$/;
  if (!nicknameRegex.test(nickname)) {
    return { isValid: false, message: '닉네임은 한글, 영문, 숫자만 사용 가능합니다.' };
  }
  
  return { isValid: true, message: '' };
};

// 닉네임 중복 확인
export const checkNicknameDuplicate = async (nickname) => {
  // true: 중복, false: 사용 가능
  const { data, error } = await supabase.rpc('check_nickname_duplicate', {
    nickname_param: nickname
  });
  if (error) {
    // 호출 측에서 신뢰성 있게 처리할 수 있도록 예외를 던진다
    throw error;
  }
  return data;
};

// 닉네임으로 사용자 생성 (device_id 포함)
export const createUserWithNickname = async (nickname) => {
  try {
    const deviceId = await getDeviceId();
    
    const { data, error } = await supabase.rpc('create_user_with_nickname', {
      nickname_param: nickname,
      device_id_param: deviceId
    });
    
    if (error) {
      return null;
    }
    
    // 로컬 스토리지에 닉네임 저장
    await AsyncStorage.setItem('userNickname', nickname);
    
    // 닉네임을 Supabase 세션에 설정
    await setNicknameInSession(nickname);
    
    return data;
  } catch (error) {
    return null;
  }
};

// 현재 사용자 ID 가져오기 (닉네임 기반)
export const getCurrentUserId = async () => {
  const nickname = await AsyncStorage.getItem('userNickname');
  const cachedUserId = await AsyncStorage.getItem('userId');
  
  if (!nickname) {
    return null; // 닉네임이 없으면 null 반환
  }
  
  // 캐시된 userId가 있으면 우선 사용
  if (cachedUserId) {
    return cachedUserId;
  }
  
  try {
    // 닉네임을 Supabase 세션에 설정
    await setNicknameInSession(nickname);
    
    const { data, error } = await supabase.rpc('get_user_by_nickname', {
      nickname_param: nickname
    });
    
    if (error) {
      return null;
    }
    
    // RPC가 uuid를 반환하는 정상 케이스
    if (data) {
      try { await AsyncStorage.setItem('userId', data); } catch (_) {}
      return data;
    }

    // Fallback: RLS가 헤더(x-nickname)로 필터하므로, users에서 id를 1건 조회
    const { data: userRow, error: selectError } = await supabase
      .from('users')
      .select('id')
      .limit(1)
      .maybeSingle();

    if (selectError || !userRow?.id) {
      return null;
    }

    try { await AsyncStorage.setItem('userId', userRow.id); } catch (_) {}
    return userRow.id;
  } catch (error) {
    return null;
  }
};

// 헤더 확인 함수
export const checkHeaders = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('device_id')
      .limit(1);
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

// device_id 재설정 함수 (문제 발생 시)
export const resetDeviceIdAndReload = async () => {
  await AsyncStorage.removeItem('deviceId');
  // React Native에서는 window.location.reload() 대신 앱 재시작 필요
  // 이 부분은 나중에 구현
};

// 레거시 데이터 정리 함수
export const cleanupLegacyData = async () => {
  try {
    // 이전 버전의 AsyncStorage 데이터 정리
    const legacyKeys = [
      'replant_characters',
      'replant_user_settings', 
      'replant_missions',
      'replant_diaries'
    ];
    
    let cleanedCount = 0;
    for (const key of legacyKeys) {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        await AsyncStorage.removeItem(key);
        cleanedCount++;
      }
    }
    
    // 정리된 키가 있을 때만 로그
    if (cleanedCount > 0) {
      console.info(`Legacy data cleanup: ${cleanedCount} items removed`);
    }
  } catch (error) {
    // AsyncStorage 접근 실패 시 조용히 무시
  }
};

// 현재 사용자 닉네임 가져오기
export const getCurrentUserNickname = async () => {
  try {
    return await AsyncStorage.getItem('userNickname');
  } catch (error) {
    console.error('닉네임 가져오기 실패:', error);
    return null;
  }
};

// 사용자 로그아웃 (닉네임 제거)
export const logoutUser = async () => {
  try {
    await AsyncStorage.removeItem('userNickname');
    await AsyncStorage.removeItem('userId');
  } catch (error) {
    console.error('로그아웃 실패:', error);
  }
};

// 데이터베이스 테이블 이름 상수
export const TABLES = {
  USERS: 'users',
  DIARIES: 'diaries',
  MISSIONS: 'missions',
  CHARACTERS: 'characters',
  CATEGORIES: 'categories',
  EMOTIONS: 'emotions',
  MISSION_TEMPLATES: 'mission_templates',
  CHARACTER_TEMPLATES: 'character_templates',
  COUNSEL_MESSAGES: 'counsel_messages'
};

// RLS (Row Level Security) 정책 이름
export const POLICIES = {
  USERS_OWN_DATA: 'users_own_data',
  DIARIES_OWN_DATA: 'diaries_own_data',
  MISSIONS_OWN_DATA: 'missions_own_data',
  CHARACTERS_OWN_DATA: 'characters_own_data'
};
