import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useUser } from '../contexts/UserContext';
import { useCharacter } from '../hooks/useCharacter';
import { useMission } from '../hooks/useMission';
import { CharacterCard, MissionCard } from '../components/specialized';
import { Card, Loading, ErrorBoundary } from '../components/ui';
import { colors, spacing, typography } from '../utils/designTokens';

const HomeScreen = () => {
  const { user } = useUser();
  const { selectedCharacter, loading: characterLoading, error: characterError } = useCharacter();
  const { missions, loading: missionLoading, error: missionError } = useMission();

  // 추천 미션 (미완료된 미션 중 최대 3개)
  const recommendedMissions = missions
    .filter(mission => !mission.completed)
    .slice(0, 3);

  if (characterLoading || missionLoading) {
    return <Loading text="데이터를 불러오는 중..." />;
  }

  if (characterError || missionError) {
    return <ErrorBoundary error={characterError || missionError} />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.welcomeText}>
          안녕하세요, {user?.nickname || '사용자'}님!
        </Text>
        
        {/* 메인 캐릭터 표시 */}
        {selectedCharacter && (
          <View style={styles.characterSection}>
            <Text style={styles.sectionTitle}>🌱 나의 캐릭터</Text>
            <CharacterCard 
              character={selectedCharacter}
              style={styles.characterCard}
            />
          </View>
        )}
        
        {/* 추천 미션 */}
        <View style={styles.missionSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎯 추천 미션</Text>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => {
                // 네비게이션은 AppNavigator에서 처리됨
                console.log('미션 화면으로 이동');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllText}>모두 보기</Text>
            </TouchableOpacity>
          </View>
          {recommendedMissions.length > 0 ? (
            recommendedMissions.map((mission) => (
              <MissionCard
                key={mission.mission_id}
                mission={mission}
                style={styles.missionCard}
              />
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                🎉 모든 미션을 완료했습니다!{'\n'}
                새로운 미션이 곧 추가될 예정입니다.
              </Text>
            </Card>
          )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
  userInfo: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  content: {
    padding: spacing[5],
  },
  welcomeText: {
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.lg,
    marginBottom: spacing[8],
    textAlign: 'center',
  },
  characterSection: {
    marginBottom: spacing[8],
  },
  missionSection: {
    marginBottom: spacing[8],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  viewAllButton: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary[300],
  },
  viewAllText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
  },
  characterCard: {
    marginBottom: spacing[4],
  },
  missionCard: {
    marginBottom: spacing[3],
  },
  emptyCard: {
    padding: spacing[6],
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
});

export default HomeScreen;
