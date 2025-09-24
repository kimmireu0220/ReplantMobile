/**
 * 공통 에러 처리 유틸리티
 * 일관된 에러 처리와 사용자 친화적 메시지 제공
 */

import { Alert } from 'react-native';
import { logError, logWarn, logInfo } from './logger';

/**
 * 에러 타입별 메시지 매핑
 */
const ERROR_MESSAGES = {
  // 데이터 관련 에러
  DATA_LOAD_FAILED: '데이터를 불러오는데 실패했습니다.',
  DATA_SAVE_FAILED: '데이터 저장에 실패했습니다.',
  DATA_UPDATE_FAILED: '데이터 수정에 실패했습니다.',
  DATA_DELETE_FAILED: '데이터 삭제에 실패했습니다.',
  
  // 사용자 관련 에러
  LOGIN_FAILED: '로그인에 실패했습니다.',
  LOGOUT_FAILED: '로그아웃에 실패했습니다.',
  USER_INFO_LOAD_FAILED: '사용자 정보를 불러오는데 실패했습니다.',
  
  // 미션 관련 에러
  MISSION_COMPLETE_FAILED: '미션 완료에 실패했습니다.',
  MISSION_UNCOMPLETE_FAILED: '미션 완료 취소에 실패했습니다.',
  MISSION_LOAD_FAILED: '미션을 불러오는데 실패했습니다.',
  
  // 캐릭터 관련 에러
  CHARACTER_LOAD_FAILED: '캐릭터를 불러오는데 실패했습니다.',
  CHARACTER_LEVELUP_FAILED: '캐릭터 레벨업에 실패했습니다.',
  CHARACTER_CREATE_FAILED: '캐릭터 생성에 실패했습니다.',
  REPRESENTATIVE_CHARACTER_SET_FAILED: '대표 캐릭터 설정에 실패했습니다.',
  
  // 다이어리 관련 에러
  DIARY_LOAD_FAILED: '다이어리를 불러오는데 실패했습니다.',
  DIARY_SAVE_FAILED: '다이어리 저장에 실패했습니다.',
  DIARY_UPDATE_FAILED: '다이어리 수정에 실패했습니다.',
  DIARY_DELETE_FAILED: '다이어리 삭제에 실패했습니다.',
  
  // 앱 관련 에러
  APP_INIT_FAILED: '앱 초기화에 실패했습니다.',
  DATA_RESET_FAILED: '데이터 초기화에 실패했습니다.',
  
  // 네트워크 관련 에러
  NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
  TIMEOUT_ERROR: '요청 시간이 초과되었습니다.',
  
  // 일반 에러
  UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다.',
};

/**
 * 에러 타입을 결정하는 함수
 */
const getErrorType = (error, context = '') => {
  if (error.message) {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'NETWORK_ERROR';
    }
    if (message.includes('timeout')) {
      return 'TIMEOUT_ERROR';
    }
    if (message.includes('login') || message.includes('auth')) {
      return 'LOGIN_FAILED';
    }
    if (message.includes('mission')) {
      return 'MISSION_COMPLETE_FAILED';
    }
    if (message.includes('character')) {
      return 'CHARACTER_LOAD_FAILED';
    }
    if (message.includes('diary')) {
      return 'DIARY_SAVE_FAILED';
    }
  }
  
  // 컨텍스트 기반 에러 타입 결정
  if (context.includes('load')) return 'DATA_LOAD_FAILED';
  if (context.includes('save')) return 'DATA_SAVE_FAILED';
  if (context.includes('update')) return 'DATA_UPDATE_FAILED';
  if (context.includes('delete')) return 'DATA_DELETE_FAILED';
  
  return 'UNKNOWN_ERROR';
};

/**
 * 에러 로깅 함수 (통합 로거 사용)
 */
export const logError = (error, context = '') => {
  const errorType = getErrorType(error, context);
  
  logError(`Error: ${errorType}`, error, { context, errorType });
};

/**
 * 사용자 친화적 에러 메시지 표시
 */
export const showErrorAlert = (error, context = '') => {
  const errorType = getErrorType(error, context);
  const userMessage = ERROR_MESSAGES[errorType] || ERROR_MESSAGES.UNKNOWN_ERROR;
  
  logWarn(`User shown error alert: ${errorType}`, { context, userMessage });
  Alert.alert('오류', userMessage);
};

/**
 * 성공 메시지 표시
 */
export const showSuccessAlert = (message, title = '성공') => {
  logInfo(`User shown success alert: ${title}`, { message });
  Alert.alert(title, message);
};

/**
 * 확인 다이얼로그 표시
 */
export const showConfirmAlert = (message, onConfirm, title = '확인') => {
  Alert.alert(
    title,
    message,
    [
      { text: '취소', style: 'cancel' },
      { text: '확인', onPress: onConfirm }
    ]
  );
};

/**
 * 에러 처리 래퍼 함수
 */
export const handleAsyncError = async (asyncFunction, context = '') => {
  try {
    return await asyncFunction();
  } catch (error) {
    logError(error, context);
    showErrorAlert(error, context);
    throw error;
  }
};

/**
 * 에러 처리와 함께 실행하는 함수
 */
export const executeWithErrorHandling = async (asyncFunction, context = '') => {
  try {
    const result = await asyncFunction();
    return { success: true, data: result };
  } catch (error) {
    logError(error, context);
    return { success: false, error: error.message };
  }
};
