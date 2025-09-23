import React from 'react';
import { useNavigate } from 'react-router-dom';
import { tokens } from '../design/tokens';
import { getCurrentUserNickname } from '../config/supabase';
import { Card, Button, ThemeToggle } from '../components/ui';
import { PageTitle, ScreenReaderOnly } from '../components/ui/ScreenReaderOnly';


const CounselStartPage = () => {
  const navigate = useNavigate();
  const nickname = getCurrentUserNickname();

  const handleProviderSelect = (providerType) => {
    navigate(`/counsel/chat?type=${providerType}`);
  };

  const pageStyle = {
    minHeight: '100vh',
    backgroundColor: tokens.colors.background.primary,
    padding: tokens.spacing[4]
  };

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing[6]
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: tokens.spacing[6]
  };



  const userInfoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing[2],
    padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.lg,
    border: `1px solid ${tokens.colors.border.light}`,
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.secondary,
    fontWeight: tokens.typography.fontWeight.medium
  };

  const pageTitleStyle = {
    fontSize: tokens.typography.fontSize['2xl'],
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing[2],
    marginTop: tokens.spacing[4],
  };

  const subtitleStyle = {
    fontSize: tokens.typography.fontSize.base,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.spacing[4],
    lineHeight: tokens.typography.lineHeight.relaxed,
  };

  // 사용되지 않는 스타일 제거하여 경고 해소

  // 단일 카드 내부에서 각 옵션을 담는 섹션 스타일
  const optionSectionStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    textAlign: 'center',
    padding: tokens.spacing[6],
    border: `1px solid ${tokens.colors.border.light}`,
    borderRadius: tokens.borderRadius.lg,
    backgroundColor: tokens.colors.background.secondary,
  };

  const cardContentStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    flex: 1,
    width: '100%',
  };

  const optionIconStyle = {
    fontSize: tokens.typography.fontSize['4xl'],
    marginBottom: tokens.spacing[3],
    textAlign: 'center',
    width: '100%',
    display: 'block',
  };

  const optionTitleStyle = {
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing[2],
    textAlign: 'center',
    width: '100%',
  };

  const optionDescStyle = {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.secondary,
    lineHeight: tokens.typography.lineHeight.relaxed,
    marginBottom: tokens.spacing[5],
    textAlign: 'center',
    width: '100%',
  };

  const buttonContainerStyle = {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  return (
    <div style={pageStyle} role="main" aria-label="상담 시작">
      <PageTitle title="상담 서비스" />
      <div style={containerStyle}>
        {/* 헤더 섹션 - 다른 페이지들과 일치 */}
        <div style={headerStyle}>
          {nickname && (
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <div style={userInfoStyle}>
                <span>👤</span>
                <span>{nickname}</span>
              </div>
              <ThemeToggle showLabel={false} showSystem={false} />
            </div>
          )}
        </div>

        {/* 단일 카드 레이아웃 */}
        <Card variant="elevated" padding="lg" style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[6], border: 'none' }} aria-labelledby="counsel-title" aria-describedby="counsel-desc">
          <div>
            <h2 style={pageTitleStyle} id="counsel-title">💬 상담 서비스</h2>
            <p style={subtitleStyle} id="counsel-desc">
              고민이나 감정을 털어놓고 싶을 때, 원하는 상담 방식을 선택해보세요
            </p>
          </div>

          {/* 도감 페이지와 유사한 옵션 그리드 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: tokens.spacing[4] }}>
            {/* 전문 상담사 */}
            <section style={optionSectionStyle} role="group" aria-labelledby="counselor-title">
              <div style={cardContentStyle}>
                <div style={optionIconStyle}>👨‍⚕️</div>
                <h3 style={optionTitleStyle} id="counselor-title">전문 상담사와 대화하기</h3>
                <p style={optionDescStyle}>
                  전문 상담사와 1:1로 대화하며<br />
                  깊이 있는 상담을 받아보세요.
                </p>
              </div>
              <div style={buttonContainerStyle}>
                <Button 
                  variant="primary" 
                  size="lg" 
                  style={{ width: '100%', maxWidth: '280px' }}
                  aria-describedby="counselor-help"
                  onClick={() => handleProviderSelect('counselor')}
                >
                  상담사 연결하기
                </Button>
                <ScreenReaderOnly id="counselor-help">
                  전문 상담사와 1대1 상담을 시작합니다. 다음 화면으로 이동합니다.
                </ScreenReaderOnly>
              </div>
            </section>

            {/* AI 챗봇 */}
            <section style={optionSectionStyle} role="group" aria-labelledby="chatbot-title">
              <div style={cardContentStyle}>
                <div style={optionIconStyle}>🤖</div>
                <h3 style={optionTitleStyle} id="chatbot-title">AI 챗봇과 대화하기</h3>
                <p style={optionDescStyle}>
                  24시간 언제든지 AI 챗봇과<br />
                  편안하게 대화해보세요.
                </p>
              </div>
              <div style={buttonContainerStyle}>
                <Button 
                  variant="secondary" 
                  size="lg" 
                  style={{ width: '100%', maxWidth: '280px' }}
                  aria-describedby="chatbot-help"
                  onClick={() => handleProviderSelect('chatbot')}
                >
                  챗봇과 대화하기
                </Button>
                <ScreenReaderOnly id="chatbot-help">
                  AI 챗봇과의 대화를 시작합니다. 다음 화면으로 이동합니다.
                </ScreenReaderOnly>
              </div>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CounselStartPage;