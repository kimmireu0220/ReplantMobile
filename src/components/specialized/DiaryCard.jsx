import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';

const DiaryCard = ({ 
  diary, 
  onEdit,
  onDelete,
  style 
}) => {
  if (!diary) return null;

  const getEmotionEmoji = (emotion) => {
    const emojiMap = {
      happy: '😊',
      excited: '🤩',
      calm: '😌',
      grateful: '🙏',
      sad: '😢',
      angry: '😠',
      anxious: '😰',
      tired: '😴',
    };
    return emojiMap[emotion] || '😊';
  };

  const getEmotionName = (emotion) => {
    const nameMap = {
      happy: '행복',
      excited: '신남',
      calm: '평온',
      grateful: '감사',
      sad: '슬픔',
      angry: '화남',
      anxious: '불안',
      tired: '피곤',
    };
    return nameMap[emotion] || emotion;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <View style={styles.emotionInfo}>
          <Text style={styles.emotionEmoji}>
            {getEmotionEmoji(diary.emotion)}
          </Text>
          <Text style={styles.emotionName}>
            {getEmotionName(diary.emotion)}
          </Text>
        </View>
        <Text style={styles.date}>
          {formatDate(diary.date)}
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.text} numberOfLines={4}>
          {diary.content}
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onEdit?.(diary)}
            activeOpacity={0.7}
          >
            <Text style={styles.editText}>✏️ 수정</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onDelete?.(diary.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.deleteText}>🗑️ 삭제</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginVertical: spacing[2],
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.base,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  
  emotionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  emotionEmoji: {
    fontSize: 20,
    marginRight: spacing[2],
  },
  
  emotionName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  
  date: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  
  content: {
    marginBottom: spacing[3],
  },
  
  text: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    lineHeight: typography.lineHeight.normal * typography.fontSize.base,
  },
  
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: spacing[3],
  },
  
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing[3],
  },
  
  actionButton: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
  },
  
  editText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[500],
    fontWeight: typography.fontWeight.medium,
  },
  
  deleteText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    fontWeight: typography.fontWeight.medium,
  },
});

export default DiaryCard;

