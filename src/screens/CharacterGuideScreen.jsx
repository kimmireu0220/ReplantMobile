import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useCharacter } from '../hooks/useCharacter';
import { colors, spacing, typography, borderRadius, shadows } from '../utils/designTokens';

const CharacterGuideScreen = () => {
  const { characters, loading, error } = useCharacter();
  const [selectedCategory, setSelectedCategory] = useState('all');

  // 카테고리별 캐릭터 필터링
  const getFilteredCharacters = () => {
    if (selectedCategory === 'all') {
      return characters;
    }
    return characters.filter(char => char.category_id === selectedCategory);
  };

  // 레벨별 캐릭터 이미지
  const getCharacterImage = (level) => {
    const levelFolder = `level${Math.min(level, 6)}`;
    switch (levelFolder) {
      case 'level1': return require('../assets/images/characters/level1/default.png');
      case 'level2': return require('../assets/images/characters/level2/default.png');
      case 'level3': return require('../assets/images/characters/level3/default.png');
      case 'level4': return require('../assets/images/characters/level4/default.png');
      case 'level5': return require('../assets/images/characters/level5/default.png');
      case 'level6': return require('../assets/images/characters/level6/default.png');
      default: return require('../assets/images/characters/level1/default.png');
    }
  };

  // 레벨 이름 변환
  const getLevelName = (level) => {
    if (level >= 10) return '성숙한 나무';
    if (level >= 7) return '자라는 나무';
    if (level >= 4) return '새싹';
    return '씨앗';
  };

  // 카테고리 이름 변환 (3개 카테고리로 축소)
  const getCategoryName = (categoryId) => {
    const categoryNames = {
      'self_management': '자기관리',
      'communication': '소통관리',
      'career': '커리어관리'
    };
    return categoryNames[categoryId] || '알 수 없음';
  };

  // 카테고리 아이콘 (3개 카테고리로 축소)
  const getCategoryIcon = (categoryId) => {
    const categoryIcons = {
      'self_management': '🧘',
      'communication': '🏃',
      'career': '📚'
    };
    return categoryIcons[categoryId] || '❓';
  };

  // 전체 통계 계산
  const getTotalStats = () => {
    const totalCharacters = characters.length;
    const totalLevel = characters.reduce((sum, char) => sum + (char.level || 1), 0);
    const totalExperience = characters.reduce((sum, char) => sum + (char.total_experience || 0), 0);
    const maxLevel = Math.max(...characters.map(char => char.level || 1), 0);
    
    return { totalCharacters, totalLevel, totalExperience, maxLevel };
  };

  const stats = getTotalStats();
  const filteredCharacters = getFilteredCharacters();

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.secondary }]}>
        <View style={[styles.header, { backgroundColor: colors.background.primary }]} />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text.secondary }]}>캐릭터 정보를 불러오는 중...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.secondary }]}>
        <View style={[styles.header, { backgroundColor: colors.background.primary }]} />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text.secondary }]}>캐릭터 정보를 불러올 수 없습니다.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background.secondary }]}>
      <View style={[styles.header, { backgroundColor: colors.background.primary, borderBottomColor: colors.border.light }]} />
      
      <ScrollView style={styles.content}>
        {/* 전체 통계 */}
        <View style={[styles.statsCard, { backgroundColor: colors.background.primary, borderColor: colors.border.light }]}>
          <Text style={[styles.statsTitle, { color: colors.text.primary }]}>📊 전체 통계</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary[500] }]}>{stats.totalCharacters}</Text>
              <Text style={[styles.statLabel, { color: colors.text.secondary }]}>보유 캐릭터</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary[500] }]}>{stats.maxLevel}</Text>
              <Text style={[styles.statLabel, { color: colors.text.secondary }]}>최고 레벨</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary[500] }]}>{stats.totalLevel}</Text>
              <Text style={[styles.statLabel, { color: colors.text.secondary }]}>총 레벨</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary[500] }]}>{stats.totalExperience.toLocaleString()}</Text>
              <Text style={[styles.statLabel, { color: colors.text.secondary }]}>총 경험치</Text>
            </View>
          </View>
        </View>

        {/* 카테고리 필터 */}
        <View style={[styles.filterCard, { backgroundColor: colors.background.primary, borderColor: colors.border.light }]}>
          <Text style={[styles.filterTitle, { color: colors.text.primary }]}>🔍 카테고리</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                { backgroundColor: colors.background.secondary, borderColor: colors.border.medium },
                selectedCategory === 'all' && { backgroundColor: colors.primary[500], borderColor: colors.primary[500] }
              ]}
              onPress={() => setSelectedCategory('all')}
            >
              <Text style={[
                styles.filterText,
                { color: colors.text.primary },
                selectedCategory === 'all' && { color: colors.text.inverse }
              ]}>
                🌟 전체
              </Text>
            </TouchableOpacity>
            
            {['self_management', 'communication', 'career'].map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.filterButton,
                  { backgroundColor: colors.background.secondary, borderColor: colors.border.medium },
                  selectedCategory === category && { backgroundColor: colors.primary[500], borderColor: colors.primary[500] }
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.filterText,
                  { color: colors.text.primary },
                  selectedCategory === category && { color: colors.text.inverse }
                ]}>
                  {getCategoryIcon(category)} {getCategoryName(category)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 캐릭터 목록 */}
        <View style={styles.charactersSection}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            {selectedCategory === 'all' ? '🌟 모든 캐릭터' : `${getCategoryIcon(selectedCategory)} ${getCategoryName(selectedCategory)} 캐릭터`}
          </Text>
          
          {filteredCharacters.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.background.primary, borderColor: colors.border.light }]}>
              <Text style={[styles.emptyIcon, { color: colors.text.tertiary }]}>📝</Text>
              <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>캐릭터가 없어요</Text>
              <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
                {selectedCategory === 'all' 
                  ? '아직 캐릭터가 없습니다.' 
                  : `${getCategoryName(selectedCategory)} 카테고리의 캐릭터가 없습니다.`
                }
              </Text>
            </View>
          ) : (
            filteredCharacters.map((character) => (
              <View key={character.id} style={[styles.characterCard, { backgroundColor: colors.background.primary, borderColor: colors.border.light }]}>
                <View style={styles.characterHeader}>
                  <View style={styles.characterImageContainer}>
                    <Image 
                      source={getCharacterImage(character.level || 1)}
                      style={styles.characterImage}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.characterInfo}>
                    <Text style={[styles.characterName, { color: colors.text.primary }]}>{character.name}</Text>
                    <Text style={[styles.characterTitle, { color: colors.text.secondary }]}>{character.title}</Text>
                    <Text style={[styles.characterCategory, { color: colors.primary[500] }]}>
                      {getCategoryIcon(character.category_id)} {getCategoryName(character.category_id)}
                    </Text>
                  </View>
                  <View style={styles.characterLevel}>
                    <Text style={[styles.levelText, { color: colors.primary[500] }]}>Lv.{character.level || 1}</Text>
                    <Text style={[styles.levelName, { color: colors.text.secondary }]}>{getLevelName(character.level || 1)}</Text>
                  </View>
                </View>
                
                <View style={styles.characterStats}>
                  <View style={styles.statRow}>
                    <Text style={[styles.characterStatLabel, { color: colors.text.secondary }]}>현재 경험치</Text>
                    <Text style={[styles.statValue, { color: colors.text.primary }]}>
                      {(character.experience || 0).toLocaleString()} EXP
                    </Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={[styles.characterStatLabel, { color: colors.text.secondary }]}>총 경험치</Text>
                    <Text style={[styles.statValue, { color: colors.text.primary }]}>
                      {(character.total_experience || 0).toLocaleString()} EXP
                    </Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={[styles.characterStatLabel, { color: colors.text.secondary }]}>해제일</Text>
                    <Text style={[styles.statValue, { color: colors.text.primary }]}>
                      {character.unlocked_date ? new Date(character.unlocked_date).toLocaleDateString('ko-KR') : '알 수 없음'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBar, { backgroundColor: colors.background.secondary }]}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { backgroundColor: colors.primary[500], width: `${((character.experience || 0) % 1000) / 10}%` }
                      ]} 
                    />
                  </View>
                  <Text style={[styles.progressText, { color: colors.text.tertiary }]}>
                    다음 레벨까지 {1000 - ((character.experience || 0) % 1000)} EXP
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing[5],
    paddingTop: 60,
    paddingBottom: spacing[5],
    borderBottomWidth: 1,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
  },
  content: {
    flex: 1,
    padding: spacing[5],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.base,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: typography.fontSize.base,
  },
  statsCard: {
    padding: spacing[5],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing[5],
    ...shadows.base,
  },
  statsTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing[4],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  statNumber: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing[1],
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
  },
  filterCard: {
    padding: spacing[5],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing[5],
    ...shadows.base,
  },
  filterTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing[3],
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginRight: spacing[2],
  },
  filterText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  charactersSection: {
    marginBottom: spacing[5],
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing[4],
  },
  emptyCard: {
    padding: spacing[8],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing[4],
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing[2],
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  characterCard: {
    padding: spacing[5],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing[4],
    ...shadows.base,
  },
  characterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  characterImageContainer: {
    width: 60,
    height: 60,
    marginRight: spacing[3],
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  characterImage: {
    width: '100%',
    height: '100%',
  },
  characterInfo: {
    flex: 1,
  },
  characterName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing[1],
  },
  characterTitle: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing[1],
  },
  characterCategory: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  characterLevel: {
    alignItems: 'center',
  },
  levelText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  levelName: {
    fontSize: typography.fontSize.sm,
  },
  characterStats: {
    marginBottom: spacing[4],
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  characterStatLabel: {
    fontSize: typography.fontSize.sm,
  },
  statValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  progressContainer: {
    marginTop: spacing[2],
  },
  progressBar: {
    height: 8,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    marginBottom: spacing[1],
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.sm,
  },
  progressText: {
    fontSize: typography.fontSize.xs,
    textAlign: 'right',
  },
});

export default CharacterGuideScreen;
