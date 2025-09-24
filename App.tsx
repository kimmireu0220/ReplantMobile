/**
 * Replant Mobile App
 * 감정 회복을 위한 모바일 앱
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { UserProvider } from './src/contexts/UserContext';
import AppNavigator from './src/navigation/AppNavigator';

function App() {
  return (
    <UserProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <AppNavigator />
    </UserProvider>
  );
}

export default App;
