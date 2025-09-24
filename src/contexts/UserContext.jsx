import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getCurrentUserNickname, 
  createUserWithNickname, 
  checkNicknameDuplicate,
  getCurrentUserId,
  logoutUser 
} from '../services/supabase';

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
      const nickname = await getCurrentUserNickname();
      const userId = await getCurrentUserId();
      
      if (nickname) {
        setUser({ 
          nickname, 
          id: userId 
        });
      }
    } catch (error) {
      console.error('사용자 정보 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 사용자 로그인 (닉네임 중복 확인 포함)
  const login = async (nickname) => {
    try {
      // 닉네임 중복 확인
      const isDuplicate = await checkNicknameDuplicate(nickname);
      if (isDuplicate) {
        throw new Error('이미 사용 중인 닉네임입니다.');
      }

      // 사용자 생성
      const userData = await createUserWithNickname(nickname);
      if (!userData) {
        throw new Error('사용자 생성에 실패했습니다.');
      }

      setUser({ 
        nickname, 
        id: userData.id || userData 
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
      await logoutUser();
      setUser(null);
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  // 사용자 정보 새로고침
  const refreshUser = async () => {
    try {
      const nickname = await getCurrentUserNickname();
      const userId = await getCurrentUserId();
      
      if (nickname) {
        setUser({ 
          nickname, 
          id: userId 
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
