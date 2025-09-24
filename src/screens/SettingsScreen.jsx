import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useUser } from '../contexts/UserContext';
import { useCharacter } from '../hooks/useCharacter';
import { CharacterCard } from '../components/specialized';
import { Card } from '../components/ui';
import { colors, spacing, typography } from '../utils/designTokens';

const SettingsScreen = () => {
  const { user, logout } = useUser();
  const { characters, selectedCharacter, selectCharacter } = useCharacter();

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말로 로그아웃하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '로그아웃', 
          style: 'destructive',
          onPress: logout
        }
      ]
    );
  };

  const handleCharacterSelect = (character) => {
    selectCharacter(character);
    Alert.alert('캐릭터 변경', `${character.name}으로 변경되었습니다!`);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background.secondary }]}>
      <View style={styles.header}>
      </View>
      
      <View style={styles.content}>
        {/* 사용자 정보 */}
        <Card style={styles.userCard}>
          <Text style={styles.userTitle}>👤 사용자 정보</Text>
          <Text style={styles.userInfo}>닉네임: {user?.nickname}</Text>
          <Text style={styles.userInfo}>가입일: {new Date().toLocaleDateString('ko-KR')}</Text>
        </Card>

        {/* 현재 캐릭터 */}
        {selectedCharacter && (
          <Card style={styles.characterCard}>
            <Text style={styles.sectionTitle}>🌱 현재 캐릭터</Text>
            <CharacterCard 
              character={selectedCharacter}
              style={styles.currentCharacter}
            />
          </Card>
        )}

        {/* 캐릭터 선택 */}
        {characters.length > 1 && (
          <Card style={styles.characterSelectionCard}>
            <Text style={styles.sectionTitle}>🔄 캐릭터 변경</Text>
            <Text style={styles.sectionDescription}>
              다른 캐릭터로 변경할 수 있습니다.
            </Text>
            {characters.map((character) => (
              <TouchableOpacity
                key={character.id}
                style={[
                  styles.characterOption,
                  selectedCharacter?.id === character.id && styles.selectedCharacter
                ]}
                onPress={() => handleCharacterSelect(character)}
                activeOpacity={0.7}
              >
                <Text style={styles.characterEmoji}>
                  {character.level >= 10 ? '🌳' : character.level >= 7 ? '🌿' : character.level >= 4 ? '🌱' : '🌰'}
                </Text>
                <View style={styles.characterInfo}>
                  <Text style={styles.characterName}>{character.name}</Text>
                  <Text style={styles.characterLevel}>Lv.{character.level}</Text>
                </View>
                {selectedCharacter?.id === character.id && (
                  <Text style={styles.selectedText}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </Card>
        )}

        
        {/* 계정 설정 */}
        <Card style={styles.accountCard}>
          <Text style={styles.sectionTitle}>🔐 계정</Text>
          <TouchableOpacity style={styles.logoutOption} onPress={handleLogout}>
            <Text style={styles.logoutText}>🚪 로그아웃</Text>
          </TouchableOpacity>
        </Card>

        {/* 앱 정보 */}
        <Card style={styles.appInfoCard}>
          <Text style={styles.sectionTitle}>ℹ️ 앱 정보</Text>
          <Text style={styles.appInfo}>버전: 1.0.0</Text>
          <Text style={styles.appInfo}>Replant - 감정 회복을 위한 여정</Text>
        </Card>
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
    padding: spacing[5],
  },
  userCard: {
    marginBottom: spacing[6],
  },
  userTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  userInfo: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
  characterCard: {
    marginBottom: spacing[6],
  },
  currentCharacter: {
    marginTop: spacing[3],
  },
  characterSelectionCard: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  sectionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[4],
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
  },
  characterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    marginBottom: spacing[2],
    backgroundColor: colors.background.primary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  selectedCharacter: {
    backgroundColor: colors.primary[100],
    borderColor: colors.primary[500],
  },
  characterEmoji: {
    fontSize: 24,
    marginRight: spacing[3],
  },
  characterInfo: {
    flex: 1,
  },
  characterName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  characterLevel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  selectedText: {
    fontSize: typography.fontSize.lg,
    color: colors.primary[500],
    fontWeight: typography.fontWeight.bold,
  },
  themeCard: {
    marginBottom: spacing[6],
  },
  accountCard: {
    marginBottom: spacing[6],
  },
  appInfoCard: {
    marginBottom: spacing[6],
  },
  option: {
    backgroundColor: colors.background.primary,
    padding: spacing[4],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  optionText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  logoutOption: {
    backgroundColor: colors.error[50],
    padding: spacing[4],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  logoutText: {
    fontSize: typography.fontSize.base,
    color: colors.error[600],
    fontWeight: typography.fontWeight.medium,
  },
  appInfo: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
});

export default SettingsScreen;
