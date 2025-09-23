import React, { useEffect, useState } from 'react';
import { tokens } from '../../design/tokens';
import { useStretching } from '../../hooks/useStretching';
import { useNotification } from '../../hooks/useNotification';

const StretchingVideoPlayer = ({ 
  missionId, 
  onComplete, 
  onCancel 
}) => {
  const {
    isCompleted,
    error,
    videoRef,
    timerRef,
    getStretchingVideo,
    updateTime,
    completeStretchingMission,
    handleVideoEnded,
    clearError
  } = useStretching();

  const { showError, showInfo } = useNotification();
  const [videoInfo, setVideoInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [localIsPlaying, setLocalIsPlaying] = useState(false);

  // 스트레칭 영상 정보 로드
  useEffect(() => {
    try {
      const info = getStretchingVideo(missionId);
      setVideoInfo(info);
      setIsLoading(false);
    } catch (error) {
      console.error('스트레칭 영상 로드 에러:', error);
      setIsLoading(false);
      showError('스트레칭 영상 로드 실패', '스트레칭 영상을 불러올 수 없습니다.');
    }
  }, [missionId, getStretchingVideo, showError]);

  // 영상 시간 업데이트 타이머
  useEffect(() => {
    if (localIsPlaying) {
      timerRef.current = setInterval(updateTime, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [localIsPlaying, updateTime, timerRef]);

  // 완료 시 자동 처리
  useEffect(() => {
    if (isCompleted) {
      showInfo('스트레칭 완료', '스트레칭을 완료했습니다! 🎉', { emoji: '🎉' });
    }
  }, [isCompleted, showInfo]);

  // 에러 처리
  useEffect(() => {
    if (error) {
      showError('스트레칭 오류', error);
      clearError();
    }
  }, [error, showError, clearError]);

  const handleComplete = async () => {
    try {
      await completeStretchingMission(missionId);
      showInfo('미션 완료', '미션이 완료되었습니다! 🎉', { emoji: '🎉' });
      onComplete?.();
    } catch (error) {
      showError('미션 완료 실패', '미션 완료에 실패했습니다.');
    }
  };

  // 스타일 정의
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacing[4]
  };

  const containerStyle = {
    backgroundColor: tokens.colors.background.primary,
    borderRadius: tokens.borderRadius.lg,
    padding: tokens.spacing[6],
    maxWidth: '800px',
    width: '100%',
    boxShadow: tokens.shadow.xl,
    border: `1px solid ${tokens.colors.border.medium}`
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing[4]
  };

  const titleStyle = {
    fontSize: tokens.typography.fontSize.xl,
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary,
    margin: 0
  };

  const closeButtonStyle = {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: tokens.colors.text.secondary,
    padding: tokens.spacing[1]
  };

  const videoContainerStyle = {
    position: 'relative',
    width: '100%',
    borderRadius: tokens.borderRadius.md,
    overflow: 'hidden',
    marginBottom: tokens.spacing[4]
  };

  const videoStyle = {
    width: '100%',
    height: 'auto',
    display: 'block'
  };

  const controlsStyle = {
    display: 'flex',
    gap: tokens.spacing[3],
    justifyContent: 'center',
    flexWrap: 'wrap'
  };

  const buttonStyle = {
    padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
    borderRadius: tokens.borderRadius.md,
    border: 'none',
    fontSize: tokens.typography.fontSize.md,
    fontWeight: tokens.typography.fontWeight.medium,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '120px'
  };

  const successButtonStyle = {
    ...buttonStyle,
    backgroundColor: tokens.colors.success,
    color: 'white'
  };

  const instructionsStyle = {
    backgroundColor: tokens.colors.background.secondary,
    padding: tokens.spacing[3],
    borderRadius: tokens.borderRadius.md,
    marginBottom: tokens.spacing[4]
  };

  const instructionsTitleStyle = {
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing[2]
  };

  const instructionsListStyle = {
    listStyle: 'none',
    padding: 0,
    margin: 0
  };

  const instructionItemStyle = {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.spacing[1],
    padding: `${tokens.spacing[1]} 0`
  };

  if (isLoading) {
    return (
      <div style={overlayStyle}>
        <div style={containerStyle}>
          <div style={{ textAlign: 'center', padding: tokens.spacing[6] }}>
            <div>스트레칭 영상을 불러오는 중...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!videoInfo) {
    return (
      <div style={overlayStyle}>
        <div style={containerStyle}>
          <div style={{ textAlign: 'center', padding: tokens.spacing[6] }}>
            <div>스트레칭 영상을 찾을 수 없습니다.</div>
            <button onClick={onCancel} style={buttonStyle}>
              뒤로 가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={overlayStyle}>
      <div style={containerStyle}>
        {/* 헤더 */}
        <div style={headerStyle}>
          <h2 style={titleStyle}>{videoInfo.title}</h2>
          <button onClick={onCancel} style={closeButtonStyle}>
            ✕
          </button>
        </div>

        {/* 설명 */}
        <p style={{ 
          color: tokens.colors.text.secondary, 
          marginBottom: tokens.spacing[4] 
        }}>
          {videoInfo.description}
        </p>

        {/* 영상 플레이어 */}
        <div style={videoContainerStyle}>
          <video
            ref={videoRef}
            src={videoInfo.videoUrl}
            style={videoStyle}
            onEnded={() => {
              setLocalIsPlaying(false);
              // 영상이 끝나면 완료 상태로 설정
              handleVideoEnded();
            }}
            onError={(e) => {
              console.error('영상 로드 에러:', e);
              showError('영상 로드 실패', '영상을 불러올 수 없습니다. 잠시 후 다시 시도해주세요.');
            }}
            controls
            preload="metadata"
            crossOrigin="anonymous"
          />
        </div>

        {/* 지시사항 */}
        <div style={instructionsStyle}>
          <div style={instructionsTitleStyle}>💡 스트레칭 지시사항</div>
          <ul style={instructionsListStyle}>
            {videoInfo.instructions.map((instruction, index) => (
              <li key={index} style={instructionItemStyle}>
                {instruction}
              </li>
            ))}
          </ul>
        </div>

        {/* 영상 재생 완료 시 미션 완료 버튼 표시 */}
        {isCompleted && (
          <div style={controlsStyle}>
            <button onClick={handleComplete} style={successButtonStyle}>
              ✅ 미션 완료
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StretchingVideoPlayer;
