import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const [isLoading, setIsLoading] = useState(true);

  // 사용자 정보 로드
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const nickname = await AsyncStorage.getItem('userNickname');
      
      if (nickname) {
        setUser({ 
          nickname, 
          id: `user_${Date.now()}` 
        });
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
      // 닉네임을 로컬 스토리지에 저장
      await AsyncStorage.setItem('userNickname', nickname);
      
      // 사용자 상태 업데이트
      setUser({ 
        nickname, 
        id: `user_${Date.now()}` // 임시 ID 생성
      });
      
      return true;
    } catch (error) {
      console.error('로그인 실패:', error);
      throw error;
    }
  };

  // 사용자 로그아웃
  const logout = async () => {
    try {
      // AsyncStorage에서 닉네임 제거
      await AsyncStorage.removeItem('userNickname');
      setUser(null);
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  // 사용자 정보 새로고침
  const refreshUser = async () => {
    try {
      const nickname = await AsyncStorage.getItem('userNickname');
      
      if (nickname) {
        setUser({ 
          nickname, 
          id: `user_${Date.now()}` 
        });
      }
    } catch (error) {
      console.error('사용자 정보 새로고침 실패:', error);
    }
  };

  const value = {
    user,
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
