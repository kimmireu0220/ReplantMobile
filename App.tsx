/**
 * Replant Mobile App
 * 감정 회복을 위한 모바일 앱
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { UserProvider } from './src/contexts/UserContext';
import { SupabaseProvider } from './src/contexts/SupabaseContext';
import AppNavigator from './src/navigation/AppNavigator';

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <SupabaseProvider>
          <StatusBar barStyle="dark-content" backgroundColor="#fff" />
          <AppNavigator />
        </SupabaseProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
