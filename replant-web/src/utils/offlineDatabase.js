// 오프라인 IndexedDB 데이터베이스 래퍼
// Replant PWA 오프라인 기능을 위한 로컬 데이터베이스

const DB_NAME = 'ReplantOfflineDB';
const DB_VERSION = 1;

// 동기화 상태 열거형
export const SYNC_STATUS = {
  SYNCED: 'synced',           // 동기화됨
  PENDING: 'pending',         // 동기화 대기
  FAILED: 'failed',           // 동기화 실패
  CONFLICTED: 'conflicted'    // 충돌 발생
};

export class OfflineDatabase {
  constructor() {
    this.db = null;
    this.initialized = false;
  }

  // 데이터베이스 초기화
  async initialize() {
    if (this.initialized) {
      return this.db;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB 열기 실패:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.initialized = true;
        console.log('IndexedDB 초기화 완료');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        this.createSchemas(db);
      };
    });
  }

  // 데이터베이스 스키마 생성
  createSchemas(db) {
    // 감정 일기 테이블
    if (!db.objectStoreNames.contains('diaries')) {
      const diariesStore = db.createObjectStore('diaries', { keyPath: 'id' });
      diariesStore.createIndex('date', 'date', { unique: false });
      diariesStore.createIndex('user_id', 'user_id', { unique: false });
      diariesStore.createIndex('sync_status', 'sync_status', { unique: false });
      diariesStore.createIndex('last_modified', 'last_modified', { unique: false });
    }

    // 미션 테이블
    if (!db.objectStoreNames.contains('missions')) {
      const missionsStore = db.createObjectStore('missions', { keyPath: 'id' });
      missionsStore.createIndex('mission_id', 'mission_id', { unique: false });
      missionsStore.createIndex('user_id', 'user_id', { unique: false });
      missionsStore.createIndex('category', 'category', { unique: false });
      missionsStore.createIndex('completed', 'completed', { unique: false });
      missionsStore.createIndex('sync_status', 'sync_status', { unique: false });
      missionsStore.createIndex('last_modified', 'last_modified', { unique: false });
    }

    // 캐릭터 테이블
    if (!db.objectStoreNames.contains('characters')) {
      const charactersStore = db.createObjectStore('characters', { keyPath: 'id' });
      charactersStore.createIndex('user_id', 'user_id', { unique: false });
      charactersStore.createIndex('category_id', 'category_id', { unique: false });
      charactersStore.createIndex('sync_status', 'sync_status', { unique: false });
      charactersStore.createIndex('last_modified', 'last_modified', { unique: false });
    }

    // 동기화 큐 테이블
    if (!db.objectStoreNames.contains('sync_queue')) {
      const syncQueueStore = db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
      syncQueueStore.createIndex('type', 'type', { unique: false });
      syncQueueStore.createIndex('timestamp', 'timestamp', { unique: false });
      syncQueueStore.createIndex('local_id', 'local_id', { unique: false });
    }

    // 메타데이터 테이블
    if (!db.objectStoreNames.contains('metadata')) {
      db.createObjectStore('metadata', { keyPath: 'key' });
    }

    console.log('데이터베이스 스키마 생성 완료');
  }

  // === 일기 관련 메서드 ===

  async saveDiary(diary) {
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['diaries'], 'readwrite');
      const store = transaction.objectStore('diaries');
      
      const request = store.put(diary);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getDiary(id) {
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['diaries'], 'readonly');
      const store = transaction.objectStore('diaries');
      
      const request = store.get(id);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getDiaries() {
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['diaries'], 'readonly');
      const store = transaction.objectStore('diaries');
      
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async getDiaryByDate(date) {
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['diaries'], 'readonly');
      const store = transaction.objectStore('diaries');
      const index = store.index('date');
      
      const request = index.get(date);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteDiary(id) {
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['diaries'], 'readwrite');
      const store = transaction.objectStore('diaries');
      
      const request = store.delete(id);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingDiaries() {
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['diaries'], 'readonly');
      const store = transaction.objectStore('diaries');
      const index = store.index('sync_status');
      
      const request = index.getAll(SYNC_STATUS.PENDING);
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async clearDiaries() {
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['diaries'], 'readwrite');
      const store = transaction.objectStore('diaries');
      
      const request = store.clear();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // === 미션 관련 메서드 ===

  async saveMission(mission) {
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['missions'], 'readwrite');
      const store = transaction.objectStore('missions');
      
      const request = store.put(mission);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getMission(id) {
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['missions'], 'readonly');
      const store = transaction.objectStore('missions');
      
      const request = store.get(id);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getMissionByMissionId(missionId) {
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['missions'], 'readonly');
      const store = transaction.objectStore('missions');
      const index = store.index('mission_id');
      
      const request = index.get(missionId);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getMissions() {
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['missions'], 'readonly');
      const store = transaction.objectStore('missions');
      
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async getCompletedMissions(userId, options = {}) {
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['missions'], 'readonly');
      const store = transaction.objectStore('missions');
      const results = [];
      
      const request = store.openCursor();
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          const mission = cursor.value;
          
          // 필터링 조건 적용
          if (mission.user_id === userId && mission.completed) {
            if (!options.category || mission.category === options.category) {
              results.push(mission);
            }
          }
          
          cursor.continue();
        } else {
          // 완료 시간 순으로 정렬
          results.sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at));
          resolve(results);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingMissions() {
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['missions'], 'readonly');
      const store = transaction.objectStore('missions');
      const index = store.index('sync_status');
      
      const request = index.getAll(SYNC_STATUS.PENDING);
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async clearMissions() {
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['missions'], 'readwrite');
      const store = transaction.objectStore('missions');
      
      const request = store.clear();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // === 캐릭터 관련 메서드 ===

  async saveCharacter(character) {
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['characters'], 'readwrite');
      const store = transaction.objectStore('characters');
      
      const request = store.put(character);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getCharacter(id) {
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['characters'], 'readonly');
      const store = transaction.objectStore('characters');
      
      const request = store.get(id);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getCharacterByCategoryId(categoryId) {
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['characters'], 'readonly');
      const store = transaction.objectStore('characters');
      const index = store.index('category_id');
      
      const request = index.get(categoryId);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getCharacters() {
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['characters'], 'readonly');
      const store = transaction.objectStore('characters');
      
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingCharacters() {
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['characters'], 'readonly');
      const store = transaction.objectStore('characters');
      const index = store.index('sync_status');
      
      const request = index.getAll(SYNC_STATUS.PENDING);
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async clearCharacters() {
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['characters'], 'readwrite');
      const store = transaction.objectStore('characters');
      
      const request = store.clear();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // === 동기화 큐 관리 ===

  async addToSyncQueue(item) {
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['sync_queue'], 'readwrite');
      const store = transaction.objectStore('sync_queue');
      
      const request = store.add(item);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getSyncQueue() {
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['sync_queue'], 'readonly');
      const store = transaction.objectStore('sync_queue');
      
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async removeSyncQueueItem(id) {
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['sync_queue'], 'readwrite');
      const store = transaction.objectStore('sync_queue');
      
      const request = store.delete(id);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clearSyncQueue() {
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['sync_queue'], 'readwrite');
      const store = transaction.objectStore('sync_queue');
      
      const request = store.clear();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // === 메타데이터 관리 ===

  async setMetadata(key, value) {
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['metadata'], 'readwrite');
      const store = transaction.objectStore('metadata');
      
      const request = store.put({ key, value, updated_at: new Date().toISOString() });
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getMetadata(key) {
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['metadata'], 'readonly');
      const store = transaction.objectStore('metadata');
      
      const request = store.get(key);
      
      request.onsuccess = () => resolve(request.result ? request.result.value : null);
      request.onerror = () => reject(request.error);
    });
  }

  async getLastSyncTime() {
    return await this.getMetadata('last_sync_time') || null;
  }

  async setLastSyncTime(timestamp) {
    return await this.setMetadata('last_sync_time', timestamp);
  }

  // === 데이터베이스 관리 ===

  async clearAllData() {
    await this.initialize();
    
    const storeNames = ['diaries', 'missions', 'characters', 'sync_queue', 'metadata'];
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeNames, 'readwrite');
      
      let completedCount = 0;
      const totalCount = storeNames.length;
      
      storeNames.forEach(storeName => {
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        
        request.onsuccess = () => {
          completedCount++;
          if (completedCount === totalCount) {
            console.log('모든 오프라인 데이터 삭제 완료');
            resolve(true);
          }
        };
        
        request.onerror = () => reject(request.error);
      });
    });
  }

  async getDatabaseStats() {
    await this.initialize();
    
    const stats = {};
    const storeNames = ['diaries', 'missions', 'characters', 'sync_queue', 'metadata'];
    
    for (const storeName of storeNames) {
      try {
        const count = await new Promise((resolve, reject) => {
          const transaction = this.db.transaction([storeName], 'readonly');
          const store = transaction.objectStore(storeName);
          const request = store.count();
          
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
        
        stats[storeName] = count;
      } catch (error) {
        stats[storeName] = 0;
      }
    }
    
    return stats;
  }

  // 데이터베이스 닫기
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initialized = false;
    }
  }
}