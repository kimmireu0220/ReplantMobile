import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/globals-minimal.css';
import './styles/components.css';
import App from './App';
import { registerServiceWorker } from './utils/serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Service Worker 등록
registerServiceWorker({
  onSuccess: (registration) => {
    console.log('[SW] Service worker registration successful with scope: ', registration.scope);
    
    // 설치 완료 후 전역 이벤트 발생
    window.dispatchEvent(new CustomEvent('sw-installed', { 
      detail: { registration } 
    }));
  },
  onUpdate: (registration) => {
    console.log('[SW] New version available');
    
    // 업데이트 사용 가능 전역 이벤트 발생
    window.dispatchEvent(new CustomEvent('sw-update-available', { 
      detail: { registration } 
    }));
  }
})
.then(registration => {
  if (registration) {
    console.log('[SW] Registration completed successfully');
  } else {
    console.log('[SW] Registration was not completed (not supported or failed)');
  }
})
.catch(error => {
  console.error('[SW] Registration failed:', error);
});

// 개발자 도구용 Service Worker 유틸리티 전역 노출 (개발 환경에서만)
if (process.env.NODE_ENV === 'development') {
  import('./utils/serviceWorkerRegistration').then(sw => {
    window.swUtils = {
      getInfo: sw.getServiceWorkerInfo,
      getCacheInfo: sw.getCacheInfo,
      clearCaches: sw.clearAllCaches,
      sendMessage: sw.sendMessageToServiceWorker,
      unregister: sw.unregisterServiceWorker
    };
    console.log('[SW] Development utilities available at window.swUtils');
  });
} 