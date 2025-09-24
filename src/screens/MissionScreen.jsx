import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useMission } from '../hooks/useMission';
import { useCharacter } from '../hooks/useCharacter';
import { MissionCard } from '../components/specialized';
import { Card, Loading, ErrorBoundary } from '../components/ui';
import { colors, spacing, typography } from '../utils/designTokens';

const MISSION_CATEGORIES = [
  { id: 'all', name: '전체', emoji: '🎯' },
  { id: 'self_management', name: '자기관리', emoji: '🧘' },
  { id: 'communication', name: '소통관리', emoji: '🏃‍♂️' },
  { id: 'career', name: '커리어관리', emoji: '📚' },
];

const MissionScreen = () => {
  const { addExperienceByCategory } = useCharacter();
  const { missions, loading, error, completeMissionWithPhoto, uncompleteMission } = useMission(addExperienceByCategory);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // 필터링된 미션 목록
  const filteredMissions = selectedCategory === 'all' 
    ? missions 
    : missions.filter(mission => mission.category === selectedCategory);

  // 진행률 계산
  const completedMissions = missions.filter(mission => mission.completed).length;
  const totalMissions = missions.length;
  const progressPercentage = totalMissions > 0 ? (completedMissions / totalMissions) * 100 : 0;

  const handleMissionComplete = async (missionId) => {
    try {
      // 사진 없이 미션 완료 (Phase 4 상태)
      const result = await completeMissionWithPhoto(missionId, null);
      
      if (result && result.success) {
        if (result.levelUp) {
          Alert.alert(
            '🎉 레벨업!',
            `축하합니다! 레벨 ${result.newLevel}이 되었습니다!`,
            [{ text: '확인' }]
          );
        } else {
          Alert.alert(
            '✅ 미션 완료',
            `+${result.experience || 50} EXP를 획득했습니다!`,
            [{ text: '확인' }]
          );
        }
      }
    } catch (completeError) {
      Alert.alert('오류', '미션 완료에 실패했습니다.');
    }
  };

  const handleMissionUncomplete = async (missionId) => {
    try {
      await uncompleteMission(missionId);
    } catch (uncompleteError) {
      Alert.alert('오류', '미션 완료 취소에 실패했습니다.');
    }
  };

  if (loading) {
    return <Loading text="미션을 불러오는 중..." />;
  }

  if (error) {
    return <ErrorBoundary error={error} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header} />
      
      <ScrollView style={styles.content}>
        {/* 진행률 표시 */}
        {totalMissions > 0 && (
          <Card style={styles.progressCard}>
            <Text style={styles.progressTitle}>진행률</Text>
            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>
                {completedMissions}개 완료 / {totalMissions}개
              </Text>
              <Text style={styles.progressPercentage}>
                {Math.round(progressPercentage)}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${progressPercentage}%` }
                ]} 
              />
            </View>
          </Card>
        )}

        {/* 카테고리 필터 */}
        <View style={styles.categorySection}>
          <Text style={styles.sectionTitle}>카테고리</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          >
            {MISSION_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.selectedCategory
                ]}
                onPress={() => setSelectedCategory(category.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                <Text style={[
                  styles.categoryName,
                  selectedCategory === category.id && styles.selectedCategoryText
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 미션 목록 */}
        <View style={styles.missionSection}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'all' ? '전체 미션' : `${MISSION_CATEGORIES.find(c => c.id === selectedCategory)?.name} 미션`}
          </Text>
          
          {filteredMissions.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>
                {selectedCategory === 'all' ? '🎯' : '📚'}
              </Text>
              <Text style={styles.emptyTitle}>
                {selectedCategory === 'all' 
                  ? '아직 미션이 없어요' 
                  : '이 카테고리의 미션이 없어요'}
              </Text>
              <Text style={styles.emptyText}>
                {selectedCategory === 'all'
                  ? '새로운 미션이 곧 추가될 예정입니다!'
                  : '다른 카테고리의 미션을 확인해보세요!'}
              </Text>
            </Card>
          ) : (
            filteredMissions.map((mission, index) => (
              <MissionCard
                key={`${mission.mission_id}-${mission.id || index}`}
                mission={mission}
                onComplete={handleMissionComplete}
                onUncomplete={handleMissionUncomplete}
                style={styles.missionCard}
              />
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
    backgroundColor: colors.background.secondary,
  },
  header: {
    paddingHorizontal: spacing[5],
    paddingTop: 60,
    paddingBottom: spacing[5],
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  content: {
    flex: 1,
    padding: spacing[5],
  },
  progressCard: {
    marginBottom: spacing[6],
  },
  progressTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  progressText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  progressPercentage: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[500],
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: 4,
  },
  categorySection: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  categoryList: {
    paddingHorizontal: spacing[1],
  },
  categoryButton: {
    alignItems: 'center',
    padding: spacing[3],
    marginHorizontal: spacing[1],
    borderRadius: 12,
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    minWidth: 80,
  },
  selectedCategory: {
    backgroundColor: colors.primary[100],
    borderColor: colors.primary[500],
  },
  categoryEmoji: {
    fontSize: 20,
    marginBottom: spacing[1],
  },
  categoryName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  selectedCategoryText: {
    color: colors.primary[500],
    fontWeight: typography.fontWeight.semibold,
  },
  missionSection: {
    marginBottom: spacing[6],
  },
  missionCard: {
    marginBottom: spacing[3],
  },
  emptyCard: {
    padding: spacing[8],
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing[4],
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
});

export default MissionScreen;
