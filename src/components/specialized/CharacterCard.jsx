import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';

const CharacterCard = ({ 
  character, 
  onPress,
  selected = false,
  style 
}) => {
  if (!character) return null;


  const getLevelName = (level) => {
    if (level >= 10) return '성숙한 나무';
    if (level >= 7) return '자라는 나무';
    if (level >= 4) return '새싹';
    return '씨앗';
  };

  // 캐릭터 이미지 미리 import
  const characterImages = {
    level1: require('../../assets/images/characters/level1/default.png'),
    level2: require('../../assets/images/characters/level2/default.png'),
    level3: require('../../assets/images/characters/level3/default.png'),
    level4: require('../../assets/images/characters/level4/default.png'),
    level5: require('../../assets/images/characters/level5/default.png'),
    level6: require('../../assets/images/characters/level6/default.png'),
  };

  // 캐릭터 이미지 경로 생성
  const getCharacterImage = (level) => {
    const levelKey = `level${Math.min(level, 6)}`;
    return characterImages[levelKey] || characterImages.level1;
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
        <View style={styles.characterImageContainer}>
          <Image 
            source={getCharacterImage(character.level || 1)}
            style={styles.characterImage}
            resizeMode="contain"
          />
        </View>
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
  
  characterImageContainer: {
    width: 60,
    height: 60,
    marginRight: spacing[3],
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.background.secondary,
  },
  
  characterImage: {
    width: '100%',
    height: '100%',
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

