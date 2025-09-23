import { supabase, getCurrentUserId, ensureNicknameSession } from '../config/supabase';
import { validateAndNormalizeCategory } from '../utils/categoryUtils';
import { quizService } from './quizService';

class MissionService {

  async getUserMissions() {
    try {
      await ensureNicknameSession();
      
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('사용자 ID를 가져올 수 없습니다.');
      }

      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        return await this.initializeUserMissions(userId);
      }

      // 템플릿과 동기화: 부족한 미션만 백필 (재초기화 대신 안전 동기화)
      const { data: templateIds, error: templateErr } = await supabase
        .from('mission_templates')
        .select('mission_id');
      if (templateErr) {
        throw templateErr;
      }
      const templateMissionIds = (templateIds || []).map(t => t.mission_id);
      const userMissionIds = (data || []).map(m => m.mission_id);
      if (templateMissionIds.length > userMissionIds.length) {
        await this.backfillMissingMissions(userId, templateMissionIds, userMissionIds);
        // 동기화 후 최신 데이터 반환
        const { data: reloaded } = await supabase
          .from('missions')
          .select('*')
          .eq('user_id', userId);
        return reloaded || [];
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  async deleteUserMissions(userId) {
    try {
      const { error } = await supabase
        .from('missions')
        .delete()
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

    } catch (error) {
      throw error;
    }
  }

  async reinitializeUserMissions(userId) {
    try {
      await this.deleteUserMissions(userId);
      const missions = await this.initializeUserMissions(userId);
      
      return missions;
    } catch (error) {
      throw error;
    }
  }

  async initializeUserMissions(userId) {
    try {
      const { data: missionTemplates, error: templateError } = await supabase
        .from('mission_templates')
        .select('*')
        .order('id');

      if (templateError) {
        throw templateError;
      }

      if (!missionTemplates || missionTemplates.length === 0) {
        throw new Error('미션 템플릿이 없습니다.');
      }


      const missionsToInsert = missionTemplates.map(template => ({
        user_id: userId,
        mission_id: template.mission_id,
        title: template.title,
        description: template.description,
        emoji: template.emoji,
        category: validateAndNormalizeCategory(template.category_id ?? template.category, '미션'),
        difficulty: template.difficulty,
        experience: template.experience,
        completed: false
      }));

      const batchSize = 10;
      const allInsertedMissions = [];
      const maxRetries = 3;

      for (let i = 0; i < missionsToInsert.length; i += batchSize) {
        const batch = missionsToInsert.slice(i, i + batchSize);
        let success = false;
        let retryCount = 0;

        while (!success && retryCount < maxRetries) {
          try {
            const { data, error } = await supabase
              .from('missions')
              .insert(batch)
              .select('*');

            if (error) {
              retryCount++;
              
              if (retryCount === maxRetries) {
                throw error;
              }
              
              await new Promise(resolve => setTimeout(resolve, 1000));
              continue;
            }

            allInsertedMissions.push(...data);
            success = true;

          } catch (error) {
            throw error;
          }
        }
      }

      
      if (allInsertedMissions.length !== missionTemplates.length) {
        throw new Error(`미션 초기화 불완전: 예상 ${missionTemplates.length}개, 실제 ${allInsertedMissions.length}개`);
      }

      return allInsertedMissions;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 사용자 미션을 템플릿과 동기화하여 누락된 미션만 안전하게 추가
   */
  async backfillMissingMissions(userId, templateMissionIds, userMissionIds) {
    try {
      // 누락된 미션 ID 계산
      const missingIds = templateMissionIds.filter(id => !userMissionIds.includes(id));
      if (missingIds.length === 0) return;

      // 누락된 템플릿 상세 조회
      const { data: missingTemplates, error: tmplErr } = await supabase
        .from('mission_templates')
        .select('*')
        .in('mission_id', missingIds);
      if (tmplErr) {
        throw tmplErr;
      }

      const missionsToInsert = (missingTemplates || []).map(template => ({
        user_id: userId,
        mission_id: template.mission_id,
        title: template.title,
        description: template.description,
        emoji: template.emoji,
        category: validateAndNormalizeCategory(template.category_id ?? template.category, '미션'),
        difficulty: template.difficulty,
        experience: template.experience,
        completed: false
      }));

      if (missionsToInsert.length === 0) return;

      const batchSize = 10;
      const maxRetries = 3;
      for (let i = 0; i < missionsToInsert.length; i += batchSize) {
        const batch = missionsToInsert.slice(i, i + batchSize);
        let success = false;
        let retryCount = 0;
        while (!success && retryCount < maxRetries) {
          const { error } = await supabase
            .from('missions')
            .insert(batch)
            .select('*');
          if (!error) {
            success = true;
            break;
          }
          retryCount++;
          if (retryCount === maxRetries) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (error) {
      throw error;
    }
  }

  async completeMission(missionId) {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('사용자 ID를 가져올 수 없습니다.');
      }

      const { data, error } = await supabase
        .from('missions')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('mission_id', missionId)
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  async completeMissionWithPhoto(missionId, photoUrl) {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('사용자 ID를 가져올 수 없습니다.');
      }

      const { data, error } = await supabase
        .from('missions')
        .update({
          photo_url: photoUrl,
          photo_submitted_at: new Date().toISOString(),
          // 비디오 인증 타입일 경우 video_url에도 저장 (프리뷰 일관성)
          video_url: photoUrl,
          video_submitted_at: new Date().toISOString(),
          completed: true,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('mission_id', missionId)
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  async uncompleteMission(missionId) {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('사용자 ID를 가져올 수 없습니다.');
      }

      const { data, error } = await supabase
        .from('missions')
        .update({
          completed: false,
          completed_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('mission_id', missionId)
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  async getCompletedMissions(userId, options = {}) {
    try {
      await ensureNicknameSession();
      
      if (!userId) {
        userId = await getCurrentUserId();
      }
      
      if (!userId) {
        throw new Error('사용자 ID를 가져올 수 없습니다.');
      }

      let query = supabase
        .from('missions')
        .select('*')
        .eq('user_id', userId)
        .eq('completed', true);

      // 카테고리 필터링 추가
      if (options.category) {
        query = query.eq('category', options.category);
      }

      const { data, error } = await query.order('completed_at', { ascending: false });

      if (error) {
        throw error;
      }

      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error };
    }
  }

  async getMissionStats(userId) {
    try {
      await ensureNicknameSession();
      
      if (!userId) {
        userId = await getCurrentUserId();
      }
      
      if (!userId) {
        throw new Error('사용자 ID를 가져올 수 없습니다.');
      }

      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .eq('user_id', userId)
        .eq('completed', true);

      if (error) {
        throw error;
      }

      const completedCount = data?.length || 0;
      const totalExperience = data?.reduce((sum, mission) => sum + (mission.experience || 0), 0) || 0;

      return {
        completedCount,
        totalExperience,
        error: null
      };
    } catch (error) {
      return {
        completedCount: 0,
        totalExperience: 0,
        error
      };
    }
  }

  /**
   * 퀴즈 완료 처리
   * @param {string} missionId - 미션 ID
   * @param {Array} answers - 사용자 답변
   * @param {number} timeSpent - 소요 시간 (초)
   * @returns {Promise<Object>} 완료 결과
   */
  async completeMissionWithQuiz(missionId, answers, timeSpent = 0) {
    try {
      await ensureNicknameSession();
      
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('사용자 ID를 가져올 수 없습니다.');
      }

      // 퀴즈 서비스를 통해 완료 처리
      const result = await quizService.completeQuiz(missionId, answers, timeSpent);
      
      return result;
    } catch (error) {
      throw error;
    }
  }

}

export const missionService = new MissionService(); 