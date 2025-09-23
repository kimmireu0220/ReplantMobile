// 하이브리드 감정 일기 서비스
// 온라인/오프라인 상태에 따라 자동으로 데이터 소스 선택

import { OfflineDatabase } from '../utils/offlineDatabase.js';
import { isOnline, addNetworkListener } from '../utils/networkManager.js';

// diaryService를 동적으로 임포트
let diaryServiceInstance = null;
const getDiaryService = async () => {
  if (!diaryServiceInstance) {
    const { diaryService } = await import('./diaryService.js');
    diaryServiceInstance = diaryService;
  }
  return diaryServiceInstance;
};

class HybridDiaryService {
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
        this.syncPendingDiaries().catch(error => {
          console.error('자동 동기화 실패:', error);
        });
      }
    });
  }

  // 사용자의 모든 일기 조회
  async getUserDiaries(deviceId) {
    await this.initialize();

    try {
      if (isOnline()) {
        // 온라인 상태: 서버에서 최신 데이터 조회 후 로컬 업데이트
        const ds = await getDiaryService();
        const onlineDiaries = await ds.getUserDiaries();
        
        // 로컬 데이터베이스도 업데이트
        for (const diary of onlineDiaries) {
          await this.offlineDB.saveDiary({
            ...diary,
            sync_status: 'synced',
            last_modified: new Date().toISOString()
          });
        }
        
        return onlineDiaries;
      } else {
        // 오프라인 상태: 로컬 데이터만 반환
        const localDiaries = await this.offlineDB.getDiaries();
        return localDiaries.map(diary => ({
          id: diary.id,
          user_id: diary.user_id,
          date: diary.date,
          emotion: diary.emotion,
          content: diary.content,
          created_at: diary.created_at,
          updated_at: diary.updated_at
        }));
      }
    } catch (error) {
      console.error('일기 목록 조회 오류:', error);
      
      // 온라인 요청 실패 시 로컬 데이터 폴백
      const localDiaries = await this.offlineDB.getDiaries();
      return localDiaries.map(diary => ({
        id: diary.id,
        user_id: diary.user_id,
        date: diary.date,
        emotion: diary.emotion,
        content: diary.content,
        created_at: diary.created_at,
        updated_at: diary.updated_at
      }));
    }
  }

  // 특정 날짜의 일기 조회
  async getDiaryByDate(deviceId, date) {
    await this.initialize();

    try {
      if (isOnline()) {
        // 온라인 상태: 서버 우선 조회
        const ds = await getDiaryService();
        const onlineDiary = await ds.getDiaryByDate(date);
        
        if (onlineDiary) {
          // 로컬 데이터베이스도 업데이트
          await this.offlineDB.saveDiary({
            ...onlineDiary,
            sync_status: 'synced',
            last_modified: new Date().toISOString()
          });
        }
        
        return onlineDiary;
      } else {
        // 오프라인 상태: 로컬 데이터만 조회
        const localDiary = await this.offlineDB.getDiaryByDate(date);
        return localDiary ? {
          id: localDiary.id,
          user_id: localDiary.user_id,
          date: localDiary.date,
          emotion: localDiary.emotion,
          content: localDiary.content,
          created_at: localDiary.created_at,
          updated_at: localDiary.updated_at
        } : null;
      }
    } catch (error) {
      console.error('일기 조회 오류:', error);
      
      // 온라인 요청 실패 시 로컬 데이터 폴백
      const localDiary = await this.offlineDB.getDiaryByDate(date);
      return localDiary ? {
        id: localDiary.id,
        user_id: localDiary.user_id,
        date: localDiary.date,
        emotion: localDiary.emotion,
        content: localDiary.content,
        created_at: localDiary.created_at,
        updated_at: localDiary.updated_at
      } : null;
    }
  }

  // 새 일기 생성
  async createDiary(diaryData) {
    await this.initialize();

    const now = new Date().toISOString();
    const localDiary = {
      ...diaryData,
      id: this.generateTemporaryId(),
      created_at: now,
      updated_at: now,
      sync_status: 'pending',
      last_modified: now
    };

    try {
      // 즉시 로컬에 저장 (낙관적 업데이트)
      await this.offlineDB.saveDiary(localDiary);

      if (isOnline()) {
        // 온라인 상태: 즉시 서버에 동기화 시도
        try {
          const ds = await getDiaryService();
          const serverDiary = await ds.createDiary(diaryData);
          
          // 서버 응답으로 로컬 데이터 업데이트
          await this.offlineDB.saveDiary({
            ...serverDiary,
            sync_status: 'synced',
            last_modified: now
          });
          
          // 임시 ID 데이터 제거
          await this.offlineDB.deleteDiary(localDiary.id);
          
          return serverDiary;
        } catch (syncError) {
          console.warn('즉시 동기화 실패, 나중에 재시도:', syncError);
          // 동기화 큐에 추가
          await this.offlineDB.addToSyncQueue({
            type: 'CREATE_DIARY',
            data: diaryData,
            local_id: localDiary.id,
            timestamp: now
          });
        }
      } else {
        // 오프라인 상태: 동기화 큐에 추가
        await this.offlineDB.addToSyncQueue({
          type: 'CREATE_DIARY',
          data: diaryData,
          local_id: localDiary.id,
          timestamp: now
        });
      }

      return localDiary;
    } catch (error) {
      console.error('일기 생성 오류:', error);
      throw new Error('일기를 저장할 수 없습니다.');
    }
  }

  // 일기 수정
  async updateDiary(diaryId, updateData) {
    await this.initialize();

    const now = new Date().toISOString();
    
    try {
      // 로컬 데이터 즉시 업데이트
      const localDiary = await this.offlineDB.getDiary(diaryId);
      if (!localDiary) {
        throw new Error('수정할 일기를 찾을 수 없습니다.');
      }

      const updatedDiary = {
        ...localDiary,
        ...updateData,
        updated_at: now,
        sync_status: 'pending',
        last_modified: now
      };

      await this.offlineDB.saveDiary(updatedDiary);

      if (isOnline()) {
        // 온라인 상태: 즉시 서버에 동기화 시도
        try {
          const ds = await getDiaryService();
          const serverDiary = await ds.updateDiary(diaryId, updateData);
          
          // 서버 응답으로 로컬 데이터 업데이트
          await this.offlineDB.saveDiary({
            ...serverDiary,
            sync_status: 'synced',
            last_modified: now
          });
          
          return serverDiary;
        } catch (syncError) {
          console.warn('즉시 동기화 실패, 나중에 재시도:', syncError);
          // 동기화 큐에 추가
          await this.offlineDB.addToSyncQueue({
            type: 'UPDATE_DIARY',
            data: { id: diaryId, ...updateData },
            local_id: diaryId,
            timestamp: now
          });
        }
      } else {
        // 오프라인 상태: 동기화 큐에 추가
        await this.offlineDB.addToSyncQueue({
          type: 'UPDATE_DIARY',
          data: { id: diaryId, ...updateData },
          local_id: diaryId,
          timestamp: now
        });
      }

      return updatedDiary;
    } catch (error) {
      console.error('일기 수정 오류:', error);
      throw new Error('일기를 수정할 수 없습니다.');
    }
  }

  // 일기 삭제
  async deleteDiary(diaryId) {
    await this.initialize();

    try {
      // 로컬에서 즉시 삭제
      await this.offlineDB.deleteDiary(diaryId);

      if (isOnline()) {
        // 온라인 상태: 즉시 서버에서도 삭제
        try {
          const ds = await getDiaryService();
          await ds.deleteDiary(diaryId);
        } catch (syncError) {
          console.warn('즉시 삭제 동기화 실패, 나중에 재시도:', syncError);
          // 동기화 큐에 추가
          await this.offlineDB.addToSyncQueue({
            type: 'DELETE_DIARY',
            data: { id: diaryId },
            local_id: diaryId,
            timestamp: new Date().toISOString()
          });
        }
      } else {
        // 오프라인 상태: 동기화 큐에 추가
        await this.offlineDB.addToSyncQueue({
          type: 'DELETE_DIARY',
          data: { id: diaryId },
          local_id: diaryId,
          timestamp: new Date().toISOString()
        });
      }

      return true;
    } catch (error) {
      console.error('일기 삭제 오류:', error);
      throw new Error('일기를 삭제할 수 없습니다.');
    }
  }

  // 대기 중인 일기 동기화
  async syncPendingDiaries() {
    if (!isOnline()) {
      console.log('오프라인 상태로 동기화를 건너뜁니다.');
      return { success: false, reason: 'offline' };
    }

    await this.initialize();

    try {
      const syncQueue = await this.offlineDB.getSyncQueue();
      const results = {
        success: 0,
        failed: 0,
        total: syncQueue.length,
        errors: []
      };

      for (const item of syncQueue) {
        try {
          await this.processSyncItem(item);
          await this.offlineDB.removeSyncQueueItem(item.id);
          results.success++;
        } catch (error) {
          console.error(`동기화 항목 처리 실패 (ID: ${item.id}):`, error);
          results.failed++;
          results.errors.push({
            item: item,
            error: error.message
          });
        }
      }

      console.log('일기 동기화 완료:', results);
      return { success: true, results };
    } catch (error) {
      console.error('일기 동기화 오류:', error);
      return { success: false, error: error.message };
    }
  }

  // 개별 동기화 항목 처리
  async processSyncItem(item) {
    const ds = await getDiaryService();
    
    switch (item.type) {
      case 'CREATE_DIARY':
        const createdDiary = await ds.createDiary(item.data);
        // 로컬의 임시 데이터를 서버 데이터로 교체
        await this.offlineDB.deleteDiary(item.local_id);
        await this.offlineDB.saveDiary({
          ...createdDiary,
          sync_status: 'synced',
          last_modified: new Date().toISOString()
        });
        break;

      case 'UPDATE_DIARY':
        const updatedDiary = await ds.updateDiary(item.data.id, item.data);
        await this.offlineDB.saveDiary({
          ...updatedDiary,
          sync_status: 'synced',
          last_modified: new Date().toISOString()
        });
        break;

      case 'DELETE_DIARY':
        await ds.deleteDiary(item.data.id);
        // 로컬에서는 이미 삭제되어 있음
        break;

      default:
        throw new Error(`알 수 없는 동기화 타입: ${item.type}`);
    }
  }

  // 임시 ID 생성
  generateTemporaryId() {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 동기화 상태 확인
  async getSyncStatus() {
    await this.initialize();

    const pendingItems = await this.offlineDB.getSyncQueue();
    const pendingDiaries = await this.offlineDB.getPendingDiaries();

    return {
      pendingSync: pendingItems.length,
      pendingDiaries: pendingDiaries.length,
      isOnline: isOnline(),
      lastSyncTime: await this.offlineDB.getLastSyncTime()
    };
  }

  // 강제 전체 동기화
  async forceSyncAll() {
    if (!isOnline()) {
      throw new Error('온라인 상태에서만 전체 동기화가 가능합니다.');
    }

    await this.initialize();

    try {
      // 1. 서버에서 최신 데이터 조회
      // 서버에서 최신 데이터 조회
      const ds = await getDiaryService();
      const serverDiaries = await ds.getUserDiaries();

      // 2. 로컬 데이터 모두 삭제 후 서버 데이터로 교체
      await this.offlineDB.clearDiaries();

      for (const diary of serverDiaries) {
        await this.offlineDB.saveDiary({
          ...diary,
          sync_status: 'synced',
          last_modified: new Date().toISOString()
        });
      }

      // 3. 동기화 큐 비우기
      await this.offlineDB.clearSyncQueue();

      // 4. 마지막 동기화 시간 업데이트
      await this.offlineDB.setLastSyncTime(new Date().toISOString());

      return { success: true, syncedCount: serverDiaries.length };
    } catch (error) {
      console.error('전체 동기화 실패:', error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스 생성
const hybridDiaryService = new HybridDiaryService();

export default hybridDiaryService;