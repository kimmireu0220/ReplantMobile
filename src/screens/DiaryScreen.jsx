import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useDiary } from '../hooks/useDiary';
import { DiaryCard, EmotionSelector } from '../components/specialized';
import { Button, Card, Loading, ErrorBoundary } from '../components/ui';
import { colors, spacing, typography, borderRadius } from '../utils/designTokens';

const DiaryScreen = () => {
  const { diaries, loading, error, saveDiary, updateDiary, deleteDiary } = useDiary();
  const [showForm, setShowForm] = useState(false);
  const [editingDiary, setEditingDiary] = useState(null);
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [diaryContent, setDiaryContent] = useState('');

  const handleSaveDiary = async () => {
    if (!selectedEmotion || !diaryContent.trim()) {
      Alert.alert('오류', '감정과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      const diaryData = {
        date: new Date().toISOString().split('T')[0],
        emotion: selectedEmotion,
        content: diaryContent.trim(),
      };

      if (editingDiary) {
        await updateDiary(editingDiary.id, diaryData);
        setEditingDiary(null);
      } else {
        await saveDiary(diaryData);
      }
      
      setShowForm(false);
      setSelectedEmotion('');
      setDiaryContent('');
    } catch (saveError) {
      Alert.alert('오류', '일기 저장에 실패했습니다.');
    }
  };

  const handleEditDiary = (diary) => {
    setEditingDiary(diary);
    setSelectedEmotion(diary.emotion);
    setDiaryContent(diary.content);
    setShowForm(true);
  };

  const handleDeleteDiary = (diaryId) => {
    Alert.alert(
      '일기 삭제',
      '정말로 이 일기를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '삭제', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDiary(diaryId);
            } catch (deleteError) {
              Alert.alert('오류', '일기 삭제에 실패했습니다.');
            }
          }
        }
      ]
    );
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingDiary(null);
    setSelectedEmotion('');
    setDiaryContent('');
  };

  if (loading) {
    return <Loading text="일기를 불러오는 중..." />;
  }

  if (error) {
    return <ErrorBoundary error={error} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header} />
      
      <ScrollView style={styles.content}>
        
        {showForm ? (
          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>
              {editingDiary ? '✏️ 일기 수정' : '✏️ 일기 작성'}
            </Text>
            
            <EmotionSelector
              selectedEmotion={selectedEmotion}
              onSelect={setSelectedEmotion}
              style={styles.emotionSelector}
            />
            
            <View style={styles.contentInput}>
              <Text style={styles.contentLabel}>오늘의 이야기</Text>
              <TextInput
                style={styles.textInput}
                value={diaryContent}
                onChangeText={setDiaryContent}
                placeholder="오늘의 감정과 이야기를 자유롭게 적어보세요..."
                placeholderTextColor={colors.text.tertiary}
                multiline={true}
                textAlignVertical="top"
                maxLength={1000}
              />
              <Text style={styles.characterCount}>
                {diaryContent.length}/1000
              </Text>
            </View>
            
            <View style={styles.formActions}>
              <Button
                title="취소"
                variant="outline"
                onPress={handleCancelForm}
                style={styles.cancelButton}
              />
              <Button
                title={editingDiary ? '수정하기' : '저장하기'}
                onPress={handleSaveDiary}
                disabled={!selectedEmotion || !diaryContent.trim()}
                style={styles.saveButton}
              />
            </View>
          </Card>
        ) : (
          <>
            {diaries.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>📝</Text>
                <Text style={styles.emptyTitle}>아직 작성된 일기가 없어요</Text>
                <Text style={styles.emptyText}>오늘의 감정을 기록해보세요!</Text>
              </Card>
            ) : (
              <>
                {diaries.map((diary) => (
                  <DiaryCard
                    key={diary.id}
                    diary={diary}
                    onEdit={handleEditDiary}
                    onDelete={handleDeleteDiary}
                    style={styles.diaryCard}
                  />
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>
      
      {/* 플로팅 액션 버튼 */}
      {!showForm && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowForm(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      )}
    </View>
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
  fab: {
    position: 'absolute',
    bottom: spacing[6],
    right: spacing[5],
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: colors.primary[500],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabIcon: {
    fontSize: typography.fontSize['2xl'],
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.bold,
  },
  content: {
    flex: 1,
    padding: spacing[5],
  },
  formCard: {
    marginBottom: spacing[6],
  },
  formTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[4],
    textAlign: 'center',
  },
  emotionSelector: {
    marginBottom: spacing[6],
  },
  contentInput: {
    marginBottom: spacing[6],
  },
  contentLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  textInput: {
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: borderRadius.base,
    padding: spacing[3],
    minHeight: 120,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    lineHeight: typography.lineHeight.normal * typography.fontSize.base,
  },
  characterCount: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'right',
    marginTop: spacing[1],
  },
  formActions: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
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
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[4],
  },
  diaryCard: {
    marginBottom: spacing[3],
  },
});

export default DiaryScreen;
