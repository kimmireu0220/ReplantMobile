import React, { useState, useRef, useEffect } from 'react';
import { tokens } from '../../design/tokens';
import { formatVideoDuration } from '../../utils/videoUtils';

const VideoRecorder = ({ onRecordingComplete, maxDuration = 300, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaStream, setMediaStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);

  // 기존 컴포넌트와 동일한 스타일 패턴
  const containerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacing[4]
  };

  const videoStyle = {
    width: '100%',
    maxWidth: '400px',
    borderRadius: tokens.borderRadius.md,
    border: `2px solid ${tokens.colors.primary[500]}`
  };

  const controlsStyle = {
    display: 'flex',
    gap: tokens.spacing[3],
    marginTop: tokens.spacing[4]
  };

  const buttonStyle = {
    padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
    borderRadius: tokens.borderRadius.md,
    border: 'none',
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.medium,
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  };

  const startButtonStyle = {
    ...buttonStyle,
    backgroundColor: tokens.colors.error,
    color: 'white'
  };

  const stopButtonStyle = {
    ...buttonStyle,
    backgroundColor: tokens.colors.gray[600],
    color: 'white'
  };

  const cancelButtonStyle = {
    ...buttonStyle,
    backgroundColor: 'transparent',
    color: tokens.colors.text.secondary,
    border: `1px solid ${tokens.colors.border.light}`
  };

  const errorOverlayStyle = {
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

  const errorCardStyle = {
    backgroundColor: tokens.colors.background.primary,
    borderRadius: tokens.borderRadius.lg,
    padding: tokens.spacing[6],
    maxWidth: '500px',
    width: '100%',
    boxShadow: tokens.shadow.xl,
    border: `1px solid ${tokens.colors.border.medium}`,
    textAlign: 'center'
  };

  const errorIconStyle = {
    fontSize: '64px',
    marginBottom: tokens.spacing[4],
    filter: 'grayscale(1) opacity(0.6)'
  };

  const errorTitleStyle = {
    fontSize: tokens.typography.fontSize.xl,
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing[3]
  };

  const errorMessageStyle = {
    fontSize: tokens.typography.fontSize.md,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.spacing[5],
    lineHeight: 1.6
  };

  const errorActionsStyle = {
    display: 'flex',
    gap: tokens.spacing[3],
    justifyContent: 'center',
    flexWrap: 'wrap'
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: tokens.colors.primary[500],
    color: 'white',
    padding: `${tokens.spacing[3]} ${tokens.spacing[5]}`,
    fontSize: tokens.typography.fontSize.md,
    fontWeight: tokens.typography.fontWeight.medium,
    minWidth: '140px'
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: 'transparent',
    color: tokens.colors.text.secondary,
    border: `2px solid ${tokens.colors.border.medium}`,
    padding: `${tokens.spacing[3]} ${tokens.spacing[5]}`,
    fontSize: tokens.typography.fontSize.md,
    fontWeight: tokens.typography.fontWeight.medium,
    minWidth: '140px'
  };

  const helpSectionStyle = {
    marginTop: tokens.spacing[5],
    padding: tokens.spacing[4],
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.md,
    border: `1px solid ${tokens.colors.border.light}`
  };

  const helpTitleStyle = {
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing[2],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing[1]
  };

  const helpListStyle = {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    textAlign: 'left'
  };

  const helpItemStyle = {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.spacing[1],
    padding: `${tokens.spacing[1]} 0`,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing[2]
  };

  // 카메라 접근 (기존 패턴과 일치)
  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true
      });
      setMediaStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('카메라 접근 실패:', error);
      
      // 오류 유형에 따른 구체적인 메시지
      let errorMessage = '카메라 접근에 실패했습니다.';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = '카메라 권한이 거부되었습니다. 브라우저 설정에서 카메라 권한을 허용해주세요.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = '카메라를 찾을 수 없습니다. 카메라가 연결되어 있는지 확인해주세요.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = '카메라가 다른 앱에서 사용 중입니다. 다른 앱을 종료하고 다시 시도해주세요.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = '지원하지 않는 카메라 설정입니다. 다른 카메라를 선택해주세요.';
      } else if (error.name === 'TypeError') {
        errorMessage = '브라우저가 카메라를 지원하지 않습니다. 다른 브라우저를 사용해주세요.';
      }
      
      setCameraError(errorMessage);
    }
  };

  // 영상 촬영 시작
  const startRecording = () => {
    if (!mediaStream) return;
    
    try {
      const mediaRecorder = new MediaRecorder(mediaStream, {
        mimeType: 'video/webm;codecs=vp9'
      });
      
      const chunks = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        onRecordingComplete(blob);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      mediaRecorderRef.current = mediaRecorder;
      
      // 타이머 시작
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      console.error('영상 촬영 시작 실패:', error);
      
      let errorMessage = '영상 촬영을 시작할 수 없습니다.';
      
      if (error.name === 'NotSupportedError') {
        errorMessage = '이 브라우저는 영상 촬영을 지원하지 않습니다. Chrome, Firefox, Safari를 사용해주세요.';
      } else if (error.name === 'InvalidStateError') {
        errorMessage = '카메라가 준비되지 않았습니다. 잠시 후 다시 시도해주세요.';
      }
      
      setCameraError(errorMessage);
    }
  };

  // 영상 촬영 중지
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  // 컴포넌트 마운트 시 카메라 시작
  useEffect(() => {
    startCamera();
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [mediaStream]);

  if (cameraError) {
    return (
      <div style={errorOverlayStyle}>
        <div style={errorCardStyle}>
          <div style={errorIconStyle}>📹</div>
          
          <h2 style={errorTitleStyle}>카메라를 사용할 수 없습니다</h2>
          
          <p style={errorMessageStyle}>
            {cameraError}
          </p>

          <div style={errorActionsStyle}>
            <button onClick={startCamera} style={primaryButtonStyle}>
              🔄 다시 시도
            </button>
            
            <button onClick={onCancel} style={secondaryButtonStyle}>
              뒤로 가기
            </button>
          </div>

          <div style={helpSectionStyle}>
            <div style={helpTitleStyle}>
              <span>💡</span>
              <span>해결 방법</span>
            </div>
            
            <ul style={helpListStyle}>
              <li style={helpItemStyle}>
                <span>1️⃣</span>
                <span>브라우저 주소창의 카메라 아이콘을 클릭하세요</span>
              </li>
              <li style={helpItemStyle}>
                <span>2️⃣</span>
                <span>카메라 권한을 "허용"으로 설정하세요</span>
              </li>
              <li style={helpItemStyle}>
                <span>3️⃣</span>
                <span>페이지를 새로고침 후 다시 시도하세요</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={videoStyle}
      />
      
      {isRecording && (
        <div style={{
          position: 'absolute',
          top: tokens.spacing[4],
          left: tokens.spacing[4],
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
          borderRadius: tokens.borderRadius.sm,
          fontSize: tokens.typography.fontSize.sm,
          fontWeight: tokens.typography.fontWeight.medium
        }}>
          🎥 촬영 중: {formatVideoDuration(recordingTime)}
        </div>
      )}
      
      <div style={controlsStyle}>
        {!isRecording ? (
          <button onClick={startRecording} style={startButtonStyle}>
            🎬 촬영 시작
          </button>
        ) : (
          <button onClick={stopRecording} style={stopButtonStyle}>
            ⏹️ 촬영 중지
          </button>
        )}
        
        <button onClick={onCancel} style={cancelButtonStyle}>
          ❌ 취소
        </button>
      </div>
    </div>
  );
};

export default VideoRecorder;
