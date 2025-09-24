/**
 * Replant Mobile Design Tokens
 * React Native용 디자인 시스템
 */

export const colors = {
  // Primary brand colors
  primary: {
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // 메인 색상
    600: '#16a34a',
  },
  
  // Neutral grays
  gray: {
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    900: '#111827',
  },
  
  // Semantic colors
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Background colors
  background: {
    primary: '#ffffff',
    secondary: '#f8f9fa',
    tertiary: '#f3f4f6',
  },
  
  // Text colors
  text: {
    primary: '#111827',
    secondary: '#6b7280',
    tertiary: '#9ca3af',
    inverse: '#ffffff',
  },
  
  // Border colors
  border: {
    light: '#e5e7eb',
    medium: '#d1d5db',
    dark: '#9ca3af',
  },
  
  // Emotion colors
  emotions: {
    happy: '#b45309',
    excited: '#c2410c',
    calm: '#0e7490',
    grateful: '#7c3aed',
    sad: '#6b7280',
    angry: '#dc2626',
    anxious: '#b45309',
    tired: '#64748b',
  },
};

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
};

export const typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const borderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
};

export const components = {
  button: {
    height: {
      sm: 32,
      base: 40,
      lg: 48,
    },
    padding: {
      sm: { horizontal: 12, vertical: 8 },
      base: { horizontal: 16, vertical: 12 },
      lg: { horizontal: 20, vertical: 16 },
    },
  },
  input: {
    height: {
      sm: 32,
      base: 40,
      lg: 48,
    },
    padding: {
      horizontal: 12,
      vertical: 8,
    },
  },
  card: {
    padding: {
      sm: 12,
      base: 16,
      lg: 20,
    },
  },
};

