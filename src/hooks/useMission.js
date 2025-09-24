import { useState, useEffect, useCallback } from 'react';
import { TABLES } from '../services/supabase';
import { useSupabase } from '../contexts/SupabaseContext';

export const useMission = (addExperienceByCategory) => {
  const { supabase } = useSupabase();
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 미션 데이터 로드
  const loadMissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: queryError } = await supabase
        .from(TABLES.MISSIONS)
        .select('*')
        .order('created_at', { ascending: false });

      if (queryError) throw queryError;

      setMissions(data || []);
    } catch (loadError) {
      console.error('미션 로드 실패:', loadError);
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // 초기 로드
  useEffect(() => {
    loadMissions();
  }, [loadMissions]);

  // 미션 완료 (사진 포함)
  const completeMissionWithPhoto = useCallback(async (missionId, photoUrl) => {
    try {
      const mission = missions.find(m => m.mission_id === missionId);
      if (!mission) {
        throw new Error('미션을 찾을 수 없습니다.');
      }

      // 미션 완료 상태 업데이트
      const { error: updateError } = await supabase
        .from(TABLES.MISSIONS)
        .update({ 
          completed: true,
          completed_at: new Date().toISOString(),
          photo_url: photoUrl 
        })
        .eq('mission_id', missionId);

      if (updateError) throw updateError;

      // 로컬 상태 업데이트
      setMissions(prev => 
        prev.map(m => 
          m.mission_id === missionId 
            ? { ...m, completed: true, completed_at: new Date().toISOString(), photo_url: photoUrl }
            : m
        )
      );

      // 경험치 추가 (캐릭터 시스템과 연동)
      let experienceResult = null;
      if (addExperienceByCategory && mission.category_id) {
        experienceResult = await addExperienceByCategory(mission.category_id, mission.experience || 50);
      }

      return {
        success: true,
        experience: experienceResult?.experience,
        levelUp: experienceResult?.levelUp,
        newLevel: experienceResult?.newLevel,
        unlocked: false // 나중에 캐릭터 해제 로직 추가
      };
    } catch (completeError) {
      console.error('미션 완료 실패:', completeError);
      return { success: false, error: completeError.message };
    }
  }, [missions, supabase, addExperienceByCategory]);

  // 미션 완료 취소
  const uncompleteMission = useCallback(async (missionId) => {
    try {
      const { error: updateError } = await supabase
        .from(TABLES.MISSIONS)
        .update({ 
          completed: false,
          completed_at: null,
          photo_url: null 
        })
        .eq('mission_id', missionId);

      if (updateError) throw updateError;

      // 로컬 상태 업데이트
      setMissions(prev => 
        prev.map(m => 
          m.mission_id === missionId 
            ? { ...m, completed: false, completed_at: null, photo_url: null }
            : m
        )
      );

      return { success: true };
    } catch (uncompleteError) {
      console.error('미션 완료 취소 실패:', uncompleteError);
      return { success: false, error: uncompleteError.message };
    }
  }, [supabase]);

  return {
    missions,
    loading,
    error,
    loadMissions,
    completeMissionWithPhoto,
    uncompleteMission,
  };
};

