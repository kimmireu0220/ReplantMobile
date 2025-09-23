import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokens } from '../design/tokens';
import { logoutUser } from '../config/supabase';
import { useNotification, useToast } from '../hooks';
import NicknameEditModal from '../components/ui/NicknameEditModal';
import { ToastContainer } from '../components/ui';
import { PageTitle, ScreenReaderOnly } from '../components/ui/ScreenReaderOnly';
import ThemeToggle from '../components/ui/ThemeToggle';

const SettingsPage = () => {
  const navigate = useNavigate();
  const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const { showError } = useNotification();
  const { toasts, showSuccess, removeToast } = useToast();

  const handleNicknameChange = () => {
    // 닉네임 변경 모달 열기
    setIsNicknameModalOpen(true);
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/start', { replace: true });
  };

  const handleNicknameSuccess = (newNickname, oldNickname) => {
    // 진동 피드백 (모바일)
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
    
    // 토스트 알림으로 눈에 띄는 피드백 제공
    showSuccess(`닉네임이 '${newNickname}'로 변경되었습니다!`, 4000);
    setStatusMessage('닉네임이 성공적으로 변경되었습니다.');
  };

  const handleNicknameError = (error) => {
    showError('닉네임 변경 실패', error);
    setStatusMessage('닉네임 변경에 실패했습니다.');
  };

  const containerStyle = {
    padding: tokens.spacing[4],
    maxWidth: '600px',
    margin: '0 auto',
  };

  const headerStyle = {
    marginBottom: tokens.spacing[6],
    textAlign: 'center',
  };

  const titleStyle = {
    fontSize: tokens.typography.fontSize.xl,
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary,
    margin: 0,
    marginBottom: tokens.spacing[2],
  };

  const subtitleStyle = {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.secondary,
    margin: 0,
  };

  const sectionStyle = {
    marginBottom: tokens.spacing[6],
  };

  const sectionTitleStyle = {
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing[4],
    paddingBottom: tokens.spacing[2],
    borderBottom: `1px solid ${tokens.colors.border.medium}`,
  };

  const menuItemStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: tokens.spacing[4],
    backgroundColor: tokens.colors.background.primary,
    border: `1px solid ${tokens.colors.border.medium}`,
    borderRadius: tokens.borderRadius.md,
    marginBottom: tokens.spacing[3],
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
    color: tokens.colors.text.primary,
  };

  const iconStyle = {
    fontSize: tokens.typography.fontSize.xl,
    marginRight: tokens.spacing[3],
    width: '24px',
    textAlign: 'center',
  };

  const menuTextStyle = {
    flex: 1,
    fontSize: tokens.typography.fontSize.base,
    fontWeight: tokens.typography.fontWeight.medium,
  };

  const arrowStyle = {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.tertiary,
  };

  const logoutSectionStyle = {
    marginTop: tokens.spacing[8],
    textAlign: 'left',
  };

  const logoutTextStyle = {
    fontSize: tokens.typography.fontSize.base,
    color: tokens.colors.error,
    fontWeight: tokens.typography.fontWeight.medium,
    cursor: 'pointer',
    padding: tokens.spacing[2],
  };

  return (
    <div style={containerStyle} role="main" aria-label="설정">
      <PageTitle title="설정" />
      <div style={headerStyle}>
        <h1 style={titleStyle}>설정</h1>
        <p style={subtitleStyle}>앱 설정을 관리하세요</p>
      </div>

      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>계정</h2>
        
        <div 
          style={menuItemStyle} 
          onClick={handleNicknameChange}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleNicknameChange();
            }
          }}
          aria-describedby="nickname-change-help"
        >
          <span style={iconStyle}>👤</span>
          <div style={menuTextStyle}>닉네임 변경</div>
          <span style={arrowStyle}>›</span>
        </div>
        <ScreenReaderOnly id="nickname-change-help">닉네임 변경 모달을 엽니다.</ScreenReaderOnly>

        <div style={menuItemStyle}>
          <span style={iconStyle}>🌱</span>
          <div style={menuTextStyle}>캐릭터 관리</div>
          <span style={arrowStyle}>›</span>
        </div>

        <div style={menuItemStyle}>
          <span style={iconStyle}>🎯</span>
          <div style={menuTextStyle}>미션 기록</div>
          <span style={arrowStyle}>›</span>
        </div>

        <div style={menuItemStyle}>
          <span style={iconStyle}>📝</span>
          <div style={menuTextStyle}>일기 백업</div>
          <span style={arrowStyle}>›</span>
        </div>
      </div>

      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>정보</h2>
        
        <div style={menuItemStyle}>
          <span style={iconStyle}>📄</span>
          <div style={menuTextStyle}>이용 약관</div>
          <span style={arrowStyle}>›</span>
        </div>

        <div style={menuItemStyle}>
          <span style={iconStyle}>🔒</span>
          <div style={menuTextStyle}>개인정보처리방침</div>
          <span style={arrowStyle}>›</span>
        </div>

        <div style={menuItemStyle}>
          <span style={iconStyle}>ℹ️</span>
          <div style={menuTextStyle}>앱 정보</div>
          <span style={arrowStyle}>›</span>
        </div>
      </div>

      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>앱 설정</h2>
        
        <div style={menuItemStyle}>
          <span style={iconStyle}>🌙</span>
          <div style={{ ...menuTextStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <span>테마 설정</span>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <ThemeToggle showLabel={false} position="static" variant="segmented" />
            </div>
          </div>
        </div>
        
        {/* 테스트 카드는 제거되었습니다 */}
      </div>

      <div style={logoutSectionStyle}>
        <div 
          style={logoutTextStyle}
          onClick={handleLogout}
        >
          로그아웃
        </div>
      </div>

      <NicknameEditModal
        isOpen={isNicknameModalOpen}
        onClose={() => setIsNicknameModalOpen(false)}
        onSuccess={handleNicknameSuccess}
        onError={handleNicknameError}
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <ScreenReaderOnly role="status" aria-live="polite" id="settings-status">
        {statusMessage}
      </ScreenReaderOnly>
    </div>
  );
};

export default SettingsPage;