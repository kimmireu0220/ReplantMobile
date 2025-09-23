import React, { useRef, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { HamburgerButton, SlidingSidebar } from '../navigation';
import { useEnvironment } from '../../contexts/EnvironmentContext';
import { DEMO_ROUTES } from '../../config/routes';
import OfflineIndicator from '../ui/OfflineIndicator';
import SyncIndicator from '../ui/SyncIndicator';
import syncManager from '../../utils/syncManager';
import conflictResolver from '../../utils/conflictResolver';

const AppLayout = ({ children }) => {
  const location = useLocation();
  const { setSidebarOpen, isSidebarOpen, isDemoMode } = useEnvironment();
  const triggerRef = useRef(null);
  const [initializeComplete, setInitializeComplete] = useState(false);

  // Initialize offline services
  useEffect(() => {
    const initializeOfflineServices = async () => {
      try {
        // Initialize conflict resolver
        await conflictResolver.initialize();
        
        // Initialize sync manager
        syncManager.initialize();
        
        console.log('오프라인 서비스 초기화 완료');
        setInitializeComplete(true);
      } catch (error) {
        console.error('오프라인 서비스 초기화 실패:', error);
        setInitializeComplete(true); // 실패해도 앱은 계속 동작
      }
    };

    initializeOfflineServices();
  }, []);

  // Safety check: Don't render AppLayout for demo routes
  if (DEMO_ROUTES.includes(location.pathname) || isDemoMode) {
    return children;
  }

  const handleToggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="app" data-layout="main">
      {/* 오프라인 상태 표시 */}
      <OfflineIndicator 
        showNetworkQuality={false}
        showCacheInfo={false}
        position="top"
      />
      
      {/* 동기화 상태 표시 */}
      {initializeComplete && (
        <SyncIndicator 
          showDetails={false}
          position="top"
        />
      )}
      
      <HamburgerButton 
        isOpen={isSidebarOpen} 
        onClick={handleToggleSidebar}
        ref={triggerRef}
        data-environment="main"
      />
      <SlidingSidebar 
        isOpen={isSidebarOpen} 
        onClose={handleCloseSidebar}
        triggerRef={triggerRef}
        data-environment="main"
      />
      <main id="main-content" className="page-content" tabIndex="-1">
        {children}
      </main>
    </div>
  );
};

export default AppLayout; 