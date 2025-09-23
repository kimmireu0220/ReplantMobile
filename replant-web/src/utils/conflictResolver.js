// 데이터 동기화 충돌 해결 관리자
// 온라인/오프라인 데이터 간 충돌 상황을 감지하고 해결

import { OfflineDatabase } from './offlineDatabase.js';

// 충돌 유형 정의
export const CONFLICT_TYPES = {
  TIMESTAMP_CONFLICT: 'timestamp_conflict',    // 시간 기반 충돌
  DUPLICATE_OPERATION: 'duplicate_operation',  // 중복 작업
  DELETED_ON_SERVER: 'deleted_on_server',     // 서버에서 삭제됨
  ID_MISMATCH: 'id_mismatch',                 // ID 불일치
  DATA_INCONSISTENCY: 'data_inconsistency'    // 데이터 불일치
};

// 해결 전략 정의
export const RESOLUTION_STRATEGIES = {
  LAST_WRITE_WINS: 'last_write_wins',         // 최신 쓰기 우선
  SERVER_AUTHORITY: 'server_authority',       // 서버 데이터 우선
  LOCAL_AUTHORITY: 'local_authority',         // 로컬 데이터 우선
  MERGE_DATA: 'merge_data',                   // 데이터 병합
  USER_CHOICE: 'user_choice',                 // 사용자 선택
  SKIP_CONFLICT: 'skip_conflict'              // 충돌 무시
};

class ConflictResolver {
  constructor() {
    this.offlineDB = new OfflineDatabase();
    this.conflictHistory = [];
    this.conflictListeners = [];
  }

  async initialize() {
    await this.offlineDB.initialize();
    this.loadConflictHistory();
  }

  // 충돌 리스너 등록
  addConflictListener(callback) {
    this.conflictListeners.push(callback);
  }

  // 충돌 리스너 제거
  removeConflictListener(callback) {
    this.conflictListeners = this.conflictListeners.filter(listener => listener !== callback);
  }

  // 충돌 발생 알림
  notifyConflictListeners(conflict) {
    this.conflictListeners.forEach(listener => {
      try {
        listener(conflict);
      } catch (error) {
        console.error('충돌 리스너 오류:', error);
      }
    });
  }

  // 일기 데이터 충돌 해결
  async resolveDigeryConflict(localDiary, serverDiary) {
    const conflict = this.detectConflict('diary', localDiary, serverDiary);
    
    if (!conflict) {
      return { resolved: true, data: serverDiary, strategy: 'no_conflict' };
    }

    const resolution = await this.resolveConflict(conflict);
    
    // 충돌 기록 저장
    this.recordConflict(conflict, resolution);
    
    return resolution;
  }

  // 미션 데이터 충돌 해결
  async resolveMissionConflict(localMission, serverMission) {
    const conflict = this.detectConflict('mission', localMission, serverMission);
    
    if (!conflict) {
      return { resolved: true, data: serverMission, strategy: 'no_conflict' };
    }

    const resolution = await this.resolveConflict(conflict);
    
    // 충돌 기록 저장
    this.recordConflict(conflict, resolution);
    
    return resolution;
  }

  // 캐릭터 데이터 충돌 해결
  async resolveCharacterConflict(localCharacter, serverCharacter) {
    const conflict = this.detectConflict('character', localCharacter, serverCharacter);
    
    if (!conflict) {
      return { resolved: true, data: serverCharacter, strategy: 'no_conflict' };
    }

    const resolution = await this.resolveConflict(conflict);
    
    // 충돌 기록 저장
    this.recordConflict(conflict, resolution);
    
    return resolution;
  }

  // 충돌 감지
  detectConflict(dataType, localData, serverData) {
    if (!localData || !serverData) {
      return null;
    }

    const conflicts = [];

    // 1. 타임스탬프 충돌 확인
    const timestampConflict = this.detectTimestampConflict(localData, serverData);
    if (timestampConflict) {
      conflicts.push(timestampConflict);
    }

    // 2. 데이터 유형별 특수 충돌 확인
    switch (dataType) {
      case 'diary':
        const diaryConflicts = this.detectDiaryConflicts(localData, serverData);
        conflicts.push(...diaryConflicts);
        break;
      
      case 'mission':
        const missionConflicts = this.detectMissionConflicts(localData, serverData);
        conflicts.push(...missionConflicts);
        break;
      
      case 'character':
        const characterConflicts = this.detectCharacterConflicts(localData, serverData);
        conflicts.push(...characterConflicts);
        break;
      default:
        break;
    }

    if (conflicts.length === 0) {
      return null;
    }

    return {
      id: `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      dataType,
      conflicts,
      localData,
      serverData,
      timestamp: new Date().toISOString()
    };
  }

  // 타임스탬프 충돌 감지
  detectTimestampConflict(localData, serverData) {
    if (!localData.updated_at || !serverData.updated_at) {
      return null;
    }

    const localTime = new Date(localData.updated_at).getTime();
    const serverTime = new Date(serverData.updated_at).getTime();
    
    // 1분 이상 차이나고 내용이 다르면 충돌
    if (Math.abs(localTime - serverTime) > 60000) {
      if (this.hasDataDifferences(localData, serverData)) {
        return {
          type: CONFLICT_TYPES.TIMESTAMP_CONFLICT,
          localTime: localData.updated_at,
          serverTime: serverData.updated_at,
          timeDiff: Math.abs(localTime - serverTime)
        };
      }
    }

    return null;
  }

  // 일기 특수 충돌 감지
  detectDiaryConflicts(localDiary, serverDiary) {
    const conflicts = [];

    // 감정이나 내용이 다른 경우
    if (localDiary.emotion !== serverDiary.emotion || 
        localDiary.content !== serverDiary.content) {
      conflicts.push({
        type: CONFLICT_TYPES.DATA_INCONSISTENCY,
        field: 'content',
        localValue: { emotion: localDiary.emotion, content: localDiary.content },
        serverValue: { emotion: serverDiary.emotion, content: serverDiary.content }
      });
    }

    return conflicts;
  }

  // 미션 특수 충돌 감지
  detectMissionConflicts(localMission, serverMission) {
    const conflicts = [];

    // 완료 상태 충돌
    if (localMission.completed !== serverMission.completed) {
      conflicts.push({
        type: CONFLICT_TYPES.DATA_INCONSISTENCY,
        field: 'completed',
        localValue: localMission.completed,
        serverValue: serverMission.completed
      });
    }

    // 중복 완료 감지
    if (localMission.completed && serverMission.completed) {
      const localCompletedTime = new Date(localMission.completed_at || 0).getTime();
      const serverCompletedTime = new Date(serverMission.completed_at || 0).getTime();
      
      // 완료 시간이 5분 이상 차이나면 중복 완료로 간주
      if (Math.abs(localCompletedTime - serverCompletedTime) > 300000) {
        conflicts.push({
          type: CONFLICT_TYPES.DUPLICATE_OPERATION,
          operation: 'mission_completion',
          localTime: localMission.completed_at,
          serverTime: serverMission.completed_at
        });
      }
    }

    return conflicts;
  }

  // 캐릭터 특수 충돌 감지
  detectCharacterConflicts(localCharacter, serverCharacter) {
    const conflicts = [];

    // 경험치 충돌
    if (localCharacter.experience !== serverCharacter.experience ||
        localCharacter.total_experience !== serverCharacter.total_experience) {
      conflicts.push({
        type: CONFLICT_TYPES.DATA_INCONSISTENCY,
        field: 'experience',
        localValue: {
          experience: localCharacter.experience,
          total_experience: localCharacter.total_experience,
          level: localCharacter.level
        },
        serverValue: {
          experience: serverCharacter.experience,
          total_experience: serverCharacter.total_experience,
          level: serverCharacter.level
        }
      });
    }

    // 통계 충돌
    const localStats = localCharacter.stats || {};
    const serverStats = serverCharacter.stats || {};
    
    if (localStats.missionsCompleted !== serverStats.missionsCompleted) {
      conflicts.push({
        type: CONFLICT_TYPES.DATA_INCONSISTENCY,
        field: 'stats',
        localValue: localStats,
        serverValue: serverStats
      });
    }

    return conflicts;
  }

  // 데이터 차이점 확인
  hasDataDifferences(localData, serverData) {
    const excludeFields = ['sync_status', 'last_modified', 'id'];
    
    for (const key in localData) {
      if (excludeFields.includes(key)) continue;
      
      if (localData[key] !== serverData[key]) {
        // 객체인 경우 깊은 비교
        if (typeof localData[key] === 'object' && typeof serverData[key] === 'object') {
          if (JSON.stringify(localData[key]) !== JSON.stringify(serverData[key])) {
            return true;
          }
        } else {
          return true;
        }
      }
    }
    
    return false;
  }

  // 충돌 해결
  async resolveConflict(conflict) {
    const strategy = this.determineResolutionStrategy(conflict);
    
    switch (strategy) {
      case RESOLUTION_STRATEGIES.LAST_WRITE_WINS:
        return this.resolveByLastWrite(conflict);
      
      case RESOLUTION_STRATEGIES.SERVER_AUTHORITY:
        return this.resolveByServerAuthority(conflict);
      
      case RESOLUTION_STRATEGIES.LOCAL_AUTHORITY:
        return this.resolveByLocalAuthority(conflict);
      
      case RESOLUTION_STRATEGIES.MERGE_DATA:
        return this.resolveByMerging(conflict);
      
      case RESOLUTION_STRATEGIES.USER_CHOICE:
        return await this.resolveByUserChoice(conflict);
      
      case RESOLUTION_STRATEGIES.SKIP_CONFLICT:
        return this.resolveBySkipping(conflict);
      
      default:
        return this.resolveByServerAuthority(conflict);
    }
  }

  // 해결 전략 결정
  determineResolutionStrategy(conflict) {
    // 중복 작업의 경우 병합 시도
    if (conflict.conflicts.some(c => c.type === CONFLICT_TYPES.DUPLICATE_OPERATION)) {
      return RESOLUTION_STRATEGIES.MERGE_DATA;
    }

    // 미션 완료 상태는 서버 우선
    if (conflict.dataType === 'mission' && 
        conflict.conflicts.some(c => c.field === 'completed')) {
      return RESOLUTION_STRATEGIES.SERVER_AUTHORITY;
    }

    // 캐릭터 경험치는 높은 값 우선 (병합)
    if (conflict.dataType === 'character' && 
        conflict.conflicts.some(c => c.field === 'experience')) {
      return RESOLUTION_STRATEGIES.MERGE_DATA;
    }

    // 일기 내용은 최신 시간 우선
    if (conflict.dataType === 'diary' && 
        conflict.conflicts.some(c => c.field === 'content')) {
      return RESOLUTION_STRATEGIES.LAST_WRITE_WINS;
    }

    // 기본적으로 최신 쓰기 우선
    return RESOLUTION_STRATEGIES.LAST_WRITE_WINS;
  }

  // 최신 쓰기 우선 해결
  resolveByLastWrite(conflict) {
    const localTime = new Date(conflict.localData.updated_at || 0).getTime();
    const serverTime = new Date(conflict.serverData.updated_at || 0).getTime();
    
    const data = localTime > serverTime ? conflict.localData : conflict.serverData;
    const source = localTime > serverTime ? 'local' : 'server';
    
    return {
      resolved: true,
      data,
      strategy: RESOLUTION_STRATEGIES.LAST_WRITE_WINS,
      source,
      timestamp: new Date().toISOString()
    };
  }

  // 서버 우선 해결
  resolveByServerAuthority(conflict) {
    return {
      resolved: true,
      data: conflict.serverData,
      strategy: RESOLUTION_STRATEGIES.SERVER_AUTHORITY,
      source: 'server',
      timestamp: new Date().toISOString()
    };
  }

  // 로컬 우선 해결
  resolveByLocalAuthority(conflict) {
    return {
      resolved: true,
      data: conflict.localData,
      strategy: RESOLUTION_STRATEGIES.LOCAL_AUTHORITY,
      source: 'local',
      timestamp: new Date().toISOString()
    };
  }

  // 데이터 병합 해결
  resolveByMerging(conflict) {
    const mergedData = this.mergeConflictedData(conflict);
    
    return {
      resolved: true,
      data: mergedData,
      strategy: RESOLUTION_STRATEGIES.MERGE_DATA,
      source: 'merged',
      timestamp: new Date().toISOString()
    };
  }

  // 데이터 병합 로직
  mergeConflictedData(conflict) {
    const { localData, serverData, dataType } = conflict;
    
    switch (dataType) {
      case 'character':
        return this.mergeCharacterData(localData, serverData);
      
      case 'mission':
        return this.mergeMissionData(localData, serverData);
      
      case 'diary':
        return this.mergeDiaryData(localData, serverData);
      
      default:
        // 기본적으로 서버 데이터 우선하고 로컬의 최신 필드만 병합
        return {
          ...serverData,
          updated_at: this.getLatestTimestamp(localData.updated_at, serverData.updated_at)
        };
    }
  }

  // 캐릭터 데이터 병합
  mergeCharacterData(localData, serverData) {
    // 높은 값 우선 병합
    const mergedStats = {
      ...serverData.stats,
      ...localData.stats,
      missionsCompleted: Math.max(
        localData.stats?.missionsCompleted || 0,
        serverData.stats?.missionsCompleted || 0
      )
    };

    return {
      ...serverData,
      experience: Math.max(localData.experience || 0, serverData.experience || 0),
      total_experience: Math.max(localData.total_experience || 0, serverData.total_experience || 0),
      level: Math.max(localData.level || 1, serverData.level || 1),
      stats: mergedStats,
      unlocked: localData.unlocked || serverData.unlocked,
      unlocked_date: localData.unlocked_date || serverData.unlocked_date,
      achievements: this.mergeAchievements(localData.achievements, serverData.achievements),
      updated_at: this.getLatestTimestamp(localData.updated_at, serverData.updated_at)
    };
  }

  // 미션 데이터 병합
  mergeMissionData(localData, serverData) {
    // 완료된 상태 우선
    const isCompleted = localData.completed || serverData.completed;
    const completedAt = this.getLatestTimestamp(localData.completed_at, serverData.completed_at);
    
    return {
      ...serverData,
      completed: isCompleted,
      completed_at: isCompleted ? completedAt : null,
      photo_url: localData.photo_url || serverData.photo_url,
      photo_submitted_at: localData.photo_submitted_at || serverData.photo_submitted_at,
      updated_at: this.getLatestTimestamp(localData.updated_at, serverData.updated_at)
    };
  }

  // 일기 데이터 병합
  mergeDiaryData(localData, serverData) {
    // 최신 시간 기준으로 내용 선택
    const localTime = new Date(localData.updated_at || 0).getTime();
    const serverTime = new Date(serverData.updated_at || 0).getTime();
    
    if (localTime > serverTime) {
      return { ...localData, id: serverData.id };
    } else {
      return serverData;
    }
  }

  // 업적 병합
  mergeAchievements(localAchievements = [], serverAchievements = []) {
    const merged = [...serverAchievements];
    
    localAchievements.forEach(localAchievement => {
      const exists = merged.some(serverAchievement => 
        serverAchievement.id === localAchievement.id
      );
      
      if (!exists) {
        merged.push(localAchievement);
      }
    });
    
    return merged;
  }

  // 최신 타임스탬프 반환
  getLatestTimestamp(time1, time2) {
    if (!time1) return time2;
    if (!time2) return time1;
    
    return new Date(time1) > new Date(time2) ? time1 : time2;
  }

  // 건너뛰기로 해결
  resolveBySkipping(conflict) {
    return {
      resolved: false,
      data: conflict.serverData,
      strategy: RESOLUTION_STRATEGIES.SKIP_CONFLICT,
      source: 'server',
      skipped: true,
      timestamp: new Date().toISOString()
    };
  }

  // 사용자 선택으로 해결 (향후 구현)
  async resolveByUserChoice(conflict) {
    // UI를 통한 사용자 선택 구현 필요
    // 현재는 서버 우선으로 처리
    this.notifyConflictListeners({
      type: 'USER_CHOICE_NEEDED',
      conflict
    });
    
    return this.resolveByServerAuthority(conflict);
  }

  // 충돌 기록 저장
  recordConflict(conflict, resolution) {
    const record = {
      id: conflict.id,
      dataType: conflict.dataType,
      conflictTypes: conflict.conflicts.map(c => c.type),
      resolution: {
        strategy: resolution.strategy,
        source: resolution.source,
        resolved: resolution.resolved
      },
      timestamp: conflict.timestamp,
      resolvedAt: new Date().toISOString()
    };

    this.conflictHistory.push(record);

    // 최대 100개 기록만 유지
    if (this.conflictHistory.length > 100) {
      this.conflictHistory = this.conflictHistory.slice(-100);
    }

    // 로컬 스토리지에 저장
    try {
      localStorage.setItem('replant_conflict_history', JSON.stringify(this.conflictHistory));
    } catch (error) {
      console.warn('충돌 히스토리 저장 실패:', error);
    }
  }

  // 충돌 히스토리 로드
  loadConflictHistory() {
    try {
      const stored = localStorage.getItem('replant_conflict_history');
      if (stored) {
        this.conflictHistory = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('충돌 히스토리 로드 실패:', error);
      this.conflictHistory = [];
    }
  }

  // 충돌 통계 조회
  getConflictStats() {
    const total = this.conflictHistory.length;
    const byType = {};
    const byStrategy = {};
    const resolved = this.conflictHistory.filter(c => c.resolution.resolved).length;

    this.conflictHistory.forEach(record => {
      record.conflictTypes.forEach(type => {
        byType[type] = (byType[type] || 0) + 1;
      });

      const strategy = record.resolution.strategy;
      byStrategy[strategy] = (byStrategy[strategy] || 0) + 1;
    });

    return {
      total,
      resolved,
      resolvedRate: total > 0 ? (resolved / total * 100).toFixed(1) : 0,
      byType,
      byStrategy,
      recent: this.conflictHistory.slice(-10)
    };
  }

  // 충돌 히스토리 초기화
  clearConflictHistory() {
    this.conflictHistory = [];
    localStorage.removeItem('replant_conflict_history');
  }
}

// 싱글톤 인스턴스 생성
const conflictResolver = new ConflictResolver();

export default conflictResolver;