// 네트워크 상태 관리 유틸리티
// PWA 오프라인 기능을 위한 네트워크 감지 및 상태 관리

class NetworkManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.listeners = [];
    this.setupEventListeners();
  }

  setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners(true);
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners(false);
    });
  }

  // 네트워크 상태 변경 리스너 등록
  addListener(callback) {
    this.listeners.push(callback);
  }

  // 네트워크 상태 변경 리스너 제거
  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  // 모든 리스너에게 상태 변경 알림
  notifyListeners(isOnline) {
    this.listeners.forEach(listener => {
      try {
        listener(isOnline);
      } catch (error) {
        console.error('네트워크 상태 리스너 오류:', error);
      }
    });
  }

  // 실제 서버 연결 테스트 (더 정확한 온라인 상태 확인)
  async testConnection(timeout = 5000) {
    if (!this.isOnline) {
      return false;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch('/ping', {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-cache'
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Supabase 연결 테스트
  async testSupabaseConnection(supabaseClient, timeout = 5000) {
    if (!this.isOnline) {
      return false;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      // 간단한 쿼리로 연결 테스트
      await supabaseClient
        .from('users')
        .select('id')
        .limit(1)
        .abortSignal(controller.signal);

      clearTimeout(timeoutId);
      return true;
    } catch (error) {
      console.warn('Supabase 연결 테스트 실패:', error);
      return false;
    }
  }

  // 현재 네트워크 상태 반환
  getNetworkStatus() {
    return {
      isOnline: this.isOnline,
      effectiveType: navigator.connection?.effectiveType || 'unknown',
      downlink: navigator.connection?.downlink || 0,
      rtt: navigator.connection?.rtt || 0
    };
  }

  // 연결 품질 평가
  getConnectionQuality() {
    if (!this.isOnline) return 'offline';

    const connection = navigator.connection;
    if (!connection) return 'unknown';

    const { effectiveType, downlink, rtt } = connection;

    if (effectiveType === '4g' && downlink > 2 && rtt < 100) {
      return 'excellent';
    } else if (effectiveType === '4g' || (downlink > 1 && rtt < 200)) {
      return 'good';
    } else if (effectiveType === '3g' || (downlink > 0.5 && rtt < 500)) {
      return 'fair';
    } else {
      return 'poor';
    }
  }
}

// 싱글톤 인스턴스 생성
const networkManager = new NetworkManager();

export default networkManager;

// 편의 함수들
export const isOnline = () => networkManager.isOnline;
export const addNetworkListener = (callback) => networkManager.addListener(callback);
export const removeNetworkListener = (callback) => networkManager.removeListener(callback);
export const testConnection = (timeout) => networkManager.testConnection(timeout);
export const testSupabaseConnection = (client, timeout) => 
  networkManager.testSupabaseConnection(client, timeout);
export const getNetworkStatus = () => networkManager.getNetworkStatus();
export const getConnectionQuality = () => networkManager.getConnectionQuality();