import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME } from '../utils/constants';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(THEME.LIGHT);
  const [isLoading, setIsLoading] = useState(true);

  // 테마 로드
  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.error('테마 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 테마 변경
  const toggleTheme = async () => {
    try {
      const newTheme = theme === THEME.LIGHT ? THEME.DARK : THEME.LIGHT;
      setTheme(newTheme);
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('테마 저장 실패:', error);
    }
  };

  // 테마 설정
  const setThemeMode = async (newTheme) => {
    try {
      setTheme(newTheme);
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('테마 설정 실패:', error);
    }
  };

  const value = {
    theme,
    isDark: theme === THEME.DARK,
    toggleTheme,
    setTheme: setThemeMode,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

