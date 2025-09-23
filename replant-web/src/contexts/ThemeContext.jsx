import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  actualTheme: 'light',
  toggleTheme: () => {},
  setTheme: () => {}
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  // Context가 없어도 기본값으로 동작 (기존 코드 호환성 보장)
  if (!context) {
    return {
      theme: 'light',
      actualTheme: 'light',
      toggleTheme: () => {},
      setTheme: () => {}
    };
  }
  
  return context;
};

// 안전한 localStorage 접근 함수
const safeGetStorageItem = (key, fallback) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key) || fallback;
    }
  } catch (error) {
    console.warn('[ThemeContext] localStorage access failed:', error);
  }
  return fallback;
};

const safeSetStorageItem = (key, value) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value);
    }
  } catch (error) {
    console.warn('[ThemeContext] localStorage write failed:', error);
  }
};

// 시스템 테마 감지 함수
const getSystemTheme = () => {
  try {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
  } catch (error) {
    console.warn('[ThemeContext] System theme detection failed:', error);
  }
  return 'light';
};

export const ThemeProvider = ({ children }) => {
  // 기본값을 'light'로 설정하여 기존 동작과 동일하게 유지
  const [theme, setThemeState] = useState(() => {
    const stored = safeGetStorageItem('replant-theme', 'light');
    // 유효한 테마 값인지 검증
    return ['light', 'dark', 'system'].includes(stored) ? stored : 'light';
  });

  const [systemTheme, setSystemTheme] = useState(getSystemTheme);

  // 실제 적용될 테마 계산
  const actualTheme = theme === 'system' ? systemTheme : theme;

  // 시스템 테마 변경 감지
  useEffect(() => {
    let mediaQuery;
    
    try {
      if (typeof window !== 'undefined' && window.matchMedia) {
        mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const handleSystemThemeChange = (e) => {
          setSystemTheme(e.matches ? 'dark' : 'light');
        };
        
        // 최신 브라우저와 이전 브라우저 모두 지원
        if (mediaQuery.addEventListener) {
          mediaQuery.addEventListener('change', handleSystemThemeChange);
        } else if (mediaQuery.addListener) {
          mediaQuery.addListener(handleSystemThemeChange);
        }
        
        return () => {
          if (mediaQuery.removeEventListener) {
            mediaQuery.removeEventListener('change', handleSystemThemeChange);
          } else if (mediaQuery.removeListener) {
            mediaQuery.removeListener(handleSystemThemeChange);
          }
        };
      }
    } catch (error) {
      console.warn('[ThemeContext] System theme listener setup failed:', error);
    }
  }, []);

  // DOM에 테마 속성 적용
  useEffect(() => {
    try {
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', actualTheme);
        
        // 기존 코드와의 호환성을 위해 class도 추가
        if (actualTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    } catch (error) {
      console.warn('[ThemeContext] DOM theme application failed:', error);
    }
  }, [actualTheme]);

  const setTheme = (newTheme) => {
    // 유효한 테마 값인지 검증
    if (!['light', 'dark', 'system'].includes(newTheme)) {
      console.warn('[ThemeContext] Invalid theme value:', newTheme);
      return;
    }
    
    setThemeState(newTheme);
    safeSetStorageItem('replant-theme', newTheme);
  };

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  };

  const contextValue = {
    theme,
    actualTheme,
    toggleTheme,
    setTheme
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;