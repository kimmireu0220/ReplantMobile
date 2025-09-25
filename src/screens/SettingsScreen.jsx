import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { useUser } from '../contexts/UserContext';
import { Card, Input } from '../components/ui';
import { colors, spacing, typography, borderRadius } from '../utils/designTokens';

const SettingsScreen = () => {
  const { user, logout, updateNickname } = useUser();
  const [showNicknameForm, setShowNicknameForm] = useState(false);
  const [newNickname, setNewNickname] = useState('');

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

  const handleNicknameChange = async () => {
    if (!newNickname.trim()) {
      Alert.alert('오류', '닉네임을 입력해주세요.');
      return;
    }

    if (newNickname.trim() === user?.nickname) {
      Alert.alert('알림', '현재 닉네임과 동일합니다.');
      return;
    }

    try {
      const result = await updateNickname(newNickname.trim());
      if (result.success) {
        Alert.alert('완료', '닉네임이 변경되었습니다.');
        setShowNicknameForm(false);
        setNewNickname('');
      } else {
        Alert.alert('오류', result.error || '닉네임 변경에 실패했습니다.');
      }
    } catch (error) {
      Alert.alert('오류', '닉네임 변경 중 오류가 발생했습니다.');
    }
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
          
          {showNicknameForm ? (
            <View style={styles.nicknameForm}>
              <Input
                label="새 닉네임"
                placeholder="새 닉네임을 입력하세요"
                value={newNickname}
                onChangeText={setNewNickname}
                style={styles.nicknameInput}
              />
              <View style={styles.nicknameActions}>
                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={() => {
                    setShowNicknameForm(false);
                    setNewNickname('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.saveButton} 
                  onPress={handleNicknameChange}
                >
                  <Text style={styles.saveButtonText}>변경</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.changeNicknameButton} 
              onPress={() => setShowNicknameForm(true)}
            >
              <Text style={styles.changeNicknameText}>✏️ 닉네임 변경</Text>
            </TouchableOpacity>
          )}
        </Card>


        
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
          <Text style={styles.appInfo}>버전: 1.0.0 (Build 123)</Text>
          <Text style={styles.appInfo}>최근 업데이트: 2025.01.26</Text>
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
    paddingTop: spacing[20],
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
  appInfo: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
  nicknameForm: {
    marginTop: spacing[4],
  },
  nicknameInput: {
    marginBottom: spacing[3],
  },
  nicknameActions: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    padding: spacing[3],
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.border.medium,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary[500],
    padding: spacing[3],
    borderRadius: borderRadius.base,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.medium,
  },
  changeNicknameButton: {
    backgroundColor: colors.background.secondary,
    padding: spacing[3],
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.border.light,
    marginTop: spacing[3],
    alignItems: 'center',
  },
  changeNicknameText: {
    fontSize: typography.fontSize.base,
    color: colors.primary[500],
    fontWeight: typography.fontWeight.medium,
  },
});

export default SettingsScreen;
