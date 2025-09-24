import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useUser } from '../contexts/UserContext';
import { validateNickname } from '../services/supabase';
import { Button, Input } from '../components/ui';
import { colors, spacing, typography } from '../utils/designTokens';

const NicknameScreen = ({ onNavigate }) => {
  const { login } = useUser();
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    // 닉네임 유효성 검사
    const validation = validateNickname(nickname);
    if (!validation.isValid) {
      Alert.alert('오류', validation.message);
      return;
    }

    setIsLoading(true);
    
    try {
      // 간단한 로그인 처리 (인증 없이)
      await login(nickname);
      // 성공 시 자동으로 홈 화면으로 이동
    } catch (error) {
      Alert.alert('오류', error.message || '로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>닉네임을 입력해주세요</Text>
        <Text style={styles.subtitle}>
          다른 사용자들과 구분할 수 있는{'\n'}
          고유한 닉네임을 설정해주세요
        </Text>
        
        <Input
          placeholder="닉네임을 입력하세요"
          value={nickname}
          onChangeText={setNickname}
          maxLength={20}
          autoFocus
          style={styles.input}
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <Button
          title={isLoading ? '처리 중...' : '완료'}
          onPress={handleSubmit}
          disabled={isLoading}
          loading={isLoading}
          size="lg"
          style={styles.button}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    justifyContent: 'space-between',
    padding: spacing[5],
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[4],
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
    marginBottom: spacing[10],
  },
  input: {
    textAlign: 'center',
  },
  buttonContainer: {
    paddingBottom: spacing[10],
  },
  button: {
    width: '100%',
  },
});

export default NicknameScreen;
