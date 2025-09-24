import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';

const MissionCard = ({ 
  mission, 
  onComplete,
  onUncomplete,
  loading = false,
  style 
}) => {
  if (!mission) return null;

  const getCategoryEmoji = (category) => {
    const emojiMap = {
      exercise: '🏃‍♂️',
      cleaning: '🧹',
      reading: '📚',
      selfcare: '🧘‍♀️',
      social: '👥',
      creativity: '🎨',
    };
    return emojiMap[category] || '🎯';
  };

  const getCategoryName = (category) => {
    const nameMap = {
      exercise: '운동',
      cleaning: '청소',
      reading: '독서',
      selfcare: '자기돌봄',
      social: '사회활동',
      creativity: '창의활동',
    };
    return nameMap[category] || category;
  };

  const handleToggleComplete = () => {
    if (mission.completed) {
      onUncomplete?.(mission.mission_id);
    } else {
      onComplete?.(mission.mission_id);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryEmoji}>
            {getCategoryEmoji(mission.category)}
          </Text>
          <Text style={styles.categoryName}>
            {getCategoryName(mission.category)}
          </Text>
        </View>
        <View style={styles.statusContainer}>
          {mission.completed ? (
            <Text style={styles.completedText}>✅ 완료</Text>
          ) : (
            <Text style={styles.pendingText}>⏳ 진행중</Text>
          )}
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{mission.title}</Text>
        {mission.description && (
          <Text style={styles.description}>{mission.description}</Text>
        )}
        
        {mission.photo_url && (
          <Image 
            source={{ uri: mission.photo_url }} 
            style={styles.photo}
            resizeMode="cover"
          />
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.experienceInfo}>
          <Text style={styles.experienceText}>
            +{mission.experience || 50} EXP
          </Text>
        </View>
        
        <TouchableOpacity
          style={[
            styles.actionButton,
            mission.completed ? styles.uncompleteButton : styles.completeButton
          ]}
          onPress={handleToggleComplete}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.actionText,
            mission.completed ? styles.uncompleteText : styles.completeText
          ]}>
            {loading ? '처리중...' : mission.completed ? '완료 취소' : '완료하기'}
          </Text>
        </TouchableOpacity>
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
  
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  categoryEmoji: {
    fontSize: 20,
    marginRight: spacing[2],
  },
  
  categoryName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  
  statusContainer: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
    backgroundColor: colors.gray[100],
  },
  
  completedText: {
    fontSize: typography.fontSize.xs,
    color: colors.success,
    fontWeight: typography.fontWeight.medium,
  },
  
  pendingText: {
    fontSize: typography.fontSize.xs,
    color: colors.warning,
    fontWeight: typography.fontWeight.medium,
  },
  
  content: {
    marginBottom: spacing[3],
  },
  
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  
  description: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.normal * typography.fontSize.base,
  },
  
  photo: {
    width: '100%',
    height: 120,
    borderRadius: borderRadius.base,
    marginTop: spacing[2],
  },
  
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  experienceInfo: {
    flex: 1,
  },
  
  experienceText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[500],
    fontWeight: typography.fontWeight.medium,
  },
  
  actionButton: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.base,
  },
  
  completeButton: {
    backgroundColor: colors.primary[500],
  },
  
  uncompleteButton: {
    backgroundColor: colors.gray[300],
  },
  
  actionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  
  completeText: {
    color: colors.text.inverse,
  },
  
  uncompleteText: {
    color: colors.text.secondary,
  },
});

export default MissionCard;

