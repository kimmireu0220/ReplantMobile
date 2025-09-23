// 하이브리드 미션 서비스
// 온라인/오프라인 상태에 따라 자동으로 데이터 소스 선택 및 미션 완료 처리

import { missionService } from './missionService.js';
import { OfflineDatabase } from '../utils/offlineDatabase.js';
import { isOnline, addNetworkListener } from '../utils/networkManager.js';

class HybridMissionService {
  constructor() {
    this.offlineDB = new OfflineDatabase();
    this.initialized = false;
    this.setupNetworkListener();
  }

  async initialize() {
    if (!this.initialized) {
      await this.offlineDB.initialize();
      this.initialized = true;
    }
  }

  setupNetworkListener() {
    addNetworkListener((isOnlineNow) => {
      if (isOnlineNow) {
        // 온라인 복구 시 자동 동기화
        this.syncPendingMissions().catch(error => {
          console.error('미션 자동 동기화 실패:', error);
        });
      }
    });
  }

  // 사용자의 모든 미션 조회
  async getUserMissions() {
    await this.initialize();

    try {
      if (isOnline()) {
        // 온라인 상태: 서버에서 최신 데이터 조회 후 로컬 업데이트
        const onlineMissions = await missionService.getUserMissions();
        
        // 로컬 데이터베이스도 업데이트
        await this.offlineDB.clearMissions(); // 전체 교체
        for (const mission of onlineMissions) {
          await this.offlineDB.saveMission({
            ...mission,
            sync_status: 'synced',
            last_modified: new Date().toISOString()
          });
        }
        
        return onlineMissions;
      } else {
        // 오프라인 상태: 로컬 데이터만 반환
        const localMissions = await this.offlineDB.getMissions();
        return localMissions.map(mission => ({
          id: mission.id,
          user_id: mission.user_id,
          mission_id: mission.mission_id,
          title: mission.title,
          description: mission.description,
          emoji: mission.emoji,
          category: mission.category,
          difficulty: mission.difficulty,
          experience: mission.experience,
          completed: mission.completed,
          completed_at: mission.completed_at,
          photo_url: mission.photo_url,
          photo_submitted_at: mission.photo_submitted_at,
          created_at: mission.created_at,
          updated_at: mission.updated_at
        }));
      }
    } catch (error) {
      console.error('미션 목록 조회 오류:', error);
      
      // 온라인 요청 실패 시 로컬 데이터 폴백
      const localMissions = await this.offlineDB.getMissions();
      return localMissions.map(mission => ({
        id: mission.id,
        user_id: mission.user_id,
        mission_id: mission.mission_id,
        title: mission.title,
        description: mission.description,
        emoji: mission.emoji,
        category: mission.category,
        difficulty: mission.difficulty,
        experience: mission.experience,
        completed: mission.completed,
        completed_at: mission.completed_at,
        photo_url: mission.photo_url,
        photo_submitted_at: mission.photo_submitted_at,
        created_at: mission.created_at,
        updated_at: mission.updated_at
      }));
    }
  }

  // 미션 완료
  async completeMission(missionId) {
    await this.initialize();

    const now = new Date().toISOString();
    
    try {
      // 로컬 미션 상태 즉시 업데이트 (낙관적 업데이트)
      const localMission = await this.offlineDB.getMissionByMissionId(missionId);
      if (!localMission) {
        throw new Error('완료할 미션을 찾을 수 없습니다.');
      }

      if (localMission.completed) {
        throw new Error('이미 완료된 미션입니다.');
      }

      const updatedMission = {
        ...localMission,
        completed: true,
        completed_at: now,
        updated_at: now,
        sync_status: 'pending',
        last_modified: now
      };

      await this.offlineDB.saveMission(updatedMission);

      // 경험치를 로컬 캐릭터에 즉시 적용
      await this.addExperienceToCharacter(localMission.experience);

      if (isOnline()) {
        // 온라인 상태: 즉시 서버에 동기화 시도
        try {
          const serverMission = await missionService.completeMission(missionId);
          
          // 서버 응답으로 로컬 데이터 업데이트
          await this.offlineDB.saveMission({
            ...serverMission,
            sync_status: 'synced',
            last_modified: now
          });
          
          return serverMission;
        } catch (syncError) {
          console.warn('즉시 동기화 실패, 나중에 재시도:', syncError);
          // 동기화 큐에 추가
          await this.offlineDB.addToSyncQueue({
            type: 'COMPLETE_MISSION',
            data: { mission_id: missionId },
            local_id: localMission.id,
            timestamp: now
          });
        }
      } else {
        // 오프라인 상태: 동기화 큐에 추가
        await this.offlineDB.addToSyncQueue({
          type: 'COMPLETE_MISSION',
          data: { mission_id: missionId },
          local_id: localMission.id,
          timestamp: now
        });
      }

      return updatedMission;
    } catch (error) {
      console.error('미션 완료 오류:', error);
      throw new Error('미션을 완료할 수 없습니다.');
    }
  }

  // 사진과 함께 미션 완료
  async completeMissionWithPhoto(missionId, photoUrl) {
    await this.initialize();

    const now = new Date().toISOString();
    
    try {
      // 로컬 미션 상태 즉시 업데이트
      const localMission = await this.offlineDB.getMissionByMissionId(missionId);
      if (!localMission) {
        throw new Error('완료할 미션을 찾을 수 없습니다.');
      }

      if (localMission.completed) {
        throw new Error('이미 완료된 미션입니다.');
      }

      const updatedMission = {
        ...localMission,
        completed: true,
        completed_at: now,
        photo_url: photoUrl,
        photo_submitted_at: now,
        updated_at: now,
        sync_status: 'pending',
        last_modified: now
      };

      await this.offlineDB.saveMission(updatedMission);

      // 경험치를 로컬 캐릭터에 즉시 적용
      await this.addExperienceToCharacter(localMission.experience);

      if (isOnline()) {
        // 온라인 상태: 즉시 서버에 동기화 시도
        try {
          const serverMission = await missionService.completeMissionWithPhoto(missionId, photoUrl);
          
          // 서버 응답으로 로컬 데이터 업데이트
          await this.offlineDB.saveMission({
            ...serverMission,
            sync_status: 'synced',
            last_modified: now
          });
          
          return serverMission;
        } catch (syncError) {
          console.warn('즉시 동기화 실패, 나중에 재시도:', syncError);
          // 동기화 큐에 추가
          await this.offlineDB.addToSyncQueue({
            type: 'COMPLETE_MISSION_WITH_PHOTO',
            data: { mission_id: missionId, photo_url: photoUrl },
            local_id: localMission.id,
            timestamp: now
          });
        }
      } else {
        // 오프라인 상태: 동기화 큐에 추가
        await this.offlineDB.addToSyncQueue({
          type: 'COMPLETE_MISSION_WITH_PHOTO',
          data: { mission_id: missionId, photo_url: photoUrl },
          local_id: localMission.id,
          timestamp: now
        });
      }

      return updatedMission;
    } catch (error) {
      console.error('사진과 함께 미션 완료 오류:', error);
      throw new Error('미션을 완료할 수 없습니다.');
    }
  }

  // 미션 완료 취소
  async uncompleteMission(missionId) {
    await this.initialize();

    const now = new Date().toISOString();
    
    try {
      const localMission = await this.offlineDB.getMissionByMissionId(missionId);
      if (!localMission) {
        throw new Error('취소할 미션을 찾을 수 없습니다.');
      }

      if (!localMission.completed) {
        throw new Error('완료되지 않은 미션입니다.');
      }

      const updatedMission = {
        ...localMission,
        completed: false,
        completed_at: null,
        photo_url: null,
        photo_submitted_at: null,
        updated_at: now,
        sync_status: 'pending',
        last_modified: now
      };

      await this.offlineDB.saveMission(updatedMission);

      // 경험치를 로컬 캐릭터에서 차감
      await this.subtractExperienceFromCharacter(localMission.experience);

      if (isOnline()) {
        // 온라인 상태: 즉시 서버에 동기화 시도
        try {
          const serverMission = await missionService.uncompleteMission(missionId);
          
          await this.offlineDB.saveMission({
            ...serverMission,
            sync_status: 'synced',
            last_modified: now
          });
          
          return serverMission;
        } catch (syncError) {
          console.warn('즉시 동기화 실패, 나중에 재시도:', syncError);
          await this.offlineDB.addToSyncQueue({
            type: 'UNCOMPLETE_MISSION',
            data: { mission_id: missionId },
            local_id: localMission.id,
            timestamp: now
          });
        }
      } else {
        // 오프라인 상태: 동기화 큐에 추가
        await this.offlineDB.addToSyncQueue({
          type: 'UNCOMPLETE_MISSION',
          data: { mission_id: missionId },
          local_id: localMission.id,
          timestamp: now
        });
      }

      return updatedMission;
    } catch (error) {
      console.error('미션 완료 취소 오류:', error);
      throw new Error('미션 완료를 취소할 수 없습니다.');
    }
  }

  // 완료된 미션 목록 조회
  async getCompletedMissions(userId, options = {}) {
    await this.initialize();

    try {
      if (isOnline()) {
        // 온라인 상태: 서버에서 조회
        const result = await missionService.getCompletedMissions(userId, options);
        
        // 로컬 데이터도 업데이트
        if (result.data) {
          for (const mission of result.data) {
            await this.offlineDB.saveMission({
              ...mission,
              sync_status: 'synced',
              last_modified: new Date().toISOString()
            });
          }
        }
        
        return result;
      } else {
        // 오프라인 상태: 로컬 데이터에서 조회
        const localMissions = await this.offlineDB.getCompletedMissions(userId, options);
        return {
          data: localMissions.map(mission => ({
            id: mission.id,
            user_id: mission.user_id,
            mission_id: mission.mission_id,
            title: mission.title,
            description: mission.description,
            emoji: mission.emoji,
            category: mission.category,
            difficulty: mission.difficulty,
            experience: mission.experience,
            completed: mission.completed,
            completed_at: mission.completed_at,
            photo_url: mission.photo_url,
            photo_submitted_at: mission.photo_submitted_at,
            created_at: mission.created_at,
            updated_at: mission.updated_at
          })),
          error: null
        };
      }
    } catch (error) {
      console.error('완료된 미션 조회 오류:', error);
      
      // 폴백: 로컬 데이터
      const localMissions = await this.offlineDB.getCompletedMissions(userId, options);
      return {
        data: localMissions.map(mission => ({
          id: mission.id,
          user_id: mission.user_id,
          mission_id: mission.mission_id,
          title: mission.title,
          description: mission.description,
          emoji: mission.emoji,
          category: mission.category,
          difficulty: mission.difficulty,
          experience: mission.experience,
          completed: mission.completed,
          completed_at: mission.completed_at,
          photo_url: mission.photo_url,
          photo_submitted_at: mission.photo_submitted_at,
          created_at: mission.created_at,
          updated_at: mission.updated_at
        })),
        error
      };
    }
  }

  // 미션 통계 조회
  async getMissionStats(userId) {
    await this.initialize();

    try {
      if (isOnline()) {
        // 온라인 상태: 서버에서 조회
        return await missionService.getMissionStats(userId);
      } else {
        // 오프라인 상태: 로컬 데이터에서 계산
        const completedMissions = await this.offlineDB.getCompletedMissions(userId);
        
        const completedCount = completedMissions.length;
        const totalExperience = completedMissions.reduce(
          (sum, mission) => sum + (mission.experience || 0), 0
        );

        return {
          completedCount,
          totalExperience,
          error: null
        };
      }
    } catch (error) {
      console.error('미션 통계 조회 오류:', error);
      
      // 폴백: 로컬 데이터에서 계산
      try {
        const completedMissions = await this.offlineDB.getCompletedMissions(userId);
        
        return {
          completedCount: completedMissions.length,
          totalExperience: completedMissions.reduce(
            (sum, mission) => sum + (mission.experience || 0), 0
          ),
          error
        };
      } catch (fallbackError) {
        return {
          completedCount: 0,
          totalExperience: 0,
          error: fallbackError
        };
      }
    }
  }

  // 로컬 캐릭터에 경험치 추가
  async addExperienceToCharacter(experience) {
    try {
      const character = await this.offlineDB.getCharacter();
      if (!character) return;

      const newExperience = (character.experience || 0) + experience;
      const newLevel = this.calculateLevel(newExperience);

      await this.offlineDB.saveCharacter({
        ...character,
        experience: newExperience,
        level: newLevel,
        sync_status: 'pending',
        last_modified: new Date().toISOString()
      });
    } catch (error) {
      console.error('캐릭터 경험치 추가 오류:', error);
    }
  }

  // 로컬 캐릭터에서 경험치 차감
  async subtractExperienceFromCharacter(experience) {
    try {
      const character = await this.offlineDB.getCharacter();
      if (!character) return;

      const newExperience = Math.max(0, (character.experience || 0) - experience);
      const newLevel = this.calculateLevel(newExperience);

      await this.offlineDB.saveCharacter({
        ...character,
        experience: newExperience,
        level: newLevel,
        sync_status: 'pending',
        last_modified: new Date().toISOString()
      });
    } catch (error) {
      console.error('캐릭터 경험치 차감 오류:', error);
    }
  }

  // 레벨 계산 (기존 로직과 동일하게 유지)
  calculateLevel(experience) {
    const baseExp = 100;
    const expGrowth = 1.2;
    
    let level = 1;
    let requiredExp = baseExp;
    let totalExp = 0;
    
    while (totalExp + requiredExp <= experience) {
      totalExp += requiredExp;
      level++;
      requiredExp = Math.floor(baseExp * Math.pow(expGrowth, level - 1));
    }
    
    return level;
  }

  // 대기 중인 미션 동기화
  async syncPendingMissions() {
    if (!isOnline()) {
      console.log('오프라인 상태로 미션 동기화를 건너뜁니다.');
      return { success: false, reason: 'offline' };
    }

    await this.initialize();

    try {
      const syncQueue = await this.offlineDB.getSyncQueue();
      const missionSyncItems = syncQueue.filter(item => 
        ['COMPLETE_MISSION', 'COMPLETE_MISSION_WITH_PHOTO', 'UNCOMPLETE_MISSION'].includes(item.type)
      );

      const results = {
        success: 0,
        failed: 0,
        total: missionSyncItems.length,
        errors: []
      };

      for (const item of missionSyncItems) {
        try {
          await this.processMissionSyncItem(item);
          await this.offlineDB.removeSyncQueueItem(item.id);
          results.success++;
        } catch (error) {
          console.error(`미션 동기화 항목 처리 실패 (ID: ${item.id}):`, error);
          results.failed++;
          results.errors.push({
            item: item,
            error: error.message
          });
        }
      }

      console.log('미션 동기화 완료:', results);
      return { success: true, results };
    } catch (error) {
      console.error('미션 동기화 오류:', error);
      return { success: false, error: error.message };
    }
  }

  // 개별 미션 동기화 항목 처리
  async processMissionSyncItem(item) {
    const now = new Date().toISOString();

    switch (item.type) {
      case 'COMPLETE_MISSION':
        const completedMission = await missionService.completeMission(item.data.mission_id);
        await this.offlineDB.saveMission({
          ...completedMission,
          sync_status: 'synced',
          last_modified: now
        });
        break;

      case 'COMPLETE_MISSION_WITH_PHOTO':
        const completedMissionWithPhoto = await missionService.completeMissionWithPhoto(
          item.data.mission_id, 
          item.data.photo_url
        );
        await this.offlineDB.saveMission({
          ...completedMissionWithPhoto,
          sync_status: 'synced',
          last_modified: now
        });
        break;

      case 'UNCOMPLETE_MISSION':
        const uncompletedMission = await missionService.uncompleteMission(item.data.mission_id);
        await this.offlineDB.saveMission({
          ...uncompletedMission,
          sync_status: 'synced',
          last_modified: now
        });
        break;

      default:
        throw new Error(`알 수 없는 미션 동기화 타입: ${item.type}`);
    }
  }

  // 동기화 상태 확인
  async getSyncStatus() {
    await this.initialize();

    const pendingItems = await this.offlineDB.getSyncQueue();
    const missionPendingItems = pendingItems.filter(item => 
      ['COMPLETE_MISSION', 'COMPLETE_MISSION_WITH_PHOTO', 'UNCOMPLETE_MISSION'].includes(item.type)
    );
    const pendingMissions = await this.offlineDB.getPendingMissions();

    return {
      pendingSync: missionPendingItems.length,
      pendingMissions: pendingMissions.length,
      isOnline: isOnline(),
      lastSyncTime: await this.offlineDB.getLastSyncTime()
    };
  }

  // 강제 전체 미션 동기화
  async forceSyncAll() {
    if (!isOnline()) {
      throw new Error('온라인 상태에서만 전체 동기화가 가능합니다.');
    }

    await this.initialize();

    try {
      // 1. 서버에서 최신 데이터 조회
      const serverMissions = await missionService.getUserMissions();

      // 2. 로컬 데이터 모두 삭제 후 서버 데이터로 교체
      await this.offlineDB.clearMissions();

      for (const mission of serverMissions) {
        await this.offlineDB.saveMission({
          ...mission,
          sync_status: 'synced',
          last_modified: new Date().toISOString()
        });
      }

      // 3. 미션 관련 동기화 큐 비우기
      const syncQueue = await this.offlineDB.getSyncQueue();
      const missionSyncItems = syncQueue.filter(item => 
        ['COMPLETE_MISSION', 'COMPLETE_MISSION_WITH_PHOTO', 'UNCOMPLETE_MISSION'].includes(item.type)
      );
      
      for (const item of missionSyncItems) {
        await this.offlineDB.removeSyncQueueItem(item.id);
      }

      return { success: true, syncedCount: serverMissions.length };
    } catch (error) {
      console.error('전체 미션 동기화 실패:', error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스 생성
const hybridMissionService = new HybridMissionService();

export default hybridMissionService;