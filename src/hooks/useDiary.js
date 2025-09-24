import { useState, useEffect, useCallback } from 'react';
import { getData, addData, updateData, deleteData, STORAGE_KEYS } from '../services';

export const useDiary = () => {
  const [diaries, setDiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 다이어리 데이터 로드
  const loadDiaries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const diariesData = await getData(STORAGE_KEYS.DIARIES);
      const sortedDiaries = diariesData.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );

      setDiaries(sortedDiaries);
    } catch (loadError) {
      console.error('다이어리 로드 실패:', loadError);
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // 초기 로드
  useEffect(() => {
    loadDiaries();
  }, [loadDiaries]);

  // 다이어리 저장
  const saveDiary = useCallback(async (diaryData) => {
    try {
      setLoading(true);

      const newDiary = await addData(STORAGE_KEYS.DIARIES, {
        date: diaryData.date,
        emotion: diaryData.emotion,
        content: diaryData.content,
        created_at: new Date().toISOString()
      });

      // 로컬 상태 업데이트
      setDiaries(prev => [newDiary, ...prev]);

      return newDiary;
    } catch (saveError) {
      console.error('다이어리 저장 실패:', saveError);
      throw saveError;
    } finally {
      setLoading(false);
    }
  }, []);

  // 다이어리 수정
  const updateDiary = useCallback(async (diaryId, diaryData) => {
    try {
      setLoading(true);

      const updatedDiary = await updateData(STORAGE_KEYS.DIARIES, diaryId, {
        date: diaryData.date,
        emotion: diaryData.emotion,
        content: diaryData.content,
        updated_at: new Date().toISOString()
      });

      // 로컬 상태 업데이트
      setDiaries(prev => 
        prev.map(diary => 
          diary.id === diaryId ? updatedDiary : diary
        )
      );

      return updatedDiary;
    } catch (updateError) {
      console.error('다이어리 수정 실패:', updateError);
      throw updateError;
    } finally {
      setLoading(false);
    }
  }, []);

  // 다이어리 삭제
  const deleteDiary = useCallback(async (diaryId) => {
    try {
      setLoading(true);

      await deleteData(STORAGE_KEYS.DIARIES, diaryId);

      // 로컬 상태 업데이트
      setDiaries(prev => prev.filter(diary => diary.id !== diaryId));

      return { success: true };
    } catch (deleteError) {
      console.error('다이어리 삭제 실패:', deleteError);
      throw deleteError;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    diaries,
    loading,
    error,
    loadDiaries,
    saveDiary,
    updateDiary,
    deleteDiary,
  };
};

