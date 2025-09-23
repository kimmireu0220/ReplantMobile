/**
 * Replant Theme Utilities
 * 기존 코드와의 호환성을 보장하는 테마 관련 유틸리티 함수들
 */

import { tokens } from '../design/tokens';

/**
 * CSS 변수명을 생성하는 함수
 * @param {string} colorPath - tokens.js의 색상 경로 (예: 'colors.primary.500')
 * @returns {string} CSS 변수명 (예: 'var(--color-primary-500)')
 */
export const getCSSVariable = (colorPath) => {
  if (!colorPath) return '';
  
  try {
    // tokens.js 경로를 CSS 변수명으로 변환
    const variable = colorPath
      .replace('colors.', '--color-')
      .replace(/\./g, '-')
      .toLowerCase();
    
    return `var(${variable})`;
  } catch (error) {
    console.warn('[themeUtils] CSS variable generation failed:', colorPath, error);
    return '';
  }
};

/**
 * tokens.js의 색상 값과 CSS 변수를 매핑하는 함수
 * 기존 코드 호환성을 위해 tokens 값을 fallback으로 사용
 * @param {string} colorPath - tokens.js의 색상 경로
 * @returns {string} CSS 변수 또는 fallback 값
 */
export const getThemeColor = (colorPath) => {
  if (!colorPath) return '';
  
  try {
    // tokens.js에서 fallback 값 추출
    const pathArray = colorPath.split('.');
    let fallbackValue = tokens;
    
    for (const key of pathArray) {
      if (fallbackValue && typeof fallbackValue === 'object') {
        fallbackValue = fallbackValue[key];
      } else {
        fallbackValue = null;
        break;
      }
    }
    
    // CSS 변수명 생성
    const cssVariable = getCSSVariable(colorPath);
    
    // CSS 변수가 있으면 fallback과 함께 반환, 없으면 tokens 값만 반환
    if (cssVariable && fallbackValue) {
      return `${cssVariable}, ${fallbackValue}`;
    } else if (fallbackValue) {
      return fallbackValue;
    }
    
    return '';
  } catch (error) {
    console.warn('[themeUtils] Theme color resolution failed:', colorPath, error);
    return '';
  }
};

/**
 * 기존 스타일 객체를 테마 지원 스타일로 변환하는 함수
 * @param {Object} styles - 기존 스타일 객체
 * @param {Object} themeMapping - 색상 필드와 tokens 경로의 매핑
 * @returns {Object} 테마를 지원하는 스타일 객체
 */
export const convertToThemeStyles = (styles, themeMapping = {}) => {
  if (!styles || typeof styles !== 'object') return styles;
  
  try {
    const themeStyles = { ...styles };
    
    // 색상 관련 필드들을 CSS 변수로 변환
    Object.entries(themeMapping).forEach(([styleKey, colorPath]) => {
      if (styles[styleKey]) {
        const themeColor = getThemeColor(colorPath);
        if (themeColor) {
          themeStyles[styleKey] = themeColor;
        }
      }
    });
    
    return themeStyles;
  } catch (error) {
    console.warn('[themeUtils] Style conversion failed:', error);
    return styles;
  }
};

/**
 * 테마별 클래스명을 생성하는 함수
 * @param {string} baseClass - 기본 클래스명
 * @param {string} themeVariant - 테마 변형 (예: 'primary', 'secondary')
 * @returns {string} 테마 지원 클래스명
 */
export const getThemeClassName = (baseClass, themeVariant = '') => {
  if (!baseClass) return '';
  
  try {
    let className = baseClass;
    
    if (themeVariant) {
      className += ` theme-${themeVariant}`;
    }
    
    return className;
  } catch (error) {
    console.warn('[themeUtils] Theme class generation failed:', error);
    return baseClass;
  }
};

/**
 * 현재 테마에 따른 조건부 값 반환 함수
 * @param {string} currentTheme - 현재 테마 ('light' | 'dark')
 * @param {any} lightValue - 라이트 테마 값
 * @param {any} darkValue - 다크 테마 값
 * @returns {any} 테마에 따른 값
 */
export const getThemeValue = (currentTheme, lightValue, darkValue) => {
  try {
    return currentTheme === 'dark' ? darkValue : lightValue;
  } catch (error) {
    console.warn('[themeUtils] Theme value selection failed:', error);
    return lightValue;
  }
};

/**
 * 감정 색상을 테마에 맞게 반환하는 함수
 * @param {string} emotion - 감정 키 (예: 'happy', 'sad')
 * @returns {string} CSS 변수 또는 fallback 색상
 */
export const getEmotionColor = (emotion) => {
  if (!emotion) return '';
  
  try {
    const colorPath = `colors.emotions.${emotion}`;
    return getThemeColor(colorPath);
  } catch (error) {
    console.warn('[themeUtils] Emotion color resolution failed:', emotion, error);
    return '';
  }
};

/**
 * 카테고리 액센트 색상을 테마에 맞게 반환하는 함수
 * @param {string} accent - 액센트 키 (예: 'red', 'blue')
 * @returns {string} CSS 변수 또는 fallback 색상
 */
export const getAccentColor = (accent) => {
  if (!accent) return '';
  
  try {
    const colorPath = `colors.accent.${accent}`;
    return getThemeColor(colorPath);
  } catch (error) {
    console.warn('[themeUtils] Accent color resolution failed:', accent, error);
    return '';
  }
};

/**
 * 브라우저에서 CSS 변수 값을 읽는 함수
 * @param {string} variableName - CSS 변수명 (예: '--color-primary-500')
 * @param {Element} element - 대상 요소 (기본값: document.documentElement)
 * @returns {string} CSS 변수 값
 */
export const getCSSVariableValue = (variableName, element = null) => {
  try {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return '';
    }
    
    const targetElement = element || document.documentElement;
    const value = getComputedStyle(targetElement)
      .getPropertyValue(variableName)
      .trim();
    
    return value;
  } catch (error) {
    console.warn('[themeUtils] CSS variable value reading failed:', variableName, error);
    return '';
  }
};

/**
 * 기존 컴포넌트의 인라인 스타일을 테마 지원 스타일로 변환하는 헬퍼
 * @param {Object} inlineStyles - 기존 인라인 스타일
 * @returns {Object} 테마를 지원하는 인라인 스타일
 */
export const themeifyInlineStyles = (inlineStyles) => {
  if (!inlineStyles || typeof inlineStyles !== 'object') return inlineStyles;
  
  try {
    const themeStyles = { ...inlineStyles };
    
    // 자주 사용되는 색상 속성들을 CSS 변수로 자동 변환
    const colorProperties = {
      backgroundColor: {
        '#ffffff': 'var(--color-background-primary)',
        '#f9fafb': 'var(--color-background-secondary)',
        '#f3f4f6': 'var(--color-background-tertiary)',
        '#f5f5f5': 'var(--color-background-body)',
      },
      color: {
        '#333333': 'var(--color-text-primary)',
        '#333': 'var(--color-text-primary)',
        '#6b7280': 'var(--color-text-secondary)',
        '#9ca3af': 'var(--color-text-tertiary)',
        '#ffffff': 'var(--color-text-inverse)',
        '#fff': 'var(--color-text-inverse)',
      },
      borderColor: {
        '#e5e7eb': 'var(--color-border-light)',
        '#d1d5db': 'var(--color-border-medium)',
        '#9ca3af': 'var(--color-border-dark)',
      }
    };
    
    // 색상 속성들을 CSS 변수로 변환
    Object.entries(colorProperties).forEach(([property, colorMap]) => {
      if (themeStyles[property] && colorMap[themeStyles[property]]) {
        themeStyles[property] = colorMap[themeStyles[property]];
      }
    });
    
    return themeStyles;
  } catch (error) {
    console.warn('[themeUtils] Inline style conversion failed:', error);
    return inlineStyles;
  }
};

/**
 * 테마 전환 시 부드러운 애니메이션을 적용하는 함수
 * @param {Element} element - 애니메이션을 적용할 요소
 * @param {number} duration - 애니메이션 지속시간 (ms)
 */
export const applyThemeTransition = (element = null, duration = 200) => {
  try {
    const targetElement = element || document.documentElement;
    
    const originalTransition = targetElement.style.transition;
    targetElement.style.transition = `all ${duration}ms ease-in-out`;
    
    // 애니메이션 완료 후 원래 transition 복원
    setTimeout(() => {
      targetElement.style.transition = originalTransition;
    }, duration);
  } catch (error) {
    console.warn('[themeUtils] Theme transition application failed:', error);
  }
};

// 기본 색상 매핑 (자주 사용되는 패턴들)
export const commonColorMappings = {
  // 버튼 스타일링
  button: {
    backgroundColor: 'colors.primary.500',
    color: 'colors.text.inverse',
    borderColor: 'colors.primary.600',
  },
  // 카드 스타일링
  card: {
    backgroundColor: 'colors.background.primary',
    color: 'colors.text.primary',
    borderColor: 'colors.border.light',
  },
  // 입력 필드 스타일링
  input: {
    backgroundColor: 'colors.background.primary',
    color: 'colors.text.primary',
    borderColor: 'colors.border.medium',
  },
  // 텍스트 스타일링
  text: {
    primary: 'colors.text.primary',
    secondary: 'colors.text.secondary',
    tertiary: 'colors.text.tertiary',
  }
};