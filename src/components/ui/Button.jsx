/**
 * 재사용 가능한 버튼 컴포넌트
 * 다양한 스타일과 크기를 지원하는 버튼
 * 
 * @param {string} title - 버튼 텍스트
 * @param {Function} onPress - 클릭 이벤트 핸들러
 * @param {string} variant - 버튼 스타일 ('primary' | 'secondary' | 'outline')
 * @param {string} size - 버튼 크기 ('sm' | 'base' | 'lg')
 * @param {boolean} disabled - 비활성화 상태
 * @param {boolean} loading - 로딩 상태
 * @param {Object} style - 추가 스타일
 * @param {Object} textStyle - 텍스트 스타일
 * @param {Object} props - 기타 props
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';

const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'base', 
  disabled = false, 
  loading = false,
  style,
  textStyle,
  ...props 
}) => {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size === 'base' ? 'baseSize' : size],
    disabled && styles.disabled,
    style,
  ];

  const textStyleCombined = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' ? colors.text.inverse : colors.primary[500]} 
          size="small" 
        />
      ) : (
        <Text style={textStyleCombined}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.base,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  
  // Variants
  primary: {
    backgroundColor: colors.primary[500],
  },
  secondary: {
    backgroundColor: colors.gray[200],
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  
  // Sizes
  sm: {
    height: 32,
    paddingHorizontal: spacing[3],
  },
  baseSize: {
    height: 40,
    paddingHorizontal: spacing[4],
  },
  lg: {
    height: 48,
    paddingHorizontal: spacing[5],
  },
  
  // States
  disabled: {
    backgroundColor: colors.gray[300],
    borderColor: colors.gray[300],
  },
  
  // Text styles
  text: {
    fontWeight: typography.fontWeight.medium,
  },
  primaryText: {
    color: colors.text.inverse,
  },
  secondaryText: {
    color: colors.text.primary,
  },
  outlineText: {
    color: colors.primary[500],
  },
  ghostText: {
    color: colors.primary[500],
  },
  
  // Text sizes
  smText: {
    fontSize: typography.fontSize.sm,
  },
  baseText: {
    fontSize: typography.fontSize.base,
  },
  lgText: {
    fontSize: typography.fontSize.lg,
  },
  
  disabledText: {
    color: colors.text.tertiary,
  },
});

export default Button;

