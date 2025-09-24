import React, { useState } from 'react';
import { TextInput, View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';

const Input = ({ 
  label,
  placeholder,
  value,
  onChangeText,
  error,
  size = 'base',
  multiline = false,
  numberOfLines = 1,
  style,
  inputStyle,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const containerStyle = [
    styles.container,
    isFocused && styles.focused,
    error && styles.error,
    style,
  ];

  const inputStyleCombined = [
    styles.input,
    styles[size],
    multiline && styles.multiline,
    inputStyle,
  ];

  return (
    <View style={containerStyle}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={inputStyleCombined}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        multiline={multiline}
        numberOfLines={numberOfLines}
        placeholderTextColor={colors.text.tertiary}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
  },
  
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  
  input: {
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: borderRadius.base,
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing[3],
    color: colors.text.primary,
    fontSize: typography.fontSize.base,
  },
  
  // Sizes
  sm: {
    height: 32,
    paddingVertical: spacing[1],
  },
  base: {
    height: 40,
    paddingVertical: spacing[2],
  },
  lg: {
    height: 48,
    paddingVertical: spacing[3],
  },
  
  // States
  focused: {
    borderColor: colors.primary[500],
  },
  
  error: {
    borderColor: colors.error,
  },
  
  multiline: {
    height: 'auto',
    minHeight: 40,
    textAlignVertical: 'top',
  },
  
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    marginTop: spacing[1],
  },
});

export default Input;

