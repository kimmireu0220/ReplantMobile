const CACHE_NAME = 'replant-v1.1.0';
const STATIC_CACHE_NAME = 'replant-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'replant-dynamic-v1.0.0';

// 캐시할 정적 리소스 목록 (GitHub Pages /Replant/ 경로 고려)
const STATIC_ASSETS = [
  '/Replant/',
  '/Replant/index.html',
  '/Replant/manifest.json',
  '/Replant/logo.png',
  '/Replant/android-chrome-192x192.png',
  '/Replant/android-chrome-512x512.png',
  '/Replant/favicon.ico',
  '/Replant/offline.html'
];

// API 엔드포인트 패턴
const API_PATTERNS = [
  /\/api\//,
  /supabase\.co/,
  /githubusercontent\.com/
];

// Supabase 관련 요청 패턴
const SUPABASE_PATTERNS = [
  /supabase\.co/,
  /supabase\.in/
];

console.log('[SW] Service Worker loading...');

// Install 이벤트: 정적 리소스 사전 캐싱
self.addEventListener('install', event => {
  console.log('[SW] Install Event');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('[SW] Precaching static assets');
        // 필수 리소스만 캐시 (실패 시 설치 중단)
        const essentialAssets = [
          '/Replant/',
          '/Replant/manifest.json',
          '/Replant/offline.html'
        ];
        return cache.addAll(essentialAssets);
      })
      .then(() => {
        console.log('[SW] Essential assets cached');
        // 추가 리소스는 비동기로 캐시 (실패해도 설치 계속)
        return caches.open(STATIC_CACHE_NAME);
      })
      .then(cache => {
        const additionalAssets = STATIC_ASSETS.filter(asset => 
          !['/Replant/', '/Replant/manifest.json', '/Replant/offline.html'].includes(asset)
        );
        
        // 각 리소스를 개별적으로 캐시 (하나 실패해도 다른 것들은 계속)
        additionalAssets.forEach(async asset => {
          try {
            await cache.add(asset);
            console.log('[SW] Cached:', asset);
          } catch (error) {
            console.warn('[SW] Failed to cache:', asset, error);
          }
        });
      })
      .then(() => {
        // 새 Service Worker 즉시 활성화
        console.log('[SW] Skipping waiting...');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Install failed:', error);
      })
  );
});

// Activate 이벤트: 오래된 캐시 정리
self.addEventListener('activate', event => {
  console.log('[SW] Activate Event');
  
  event.waitUntil(
    Promise.all([
      // 오래된 캐시 정리
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName.startsWith('replant-')) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // 모든 클라이언트에서 새 SW 활성화
      self.clients.claim()
    ])
    .then(() => {
      console.log('[SW] Service Worker activated and claimed clients');
    })
    .catch(error => {
      console.error('[SW] Activation failed:', error);
    })
  );
});

// Fetch 이벤트: 네트워크 요청 가로채기
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Chrome extension 요청은 무시
  if (url.protocol === 'chrome-extension:') {
    return;
  }
  
  // API 요청과 정적 리소스 구분 처리
  if (isAPIRequest(request.url)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isAppNavigation(request)) {
    event.respondWith(handleNavigation(request));
  } else {
    event.respondWith(handleStaticRequest(request));
  }
});

// API 요청 판별 함수
function isAPIRequest(url) {
  return API_PATTERNS.some(pattern => pattern.test(url));
}

// 앱 내 네비게이션 판별 함수
function isAppNavigation(request) {
  return request.mode === 'navigate' && 
         request.destination === 'document' &&
         new URL(request.url).pathname.startsWith('/Replant');
}

// Supabase 요청 판별 함수
function isSupabaseRequest(url) {
  return SUPABASE_PATTERNS.some(pattern => pattern.test(url));
}

// API 요청 처리: Network First 전략
async function handleAPIRequest(request) {
  const cacheName = isSupabaseRequest(request.url) ? 
    DYNAMIC_CACHE_NAME : STATIC_CACHE_NAME;

  try {
    console.log('[SW] API Request:', request.url);
    
    // 네트워크 우선 시도
    const response = await fetch(request.clone());
    
    if (response.ok && request.method === 'GET') {
      // GET 요청의 성공 응답만 캐시
      const cache = await caches.open(cacheName);
      await cache.put(request, response.clone());
      console.log('[SW] API response cached:', request.url);
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Network failed for API:', request.url);
    
    // 네트워크 실패 시 캐시에서 반환 (GET 요청만)
    if (request.method === 'GET') {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        console.log('[SW] Returning cached API response:', request.url);
        return cachedResponse;
      }
    }
    
    // 캐시에도 없으면 오류 응답
    return new Response(
      JSON.stringify({ error: 'Network unavailable', offline: true }), 
      { 
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// 앱 네비게이션 처리: SPA 라우팅 지원
async function handleNavigation(request) {
  try {
    // 네트워크에서 최신 index.html 가져오기 시도
    const response = await fetch('/Replant/index.html');
    return response;
  } catch (error) {
    console.log('[SW] Network failed for navigation, using cache');
    
    // 네트워크 실패 시 캐시된 index.html 반환
    const cachedResponse = await caches.match('/Replant/index.html') ||
                          await caches.match('/Replant/');
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // 둘 다 없으면 오프라인 페이지
    return caches.match('/Replant/offline.html') ||
           new Response('App is offline', { status: 200 });
  }
}

// 정적 리소스 처리: Cache First 전략
async function handleStaticRequest(request) {
  // 먼저 캐시 확인
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    console.log('[SW] Cache hit:', request.url);
    return cachedResponse;
  }
  
  try {
    console.log('[SW] Cache miss, fetching:', request.url);
    const networkResponse = await fetch(request);
    
    // 성공적인 응답을 캐시에 저장
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      await cache.put(request, networkResponse.clone());
      console.log('[SW] New resource cached:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Failed to fetch:', request.url);
    
    // HTML 문서 요청에 대해서는 오프라인 페이지 반환
    if (request.destination === 'document') {
      const offlineResponse = await caches.match('/Replant/offline.html');
      if (offlineResponse) {
        return offlineResponse;
      }
    }
    
    // 다른 리소스는 네트워크 오류 응답
    return new Response('Network error occurred', { 
      status: 408,
      statusText: 'Network timeout'
    });
  }
}

// 클라이언트와의 메시지 통신
self.addEventListener('message', event => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Skip waiting requested');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
  
  // 수동 동기화 요청 처리
  if (event.data && event.data.type === 'REQUEST_SYNC') {
    console.log('[SW] Manual sync requested');
    // Background Sync 등록
    self.registration.sync.register('replant-sync')
      .then(() => {
        console.log('[SW] Background sync registered');
        event.ports[0]?.postMessage({ success: true });
      })
      .catch(error => {
        console.error('[SW] Background sync registration failed:', error);
        event.ports[0]?.postMessage({ success: false, error: error.message });
      });
  }
  
  // 즉시 동기화 요청 처리
  if (event.data && event.data.type === 'IMMEDIATE_SYNC') {
    console.log('[SW] Immediate sync requested');
    event.waitUntil(
      doBackgroundSync()
        .then(() => {
          event.ports[0]?.postMessage({ success: true });
        })
        .catch(error => {
          event.ports[0]?.postMessage({ success: false, error: error.message });
        })
    );
  }
  
  // 동기화 상태 요청 처리
  if (event.data && event.data.type === 'GET_SYNC_STATUS') {
    // 등록된 동기화 태그 확인
    self.registration.sync.getTags()
      .then(tags => {
        event.ports[0]?.postMessage({
          hasPendingSync: tags.includes('replant-sync'),
          pendingTags: tags
        });
      })
      .catch(error => {
        event.ports[0]?.postMessage({
          hasPendingSync: false,
          error: error.message
        });
      });
  }
});

// 백그라운드 동기화
self.addEventListener('sync', event => {
  console.log('[SW] Background sync event:', event.tag);
  
  if (event.tag === 'replant-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// 백그라운드 동기화 실행
async function doBackgroundSync() {
  console.log('[SW] Starting background sync...');
  
  try {
    // 클라이언트가 열려있는지 확인
    const clients = await self.clients.matchAll();
    
    if (clients.length > 0) {
      // 클라이언트에게 동기화 시작 알림
      clients.forEach(client => {
        client.postMessage({
          type: 'SYNC_START',
          timestamp: new Date().toISOString()
        });
      });
      
      // 동기화 결과를 받기 위해 대기
      const syncResult = await performSyncWithClient(clients[0]);
      
      // 모든 클라이언트에게 결과 알림
      clients.forEach(client => {
        client.postMessage({
          type: 'SYNC_COMPLETE',
          result: syncResult,
          timestamp: new Date().toISOString()
        });
      });
      
      console.log('[SW] Background sync completed:', syncResult);
    } else {
      console.log('[SW] No clients available for sync');
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
    
    // 에러를 클라이언트에게 알림
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_ERROR',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    });
  }
}

// 클라이언트와 함께 동기화 수행
async function performSyncWithClient(client) {
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    
    // 응답을 받을 포트 설정
    channel.port1.onmessage = (event) => {
      resolve(event.data);
    };
    
    // 클라이언트에게 동기화 요청 전송
    client.postMessage(
      { type: 'PERFORM_SYNC' },
      [channel.port2]
    );
    
    // 30초 타임아웃
    setTimeout(() => {
      resolve({ success: false, error: 'Sync timeout' });
    }, 30000);
  });
}

// 푸시 알림 처리 (향후 확장용)
self.addEventListener('push', event => {
  console.log('[SW] Push received:', event);
  
  const options = {
    body: 'Replant has new updates!',
    icon: '/Replant/android-chrome-192x192.png',
    badge: '/Replant/android-chrome-192x192.png',
    data: {
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'open',
        title: 'Open App'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };
  
  if (event.data) {
    const payload = event.data.json();
    options.body = payload.body || options.body;
    options.data = { ...options.data, ...payload.data };
  }
  
  event.waitUntil(
    self.registration.showNotification('Replant', options)
  );
});

// 알림 클릭 처리
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.matchAll().then(clientList => {
        // 이미 열려있는 창이 있으면 포커스
        for (const client of clientList) {
          if (client.url === '/Replant/' && 'focus' in client) {
            return client.focus();
          }
        }
        // 없으면 새 창 열기
        if (clients.openWindow) {
          return clients.openWindow('/Replant/');
        }
      })
    );
  }
});

// 온라인/오프라인 상태 변경 감지
self.addEventListener('online', () => {
  console.log('[SW] Network back online, triggering sync');
  
  // 네트워크 복구 시 자동 동기화 등록
  if (self.registration && self.registration.sync) {
    self.registration.sync.register('replant-sync')
      .then(() => {
        console.log('[SW] Auto sync registered on network recovery');
      })
      .catch(error => {
        console.error('[SW] Auto sync registration failed:', error);
      });
  }
});

self.addEventListener('offline', () => {
  console.log('[SW] Network went offline');
});

console.log('[SW] Service Worker loaded successfully with background sync support');