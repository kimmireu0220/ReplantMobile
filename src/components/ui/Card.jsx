import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../utils/designTokens';

const Card = ({ 
  children, 
  variant = 'base', 
  padding = 'base',
  style,
  ...props 
}) => {
  const cardStyle = [
    styles.base,
    styles[variant],
    styles[`padding${padding.charAt(0).toUpperCase() + padding.slice(1)}`],
    style,
  ];

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    ...shadows.base,
  },
  
  // Variants
  elevated: {
    ...shadows.lg,
  },
  flat: {
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  
  // Padding variants
  paddingSm: {
    padding: spacing[3],
  },
  paddingBase: {
    padding: spacing[4],
  },
  paddingLg: {
    padding: spacing[6],
  },
});

export default Card;

