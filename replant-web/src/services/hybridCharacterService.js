// 하이브리드 캐릭터 서비스
// 온라인/오프라인 상태에 따라 자동으로 데이터 소스 선택 및 캐릭터 상태 관리

import { characterService } from './characterService.js';
import { OfflineDatabase } from '../utils/offlineDatabase.js';
import { isOnline, addNetworkListener } from '../utils/networkManager.js';

class HybridCharacterService {
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
        this.syncPendingCharacters().catch(error => {
          console.error('캐릭터 자동 동기화 실패:', error);
        });
      }
    });
  }

  // 사용자의 모든 캐릭터 조회
  async getUserCharacters() {
    await this.initialize();

    try {
      if (isOnline()) {
        // 온라인 상태: 서버에서 최신 데이터 조회 후 로컬 업데이트
        const onlineCharacters = await characterService.getUserCharacters();
        
        // 로컬 데이터베이스도 업데이트
        await this.offlineDB.clearCharacters(); // 전체 교체
        for (const character of onlineCharacters) {
          await this.offlineDB.saveCharacter({
            ...character,
            sync_status: 'synced',
            last_modified: new Date().toISOString()
          });
        }
        
        return onlineCharacters;
      } else {
        // 오프라인 상태: 로컬 데이터만 반환
        const localCharacters = await this.offlineDB.getCharacters();
        return localCharacters.map(character => ({
          id: character.id,
          user_id: character.user_id,
          category_id: character.category_id,
          name: character.name,
          level: character.level,
          experience: character.experience,
          max_experience: character.max_experience,
          total_experience: character.total_experience,
          unlocked: character.unlocked,
          unlocked_date: character.unlocked_date,
          stats: character.stats,
          achievements: character.achievements,
          created_at: character.created_at,
          updated_at: character.updated_at
        }));
      }
    } catch (error) {
      console.error('캐릭터 목록 조회 오류:', error);
      
      // 온라인 요청 실패 시 로컬 데이터 폴백
      const localCharacters = await this.offlineDB.getCharacters();
      return localCharacters.map(character => ({
        id: character.id,
        user_id: character.user_id,
        category_id: character.category_id,
        name: character.name,
        level: character.level,
        experience: character.experience,
        max_experience: character.max_experience,
        total_experience: character.total_experience,
        unlocked: character.unlocked,
        unlocked_date: character.unlocked_date,
        stats: character.stats,
        achievements: character.achievements,
        created_at: character.created_at,
        updated_at: character.updated_at
      }));
    }
  }

  // 캐릭터에 경험치 추가
  async addExperienceToCharacter(categoryId, experiencePoints) {
    await this.initialize();

    const now = new Date().toISOString();
    
    try {
      // 로컬 캐릭터 즉시 업데이트 (낙관적 업데이트)
      const localCharacter = await this.offlineDB.getCharacterByCategoryId(categoryId);
      if (!localCharacter) {
        throw new Error('캐릭터를 찾을 수 없습니다.');
      }

      // 경험치 계산 및 레벨업 체크
      const newExperience = (localCharacter.experience || 0) + experiencePoints;
      const newTotalExperience = (localCharacter.total_experience || 0) + experiencePoints;
      
      // 레벨업 계산
      const levelUpResult = this.calculateLevelUp(
        localCharacter.level, 
        newExperience, 
        localCharacter.max_experience
      );

      // 통계 업데이트
      const newStats = {
        ...localCharacter.stats,
        missionsCompleted: (localCharacter.stats?.missionsCompleted || 0) + 1
      };

      // 캐릭터 해제 체크 (첫 미션 완료 시)
      let unlocked = localCharacter.unlocked;
      let unlockedDate = localCharacter.unlocked_date;
      let newlyUnlocked = false;
      
      if (!localCharacter.unlocked && newStats.missionsCompleted === 1) {
        unlocked = true;
        unlockedDate = now;
        newlyUnlocked = true;
      }

      const updatedCharacter = {
        ...localCharacter,
        level: levelUpResult.newLevel,
        experience: levelUpResult.remainingExperience,
        max_experience: levelUpResult.newMaxExperience,
        total_experience: newTotalExperience,
        unlocked,
        unlocked_date: unlockedDate,
        stats: newStats,
        updated_at: now,
        sync_status: 'pending',
        last_modified: now
      };

      await this.offlineDB.saveCharacter(updatedCharacter);

      const result = {
        success: true,
        character: updatedCharacter,
        levelUp: levelUpResult.leveledUp,
        unlocked: newlyUnlocked,
        newName: this.getCharacterNameByLevel(levelUpResult.newLevel)
      };

      if (isOnline()) {
        // 온라인 상태: 즉시 서버에 동기화 시도
        try {
          const serverResult = await characterService.addExperienceToCharacter(categoryId, experiencePoints);
          
          // 서버 응답으로 로컬 데이터 업데이트
          await this.offlineDB.saveCharacter({
            ...serverResult.character,
            sync_status: 'synced',
            last_modified: now
          });
          
          return serverResult;
        } catch (syncError) {
          console.warn('즉시 동기화 실패, 나중에 재시도:', syncError);
          // 동기화 큐에 추가
          await this.offlineDB.addToSyncQueue({
            type: 'ADD_CHARACTER_EXPERIENCE',
            data: { category_id: categoryId, experience_points: experiencePoints },
            local_id: localCharacter.id,
            timestamp: now
          });
        }
      } else {
        // 오프라인 상태: 동기화 큐에 추가
        await this.offlineDB.addToSyncQueue({
          type: 'ADD_CHARACTER_EXPERIENCE',
          data: { category_id: categoryId, experience_points: experiencePoints },
          local_id: localCharacter.id,
          timestamp: now
        });
      }

      return result;
    } catch (error) {
      console.error('캐릭터 경험치 추가 오류:', error);
      throw new Error('캐릭터 경험치를 추가할 수 없습니다.');
    }
  }

  // 캐릭터 업데이트
  async updateCharacter(categoryId, updates) {
    await this.initialize();

    const now = new Date().toISOString();
    
    try {
      // 로컬 캐릭터 즉시 업데이트
      const localCharacter = await this.offlineDB.getCharacterByCategoryId(categoryId);
      if (!localCharacter) {
        throw new Error('수정할 캐릭터를 찾을 수 없습니다.');
      }

      const updatedCharacter = {
        ...localCharacter,
        ...updates,
        updated_at: now,
        sync_status: 'pending',
        last_modified: now
      };

      await this.offlineDB.saveCharacter(updatedCharacter);

      if (isOnline()) {
        // 온라인 상태: 즉시 서버에 동기화 시도
        try {
          const serverCharacter = await characterService.updateCharacter(categoryId, updates);
          
          // 서버 응답으로 로컬 데이터 업데이트
          await this.offlineDB.saveCharacter({
            ...serverCharacter,
            sync_status: 'synced',
            last_modified: now
          });
          
          return serverCharacter;
        } catch (syncError) {
          console.warn('즉시 동기화 실패, 나중에 재시도:', syncError);
          // 동기화 큐에 추가
          await this.offlineDB.addToSyncQueue({
            type: 'UPDATE_CHARACTER',
            data: { category_id: categoryId, updates },
            local_id: localCharacter.id,
            timestamp: now
          });
        }
      } else {
        // 오프라인 상태: 동기화 큐에 추가
        await this.offlineDB.addToSyncQueue({
          type: 'UPDATE_CHARACTER',
          data: { category_id: categoryId, updates },
          local_id: localCharacter.id,
          timestamp: now
        });
      }

      return updatedCharacter;
    } catch (error) {
      console.error('캐릭터 업데이트 오류:', error);
      throw new Error('캐릭터를 업데이트할 수 없습니다.');
    }
  }

  // 메인 캐릭터 설정
  async setMainCharacter(categoryId) {
    await this.initialize();

    const now = new Date().toISOString();
    
    try {
      // 로컬에서 캐릭터 존재 및 해제 여부 확인
      const localCharacter = await this.offlineDB.getCharacterByCategoryId(categoryId);
      if (!localCharacter) {
        throw new Error('캐릭터를 찾을 수 없습니다.');
      }

      if (!localCharacter.unlocked) {
        throw new Error('해제되지 않은 캐릭터는 대표 캐릭터로 설정할 수 없습니다.');
      }

      // 로컬 메타데이터에 저장
      await this.offlineDB.setMetadata('selectedCharacterId', categoryId);
      await this.offlineDB.setMetadata('selectedCharacterLastUpdated', now);

      const result = {
        success: true,
        settings: {
          selectedCharacterId: categoryId,
          lastUpdated: now
        }
      };

      if (isOnline()) {
        // 온라인 상태: 즉시 서버에 동기화 시도
        try {
          const serverResult = await characterService.setMainCharacter(categoryId);
          return serverResult;
        } catch (syncError) {
          console.warn('메인 캐릭터 설정 동기화 실패, 나중에 재시도:', syncError);
          // 동기화 큐에 추가
          await this.offlineDB.addToSyncQueue({
            type: 'SET_MAIN_CHARACTER',
            data: { category_id: categoryId },
            local_id: `main_character_${categoryId}`,
            timestamp: now
          });
        }
      } else {
        // 오프라인 상태: 동기화 큐에 추가
        await this.offlineDB.addToSyncQueue({
          type: 'SET_MAIN_CHARACTER',
          data: { category_id: categoryId },
          local_id: `main_character_${categoryId}`,
          timestamp: now
        });
      }

      return result;
    } catch (error) {
      console.error('메인 캐릭터 설정 오류:', error);
      throw new Error('메인 캐릭터를 설정할 수 없습니다.');
    }
  }

  // 메인 캐릭터 조회
  async getMainCharacter() {
    await this.initialize();

    try {
      if (isOnline()) {
        // 온라인 상태: 서버에서 조회
        const serverCharacter = await characterService.getMainCharacter();
        
        if (serverCharacter) {
          // 로컬에도 저장
          await this.offlineDB.saveCharacter({
            ...serverCharacter,
            sync_status: 'synced',
            last_modified: new Date().toISOString()
          });
          
          await this.offlineDB.setMetadata('selectedCharacterId', serverCharacter.category_id);
        }
        
        return serverCharacter;
      } else {
        // 오프라인 상태: 로컬 메타데이터에서 조회
        const selectedCharacterId = await this.offlineDB.getMetadata('selectedCharacterId');
        
        if (!selectedCharacterId) {
          return null;
        }

        return await this.offlineDB.getCharacterByCategoryId(selectedCharacterId);
      }
    } catch (error) {
      console.error('메인 캐릭터 조회 오류:', error);
      
      // 폴백: 로컬 데이터
      try {
        const selectedCharacterId = await this.offlineDB.getMetadata('selectedCharacterId');
        if (selectedCharacterId) {
          return await this.offlineDB.getCharacterByCategoryId(selectedCharacterId);
        }
        return null;
      } catch (fallbackError) {
        return null;
      }
    }
  }

  // 캐릭터 이름 업데이트
  async updateCharacterName(categoryId, newName) {
    await this.initialize();

    if (!newName || newName.trim().length === 0) {
      throw new Error('캐릭터 이름은 비어있을 수 없습니다.');
    }

    if (newName.length > 20) {
      throw new Error('캐릭터 이름은 20자를 초과할 수 없습니다.');
    }

    return await this.updateCharacter(categoryId, { name: newName.trim() });
  }

  // 캐릭터 해제
  async unlockCharacter(categoryId) {
    await this.initialize();

    const now = new Date().toISOString();
    
    try {
      const localCharacter = await this.offlineDB.getCharacterByCategoryId(categoryId);
      if (!localCharacter) {
        throw new Error('캐릭터를 찾을 수 없습니다.');
      }

      if (localCharacter.unlocked) {
        return {
          success: true,
          character: localCharacter
        };
      }

      const unlockAchievement = {
        id: `unlock_${categoryId}`,
        type: 'unlock',
        unlockedDate: now,
        title: `캐릭터 해제!`,
        description: `새로운 캐릭터를 해제했습니다.`
      };

      const currentAchievements = localCharacter.achievements || [];
      const updatedAchievements = [...currentAchievements, unlockAchievement];

      const updatedCharacter = {
        ...localCharacter,
        unlocked: true,
        unlocked_date: now,
        achievements: updatedAchievements,
        updated_at: now,
        sync_status: 'pending',
        last_modified: now
      };

      await this.offlineDB.saveCharacter(updatedCharacter);

      const result = {
        success: true,
        character: updatedCharacter
      };

      if (isOnline()) {
        // 온라인 상태: 즉시 서버에 동기화 시도
        try {
          const serverResult = await characterService.unlockCharacter(categoryId);
          
          await this.offlineDB.saveCharacter({
            ...serverResult.character,
            sync_status: 'synced',
            last_modified: now
          });
          
          return serverResult;
        } catch (syncError) {
          console.warn('캐릭터 해제 동기화 실패, 나중에 재시도:', syncError);
          await this.offlineDB.addToSyncQueue({
            type: 'UNLOCK_CHARACTER',
            data: { category_id: categoryId },
            local_id: localCharacter.id,
            timestamp: now
          });
        }
      } else {
        // 오프라인 상태: 동기화 큐에 추가
        await this.offlineDB.addToSyncQueue({
          type: 'UNLOCK_CHARACTER',
          data: { category_id: categoryId },
          local_id: localCharacter.id,
          timestamp: now
        });
      }

      return result;
    } catch (error) {
      console.error('캐릭터 해제 오류:', error);
      throw new Error('캐릭터를 해제할 수 없습니다.');
    }
  }

  // 레벨업 계산 로직 (오프라인 전용)
  calculateLevelUp(currentLevel, newExperience, currentMaxExperience) {
    let level = currentLevel;
    let experience = newExperience;
    let maxExperience = currentMaxExperience;
    let leveledUp = false;

    // 레벨업 체크 및 처리
    while (experience >= maxExperience && level < 100) { // 최대 레벨 100
      experience -= maxExperience;
      level++;
      leveledUp = true;
      
      // 다음 레벨의 필요 경험치 계산
      maxExperience = this.calculateMaxExperience(level);
    }

    return {
      newLevel: level,
      remainingExperience: experience,
      newMaxExperience: maxExperience,
      leveledUp
    };
  }

  // 레벨별 최대 경험치 계산
  calculateMaxExperience(level) {
    const baseExp = 500;
    const growthRate = 1.15;
    return Math.floor(baseExp * Math.pow(growthRate, level - 1));
  }

  // 레벨별 캐릭터 이름 (기본값)
  getCharacterNameByLevel(level) {
    if (level >= 50) return '전설의 동반자';
    if (level >= 30) return '성장한 동반자';
    if (level >= 15) return '자란 동반자';
    if (level >= 5) return '어린 동반자';
    return '새싹 동반자';
  }

  // 대기 중인 캐릭터 동기화
  async syncPendingCharacters() {
    if (!isOnline()) {
      console.log('오프라인 상태로 캐릭터 동기화를 건너뜁니다.');
      return { success: false, reason: 'offline' };
    }

    await this.initialize();

    try {
      const syncQueue = await this.offlineDB.getSyncQueue();
      const characterSyncItems = syncQueue.filter(item => 
        ['ADD_CHARACTER_EXPERIENCE', 'UPDATE_CHARACTER', 'SET_MAIN_CHARACTER', 'UNLOCK_CHARACTER'].includes(item.type)
      );

      const results = {
        success: 0,
        failed: 0,
        total: characterSyncItems.length,
        errors: []
      };

      for (const item of characterSyncItems) {
        try {
          await this.processCharacterSyncItem(item);
          await this.offlineDB.removeSyncQueueItem(item.id);
          results.success++;
        } catch (error) {
          console.error(`캐릭터 동기화 항목 처리 실패 (ID: ${item.id}):`, error);
          results.failed++;
          results.errors.push({
            item: item,
            error: error.message
          });
        }
      }

      console.log('캐릭터 동기화 완료:', results);
      return { success: true, results };
    } catch (error) {
      console.error('캐릭터 동기화 오류:', error);
      return { success: false, error: error.message };
    }
  }

  // 개별 캐릭터 동기화 항목 처리
  async processCharacterSyncItem(item) {
    const now = new Date().toISOString();

    switch (item.type) {
      case 'ADD_CHARACTER_EXPERIENCE':
        const expResult = await characterService.addExperienceToCharacter(
          item.data.category_id, 
          item.data.experience_points
        );
        await this.offlineDB.saveCharacter({
          ...expResult.character,
          sync_status: 'synced',
          last_modified: now
        });
        break;

      case 'UPDATE_CHARACTER':
        const updatedCharacter = await characterService.updateCharacter(
          item.data.category_id, 
          item.data.updates
        );
        await this.offlineDB.saveCharacter({
          ...updatedCharacter,
          sync_status: 'synced',
          last_modified: now
        });
        break;

      case 'SET_MAIN_CHARACTER':
        await characterService.setMainCharacter(item.data.category_id);
        await this.offlineDB.setMetadata('selectedCharacterId', item.data.category_id);
        break;

      case 'UNLOCK_CHARACTER':
        const unlockResult = await characterService.unlockCharacter(item.data.category_id);
        await this.offlineDB.saveCharacter({
          ...unlockResult.character,
          sync_status: 'synced',
          last_modified: now
        });
        break;

      default:
        throw new Error(`알 수 없는 캐릭터 동기화 타입: ${item.type}`);
    }
  }

  // 동기화 상태 확인
  async getSyncStatus() {
    await this.initialize();

    const pendingItems = await this.offlineDB.getSyncQueue();
    const characterPendingItems = pendingItems.filter(item => 
      ['ADD_CHARACTER_EXPERIENCE', 'UPDATE_CHARACTER', 'SET_MAIN_CHARACTER', 'UNLOCK_CHARACTER'].includes(item.type)
    );
    const pendingCharacters = await this.offlineDB.getPendingCharacters();

    return {
      pendingSync: characterPendingItems.length,
      pendingCharacters: pendingCharacters.length,
      isOnline: isOnline(),
      lastSyncTime: await this.offlineDB.getLastSyncTime()
    };
  }

  // 강제 전체 캐릭터 동기화
  async forceSyncAll() {
    if (!isOnline()) {
      throw new Error('온라인 상태에서만 전체 동기화가 가능합니다.');
    }

    await this.initialize();

    try {
      // 1. 서버에서 최신 데이터 조회
      const serverCharacters = await characterService.getUserCharacters();
      const mainCharacter = await characterService.getMainCharacter();

      // 2. 로컬 데이터 모두 삭제 후 서버 데이터로 교체
      await this.offlineDB.clearCharacters();

      for (const character of serverCharacters) {
        await this.offlineDB.saveCharacter({
          ...character,
          sync_status: 'synced',
          last_modified: new Date().toISOString()
        });
      }

      // 3. 메인 캐릭터 설정 동기화
      if (mainCharacter) {
        await this.offlineDB.setMetadata('selectedCharacterId', mainCharacter.category_id);
      }

      // 4. 캐릭터 관련 동기화 큐 비우기
      const syncQueue = await this.offlineDB.getSyncQueue();
      const characterSyncItems = syncQueue.filter(item => 
        ['ADD_CHARACTER_EXPERIENCE', 'UPDATE_CHARACTER', 'SET_MAIN_CHARACTER', 'UNLOCK_CHARACTER'].includes(item.type)
      );
      
      for (const item of characterSyncItems) {
        await this.offlineDB.removeSyncQueueItem(item.id);
      }

      return { success: true, syncedCount: serverCharacters.length };
    } catch (error) {
      console.error('전체 캐릭터 동기화 실패:', error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스 생성
const hybridCharacterService = new HybridCharacterService();

export default hybridCharacterService;