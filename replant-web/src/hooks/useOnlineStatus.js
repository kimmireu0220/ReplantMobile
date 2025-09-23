import { useState, useEffect, useRef } from 'react';

/**
 * 온라인/오프라인 상태를 추적하는 커스텀 훅
 * 
 * @returns {Object} - 온라인 상태 객체
 * @property {boolean} isOnline - 현재 온라인 상태
 * @property {boolean} wasOffline - 이전에 오프라인이었는지 여부 (복구 알림용)
 * @property {Date|null} lastOffline - 마지막 오프라인 시점
 * @property {Date|null} lastOnline - 마지막 온라인 복구 시점
 */
export function useOnlineStatus() {
  const [status, setStatus] = useState({
    isOnline: navigator.onLine,
    wasOffline: false,
    lastOffline: null,
    lastOnline: null
  });

  // 최신 온라인 상태를 참조하기 위한 ref (의존성 루프 없이 최신값 사용)
  const isOnlineRef = useRef(navigator.onLine);

  useEffect(() => {
    isOnlineRef.current = status.isOnline;
  }, [status.isOnline]);

  useEffect(() => {
    function handleOnline() {
      console.log('[Online Status] Connection restored');
      
      setStatus(prevStatus => ({
        ...prevStatus,
        isOnline: true,
        wasOffline: !prevStatus.isOnline, // 방금 오프라인에서 복구됨
        lastOnline: new Date()
      }));
    }

    function handleOffline() {
      console.log('[Online Status] Connection lost');
      
      setStatus(prevStatus => ({
        ...prevStatus,
        isOnline: false,
        wasOffline: false, // 오프라인 상태에서는 wasOffline을 false로
        lastOffline: new Date()
      }));
    }

    // 브라우저 이벤트 리스너
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Service Worker 상태 변화 감지
    let swMessageHandler = null;
    if ('serviceWorker' in navigator) {
      swMessageHandler = (event) => {
        if (event.data && event.data.type === 'NETWORK_STATUS_CHANGE') {
          // Service Worker에서 네트워크 상태 변화 알림
          const { isOnline: swOnlineStatus } = event.data;
          if (swOnlineStatus !== isOnlineRef.current) {
            if (swOnlineStatus) {
              handleOnline();
            } else {
              handleOffline();
            }
          }
        }
      };
      navigator.serviceWorker.addEventListener('message', swMessageHandler);
    }

    // 정기적인 연결 상태 확인 (30초마다)
    const intervalId = setInterval(async () => {
      try {
        // 가벼운 요청으로 실제 연결 상태 확인
        await fetch('/favicon.ico', { 
          method: 'HEAD',
          cache: 'no-cache',
          mode: 'no-cors'
        });
        
        // 성공하면 온라인
        if (!navigator.onLine) {
          handleOnline();
        }
      } catch (error) {
        // 실패하면 오프라인
        if (navigator.onLine) {
          handleOffline();
        }
      }
    }, 30000);

    // cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if ('serviceWorker' in navigator && swMessageHandler) {
        navigator.serviceWorker.removeEventListener('message', swMessageHandler);
      }
      clearInterval(intervalId);
    };
  }, []);

  return status;
}

/**
 * 네트워크 품질을 추정하는 훅
 * 
 * @returns {Object} - 네트워크 품질 정보
 * @property {'fast'|'slow'|'offline'|'unknown'} quality - 네트워크 품질
 * @property {number|null} rtt - 왕복 시간 (ms)
 * @property {number|null} downlink - 다운링크 속도 (Mbps)
 */
export function useNetworkQuality() {
  const [quality, setQuality] = useState({
    quality: 'unknown',
    rtt: null,
    downlink: null
  });

  const { isOnline } = useOnlineStatus();

  useEffect(() => {
    if (!isOnline) {
      setQuality(prev => ({ ...prev, quality: 'offline' }));
      return;
    }

    function updateNetworkQuality() {
      if ('connection' in navigator) {
        const connection = navigator.connection;
        const rtt = connection.rtt;
        const downlink = connection.downlink;
        
        let qualityLevel = 'unknown';
        
        // 네트워크 품질 판단 로직
        if (rtt < 50 && downlink > 10) {
          qualityLevel = 'fast';
        } else if (rtt < 150 && downlink > 1) {
          qualityLevel = 'medium';
        } else if (rtt > 0 || downlink > 0) {
          qualityLevel = 'slow';
        }
        
        setQuality({
          quality: qualityLevel,
          rtt,
          downlink
        });
        
        console.log('[Network Quality]', qualityLevel, `RTT: ${rtt}ms, Downlink: ${downlink}Mbps`);
      }
    }

    // 초기 품질 확인
    updateNetworkQuality();

    // 연결 상태 변화 감지
    if ('connection' in navigator) {
      navigator.connection.addEventListener('change', updateNetworkQuality);
      
      return () => {
        navigator.connection.removeEventListener('change', updateNetworkQuality);
      };
    }
  }, [isOnline]);

  return quality;
}

/**
 * Service Worker 캐시 상태를 확인하는 훅
 * 
 * @returns {Object} - 캐시 상태 정보
 * @property {boolean} hasCache - 캐시가 있는지 여부
 * @property {number} cacheCount - 캐시된 항목 수
 * @property {boolean} isServiceWorkerReady - Service Worker 준비 상태
 */
export function useCacheStatus() {
  const [cacheStatus, setCacheStatus] = useState({
    hasCache: false,
    cacheCount: 0,
    isServiceWorkerReady: false
  });

  useEffect(() => {
    async function checkCacheStatus() {
      if ('serviceWorker' in navigator && 'caches' in window) {
        try {
          // Service Worker 준비 상태 확인
          const registration = await navigator.serviceWorker.getRegistration();
          const isServiceWorkerReady = !!(registration && registration.active);
          
          // 캐시 상태 확인
          const cacheNames = await caches.keys();
          let totalCacheCount = 0;
          
          for (const name of cacheNames) {
            const cache = await caches.open(name);
            const keys = await cache.keys();
            totalCacheCount += keys.length;
          }
          
          setCacheStatus({
            hasCache: cacheNames.length > 0,
            cacheCount: totalCacheCount,
            isServiceWorkerReady
          });
          
        } catch (error) {
          console.error('[Cache Status] Failed to check cache:', error);
          setCacheStatus({
            hasCache: false,
            cacheCount: 0,
            isServiceWorkerReady: false
          });
        }
      }
    }

    // 초기 체크
    checkCacheStatus();
    
    // Service Worker 상태 변화 감지
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', checkCacheStatus);
      
      return () => {
        navigator.serviceWorker.removeEventListener('controllerchange', checkCacheStatus);
      };
    }
  }, []);

  return cacheStatus;
}