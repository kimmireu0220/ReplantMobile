import { useState, useEffect } from 'react';
import { diaryService } from '../services/diaryService';

export const useDiary = () => {
  const [diaries, setDiaries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDiaries = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const diariesData = await diaryService.getUserDiaries();
      setDiaries(diariesData);
    } catch (err) {
      setError(err.message);
      setDiaries([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDiaries();
  }, []);

  const saveDiary = async (diaryData) => {
    setIsLoading(true);
    
    try {
      const newDiary = await diaryService.saveDiary(
        diaryData.date,
        diaryData.emotion,
        diaryData.content
      );
      
      // 일기 목록 새로고침
      await loadDiaries();
      
      return newDiary;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateDiary = async (diaryId, diaryData) => {
    setIsLoading(true);
    
    try {
      const updatedDiary = await diaryService.updateDiary(
        diaryId,
        diaryData.date,
        diaryData.emotion,
        diaryData.content
      );
      
      // 일기 목록 새로고침
      await loadDiaries();
      
      return updatedDiary;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDiary = async (diaryId) => {
    try {
      await diaryService.deleteDiary(diaryId);
      
      // 일기 목록 새로고침
      await loadDiaries();
    } catch (error) {
      throw error;
    }
  };

  return {
    diaries,
    isLoading,
    error,
    saveDiary,
    updateDiary,
    deleteDiary,
    reloadDiaries: loadDiaries
  };
}; 