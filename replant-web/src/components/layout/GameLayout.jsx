import React, { useRef } from 'react';
import { HamburgerButton, SlidingSidebar } from '../navigation';
import { useEnvironment } from '../../contexts/EnvironmentContext';

/**
 * 게임 전용 레이아웃
 * - 미니게임 화면에서도 햄버거 버튼과 사이드바 내비게이션을 제공
 * - AppLayout과 동일한 패턴을 따르되, data-layout 값을 "game"으로 구분
 */
const GameLayout = ({ children }) => {
  const { setSidebarOpen, isSidebarOpen } = useEnvironment();
  const triggerRef = useRef(null);

  const handleToggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="app" data-layout="game">
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

export default GameLayout;


