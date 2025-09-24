import { useState, useEffect, useCallback } from 'react';
import { TABLES } from '../services/supabase';
import { useSupabase } from '../contexts/SupabaseContext';

export const useDiary = () => {
  const { supabase } = useSupabase();
  const [diaries, setDiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 다이어리 데이터 로드
  const loadDiaries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: queryError } = await supabase
        .from(TABLES.DIARIES)
        .select('*')
        .order('created_at', { ascending: false });

      if (queryError) throw queryError;

      setDiaries(data || []);
    } catch (loadError) {
      console.error('다이어리 로드 실패:', loadError);
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // 초기 로드
  useEffect(() => {
    loadDiaries();
  }, [loadDiaries]);

  // 다이어리 저장
  const saveDiary = useCallback(async (diaryData) => {
    try {
      setLoading(true);

      const { data, error: queryError } = await supabase
        .from(TABLES.DIARIES)
        .insert({
          date: diaryData.date,
          emotion: diaryData.emotion,
          content: diaryData.content,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (queryError) throw queryError;

      // 로컬 상태 업데이트
      setDiaries(prev => [data, ...prev]);

      return data;
    } catch (saveError) {
      console.error('다이어리 저장 실패:', saveError);
      throw saveError;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // 다이어리 수정
  const updateDiary = useCallback(async (diaryId, diaryData) => {
    try {
      setLoading(true);

      const { data, error: queryError } = await supabase
        .from(TABLES.DIARIES)
        .update({
          date: diaryData.date,
          emotion: diaryData.emotion,
          content: diaryData.content,
          updated_at: new Date().toISOString()
        })
        .eq('id', diaryId)
        .select()
        .single();

      if (queryError) throw queryError;

      // 로컬 상태 업데이트
      setDiaries(prev => 
        prev.map(diary => 
          diary.id === diaryId ? data : diary
        )
      );

      return data;
    } catch (updateError) {
      console.error('다이어리 수정 실패:', updateError);
      throw updateError;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // 다이어리 삭제
  const deleteDiary = useCallback(async (diaryId) => {
    try {
      setLoading(true);

      const { error: deleteError } = await supabase
        .from(TABLES.DIARIES)
        .delete()
        .eq('id', diaryId);

      if (deleteError) throw deleteError;

      // 로컬 상태 업데이트
      setDiaries(prev => prev.filter(diary => diary.id !== diaryId));

      return { success: true };
    } catch (deleteError) {
      console.error('다이어리 삭제 실패:', deleteError);
      throw deleteError;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

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

