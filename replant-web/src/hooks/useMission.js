import { useState, useEffect, useRef, useCallback } from 'react';
import { missionService } from '../services/missionService';
import { handleError } from '../utils/ErrorHandler';

export const useMission = (addExperienceByCategory) => {
  const [missions, setMissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const loadingRef = useRef(false);

  // 미션 데이터 로드 (useCallback으로 메모이제이션)
  const loadMissions = useCallback(async () => {
    // 중복 호출 방지
    if (loadingRef.current) {
      return;
    }

    try {
      loadingRef.current = true;
      setIsLoading(true);
      setError(null);
      
      const missionsData = await missionService.getUserMissions();
      
      setMissions(missionsData);
      setIsInitialized(true);
    } catch (err) {
      const processedError = handleError(err, '미션 데이터 로드');
      setError(processedError.message);
      setMissions([]);
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, []);

  // 안전한 초기화 (중복 호출 방지)
  useEffect(() => {
    if (!isInitialized && !loadingRef.current) {
      loadMissions();
    }
  }, [isInitialized, loadMissions]);

  // 미션 완료 처리 (useCallback으로 메모이제이션)
  const completeMission = useCallback(async (missionId) => {
    try {
      
      const mission = missions.find(m => m.mission_id === missionId);
      if (!mission) {
        throw new Error('미션을 찾을 수 없습니다.');
      }
      

      // Supabase에서 미션 완료 처리
      const updatedMission = await missionService.completeMission(missionId);
      
      // 로컬 상태 업데이트
      const updatedMissions = missions.map(m =>
        m.mission_id === missionId
          ? { ...m, completed: true, completed_at: updatedMission.completed_at }
          : m
      );
      
      setMissions(updatedMissions);
      
      if (addExperienceByCategory && mission.category) {
        try {
          const experiencePoints = mission.experience || 50;
          
          const result = await addExperienceByCategory(mission.category, experiencePoints);
          
          if (result && result.success) {
            const finalResult = {
              success: true,
              experience: experiencePoints,
              category: mission.category,
              levelUp: result.levelUp || false,
              newLevel: result.newLevel,
              unlocked: result.unlocked || false,
              ...result
            };
            return finalResult;
          }
        } catch (error) {
          // 경험치 추가 실패 시에도 미션 완료는 성공으로 처리
          return { 
            success: true, 
            experience: 0,
            category: mission.category,
            error: '경험치 추가 실패'
          };
        }
      }

      return { 
        success: true, 
        experience: 0,
        category: mission.category 
      };
    } catch (error) {
      throw error;
    }
  }, [missions, addExperienceByCategory]);

  // 사진과 함께 미션 완료 처리 (useCallback으로 메모이제이션)
  const completeMissionWithPhoto = useCallback(async (missionId, photoUrl) => {
    try {
      const mission = missions.find(m => m.mission_id === missionId);
      if (!mission) {
        throw new Error('미션을 찾을 수 없습니다.');
      }

      // 사진과 함께 미션 완료 처리
      const updatedMission = await missionService.completeMissionWithPhoto(
        missionId, 
        photoUrl
      );
      
      // 로컬 상태 업데이트
      const updatedMissions = missions.map(m =>
        m.mission_id === missionId
          ? { 
              ...m, 
              photo_url: photoUrl,
              photo_submitted_at: updatedMission.photo_submitted_at,
              completed: true, 
              completed_at: updatedMission.completed_at 
            }
          : m
      );
      
      setMissions(updatedMissions);
      
      // 경험치 추가 (기존 로직 유지)
      if (addExperienceByCategory && mission.category) {
        try {
          const experiencePoints = mission.experience || 50;
          const result = await addExperienceByCategory(mission.category, experiencePoints);
          
          if (result && result.success) {
            return {
              success: true,
              experience: experiencePoints,
              category: mission.category,
              levelUp: result.levelUp || false,
              newLevel: result.newLevel,
              unlocked: result.unlocked || false,
              ...result
            };
          }
        } catch (error) {
          return { 
            success: true, 
            experience: 0,
            category: mission.category,
            error: '경험치 추가 실패'
          };
        }
      }

      return { 
        success: true, 
        experience: 0,
        category: mission.category 
      };
    } catch (error) {
      throw error;
    }
  }, [missions, addExperienceByCategory]);

  // 미션 완료 취소 (useCallback으로 메모이제이션)
  const uncompleteMission = useCallback(async (missionId) => {
    try {
      // Supabase에서 미션 완료 취소 처리
      await missionService.uncompleteMission(missionId);
      
      // 로컬 상태 업데이트
      const updatedMissions = missions.map(mission =>
        mission.mission_id === missionId
          ? { ...mission, completed: false, completed_at: null }
          : mission
      );
      
      setMissions(updatedMissions);
    } catch (error) {
      throw error;
    }
  }, [missions]);

  // 퀴즈와 함께 미션 완료 처리
  const completeMissionWithQuiz = useCallback(async (missionId, answers, timeSpent = 0) => {
    try {
      const mission = missions.find(m => m.mission_id === missionId);
      if (!mission) {
        throw new Error('미션을 찾을 수 없습니다.');
      }

      // 퀴즈와 함께 미션 완료 처리
      const result = await missionService.completeMissionWithQuiz(missionId, answers, timeSpent);
      
      if (result.success) {
        // 로컬 상태 업데이트
        const updatedMissions = missions.map(m =>
          m.mission_id === missionId
            ? { 
                ...m, 
                quiz_score: result.score,
                quiz_completed_at: result.missionData?.quiz_completed_at,
                completed: true, 
                completed_at: result.missionData?.completed_at 
              }
            : m
        );
        
        setMissions(updatedMissions);
        
        // 경험치 추가 (기존 로직 유지)
        if (addExperienceByCategory && mission.category) {
          try {
            const experiencePoints = mission.experience || 50;
            const result = await addExperienceByCategory(mission.category, experiencePoints);
            
            if (result && result.success) {
              return {
                success: true,
                experience: experiencePoints,
                category: mission.category,
                levelUp: result.levelUp || false,
                newLevel: result.newLevel,
                unlocked: result.unlocked || false,
                quizScore: result.score,
                ...result
              };
            }
          } catch (error) {
            return { 
              success: true, 
              experience: 0,
              category: mission.category,
              quizScore: result.score,
              error: '경험치 추가 실패'
            };
          }
        }

        return { 
          success: true, 
          experience: 0,
          category: mission.category,
          quizScore: result.score
        };
      }

      return result;
    } catch (error) {
      throw error;
    }
  }, [missions, addExperienceByCategory]);

  return {
    missions,
    isLoading,
    error,
    completeMission,
    completeMissionWithPhoto,
    completeMissionWithQuiz,
    uncompleteMission,
    reloadMissions: loadMissions
  };
}; 