import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';

const CharacterCard = ({ 
  character, 
  onPress,
  selected = false,
  style 
}) => {
  if (!character) return null;

  const getLevelEmoji = (level) => {
    if (level >= 10) return '🌳';
    if (level >= 7) return '🌿';
    if (level >= 4) return '🌱';
    return '🌰';
  };

  const getLevelName = (level) => {
    if (level >= 10) return '성숙한 나무';
    if (level >= 7) return '자라는 나무';
    if (level >= 4) return '새싹';
    return '씨앗';
  };

  const experienceProgress = (character.experience || 0) % 100;
  const nextLevelExp = 100 - experienceProgress;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        selected && styles.selected,
        style
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.emoji}>{getLevelEmoji(character.level || 1)}</Text>
        <View style={styles.info}>
          <Text style={styles.name}>{character.name || '캐릭터'}</Text>
          <Text style={styles.level}>{getLevelName(character.level || 1)}</Text>
        </View>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressInfo}>
          <Text style={styles.levelText}>Lv.{character.level || 1}</Text>
          <Text style={styles.expText}>
            {experienceProgress}/100 EXP
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${experienceProgress}%` }
            ]} 
          />
        </View>
        <Text style={styles.nextLevelText}>
          다음 레벨까지 {nextLevelExp} EXP
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginVertical: spacing[2],
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.base,
  },
  
  selected: {
    borderColor: colors.primary[500],
    borderWidth: 2,
    backgroundColor: colors.primary[100],
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  
  emoji: {
    fontSize: 32,
    marginRight: spacing[3],
  },
  
  info: {
    flex: 1,
  },
  
  name: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  
  level: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  
  progressContainer: {
    marginTop: spacing[2],
  },
  
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[1],
  },
  
  levelText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[500],
  },
  
  expText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  
  progressBar: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    marginBottom: spacing[1],
  },
  
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.sm,
  },
  
  nextLevelText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});

export default CharacterCard;

