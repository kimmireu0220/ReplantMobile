import React, { useState, useRef } from 'react';
import { tokens } from '../../design/tokens';
import { supabase } from '../../config/supabase';
import { verificationTypeIcons, verificationTypeColors } from '../../data/missions';
import VideoRecorder from './VideoRecorder';
import StretchingVideoPlayer from './StretchingVideoPlayer';
import QuizModal from './QuizModal';
import DiaryVerificationModal from './DiaryVerificationModal';
import TimerVerificationModal from './TimerVerificationModal';

// 파일명 정규화 함수 (기존 PhotoSubmitButton에서 가져옴)
const normalizeFileName = (originalName) => {
  const lastDotIndex = originalName.lastIndexOf('.');
  const extension = lastDotIndex !== -1 ? originalName.slice(lastDotIndex) : '';
  const nameWithoutExtension = lastDotIndex !== -1 ? originalName.slice(0, lastDotIndex) : originalName;
  
  const normalizedName = nameWithoutExtension
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();
  
  const finalName = normalizedName || 'file';
  return `${Date.now()}-${finalName}${extension}`;
};

const VerificationButton = ({ 
  mission, 
  verificationType, 
  buttonText, 
  onSubmit, 
  disabled = false 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showVideoRecorder, setShowVideoRecorder] = useState(false);
  const [showStretchingPlayer, setShowStretchingPlayer] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showDiaryVerificationModal, setShowDiaryVerificationModal] = useState(false);
  const [showTimerVerificationModal, setShowTimerVerificationModal] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const fileInputRef = useRef(null);

  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing[2],
    padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
    backgroundColor: 'transparent',
    color: verificationTypeColors[verificationType] || tokens.colors.primary[500],
    border: `1px solid ${verificationTypeColors[verificationType] || tokens.colors.primary[500]}`,
    borderRadius: tokens.borderRadius.md,
    cursor: disabled || isUploading ? 'not-allowed' : 'pointer',
    opacity: disabled || isUploading ? 0.6 : 1,
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.medium,
    transition: 'all 0.2s ease'
  };

  const handleVideoRecording = (videoBlob) => {
    setRecordedVideo(videoBlob);
    setShowVideoRecorder(false);
  };

  const handleVideoUpload = async () => {
    if (!recordedVideo) return;
    
    // File 객체로 변환 (기존 패턴과 일치)
    const videoFile = new File([recordedVideo], `mission-${mission.mission_id}.webm`, {
      type: 'video/webm'
    });
    
    await handleFileUpload(videoFile);
    setRecordedVideo(null);
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      switch (verificationType) {
        case 'stretching':
          setShowStretchingPlayer(true);
          break;
        case 'video':
          setShowVideoRecorder(true);
          break;
        case 'photo':
        case 'screenshot':
          fileInputRef.current?.click();
          break;
        case 'quiz':
          setShowQuizModal(true);
          break;
        case 'diary':
          setShowDiaryVerificationModal(true);
          break;
        case 'timer':
          setShowTimerVerificationModal(true);
          break;
        case 'audio':
          alert('음악 듣기 기능은 준비 중입니다!');
          break;
        default:
          fileInputRef.current?.click();
      }
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    // 파일 검증
    if (verificationType === 'video') {
      if (file.size > 100 * 1024 * 1024) {
        alert('영상 파일 크기는 100MB 이하여야 합니다.');
        return;
      }
      if (!file.type.startsWith('video/')) {
        alert('영상 파일만 업로드 가능합니다.');
        return;
      }
    } else {
      if (file.size > 10 * 1024 * 1024) {
        alert('파일 크기는 10MB 이하여야 합니다.');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
      }
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const normalizedFileName = normalizeFileName(file.name);
      const bucketName = verificationType === 'video' ? 'mission-videos' : 'mission-photos';
      
      // Supabase Storage에 업로드
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(normalizedFileName, file, {
          onUploadProgress: (progress) => {
            setUploadProgress((progress.loaded / progress.total) * 100);
          }
        });

      if (uploadError) throw uploadError;

      // 공개 URL 생성
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(normalizedFileName);

      // 미션 완료 처리
      const result = await onSubmit(mission.mission_id, publicUrl);
      
      if (result && result.success) {
        // 성공 처리 - 상위 컴포넌트에서 처리됨
      }

    } catch (error) {
      let errorMessage = '업로드에 실패했습니다.';
      
      if (error.message?.includes('Invalid key')) {
        errorMessage = '파일명에 특수문자가 포함되어 있습니다.';
      } else if (error.message?.includes('File size')) {
        errorMessage = '파일 크기가 너무 큽니다.';
      } else if (error.message?.includes('Unauthorized')) {
        errorMessage = '업로드 권한이 없습니다. 다시 로그인해주세요.';
      } else if (error.message?.includes('Bucket not found')) {
        errorMessage = '저장소 설정에 문제가 있습니다. 관리자에게 문의해주세요.';
      }
      
      alert(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const getUploadText = () => {
    if (isUploading) {
      return `업로드 중... ${Math.round(uploadProgress)}%`;
    }
    return buttonText;
  };

  const getUploadIcon = () => {
    if (isUploading) {
      return '📤';
    }
    return verificationTypeIcons[verificationType] || '📷';
  };

  return (
    <>
      <button
        onClick={handleClick}
        style={buttonStyle}
        disabled={disabled || isUploading}
      >
        <span>{getUploadIcon()}</span>
        <span>{getUploadText()}</span>
      </button>

      {/* 스트레칭 영상 플레이어 모달 */}
      {showStretchingPlayer && (
        <StretchingVideoPlayer
          missionId={mission.mission_id}
          onComplete={() => {
            setShowStretchingPlayer(false);
            // 미션 완료 후 페이지 새로고침 또는 상태 업데이트
            window.location.reload();
          }}
          onCancel={() => setShowStretchingPlayer(false)}
        />
      )}

      {/* 영상 촬영 모달 */}
      {showVideoRecorder && (
        <VideoRecorder
          onRecordingComplete={handleVideoRecording}
          maxDuration={300} // 5분 제한
          onCancel={() => setShowVideoRecorder(false)}
        />
      )}

      {/* 촬영된 영상 미리보기 */}
      {recordedVideo && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: tokens.colors.background.primary,
          padding: tokens.spacing[4],
          borderRadius: tokens.borderRadius.md,
          border: `1px solid ${tokens.colors.border.light}`,
          zIndex: 1001,
          boxShadow: `0 4px 20px ${tokens.colors.shadow.medium}`
        }}>
          <h4 style={{
            margin: `0 0 ${tokens.spacing[3]} 0`,
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.medium,
            color: tokens.colors.text.primary
          }}>
            촬영된 영상 미리보기
          </h4>
          <video 
            src={URL.createObjectURL(recordedVideo)} 
            controls 
            style={{ 
              maxWidth: '300px',
              borderRadius: tokens.borderRadius.sm
            }} 
          />
          <div style={{ 
            display: 'flex', 
            gap: tokens.spacing[2], 
            marginTop: tokens.spacing[3] 
          }}>
            <button onClick={handleVideoUpload} style={{
              ...buttonStyle,
              backgroundColor: tokens.colors.primary[500],
              color: 'white'
            }}>
              📤 업로드
            </button>
            <button onClick={() => setRecordedVideo(null)} style={{
              ...buttonStyle,
              backgroundColor: tokens.colors.gray[400],
              color: 'white'
            }}>
              🔄 다시 촬영
            </button>
          </div>
        </div>
      )}
      
      {/* 퀴즈 모달 */}
      {showQuizModal && (
        <QuizModal
          missionId={mission.mission_id}
          onComplete={() => {
            setShowQuizModal(false);
            window.location.reload(); // 바로 새로고침
          }}
          onCancel={() => setShowQuizModal(false)}
        />
      )}

      {/* 일기 작성 모달 */}
      {showDiaryVerificationModal && (
        <DiaryVerificationModal
          missionId={mission.mission_id}
          onComplete={() => {
            setShowDiaryVerificationModal(false);
            window.location.reload();
          }}
          onCancel={() => setShowDiaryVerificationModal(false)}
        />
      )}

      {/* 타이머 인증 모달 */}
      {showTimerVerificationModal && (
        <TimerVerificationModal
          missionId={mission.mission_id}
          onComplete={() => {
            setShowTimerVerificationModal(false);
            window.location.reload();
          }}
          onCancel={() => setShowTimerVerificationModal(false)}
        />
      )}


      {/* 기존 파일 업로드 input */}
      {(verificationType === 'photo' || verificationType === 'screenshot') && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileUpload(e.target.files[0])}
          style={{ display: 'none' }}
        />
      )}
    </>
  );
};

export default VerificationButton;
