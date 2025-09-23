import React from 'react';
import { tokens } from '../design/tokens';

// 데모 컴포넌트들
import { ComponentDemo } from '../components/demo';

// UI 컴포넌트들
import { 
  Button, 
  Card, 
  Progress, 
  ToastContainer,
  EmotionTagList,
  Checkbox,
  Logo,
  NotificationContainer,
  ImageWithFallback,
  NicknameEditModal
} from '../components/ui';
import { ScreenReaderOnly } from '../components/ui/ScreenReaderOnly';

// Feature 컴포넌트들
import {
  MissionCard,
  MissionCheckButton,
  EmotionDiaryForm,
  EmotionDiaryCard,
  CharacterLevelDisplay,
  PhotoSubmitButton,
  PhotoPreview
} from '../components/features';

// Quiz 컴포넌트
import QuizModal from '../components/features/QuizModal';

// Navigation 컴포넌트들
import {
  SidebarItem,
  SlidingSidebar
} from '../components/navigation';

// 기타 컴포넌트
import { MessageBubble } from '../components/counsel';
import { FavoriteButton } from '../components/character';

// 데이터 (데모 전용 데이터 제거)

const ComponentsPage = () => {
  const [activeTab, setActiveTab] = React.useState('ui');
  const [selectedEmotion, setSelectedEmotion] = React.useState(null);
  const [toasts, setToasts] = React.useState([]);
  const [notifications, setNotifications] = React.useState([]);
  // 데모 페이지에서는 전역 내비게이션을 노출하지 않음
  const [isSidebarOpen, setSidebarOpen] = React.useState(false);
  const [isNicknameModalOpen, setNicknameModalOpen] = React.useState(false);
  const [isSettingMain, setIsSettingMain] = React.useState(false);
  const [isMainCharacter, setIsMainCharacter] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState('/logo.png');
  const [isQuizModalOpen, setIsQuizModalOpen] = React.useState(false);
  const [quizScore, setQuizScore] = React.useState(85);

  const pageStyle = {
    padding: tokens.spacing[6],
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: tokens.colors.background.primary,
    minHeight: '100vh',
    // 데모 환경에서 내비게이션 바 숨김
    position: 'relative',
    zIndex: 1,
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: tokens.spacing[8],
    padding: tokens.spacing[6],
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.lg,
    border: `1px solid ${tokens.colors.border.light}`,
  };

  const titleStyle = {
    fontSize: tokens.typography.fontSize['3xl'],
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing[3],
  };

  const subtitleStyle = {
    fontSize: tokens.typography.fontSize.lg,
    color: tokens.colors.text.secondary,
    lineHeight: tokens.typography.lineHeight.relaxed,
  };

  const tabContainerStyle = {
    display: 'flex',
    gap: tokens.spacing[1],
    marginBottom: tokens.spacing[6],
    padding: tokens.spacing[2],
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.lg,
    border: `1px solid ${tokens.colors.border.light}`,
  };

  const tabStyle = (isActive) => ({
    padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
    borderRadius: tokens.borderRadius.md,
    backgroundColor: isActive ? tokens.colors.primary[500] : 'transparent',
    color: isActive ? tokens.colors.text.inverse : tokens.colors.text.primary,
    border: 'none',
    cursor: 'pointer',
    fontSize: tokens.typography.fontSize.base,
    fontWeight: isActive ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
    transition: 'all 0.2s ease',
  });

  const handleShowToast = (message, type = 'info') => {
    const newToast = {
      id: Date.now(),
      message,
      type,
    };
    setToasts(prev => [...prev, newToast]);
  };

  const handleRemoveToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleShowNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
  };

  const handleRemoveNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const handleQuizComplete = () => {
    handleShowToast('퀴즈가 완료되었습니다!', 'success');
    setIsQuizModalOpen(false);
  };

  const handleQuizCancel = () => {
    setIsQuizModalOpen(false);
  };

  const handleShowQuizResult = (score) => {
    setQuizScore(score);
    setIsQuizModalOpen(true);
  };

  const mockMission = {
    id: 1,
    title: "감정 일기 작성하기",
    description: "오늘의 감정을 일기로 기록해보세요",
    category: "selfcare",
    difficulty: "easy",
    completed: false,
    progress: 0,
  };

  const mockCharacter = {
    id: 1,
    name: "성장하는 나",
    level: 5,
    experience: 750,
    maxExperience: 1000,
    category: "selfcare",
  };

  const tabs = [
    { id: 'ui', label: 'UI 컴포넌트', icon: '🎨' },
    { id: 'features', label: '기능 컴포넌트', icon: '⚡' },
    { id: 'navigation', label: '네비게이션', icon: '🧭' },
    { id: 'notifications', label: '알림', icon: '🔔' },
  ];

  const renderUIComponents = () => (
    <div style={{ display: 'grid', gap: tokens.spacing[6], gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
      <ComponentDemo 
        title="Button" 
        description="다양한 variant와 size를 지원하는 버튼"
        code={`<Button variant="primary" size="lg">기본 버튼</Button>`}
      >
        <div style={{ display: 'flex', gap: tokens.spacing[2], flexWrap: 'wrap' }}>
          <ScreenReaderOnly id="demo-button-help">버튼을 눌러 토스트 알림을 확인할 수 있습니다.</ScreenReaderOnly>
          <Button aria-describedby="demo-button-help" variant="primary" size="sm" onClick={() => handleShowToast('기본 버튼!', 'success')}>
            기본
          </Button>
          <Button aria-describedby="demo-button-help" variant="secondary" size="sm" onClick={() => handleShowToast('보조 버튼!', 'info')}>
            보조
          </Button>
          <Button aria-describedby="demo-button-help" variant="danger" size="sm" onClick={() => handleShowToast('위험 버튼!', 'error')}>
            위험
          </Button>
          <Button aria-describedby="demo-button-help" loading size="sm">로딩</Button>
        </div>
      </ComponentDemo>

      <ComponentDemo 
        title="Card" 
        description="컨텐츠를 담는 카드 컨테이너"
        code={`<Card variant="default" padding="lg">
  <h3>카드 제목</h3>
  <p>카드 내용입니다.</p>
</Card>`}
      >
        <Card variant="default" padding="base">
          <h4 style={{ margin: `0 0 ${tokens.spacing[2]} 0` }}>기본 카드</h4>
          <p style={{ margin: 0, fontSize: tokens.typography.fontSize.sm }}>간단한 카드 예시입니다.</p>
        </Card>
      </ComponentDemo>

      <ComponentDemo 
        title="Progress" 
        description="진행률을 시각화하는 컴포넌트"
        code={`<Progress value={75} max={100} variant="primary" />`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
          <Progress value={75} max={100} variant="primary" />
          <Progress value={50} max={100} variant="secondary" />
        </div>
      </ComponentDemo>

      <ComponentDemo 
        title="EmotionTagList" 
        description="감정 태그 선택 UI"
        code={`<EmotionTagList 
  selectedEmotion={selectedEmotion}
  onSelect={setSelectedEmotion}
/>`}
      >
        <EmotionTagList 
          selectedEmotion={selectedEmotion}
          onSelect={setSelectedEmotion}
          size="md"
        />
      </ComponentDemo>

      <ComponentDemo 
        title="Checkbox" 
        description="체크박스 컴포넌트"
        code={`<Checkbox 
  checked={isChecked} 
  onChange={setIsChecked}
  label="체크박스 라벨"
/>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
          <Checkbox 
            checked={false} 
            onChange={() => {}}
            label="기본 체크박스"
          />
          <Checkbox 
            checked={true} 
            onChange={() => {}}
            label="체크된 체크박스"
          />
        </div>
      </ComponentDemo>

      <ComponentDemo 
        title="Logo" 
        description="로고 컴포넌트"
        code={`<Logo size="md" />`}
      >
        <Logo size="md" />
      </ComponentDemo>

      <ComponentDemo 
        title="ImageWithFallback" 
        description="로딩/에러 처리와 폴백을 지원하는 이미지"
        code={`<ImageWithFallback src="/invalid.jpg" fallbackSrc="/logo.png" alt="대체 이미지" />`}
      >
        <div style={{ display: 'flex', gap: tokens.spacing[4], alignItems: 'center' }}>
          <div style={{ width: 160 }}>
            <ImageWithFallback src="/invalid.jpg" fallbackSrc="/logo.png" alt="대체 이미지" />
          </div>
          <div style={{ width: 160 }}>
            <ImageWithFallback src="/logo.png" fallbackSrc="/invalid-fallback.jpg" alt="정상 이미지" />
          </div>
        </div>
      </ComponentDemo>

      <ComponentDemo 
        title="NicknameEditModal" 
        description="닉네임 변경 모달"
        code={`<NicknameEditModal isOpen={isOpen} onClose={onClose} />`}
      >
        <Button variant="primary" size="sm" onClick={() => setNicknameModalOpen(true)}>닉네임 변경 모달 열기</Button>
      </ComponentDemo>

      <ComponentDemo 
        title="MessageBubble" 
        description="상담 메시지 버블"
        code={`<>
  <MessageBubble message="안녕하세요!" isUser={true} timestamp="14:30" />
  <MessageBubble message="무엇을 도와드릴까요?" isUser={false} timestamp="14:31" />
</>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2], maxWidth: 420 }}>
          <MessageBubble message="안녕하세요!" isUser={true} timestamp="14:30" />
          <MessageBubble message="무엇을 도와드릴까요?" isUser={false} timestamp="14:31" />
        </div>
      </ComponentDemo>
    </div>
  );

  const renderFeatureComponents = () => (
    <div style={{ display: 'grid', gap: tokens.spacing[6], gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
      <ComponentDemo 
        title="MissionCard" 
        description="미션 정보를 표시하는 카드"
        code={`<MissionCard 
  mission={missionData} 
  onToggle={handleToggle}
  showProgress={true}
/>`}
      >
        <MissionCard 
          mission={mockMission} 
          onToggle={() => handleShowToast('미션 토글!', 'info')}
          showProgress={true}
        />
      </ComponentDemo>

      <ComponentDemo 
        title="MissionCheckButton" 
        description="미션 완료 체크 버튼"
        code={`<MissionCheckButton 
  isCompleted={isCompleted} 
  onToggle={handleToggle}
/>`}
      >
        <div style={{ display: 'flex', gap: tokens.spacing[3] }}>
          <MissionCheckButton 
            isCompleted={false} 
            onToggle={() => handleShowToast('미션 완료!', 'success')}
          />
          <MissionCheckButton 
            isCompleted={true} 
            onToggle={() => handleShowToast('미션 취소!', 'info')}
          />
        </div>
      </ComponentDemo>

      <ComponentDemo 
        title="CharacterLevelDisplay" 
        description="캐릭터 성장 시각화"
        code={`<CharacterLevelDisplay 
  characterLevel={characterData} 
  variant="primary"
  showDetails={true}
/>`}
      >
        <CharacterLevelDisplay 
          characterLevel={mockCharacter} 
          variant="primary"
          showDetails={true}
        />
      </ComponentDemo>

      <ComponentDemo 
        title="EmotionDiaryForm" 
        description="감정 일기 작성 폼"
        code={`<EmotionDiaryForm 
  onSubmit={handleSubmit} 
  initialData={diaryData}
  isLoading={isSubmitting}
/>`}
      >
        <EmotionDiaryForm 
          onSubmit={(data) => {
            handleShowToast('일기 저장 완료!', 'success');
          }} 
          initialData={null}
          isLoading={false}
        />
      </ComponentDemo>

      <ComponentDemo 
        title="EmotionDiaryCard" 
        description="감정 일기 카드 표시"
        code={`<EmotionDiaryCard 
  entry={diaryData} 
  onEdit={handleEdit}
  onDelete={handleDelete}
/>`}
      >
        <EmotionDiaryCard 
          entry={{
            id: 1,
            date: '2024-01-15',
            emotion_id: 1,
            content: '오늘은 정말 좋은 하루였습니다.'
          }} 
          onEdit={() => handleShowToast('일기 편집!', 'info')}
          onDelete={() => handleShowToast('일기 삭제!', 'error')}
        />
      </ComponentDemo>

      <ComponentDemo 
        title="PhotoSubmitButton" 
        description="사진 업로드 버튼"
        code={`<PhotoSubmitButton 
  onPhotoSubmit={handlePhotoSubmit}
  isUploading={isUploading}
/>`}
      >
        <PhotoSubmitButton 
          mission={mockMission}
          onSubmit={(missionId, publicUrl) => {
            handleShowToast('사진 업로드 완료!', 'success');
            return { success: true, missionId, publicUrl };
          }}
        />
      </ComponentDemo>

      <ComponentDemo 
        title="PhotoPreview" 
        description="업로드한 사진 미리보기"
        code={`<PhotoPreview photoUrl="/logo.png" onRemove={() => {}} />`}
      >
        <div style={{ display: 'flex', gap: tokens.spacing[3], alignItems: 'center' }}>
          <PhotoPreview photoUrl={previewUrl} onRemove={() => { setPreviewUrl(''); handleShowToast('사진 제거', 'info'); }} />
          <Button size="sm" onClick={() => setPreviewUrl('/logo.png')}>샘플 사진 설정</Button>
        </div>
      </ComponentDemo>

      <ComponentDemo
        title="QuizModal - 퀴즈 결과 화면"
        description="개선된 퀴즈 결과 화면입니다. 점수 표시, 통계 정보, 성취 배지를 포함합니다."
        code="<QuizModal missionId='rd3' onComplete={handleQuizComplete} onCancel={handleQuizCancel} />"
      >
        <div style={{ display: 'flex', gap: tokens.spacing.md, flexWrap: 'wrap' }}>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={() => handleShowQuizResult(100)}
          >
            만점 결과 보기
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => handleShowQuizResult(85)}
          >
            우수 결과 보기
          </Button>
          <Button 
            variant="danger" 
            size="sm" 
            onClick={() => handleShowQuizResult(60)}
          >
            보통 결과 보기
          </Button>
        </div>
      </ComponentDemo>

      <ComponentDemo 
        title="FavoriteButton" 
        description="대표 캐릭터 설정 버튼"
        code={`<FavoriteButton isMainCharacter={false} onSetAsMain={...} />`}
      >
        <div style={{ position: 'relative', width: 200, height: 120, border: `1px solid ${tokens.colors.border.light}`, borderRadius: tokens.borderRadius.md }}>
          <FavoriteButton 
            isMainCharacter={isMainCharacter}
            isSettingMain={isSettingMain}
            onSetAsMain={async () => {
              setIsSettingMain(true);
              setTimeout(() => {
                setIsSettingMain(false);
                setIsMainCharacter(true);
                handleShowToast('대표 캐릭터로 설정되었습니다.', 'success');
              }, 600);
            }}
          />
        </div>
      </ComponentDemo>
    </div>
  );

  const renderNavigationComponents = () => (
    <div style={{ display: 'grid', gap: tokens.spacing[6], gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
      <ComponentDemo 
        title="Navigation Controls" 
        description="햄버거 버튼과 사이드바 열기/닫기"
        code={`<HamburgerButton isOpen={isOpen} onClick={toggle} />\n<SlidingSidebar isOpen={isOpen} onClose={close} />`}
      >
        <div style={{ display: 'flex', gap: tokens.spacing[2], alignItems: 'center' }}>
          <ScreenReaderOnly id="demo-nav-help">사이드바 열기와 닫기 버튼으로 오버레이 사이드바 동작을 확인하세요.</ScreenReaderOnly>
          <Button aria-describedby="demo-nav-help" size="sm" onClick={() => setSidebarOpen(true)}>사이드바 열기</Button>
          <Button aria-describedby="demo-nav-help" size="sm" variant="secondary" onClick={() => setSidebarOpen(false)}>사이드바 닫기</Button>
        </div>
        <p style={{ marginTop: tokens.spacing[2], color: tokens.colors.text.secondary, fontSize: tokens.typography.fontSize.sm }}>
          화면 좌측 상단의 햄버거 버튼과 오버레이 사이드바를 직접 확인하세요.
        </p>
        <SlidingSidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      </ComponentDemo>
      <ComponentDemo 
        title="SidebarItem" 
        description="사이드바 메뉴 아이템"
        code={`<SidebarItem 
  to="/home" 
  icon="🏠" 
  text="홈" 
  onClick={handleClick}
/>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
          <SidebarItem 
            to="/home" 
            icon="🏠" 
            text="홈" 
            onClick={() => handleShowToast('홈 메뉴!', 'info')}
          />
          <SidebarItem 
            to="/diary" 
            icon="📝" 
            text="일기" 
            onClick={() => handleShowToast('일기 메뉴!', 'info')}
          />
        </div>
      </ComponentDemo>
    </div>
  );

  const renderNotificationComponents = () => (
    <div style={{ display: 'grid', gap: tokens.spacing[6], gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
      <ComponentDemo 
        title="Toast 알림" 
        description="토스트 알림 컴포넌트"
        code={`<Toast 
  message="저장되었습니다!" 
  type="success" 
  duration={3000}
/>`}
      >
        <div style={{ display: 'flex', gap: tokens.spacing[2], flexWrap: 'wrap' }}>
          <ScreenReaderOnly id="demo-toast-help">버튼을 누르면 화면 상단에 토스트 알림이 나타납니다.</ScreenReaderOnly>
          <Button 
            aria-describedby="demo-toast-help"
            variant="primary" 
            size="sm" 
            onClick={() => handleShowToast('성공 메시지!', 'success')}
          >
            성공 토스트
          </Button>
          <Button 
            aria-describedby="demo-toast-help"
            variant="secondary" 
            size="sm" 
            onClick={() => handleShowToast('정보 메시지!', 'info')}
          >
            정보 토스트
          </Button>
          <Button 
            aria-describedby="demo-toast-help"
            variant="danger" 
            size="sm" 
            onClick={() => handleShowToast('오류 메시지!', 'error')}
          >
            오류 토스트
          </Button>
        </div>
      </ComponentDemo>

      <ComponentDemo 
        title="Notification 알림" 
        description="알림 컴포넌트"
        code={`<NotificationContainer 
  notifications={notifications} 
  onRemove={handleRemoveNotification}
/>`}
      >
        <div style={{ display: 'flex', gap: tokens.spacing[2], flexWrap: 'wrap' }}>
          <ScreenReaderOnly id="demo-noti-help">버튼을 누르면 화면 우측 상단에 알림이 나타납니다.</ScreenReaderOnly>
          <Button 
            aria-describedby="demo-noti-help"
            variant="primary" 
            size="sm" 
            onClick={() => handleShowNotification('새로운 알림!', 'success')}
          >
            성공 알림
          </Button>
          <Button 
            aria-describedby="demo-noti-help"
            variant="secondary" 
            size="sm" 
            onClick={() => handleShowNotification('정보 알림!', 'info')}
          >
            정보 알림
          </Button>
          <Button 
            aria-describedby="demo-noti-help"
            variant="danger" 
            size="sm" 
            onClick={() => handleShowNotification('오류 알림!', 'error')}
          >
            오류 알림
          </Button>
        </div>
      </ComponentDemo>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'ui':
        return renderUIComponents();
      case 'features':
        return renderFeatureComponents();
      case 'navigation':
        return renderNavigationComponents();
      case 'notifications':
        return renderNotificationComponents();
      default:
        return renderUIComponents();
    }
  };

  return (
    <div style={pageStyle}>
      {/* 데모 환경 표시 배너 */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: tokens.colors.warning,
        color: tokens.colors.text.inverse,
        padding: tokens.spacing[2],
        textAlign: 'center',
        fontSize: tokens.typography.fontSize.sm,
        fontWeight: tokens.typography.fontWeight.semibold,
        zIndex: 1000,
      }}>
        🧪 데모 환경 - 컴포넌트 테스트 페이지
      </div>

      <header style={{
        ...headerStyle,
        marginTop: tokens.spacing[8], // 배너 높이만큼 여백 추가
      }}>
        <h1 style={titleStyle}>🧩 Replant 컴포넌트 데모</h1>
        <p style={subtitleStyle}>
          Replant 프로젝트에서 사용되는 모든 컴포넌트들을 확인하고 테스트할 수 있습니다.
        </p>
      </header>

      <div style={tabContainerStyle}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            style={tabStyle(activeTab === tab.id)}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {renderContent()}

      {/* Toast 및 Notification 컨테이너 */}
      <ToastContainer toasts={toasts} removeToast={handleRemoveToast} />
      <NotificationContainer 
        notifications={notifications} 
        removeNotification={handleRemoveNotification}
      />

      {/* Navigation demo는 컴포넌트 페이지에서 숨김 (실제 앱 레이아웃에서만 노출) */}

      {/* Nickname modal */}
      <NicknameEditModal 
        isOpen={isNicknameModalOpen} 
        onClose={() => setNicknameModalOpen(false)}
        onSuccess={(newNickname) => handleShowToast(`닉네임이 '${newNickname}'(으)로 변경되었습니다.`, 'success')}
        onError={(msg) => handleShowToast(msg || '닉네임 변경 실패', 'error')}
      />

      {/* Quiz Modal */}
      {isQuizModalOpen && (
        <QuizModal 
          missionId="rd3" 
          onComplete={handleQuizComplete} 
          onCancel={handleQuizCancel}
          demoScore={quizScore}
        />
      )}
    </div>
  );
};

export default ComponentsPage;
