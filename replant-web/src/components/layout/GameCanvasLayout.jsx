import React from 'react';

/**
 * 게임 캔버스 전용 레이아웃
 * - 햄버거 버튼/사이드바 미노출
 * - 게임 플레이 화면에 사용
 */
const GameCanvasLayout = ({ children }) => {
  return (
    <div className="app" data-layout="game-canvas">
      <main id="main-content" className="page-content" tabIndex="-1">
        {children}
      </main>
    </div>
  );
};

export default GameCanvasLayout;


