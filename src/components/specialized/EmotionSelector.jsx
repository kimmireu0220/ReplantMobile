import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';

const EMOTIONS = [
  { id: 'happy', label: '행복', emoji: '😊', color: colors.emotions.happy },
  { id: 'excited', label: '신남', emoji: '🤩', color: colors.emotions.excited },
  { id: 'calm', label: '평온', emoji: '😌', color: colors.emotions.calm },
  { id: 'grateful', label: '감사', emoji: '🙏', color: colors.emotions.grateful },
  { id: 'sad', label: '슬픔', emoji: '😢', color: colors.emotions.sad },
  { id: 'angry', label: '화남', emoji: '😠', color: colors.emotions.angry },
  { id: 'anxious', label: '불안', emoji: '😰', color: colors.emotions.anxious },
  { id: 'tired', label: '피곤', emoji: '😴', color: colors.emotions.tired },
];

const EmotionSelector = ({ 
  selectedEmotion, 
  onSelect, 
  multiple = false,
  style 
}) => {
  const [selected, setSelected] = useState(selectedEmotion || []);

  const handleSelect = (emotion) => {
    if (multiple) {
      const newSelected = selected.includes(emotion.id)
        ? selected.filter(id => id !== emotion.id)
        : [...selected, emotion.id];
      setSelected(newSelected);
      onSelect(newSelected);
    } else {
      setSelected([emotion.id]);
      onSelect(emotion.id);
    }
  };

  const isSelected = (emotionId) => {
    return multiple ? selected.includes(emotionId) : selected.includes(emotionId);
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>오늘의 감정을 선택해주세요</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {EMOTIONS.map((emotion) => (
          <TouchableOpacity
            key={emotion.id}
            style={[
              styles.emotionButton,
              isSelected(emotion.id) && styles.selectedButton,
              isSelected(emotion.id) && { backgroundColor: emotion.color + '20' }
            ]}
            onPress={() => handleSelect(emotion)}
            activeOpacity={0.7}
          >
            <Text style={styles.emoji}>{emotion.emoji}</Text>
            <Text style={[
              styles.label,
              isSelected(emotion.id) && styles.selectedLabel
            ]}>
              {emotion.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing[4],
  },
  
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[3],
    textAlign: 'center',
  },
  
  scrollContent: {
    paddingHorizontal: spacing[2],
  },
  
  emotionButton: {
    alignItems: 'center',
    padding: spacing[3],
    marginHorizontal: spacing[1],
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    minWidth: 80,
  },
  
  selectedButton: {
    borderColor: colors.primary[500],
    borderWidth: 2,
  },
  
  emoji: {
    fontSize: 24,
    marginBottom: spacing[1],
  },
  
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  
  selectedLabel: {
    color: colors.primary[500],
    fontWeight: typography.fontWeight.semibold,
  },
});

export default EmotionSelector;

