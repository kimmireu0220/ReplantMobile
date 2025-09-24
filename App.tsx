/**
 * Replant Mobile App
 * 감정 회복을 위한 모바일 앱
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { UserProvider } from './src/contexts/UserContext';
import AppNavigator from './src/navigation/AppNavigator';
import { initializeLogger } from './src/utils/logger';

function App() {
  useEffect(() => {
    // 앱 시작 시 로거 초기화
    initializeLogger();
  }, []);

  return (
    <UserProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <AppNavigator />
    </UserProvider>
  );
}

export default App;
