// 동기화 관리자
// PWA 백그라운드 동기화와 수동 동기화를 관리

import hybridDiaryService from '../services/hybridDiaryService.js';
import hybridMissionService from '../services/hybridMissionService.js';
import { isOnline, addNetworkListener } from './networkManager.js';

class SyncManager {
  constructor() {
    this.isManualSyncInProgress = false;
    this.autoSyncInProgress = false;
    this.listeners = [];
    this.syncHistory = [];
    this.setupServiceWorkerMessageListener();
    this.setupNetworkListener();
  }

  // 동기화 상태 리스너 등록
  addSyncListener(callback) {
    this.listeners.push(callback);
  }

  // 동기화 상태 리스너 제거
  removeSyncListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  // 동기화 상태 알림
  notifySyncListeners(data) {
    this.listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('동기화 리스너 오류:', error);
      }
    });
  }

  // Service Worker 메시지 리스너 설정
  setupServiceWorkerMessageListener() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        const { type, result, error, timestamp } = event.data;

        switch (type) {
          case 'SYNC_START':
            console.log('[SyncManager] Background sync started at:', timestamp);
            this.autoSyncInProgress = true;
            this.notifySyncListeners({
              type: 'SYNC_START',
              isBackground: true,
              timestamp
            });
            break;

          case 'SYNC_COMPLETE':
            console.log('[SyncManager] Background sync completed:', result);
            this.autoSyncInProgress = false;
            this.recordSyncResult(result, true);
            this.notifySyncListeners({
              type: 'SYNC_COMPLETE',
              isBackground: true,
              result,
              timestamp
            });
            break;

          case 'SYNC_ERROR':
            console.error('[SyncManager] Background sync error:', error);
            this.autoSyncInProgress = false;
            this.recordSyncResult({ success: false, error }, true);
            this.notifySyncListeners({
              type: 'SYNC_ERROR',
              isBackground: true,
              error,
              timestamp
            });
            break;

          case 'PERFORM_SYNC':
            // Service Worker에서 요청한 동기화 수행
            this.performSyncForServiceWorker(event.ports[0]);
            break;
          default:
            break;
        }
      });
    }
  }

  // 네트워크 상태 변경 리스너 설정
  setupNetworkListener() {
    addNetworkListener((isOnlineNow) => {
      if (isOnlineNow && !this.autoSyncInProgress && !this.isManualSyncInProgress) {
        console.log('[SyncManager] Network recovered, checking for pending sync');
        // 네트워크 복구 시 대기 중인 동기화가 있는지 확인
        this.checkPendingSyncData()
          .then(hasPending => {
            if (hasPending) {
              console.log('[SyncManager] Pending data found, registering background sync');
              this.registerBackgroundSync();
            }
          })
          .catch(error => {
            console.error('[SyncManager] Error checking pending data:', error);
          });
      }
    });
  }

  // Service Worker를 위한 동기화 수행
  async performSyncForServiceWorker(port) {
    try {
      console.log('[SyncManager] Performing sync for Service Worker');
      
      const result = await this.performFullSync();
      
      // Service Worker에게 결과 전송
      port.postMessage(result);
      
      return result;
    } catch (error) {
      console.error('[SyncManager] Sync for Service Worker failed:', error);
      
      const errorResult = {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      
      port.postMessage(errorResult);
      return errorResult;
    }
  }

  // 전체 동기화 수행
  async performFullSync() {
    if (!isOnline()) {
      throw new Error('네트워크에 연결되어 있지 않습니다.');
    }

    this.notifySyncListeners({
      type: 'SYNC_START',
      isBackground: false,
      timestamp: new Date().toISOString()
    });

    const results = {
      success: true,
      timestamp: new Date().toISOString(),
      diary: { success: 0, failed: 0, errors: [] },
      mission: { success: 0, failed: 0, errors: [] },
      totalSynced: 0,
      totalErrors: 0
    };

    try {
      // 1. 일기 동기화
      console.log('[SyncManager] Syncing diaries...');
      const diaryResult = await hybridDiaryService.syncPendingDiaries();
      
      if (diaryResult.success && diaryResult.results) {
        results.diary = diaryResult.results;
        results.totalSynced += diaryResult.results.success;
        results.totalErrors += diaryResult.results.failed;
      } else {
        results.diary.errors.push({
          type: 'DIARY_SYNC_FAILED',
          error: diaryResult.error || 'Unknown diary sync error'
        });
      }

      // 2. 미션 동기화
      console.log('[SyncManager] Syncing missions...');
      const missionResult = await hybridMissionService.syncPendingMissions();
      
      if (missionResult.success && missionResult.results) {
        results.mission = missionResult.results;
        results.totalSynced += missionResult.results.success;
        results.totalErrors += missionResult.results.failed;
      } else {
        results.mission.errors.push({
          type: 'MISSION_SYNC_FAILED',
          error: missionResult.error || 'Unknown mission sync error'
        });
      }

      // 3. 결과 분석
      if (results.totalErrors > 0) {
        results.success = false;
        results.message = `동기화 완료: ${results.totalSynced}개 성공, ${results.totalErrors}개 실패`;
      } else if (results.totalSynced === 0) {
        results.message = '동기화할 데이터가 없습니다.';
      } else {
        results.message = `${results.totalSynced}개 항목이 성공적으로 동기화되었습니다.`;
      }

      console.log('[SyncManager] Full sync completed:', results);

      this.notifySyncListeners({
        type: 'SYNC_COMPLETE',
        isBackground: false,
        result: results,
        timestamp: results.timestamp
      });

      return results;

    } catch (error) {
      console.error('[SyncManager] Full sync failed:', error);
      
      const errorResult = {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        totalSynced: results.totalSynced,
        totalErrors: results.totalErrors + 1
      };

      this.notifySyncListeners({
        type: 'SYNC_ERROR',
        isBackground: false,
        error: error.message,
        timestamp: errorResult.timestamp
      });

      return errorResult;
    }
  }

  // 수동 동기화 시작
  async startManualSync() {
    if (this.isManualSyncInProgress) {
      throw new Error('이미 동기화가 진행 중입니다.');
    }

    if (!isOnline()) {
      throw new Error('온라인 상태에서만 동기화할 수 있습니다.');
    }

    this.isManualSyncInProgress = true;

    try {
      const result = await this.performFullSync();
      this.recordSyncResult(result, false);
      return result;
    } finally {
      this.isManualSyncInProgress = false;
    }
  }

  // 백그라운드 동기화 등록
  async registerBackgroundSync() {
    if (!('serviceWorker' in navigator)) {
      console.warn('[SyncManager] Service Worker not supported');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      if ('sync' in registration) {
        await registration.sync.register('replant-sync');
        console.log('[SyncManager] Background sync registered');
        return true;
      } else {
        console.warn('[SyncManager] Background Sync not supported');
        return false;
      }
    } catch (error) {
      console.error('[SyncManager] Failed to register background sync:', error);
      return false;
    }
  }

  // 즉시 동기화 요청 (Service Worker 통해)
  async requestImmediateSync() {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker가 지원되지 않습니다.');
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      if (!registration.active) {
        throw new Error('Service Worker가 활성화되지 않았습니다.');
      }

      return new Promise((resolve, reject) => {
        const channel = new MessageChannel();
        
        channel.port1.onmessage = (event) => {
          if (event.data.success) {
            resolve(event.data);
          } else {
            reject(new Error(event.data.error || 'Immediate sync failed'));
          }
        };

        registration.active.postMessage(
          { type: 'IMMEDIATE_SYNC' },
          [channel.port2]
        );

        // 30초 타임아웃
        setTimeout(() => {
          reject(new Error('Immediate sync timeout'));
        }, 30000);
      });
    } catch (error) {
      console.error('[SyncManager] Immediate sync request failed:', error);
      throw error;
    }
  }

  // 대기 중인 동기화 데이터 확인
  async checkPendingSyncData() {
    try {
      const diaryStatus = await hybridDiaryService.getSyncStatus();
      const missionStatus = await hybridMissionService.getSyncStatus();

      return (diaryStatus.pendingSync > 0 || 
              diaryStatus.pendingDiaries > 0 ||
              missionStatus.pendingSync > 0 ||
              missionStatus.pendingMissions > 0);
    } catch (error) {
      console.error('[SyncManager] Error checking pending data:', error);
      return false;
    }
  }

  // 동기화 상태 조회
  async getSyncStatus() {
    try {
      const [diaryStatus, missionStatus] = await Promise.all([
        hybridDiaryService.getSyncStatus(),
        hybridMissionService.getSyncStatus()
      ]);

      const totalPending = diaryStatus.pendingSync + missionStatus.pendingSync;
      const totalPendingData = diaryStatus.pendingDiaries + missionStatus.pendingMissions;

      return {
        isOnline: isOnline(),
        isManualSyncInProgress: this.isManualSyncInProgress,
        isAutoSyncInProgress: this.autoSyncInProgress,
        totalPendingSync: totalPending,
        totalPendingData: totalPendingData,
        diary: diaryStatus,
        mission: missionStatus,
        lastSyncTime: Math.max(
          new Date(diaryStatus.lastSyncTime || 0).getTime(),
          new Date(missionStatus.lastSyncTime || 0).getTime()
        ),
        syncHistory: this.syncHistory.slice(-10) // 최근 10개만
      };
    } catch (error) {
      console.error('[SyncManager] Error getting sync status:', error);
      return {
        isOnline: isOnline(),
        isManualSyncInProgress: this.isManualSyncInProgress,
        isAutoSyncInProgress: this.autoSyncInProgress,
        totalPendingSync: 0,
        totalPendingData: 0,
        error: error.message
      };
    }
  }

  // 동기화 결과 기록
  recordSyncResult(result, isBackground) {
    const record = {
      timestamp: new Date().toISOString(),
      isBackground,
      success: result.success,
      totalSynced: result.totalSynced || 0,
      totalErrors: result.totalErrors || 0,
      error: result.error
    };

    this.syncHistory.push(record);

    // 최대 50개 기록만 유지
    if (this.syncHistory.length > 50) {
      this.syncHistory = this.syncHistory.slice(-50);
    }

    // 로컬 스토리지에도 저장
    try {
      localStorage.setItem('replant_sync_history', JSON.stringify(this.syncHistory));
    } catch (error) {
      console.warn('[SyncManager] Failed to save sync history:', error);
    }
  }

  // 동기화 히스토리 로드
  loadSyncHistory() {
    try {
      const stored = localStorage.getItem('replant_sync_history');
      if (stored) {
        this.syncHistory = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('[SyncManager] Failed to load sync history:', error);
      this.syncHistory = [];
    }
  }

  // 강제 전체 동기화 (로컬 데이터 초기화)
  async forceFullSync() {
    if (!isOnline()) {
      throw new Error('온라인 상태에서만 전체 동기화할 수 있습니다.');
    }

    if (this.isManualSyncInProgress) {
      throw new Error('이미 동기화가 진행 중입니다.');
    }

    this.isManualSyncInProgress = true;

    try {
      console.log('[SyncManager] Starting force full sync...');
      
      this.notifySyncListeners({
        type: 'FORCE_SYNC_START',
        timestamp: new Date().toISOString()
      });

      // 모든 로컬 데이터를 서버 데이터로 교체
      const [diaryResult, missionResult] = await Promise.all([
        hybridDiaryService.forceSyncAll(),
        hybridMissionService.forceSyncAll()
      ]);

      const result = {
        success: true,
        timestamp: new Date().toISOString(),
        diary: diaryResult,
        mission: missionResult,
        message: '전체 동기화가 완료되었습니다.'
      };

      console.log('[SyncManager] Force full sync completed:', result);

      this.notifySyncListeners({
        type: 'FORCE_SYNC_COMPLETE',
        result,
        timestamp: result.timestamp
      });

      this.recordSyncResult(result, false);
      return result;

    } catch (error) {
      console.error('[SyncManager] Force full sync failed:', error);
      
      const errorResult = {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };

      this.notifySyncListeners({
        type: 'FORCE_SYNC_ERROR',
        error: error.message,
        timestamp: errorResult.timestamp
      });

      this.recordSyncResult(errorResult, false);
      throw error;
    } finally {
      this.isManualSyncInProgress = false;
    }
  }

  // 초기화
  initialize() {
    this.loadSyncHistory();
    
    // 앱 시작 시 대기 중인 데이터가 있으면 백그라운드 동기화 등록
    if (isOnline()) {
      this.checkPendingSyncData()
        .then(hasPending => {
          if (hasPending) {
            console.log('[SyncManager] Pending data found on startup, registering background sync');
            this.registerBackgroundSync();
          }
        })
        .catch(error => {
          console.error('[SyncManager] Error checking pending data on startup:', error);
        });
    }
  }
}

// 싱글톤 인스턴스 생성
const syncManager = new SyncManager();

export default syncManager;