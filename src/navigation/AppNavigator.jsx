import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useUser } from '../contexts/UserContext';
import { SCREEN_NAMES } from '../utils/constants';

// 화면 컴포넌트들
import StartScreen from '../screens/StartScreen';
import NicknameScreen from '../screens/NicknameScreen';
import HomeScreen from '../screens/HomeScreen';
import DiaryScreen from '../screens/DiaryScreen';
import MissionScreen from '../screens/MissionScreen';
import SettingsScreen from '../screens/SettingsScreen';

// 간단한 상태 기반 네비게이션 (React Navigation 없이)
const AppNavigator = () => {
  const { isLoggedIn, isLoading } = useUser();
  const [currentScreen, setCurrentScreen] = useState(SCREEN_NAMES.START);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>로딩 중...</Text>
      </View>
    );
  }

  // 로그인하지 않은 경우 - 인증 화면들
  if (!isLoggedIn) {
    const renderAuthScreen = () => {
      switch (currentScreen) {
        case SCREEN_NAMES.START:
          return <StartScreen onNavigate={setCurrentScreen} />;
        case SCREEN_NAMES.NICKNAME:
          return <NicknameScreen onNavigate={setCurrentScreen} />;
        default:
          return <StartScreen onNavigate={setCurrentScreen} />;
      }
    };

    return (
      <View style={styles.container}>
        <View style={styles.screenContainer}>
          {renderAuthScreen()}
        </View>
      </View>
    );
  }

  // 로그인한 경우 - 간단한 탭 네비게이션
  const renderScreen = () => {
    switch (currentScreen) {
      case SCREEN_NAMES.HOME:
        return <HomeScreen />;
      case SCREEN_NAMES.DIARY:
        return <DiaryScreen />;
      case SCREEN_NAMES.MISSION:
        return <MissionScreen />;
      case SCREEN_NAMES.SETTINGS:
        return <SettingsScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <View style={styles.container}>
      {/* 메인 화면 */}
      <View style={styles.screenContainer}>
        {renderScreen()}
      </View>
      
      {/* 하단 탭 네비게이션 */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, currentScreen === SCREEN_NAMES.HOME && styles.activeTab]}
          onPress={() => setCurrentScreen(SCREEN_NAMES.HOME)}
        >
          <Text style={styles.tabIcon}>🏠</Text>
          <Text style={styles.tabLabel}>홈</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, currentScreen === SCREEN_NAMES.DIARY && styles.activeTab]}
          onPress={() => setCurrentScreen(SCREEN_NAMES.DIARY)}
        >
          <Text style={styles.tabIcon}>📝</Text>
          <Text style={styles.tabLabel}>다이어리</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, currentScreen === SCREEN_NAMES.MISSION && styles.activeTab]}
          onPress={() => setCurrentScreen(SCREEN_NAMES.MISSION)}
        >
          <Text style={styles.tabIcon}>🎯</Text>
          <Text style={styles.tabLabel}>미션</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, currentScreen === SCREEN_NAMES.SETTINGS && styles.activeTab]}
          onPress={() => setCurrentScreen(SCREEN_NAMES.SETTINGS)}
        >
          <Text style={styles.tabIcon}>⚙️</Text>
          <Text style={styles.tabLabel}>설정</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingBottom: 20,
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    backgroundColor: '#f0f0f0',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    color: '#666',
  },
});

export default AppNavigator;