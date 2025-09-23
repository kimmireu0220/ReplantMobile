import React, { useState } from 'react';
import { tokens } from '../design/tokens';
import { getCurrentUserNickname } from '../config/supabase';
import EmotionDiaryForm from '../components/features/EmotionDiaryForm';
import EmotionDiaryCard from '../components/features/EmotionDiaryCard';
import { Button, ThemeToggle } from '../components/ui';
import Card from '../components/ui/Card';
import { PageTitle, ScreenReaderOnly } from '../components/ui/ScreenReaderOnly';

import { useDiary } from '../hooks/useDiary';

const DiaryPage = () => {
  const { diaries, isLoading, saveDiary, updateDiary, deleteDiary } = useDiary();
  const [showForm, setShowForm] = useState(false);
  const [editingDiary, setEditingDiary] = useState(null);
  const nickname = getCurrentUserNickname();

  const handleSaveDiary = async (diaryData) => {
    try {
      if (editingDiary) {
        await updateDiary(editingDiary.id, diaryData);
        setEditingDiary(null);
      } else {
        await saveDiary(diaryData);
      }
      
      setShowForm(false);
    } catch (error) {
      // 에러 처리
    }
  };

  const handleEditDiary = (diary) => {
    setEditingDiary(diary);
    setShowForm(true);
  };

  const handleDeleteDiary = async (diaryId) => {
    if (window.confirm('정말로 이 일기를 삭제하시겠습니까?')) {
      try {
        await deleteDiary(diaryId);
      } catch (error) {
      }
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingDiary(null);
  };

  const pageStyle = {
    minHeight: '100vh',
    backgroundColor: tokens.colors.background.primary,
    padding: tokens.spacing[4]
  };

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing[6]
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: tokens.spacing[2]
  };



  const userInfoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing[2],
    padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.lg,
    border: `1px solid ${tokens.colors.border.medium}`,
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.secondary,
    fontWeight: tokens.typography.fontWeight.medium
  };

  // 미사용 스타일 제거 (no-unused-vars 경고 해소)

  const pageTitleStyle = {
    fontSize: tokens.typography.fontSize['2xl'],
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing[3]
  };

  const pageSubtitleStyle = {
    fontSize: tokens.typography.fontSize.base,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.spacing[6]
  };

  // 미사용 스타일 제거 (no-unused-vars 경고 해소)

  const loadingStyle = {
    textAlign: 'center',
    padding: tokens.spacing[10]
  };

  const emptyStateStyle = {
    textAlign: 'center',
    padding: tokens.spacing[10]
  };

  const emptyIconStyle = {
    fontSize: '48px',
    marginBottom: tokens.spacing[4]
  };

  const emptyTitleStyle = {
    fontSize: tokens.typography.fontSize.xl,
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing[2]
  };

  const emptyTextStyle = {
    fontSize: tokens.typography.fontSize.base,
    color: tokens.colors.text.secondary
  };


  const diaryListTitleStyle = {
    fontSize: tokens.typography.fontSize.xl,
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing[5]
  };

  const diaryListContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: tokens.spacing[5]
  };

  const formHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing[4]
  };

  const formTitleStyle = {
    fontSize: tokens.typography.fontSize['2xl'],
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary
  };

  const cardHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacing[3],
  };

  const headerTextGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
  };



  return (
    <div style={pageStyle} role="main" aria-label="감정 일기">
      <PageTitle title="감정 일기" />
      <div style={containerStyle}>
        <ScreenReaderOnly id="diary-status" role="status" aria-live="polite" />
        <div style={headerStyle}>
          {nickname && (
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <div style={userInfoStyle}>
                <span>👤</span>
                <span>{nickname}</span>
              </div>
              <ThemeToggle showLabel={false} showSystem={false} />
            </div>
          )}
        </div>

        <Card variant="elevated" padding="lg" style={{ border: `1px solid ${tokens.colors.border.medium}` }} aria-labelledby="diary-title" aria-describedby="diary-desc">
          {!showForm ? (
            <>
              <div style={cardHeaderStyle}>
                <div style={headerTextGroupStyle}>
                  <h2 style={pageTitleStyle} id="diary-title">📓 감정 일기</h2>
                  <p style={pageSubtitleStyle} id="diary-desc">오늘의 감정을 자유롭게 기록해보세요</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  ariaLabel="새 일기 작성하기"
                  onClick={() => setShowForm(true)}
                  style={{
                    minWidth: tokens.components.button.height.base,
                    width: tokens.components.button.height.base,
                    height: tokens.components.button.height.base,
                    borderRadius: tokens.borderRadius.full,
                    fontSize: tokens.typography.fontSize.xl,
                  }}
                >
                  ＋
                </Button>
              </div>

              <div style={{ marginTop: tokens.spacing[6] }}>
              {isLoading ? (
                <div style={loadingStyle}>
                  <div style={{ fontSize: '24px', marginBottom: tokens.spacing[3] }}>⏳</div>
                  <p>일기를 불러오는 중...</p>
                </div>
              ) : !diaries || diaries.length === 0 ? (
                <div style={emptyStateStyle} role="status" aria-live="polite">
                  <div style={emptyIconStyle}>📝</div>
                  <h3 style={emptyTitleStyle}>아직 작성된 일기가 없어요</h3>
                  <p style={emptyTextStyle}>오늘의 감정을 기록해보세요!</p>
                </div>
              ) : (
                <>
                  <h3 style={{ ...diaryListTitleStyle, marginTop: tokens.spacing[2] }}>📚 내 일기 모음</h3>
                  <div style={diaryListContainerStyle}>
                    {diaries.map((diary) => (
                      <EmotionDiaryCard
                        key={diary.id}
                        entry={diary}
                        onEdit={handleEditDiary}
                        onDelete={handleDeleteDiary}
                      />
                    ))}
                  </div>
                </>
              )}
              </div>
            </>
          ) : (
            <>
              <div style={formHeaderStyle}>
                <h2 style={formTitleStyle}>{editingDiary ? '✏️ 일기 수정' : '✏️ 일기 작성'}</h2>
              </div>
              <EmotionDiaryForm 
                onSubmit={handleSaveDiary}
                onCancel={handleCloseForm}
                initialData={editingDiary}
                isLoading={isLoading}
                asCard={false}
              />
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default DiaryPage; 