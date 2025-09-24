import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { useCharacter } from '../hooks/useCharacter';
import { colors, spacing, typography, borderRadius, shadows } from '../utils/designTokens';

const CharacterDetailScreen = ({ route, navigation }) => {
  const { character } = route.params;
  const [currentEmotion, setCurrentEmotion] = useState('default');
  
  // 레벨별 캐릭터 이미지
  const getCharacterImage = (level, emotion = 'default') => {
    const levelFolder = `level${Math.min(level, 6)}`;
    switch (levelFolder) {
      case 'level1': 
        return emotion === 'happy' ? require('../assets/images/characters/level1/happy.png') :
               emotion === 'waving' ? require('../assets/images/characters/level1/waving.png') :
               require('../assets/images/characters/level1/default.png');
      case 'level2': 
        return emotion === 'happy' ? require('../assets/images/characters/level2/happy.png') :
               emotion === 'waving' ? require('../assets/images/characters/level2/waving.png') :
               require('../assets/images/characters/level2/default.png');
      case 'level3': 
        return emotion === 'happy' ? require('../assets/images/characters/level3/happy.png') :
               emotion === 'waving' ? require('../assets/images/characters/level3/waving.png') :
               require('../assets/images/characters/level3/default.png');
      case 'level4': 
        return emotion === 'happy' ? require('../assets/images/characters/level4/happy.png') :
               emotion === 'waving' ? require('../assets/images/characters/level4/waving.png') :
               require('../assets/images/characters/level4/default.png');
      case 'level5': 
        return emotion === 'happy' ? require('../assets/images/characters/level5/happy.png') :
               emotion === 'waving' ? require('../assets/images/characters/level5/waving.png') :
               require('../assets/images/characters/level5/default.png');
      case 'level6': 
        return emotion === 'happy' ? require('../assets/images/characters/level6/happy.png') :
               emotion === 'waving' ? require('../assets/images/characters/level6/waving.png') :
               require('../assets/images/characters/level6/default.png');
      default: 
        return require('../assets/images/characters/level1/default.png');
    }
  };

  // 레벨 이름 변환
  const getLevelName = (level) => {
    if (level >= 10) return '성숙한 나무';
    if (level >= 7) return '자라는 나무';
    if (level >= 4) return '새싹';
    return '씨앗';
  };

  // 카테고리 이름 변환
  const getCategoryName = (categoryId) => {
    const categoryNames = {
      'self_management': '자기관리',
      'communication': '소통관리',
      'career': '커리어관리'
    };
    return categoryNames[categoryId] || '알 수 없음';
  };

  // 카테고리 아이콘
  const getCategoryIcon = (categoryId) => {
    const categoryIcons = {
      'self_management': '🧘',
      'communication': '🏃',
      'career': '📚'
    };
    return categoryIcons[categoryId] || '❓';
  };

  // 감정 표현 버튼들
  const emotionButtons = [
    { key: 'default', label: '기본', emoji: '😐' },
    { key: 'happy', label: '기쁨', emoji: '😊' },
    { key: 'waving', label: '인사', emoji: '👋' }
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← 뒤로</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* 캐릭터 이미지 섹션 */}
        <View style={styles.characterSection}>
          <View style={styles.characterImageContainer}>
            <Image 
              source={getCharacterImage(character.level || 1, currentEmotion)}
              style={styles.characterImage}
              resizeMode="contain"
            />
          </View>
          
          {/* 감정 표현 버튼들 */}
          <View style={styles.emotionButtons}>
            {emotionButtons.map((emotion) => (
              <TouchableOpacity
                key={emotion.key}
                style={[
                  styles.emotionButton,
                  currentEmotion === emotion.key && styles.emotionButtonActive
                ]}
                onPress={() => setCurrentEmotion(emotion.key)}
              >
                <Text style={styles.emotionEmoji}>{emotion.emoji}</Text>
                <Text style={[
                  styles.emotionLabel,
                  currentEmotion === emotion.key && styles.emotionLabelActive
                ]}>
                  {emotion.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 캐릭터 정보 섹션 */}
        <View style={styles.infoSection}>
          <View style={styles.characterInfo}>
            <Text style={styles.characterName}>{character.name}</Text>
            <Text style={styles.characterTitle}>{character.title}</Text>
            <View style={styles.categoryContainer}>
              <Text style={styles.categoryIcon}>
                {getCategoryIcon(character.category_id)}
              </Text>
              <Text style={styles.categoryName}>
                {getCategoryName(character.category_id)}
              </Text>
            </View>
          </View>

          <View style={styles.levelInfo}>
            <Text style={styles.levelText}>Lv.{character.level || 1}</Text>
            <Text style={styles.levelName}>{getLevelName(character.level || 1)}</Text>
          </View>
        </View>

        {/* 경험치 정보 */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>📊 성장 정보</Text>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>현재 경험치</Text>
            <Text style={styles.statValue}>{character.experience || 0} EXP</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>다음 레벨까지</Text>
            <Text style={styles.statValue}>
              {100 - ((character.experience || 0) % 100)} EXP
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>총 미션 완료</Text>
            <Text style={styles.statValue}>{character.completed_missions || 0}개</Text>
          </View>
        </View>

        {/* 캐릭터 설명 */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>🌱 캐릭터 소개</Text>
          <Text style={styles.description}>
            {character.description || 
              `${getCategoryName(character.category_id)} 영역에서 성장하고 있는 캐릭터입니다. ` +
              `미션을 완료할 때마다 경험치를 얻고 레벨업할 수 있어요!`
            }
          </Text>
        </View>

        {/* 성장 팁 */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>💡 성장 팁</Text>
          <View style={styles.tipItem}>
            <Text style={styles.tipIcon}>🎯</Text>
            <Text style={styles.tipText}>
              {getCategoryName(character.category_id)} 관련 미션을 완료하면 더 많은 경험치를 얻을 수 있어요!
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipIcon}>📈</Text>
            <Text style={styles.tipText}>
              매일 꾸준히 미션을 완료하면 캐릭터가 빠르게 성장해요!
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipIcon}>🌟</Text>
            <Text style={styles.tipText}>
              레벨이 올라갈수록 더 멋진 캐릭터 모습을 볼 수 있어요!
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingTop: spacing[20],
    paddingBottom: spacing[6],
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    marginRight: spacing[4],
  },
  backButtonText: {
    fontSize: typography.fontSize.lg,
    color: colors.primary[500],
    fontWeight: typography.fontWeight.medium,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  content: {
    padding: spacing[5],
    paddingTop: spacing[6],
  },
  characterSection: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  characterImageContainer: {
    width: 160,
    height: 160,
    marginBottom: spacing[6],
    borderRadius: borderRadius.xl,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  characterImage: {
    width: '90%',
    height: '90%',
  },
  emotionButtons: {
    flexDirection: 'row',
    gap: spacing[2],
    paddingHorizontal: spacing[2],
  },
  emotionButton: {
    flex: 1,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[4],
    borderRadius: borderRadius.xl,
    backgroundColor: colors.background.primary,
    borderWidth: 2,
    borderColor: colors.border.light,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emotionButtonActive: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[400],
    shadowColor: colors.primary[400],
    shadowOpacity: 0.2,
    transform: [{ scale: 1.02 }],
  },
  emotionEmoji: {
    fontSize: typography.fontSize['2xl'],
    marginBottom: spacing[2],
  },
  emotionLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.semibold,
  },
  emotionLabelActive: {
    color: colors.primary[700],
    fontWeight: typography.fontWeight.bold,
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[8],
    padding: spacing[5],
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    ...shadows.base,
  },
  characterInfo: {
    flex: 1,
  },
  characterName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  characterTitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing[2],
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: typography.fontSize.lg,
    marginRight: spacing[2],
  },
  categoryName: {
    fontSize: typography.fontSize.base,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
  },
  levelInfo: {
    alignItems: 'flex-end',
  },
  levelText: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[500],
  },
  levelName: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  statsSection: {
    marginBottom: spacing[8],
    padding: spacing[5],
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    ...shadows.base,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[4],
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  statLabel: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  statValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  descriptionSection: {
    marginBottom: spacing[8],
    padding: spacing[5],
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    ...shadows.base,
  },
  description: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  tipsSection: {
    padding: spacing[5],
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    ...shadows.base,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing[4],
  },
  tipIcon: {
    fontSize: typography.fontSize.lg,
    marginRight: spacing[3],
    marginTop: spacing[1],
  },
  tipText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
});

export default CharacterDetailScreen;
