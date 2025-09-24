import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SCREEN_NAMES } from '../utils/constants';
import { Button } from '../components/ui';
import { colors, spacing, typography } from '../utils/designTokens';

const StartScreen = ({ onNavigate }) => {

  const handleGetStarted = () => {
    if (onNavigate) {
      onNavigate(SCREEN_NAMES.NICKNAME);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🌱 Replant</Text>
        <Text style={styles.subtitle}>감정 회복을 위한 여정</Text>
        <Text style={styles.description}>
          매일의 감정을 기록하고, 미션을 완료하며{'\n'}
          캐릭터와 함께 성장해보세요
        </Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <Button
          title="시작하기"
          onPress={handleGetStarted}
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
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[4],
  },
  subtitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[6],
  },
  description: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  buttonContainer: {
    paddingBottom: spacing[10],
  },
  button: {
    width: '100%',
  },
});

export default StartScreen;
