import { useState, useEffect, useCallback } from 'react';
import { getData, addData, updateData, deleteData, getStorageKeys } from '../services';
import { useUser } from '../contexts/UserContext';
import { logError } from '../utils/logger';

export const useDiary = () => {
  const { currentNickname } = useUser();
  const [diaries, setDiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 다이어리 데이터 로드
  const loadDiaries = useCallback(async () => {
    if (!currentNickname) return;
    
    try {
      setLoading(true);
      setError(null);

      const storageKeys = getStorageKeys(currentNickname);
      const diariesData = await getData(storageKeys.DIARIES);
      const sortedDiaries = diariesData.sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );

      setDiaries(sortedDiaries);
    } catch (loadError) {
      logError('다이어리 로드 실패', loadError, { currentNickname });
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [currentNickname]);

  // 초기 로드
  useEffect(() => {
    loadDiaries();
  }, [loadDiaries]);

  // 다이어리 저장
  const saveDiary = useCallback(async (diaryData) => {
    try {
      setLoading(true);

      const storageKeys = getStorageKeys(currentNickname);
      const newDiary = await addData(storageKeys.DIARIES, {
        date: diaryData.date,
        emotion: diaryData.emotion,
        content: diaryData.content
      });

      // 로컬 상태 업데이트
      setDiaries(prev => [newDiary, ...prev]);

      return newDiary;
    } catch (saveError) {
      logError('다이어리 저장 실패', saveError, { diaryData, currentNickname });
      throw saveError;
    } finally {
      setLoading(false);
    }
  }, [currentNickname]);

  // 다이어리 수정
  const updateDiary = useCallback(async (diaryId, diaryData) => {
    try {
      setLoading(true);

      const storageKeys = getStorageKeys(currentNickname);
      const updatedDiary = await updateData(storageKeys.DIARIES, diaryId, {
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
      logError('다이어리 수정 실패', updateError, { diaryId, diaryData, currentNickname });
      throw updateError;
    } finally {
      setLoading(false);
    }
  }, [currentNickname]);

  // 다이어리 삭제
  const deleteDiary = useCallback(async (diaryId) => {
    try {
      setLoading(true);

      const storageKeys = getStorageKeys(currentNickname);
      await deleteData(storageKeys.DIARIES, diaryId);

      // 로컬 상태 업데이트
      setDiaries(prev => prev.filter(diary => diary.id !== diaryId));

      return { success: true };
    } catch (deleteError) {
      logError('다이어리 삭제 실패', deleteError, { diaryId, currentNickname });
      throw deleteError;
    } finally {
      setLoading(false);
    }
  }, [currentNickname]);

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

