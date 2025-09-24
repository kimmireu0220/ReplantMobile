import { useState, useEffect, useCallback } from 'react';
import { getData, updateData, getStorageKeys } from '../services';
import { useUser } from '../contexts/UserContext';

export const useMission = (addExperienceByCategory) => {
  const { currentNickname } = useUser();
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 미션 데이터 로드
  const loadMissions = useCallback(async () => {
    if (!currentNickname) return;
    
    try {
      setLoading(true);
      setError(null);

      const storageKeys = getStorageKeys(currentNickname);
      const missionsData = await getData(storageKeys.MISSIONS);
      const sortedMissions = missionsData.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );

      setMissions(sortedMissions);
    } catch (loadError) {
      console.error('미션 로드 실패:', loadError);
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [currentNickname]);

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
      const updatedMission = {
        ...mission,
        completed: true,
        completed_at: new Date().toISOString(),
        photo_url: photoUrl
      };

      const storageKeys = getStorageKeys(currentNickname);
      await updateData(storageKeys.MISSIONS, mission.id, updatedMission);

      // 로컬 상태 업데이트
      setMissions(prev => 
        prev.map(m => 
          m.mission_id === missionId 
            ? updatedMission
            : m
        )
      );

      // 경험치 추가 (캐릭터 시스템과 연동)
      let experienceResult = null;
      if (addExperienceByCategory && mission.category) {
        experienceResult = await addExperienceByCategory(mission.category, mission.experience || 50);
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
  }, [missions, addExperienceByCategory]);

  // 미션 완료 취소
  const uncompleteMission = useCallback(async (missionId) => {
    try {
      const mission = missions.find(m => m.mission_id === missionId);
      if (!mission) {
        throw new Error('미션을 찾을 수 없습니다.');
      }

      const updatedMission = {
        ...mission,
        completed: false,
        completed_at: null,
        photo_url: null
      };

      const storageKeys = getStorageKeys(currentNickname);
      await updateData(storageKeys.MISSIONS, mission.id, updatedMission);

      // 로컬 상태 업데이트
      setMissions(prev => 
        prev.map(m => 
          m.mission_id === missionId 
            ? updatedMission
            : m
        )
      );

      return { success: true };
    } catch (uncompleteError) {
      console.error('미션 완료 취소 실패:', uncompleteError);
      return { success: false, error: uncompleteError.message };
    }
  }, [missions]);

  return {
    missions,
    loading,
    error,
    loadMissions,
    completeMissionWithPhoto,
    uncompleteMission,
  };
};

