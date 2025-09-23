import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
// Replant - 사회적 고립자를 위한 감정 회복 PWA 앱
import AppLayout from './components/layout/AppLayout';
import { EnvironmentProvider } from './contexts/EnvironmentContext';
import { SupabaseProvider } from './contexts/SupabaseContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { getLayoutMode, LAYOUT_MODES } from './config/routes';
import { getCurrentUserNickname } from './config/supabase';
import { cleanupLegacyData } from './config/supabase';
import { initializeAccessibility } from './utils/initializeAccessibility';

import { setupGlobalErrorHandling, OfflineIndicator } from './components/ui';

// 접근성 스타일 시트 로드 (최소화된 버전)
import './styles/accessibility-minimal.css';

// 다크모드 테마 시스템 (기존 스타일과 호환)
import './styles/theme.css';

import WelcomePage from './pages/WelcomePage';
import StartPage from './pages/StartPage';
import NicknamePage from './pages/NicknamePage';
import HomePage from './pages/HomePage';
import GameSelectionPage from './pages/GameSelectionPage';
import ObstacleGamePage from './pages/ObstacleGamePage';
import PuzzleGamePage from './pages/PuzzleGamePage';
import MemoryGamePage from './pages/MemoryGamePage';
import QuizGamePage from './pages/QuizGamePage';
import DiaryPage from './pages/DiaryPage';
import MissionPage from './pages/MissionPage';
import GameLayout from './components/layout/GameLayout';
import GameCanvasLayout from './components/layout/GameCanvasLayout';
// 지연 로딩 컴포넌트들
import { 
  LazyCharacterDetailPage,
  LazyCompletedMissionsPage,
  LazyDexPage,
  LazyCounselChatPage
} from './utils/lazyComponents';

// 지연 로딩 컴포넌트들
import ComponentsPage from './pages/ComponentsPage';

// 자주 사용되는 페이지들은 일반 import 유지
import CounselStartPage from './pages/CounselStartPage';
import SettingsPage from './pages/SettingsPage';

import NotFoundPage from './pages/NotFoundPage';

const ProtectedRoute = ({ children }) => {
  const nickname = getCurrentUserNickname();
  
  if (!nickname) {
    return <Navigate to="/start" replace />;
  }
  
  return children;
};

const AutoLoginHandler = () => {
  const nickname = getCurrentUserNickname();
  
  if (nickname) {
    return <Navigate to="/home" replace />;
  }
  
  return <Navigate to="/start" replace />;
};

export const AppWithLayout = () => {
  const location = useLocation();
  const layoutMode = getLayoutMode(location.pathname);

  if (layoutMode === LAYOUT_MODES.DEMO) {
    return (
      <div className="demo-environment" data-environment="demo">
        <Routes>
          <Route path="/components" element={<ComponentsPage />} />
          <Route path="*" element={<NotFoundPage layoutMode="demo" />} />
        </Routes>
      </div>
    );
  }

  if (layoutMode === LAYOUT_MODES.MINIMAL) {
    return (
      <div className="minimal-layout" data-environment="minimal">
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/start" element={
            <>
              <AutoLoginHandler />
              <StartPage />
            </>
          } />
          <Route path="/nickname" element={<NicknamePage />} />
          {/* 게임 관련 라우트들 - 게임 전용 레이아웃으로 감싸기 */}
          <Route path="/game" element={
            <GameLayout>
              <ProtectedRoute>
                <GameSelectionPage />
              </ProtectedRoute>
            </GameLayout>
          } />
          <Route path="/game/obstacle" element={
            <GameCanvasLayout>
              <ProtectedRoute>
                <ObstacleGamePage />
              </ProtectedRoute>
            </GameCanvasLayout>
          } />
          <Route path="/game/puzzle" element={
            <GameCanvasLayout>
              <ProtectedRoute>
                <PuzzleGamePage />
              </ProtectedRoute>
            </GameCanvasLayout>
          } />
          <Route path="/game/memory" element={
            <GameCanvasLayout>
              <ProtectedRoute>
                <MemoryGamePage />
              </ProtectedRoute>
            </GameCanvasLayout>
          } />
          <Route path="/game/quiz" element={
            <GameCanvasLayout>
              <ProtectedRoute>
                <QuizGamePage />
              </ProtectedRoute>
            </GameCanvasLayout>
          } />
          <Route path="*" element={<NotFoundPage layoutMode="minimal" />} />
        </Routes>
      </div>
    );
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={
          <AutoLoginHandler />
        } />
        
        <Route path="/Replant" element={
          <Navigate to="/home" replace />
        } />
        <Route path="/Replant/" element={
          <Navigate to="/home" replace />
        } />
        
        <Route path="/home" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } />
        <Route path="/diary" element={
          <ProtectedRoute>
            <DiaryPage />
          </ProtectedRoute>
        } />
        <Route path="/mission" element={
          <ProtectedRoute>
            <MissionPage />
          </ProtectedRoute>
        } />

        <Route path="/counsel" element={
          <ProtectedRoute>
            <CounselStartPage />
          </ProtectedRoute>
        } />
        <Route path="/counsel/chat" element={
          <ProtectedRoute>
            <LazyCounselChatPage />
          </ProtectedRoute>
        } />

        <Route path="/character/detail/:categoryId" element={
          <ProtectedRoute>
            <LazyCharacterDetailPage />
          </ProtectedRoute>
        } />
        <Route path="/completed-missions" element={
          <ProtectedRoute>
            <LazyCompletedMissionsPage />
          </ProtectedRoute>
        } />
        <Route path="/dex" element={
          <ProtectedRoute>
            <LazyDexPage />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } />
        

        
        <Route path="*" element={<NotFoundPage layoutMode="full" />} />
      </Routes>
    </AppLayout>
  );
};

function App() {
  React.useEffect(() => {
    // 전역 에러 처리 설정
    setupGlobalErrorHandling();
    
    // 레거시 데이터 정리
    cleanupLegacyData();
    
    // 접근성 시스템 초기화
    const cleanupAccessibility = initializeAccessibility();
    
    return () => {
      // cleanup 함수가 존재하는 경우에만 실행
      if (typeof cleanupAccessibility === 'function') {
        cleanupAccessibility();
      }
    };
  }, []);

  return (
    <ThemeProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <SupabaseProvider>
          <EnvironmentProvider>
            <OfflineIndicator />
            <div id="app-root" role="application" aria-label="Replant - 감정 회복 앱">
              <AppWithLayout />
            </div>
          </EnvironmentProvider>
        </SupabaseProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App; 