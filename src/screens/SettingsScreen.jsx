import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useUser } from '../contexts/UserContext';
import { Card } from '../components/ui';
import { colors, spacing, typography, borderRadius } from '../utils/designTokens';
import { resetAppData } from '../services/appService';

const SettingsScreen = () => {
  const { user, logout } = useUser();

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


  const handleResetData = () => {
    Alert.alert(
      '데이터 초기화',
      '모든 데이터가 삭제됩니다. 정말로 초기화하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '초기화', 
          style: 'destructive',
          onPress: async () => {
            try {
              await resetAppData();
              Alert.alert('완료', '데이터가 초기화되었습니다. 앱을 재시작해주세요.');
            } catch (error) {
              Alert.alert('오류', '데이터 초기화에 실패했습니다.');
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background.secondary }]}>
      <View style={styles.header} />
      
      <View style={styles.content}>
        {/* 사용자 정보 */}
        <Card style={styles.userCard}>
          <Text style={styles.userTitle}>👤 사용자 정보</Text>
          <Text style={styles.userInfo}>닉네임: {user?.nickname}</Text>
          <Text style={styles.userInfo}>가입일: {new Date().toLocaleDateString('ko-KR')}</Text>
        </Card>


        
        {/* 계정 설정 */}
        <Card style={styles.accountCard}>
          <Text style={styles.sectionTitle}>🔐 계정</Text>
          <TouchableOpacity style={styles.logoutOption} onPress={handleLogout}>
            <Text style={styles.logoutText}>🚪 로그아웃</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resetOption} onPress={handleResetData}>
            <Text style={styles.resetText}>🗑️ 데이터 초기화</Text>
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
    paddingTop: spacing[15],
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
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[3],
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
    borderRadius: borderRadius.base,
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
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  logoutText: {
    fontSize: typography.fontSize.base,
    color: colors.error[600],
    fontWeight: typography.fontWeight.medium,
  },
  resetOption: {
    backgroundColor: colors.warning[50],
    padding: spacing[4],
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.border.light,
    marginTop: spacing[3],
  },
  resetText: {
    fontSize: typography.fontSize.base,
    color: colors.warning[600],
    fontWeight: typography.fontWeight.medium,
  },
  appInfo: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
});

export default SettingsScreen;
