import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStorageKeys, initializeUserData } from '../services';
import { clearDeviceBasedData, getDeviceId } from '../services/storage';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [currentNickname, setCurrentNickname] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 사용자 정보 로드
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      // 기존 기기별 데이터에서 닉네임 찾기
      const deviceId = await getDeviceId();
      const oldNicknameKey = `userNickname_${deviceId}`;
      const nickname = await AsyncStorage.getItem(oldNicknameKey);
      
      if (nickname) {
        setUser({ 
          nickname, 
          id: `user_${Date.now()}` 
        });
        setCurrentNickname(nickname);
      }
    } catch (error) {
      console.error('사용자 정보 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 사용자 로그인 (인증 없이 닉네임만으로)
  const login = async (nickname) => {
    try {
      console.log('로그인 시작:', nickname);
      
      // 사용자 상태 업데이트
      const userId = `user_${Date.now()}`;
      setUser({ 
        nickname, 
        id: userId
      });
      setCurrentNickname(nickname);
      
      // 미션 데이터 초기화
      await initializeUserData(userId, nickname);
      
      console.log('로그인 성공:', nickname);
      return true;
    } catch (error) {
      console.error('로그인 실패:', error);
      // 에러가 발생해도 강제로 성공 처리
      const userId = `user_${Date.now()}`;
      setUser({ 
        nickname, 
        id: userId
      });
      setCurrentNickname(nickname);
      
      // 미션 데이터 초기화 (에러가 발생해도)
      try {
        await initializeUserData(userId, nickname);
      } catch (initError) {
        console.error('데이터 초기화 실패:', initError);
      }
      
      return true;
    }
  };

  // 사용자 로그아웃
  const logout = async () => {
    try {
      // AsyncStorage에서 닉네임 제거
      if (currentNickname) {
        const storageKeys = getStorageKeys(currentNickname);
        await AsyncStorage.removeItem(storageKeys.USER_NICKNAME);
      }
      setUser(null);
      setCurrentNickname(null);
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  // 사용자 정보 새로고침
  const refreshUser = async () => {
    try {
      if (currentNickname) {
        const storageKeys = getStorageKeys(currentNickname);
        const nickname = await AsyncStorage.getItem(storageKeys.USER_NICKNAME);
        
        if (nickname) {
          setUser({ 
            nickname, 
            id: `user_${Date.now()}` 
          });
        }
      }
    } catch (error) {
      console.error('사용자 정보 새로고침 실패:', error);
    }
  };

  const value = {
    user,
    currentNickname,
    isLoggedIn: !!user,
    login,
    logout,
    refreshUser,
    isLoading,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
