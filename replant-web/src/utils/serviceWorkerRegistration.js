// Service Worker 등록 및 생명주기 관리
// Replant PWA용 Service Worker 등록 유틸리티

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  )
);

// Service Worker 지원 여부 확인
export function isServiceWorkerSupported() {
  // 논리 연산자 우선순위를 명확히 하기 위해 괄호로 그룹화
  return ('serviceWorker' in navigator) &&
         ((window.location.protocol === 'https:') || isLocalhost);
}

// Service Worker 등록 함수
export function registerServiceWorker(config = {}) {
  if (!isServiceWorkerSupported()) {
    console.log('[SW] Service Worker not supported or not on HTTPS');
    return Promise.resolve(null);
  }

  const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
  
  // 같은 origin에서만 작동
  if (publicUrl.origin !== window.location.origin) {
    console.log('[SW] Service Worker registration skipped - different origin');
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/sw.js`;
      
      console.log('[SW] Attempting to register Service Worker:', swUrl);

      if (isLocalhost) {
        // 로컬 개발 환경
        checkValidServiceWorker(swUrl, config)
          .then(resolve)
          .catch((error) => {
            console.error('[SW] localhost registration failed:', error);
            resolve(null);
          });
        
        navigator.serviceWorker.ready.then(() => {
          console.log('[SW] App is being served from cache by a service worker in localhost mode.');
        });
      } else {
        // 프로덕션 환경
        registerValidServiceWorker(swUrl, config)
          .then(resolve)
          .catch((error) => {
            console.error('[SW] production registration failed:', error);
            resolve(null);
          });
      }
    });
  });
}

// 프로덕션 환경 Service Worker 등록
function registerValidServiceWorker(swUrl, config) {
  return navigator.serviceWorker
    .register(swUrl, {
      updateViaCache: 'none', // 항상 네트워크에서 SW 업데이트 확인
      scope: process.env.PUBLIC_URL + '/' // GitHub Pages 경로 고려
    })
    .then(registration => {
      console.log('[SW] Registration successful:', registration);
      
      // 즉시 업데이트 확인
      registration.update();
      
      // 업데이트 감지 이벤트 리스너
      registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) return;

        console.log('[SW] New Service Worker found, installing...');

        installingWorker.addEventListener('statechange', () => {
          console.log('[SW] Installing worker state:', installingWorker.state);
          
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // 새 버전 사용 가능 (업데이트)
              console.log('[SW] New content is available; refresh needed.');
              
              if (config.onUpdate) {
                config.onUpdate(registration);
              } else {
                // 기본 업데이트 처리
                showUpdateNotification(registration);
              }
            } else {
              // 첫 설치 완료
              console.log('[SW] Content is cached for offline use.');
              
              if (config.onSuccess) {
                config.onSuccess(registration);
              } else {
                // 기본 설치 완료 처리
                showInstallNotification();
              }
            }
          }
        });
      });

      // 백그라운드 동기화 지원 확인
      if ('sync' in window.ServiceWorkerRegistration.prototype) {
        console.log('[SW] Background sync supported');
      }

      // 정기적으로 업데이트 확인 (1시간마다)
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000);

      return registration;
    });
}

// 로컬 개발 환경 Service Worker 확인
function checkValidServiceWorker(swUrl, config) {
  return fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then(response => {
      const contentType = response.headers.get('content-type');
      
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // Service Worker 파일이 없거나 JavaScript가 아닌 경우
        console.log('[SW] No valid service worker found. Unregistering.');
        
        return navigator.serviceWorker.ready.then(registration => {
          return registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // 유효한 Service Worker 등록
        return registerValidServiceWorker(swUrl, config);
      }
    })
    .catch(() => {
      console.log('[SW] No internet connection found. App is running in offline mode.');
      return null;
    });
}

// Service Worker 제거 함수
export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    return navigator.serviceWorker.ready
      .then(registration => {
        return registration.unregister();
      })
      .then(() => {
        console.log('[SW] Service Worker unregistered');
        return true;
      })
      .catch(error => {
        console.error('[SW] Service Worker unregistration failed:', error.message);
        return false;
      });
  }
  return Promise.resolve(false);
}

// 업데이트 알림 표시
function showUpdateNotification(registration) {
  // 토스트나 모달로 업데이트 알림
  const shouldUpdate = window.confirm(
    '새로운 버전이 사용 가능합니다. 지금 업데이트하시겠습니까?\n' +
    '(업데이트하면 페이지가 새로고침됩니다)'
  );
  
  if (shouldUpdate) {
    applyServiceWorkerUpdate(registration);
  }
}

// 설치 완료 알림 표시
function showInstallNotification() {
  console.log('[SW] App installed and ready for offline use!');
  
  // 설치 완료 토스트 표시 (실제 토스트 시스템이 있다면 사용)
  if (window.showToast) {
    window.showToast('앱이 설치되었습니다! 이제 오프라인에서도 사용할 수 있어요 🌱', 'success');
  }
}

// Service Worker 업데이트 적용
export function applyServiceWorkerUpdate(registration) {
  if (registration && registration.waiting) {
    console.log('[SW] Applying update...');
    
    // 새 Service Worker에게 즉시 활성화 요청
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    
    // 페이지 새로고침
    window.location.reload();
  }
}

// Service Worker 상태 정보 가져오기
export async function getServiceWorkerInfo() {
  if (!isServiceWorkerSupported()) {
    return { supported: false };
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    
    if (!registration) {
      return { 
        supported: true, 
        registered: false 
      };
    }

    return {
      supported: true,
      registered: true,
      state: registration.active ? registration.active.state : 'unknown',
      updateAvailable: !!registration.waiting,
      scope: registration.scope,
      scriptURL: registration.active ? registration.active.scriptURL : null
    };
  } catch (error) {
    console.error('[SW] Failed to get service worker info:', error);
    return { 
      supported: true, 
      registered: false, 
      error: error.message 
    };
  }
}

// 캐시 정보 가져오기
export async function getCacheInfo() {
  if (!('caches' in window)) {
    return { supported: false };
  }

  try {
    const cacheNames = await caches.keys();
    const cacheInfo = {};
    
    for (const name of cacheNames) {
      const cache = await caches.open(name);
      const keys = await cache.keys();
      cacheInfo[name] = {
        size: keys.length,
        urls: keys.map(request => request.url).slice(0, 10) // 처음 10개만
      };
    }

    return {
      supported: true,
      caches: cacheInfo,
      totalCaches: cacheNames.length
    };
  } catch (error) {
    console.error('[SW] Failed to get cache info:', error);
    return { 
      supported: true, 
      error: error.message 
    };
  }
}

// 캐시 초기화 함수 (개발/디버깅용)
export async function clearAllCaches() {
  if (!('caches' in window)) {
    console.log('[SW] Cache API not supported');
    return false;
  }

  try {
    const cacheNames = await caches.keys();
    const deletePromises = cacheNames.map(name => caches.delete(name));
    await Promise.all(deletePromises);
    
    console.log('[SW] All caches cleared:', cacheNames);
    return true;
  } catch (error) {
    console.error('[SW] Failed to clear caches:', error);
    return false;
  }
}

// Service Worker 메시지 전송
export function sendMessageToServiceWorker(message) {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data);
      };
      
      navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2]);
      
      // 5초 타임아웃
      setTimeout(() => {
        reject(new Error('Service Worker message timeout'));
      }, 5000);
    });
  }
  
  return Promise.reject(new Error('Service Worker not available'));
}

console.log('[SW Utils] Service Worker registration utilities loaded');