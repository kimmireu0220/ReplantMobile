import React, { useState, useRef } from 'react';
import { tokens } from '../../design/tokens';
import { supabase } from '../../config/supabase';

// 파일명 정규화 함수
const normalizeFileName = (originalName) => {
  // 파일 확장자 추출
  const lastDotIndex = originalName.lastIndexOf('.');
  const extension = lastDotIndex !== -1 ? originalName.slice(lastDotIndex) : '';
  const nameWithoutExtension = lastDotIndex !== -1 ? originalName.slice(0, lastDotIndex) : originalName;
  
  // 한글, 특수문자, 공백을 제거하고 영문/숫자만 남김
  const normalizedName = nameWithoutExtension
    .replace(/[^a-zA-Z0-9]/g, '') // 영문/숫자만 남김
    .toLowerCase(); // 소문자로 변환
  
  // 정규화된 이름이 비어있으면 기본값 사용
  const finalName = normalizedName || 'photo';
  
  // 타임스탬프와 함께 반환
  return `${Date.now()}-${finalName}${extension}`;
};

const PhotoSubmitButton = ({ mission, onSubmit, disabled = false }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing[2],
    padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
    backgroundColor: 'transparent',
    color: tokens.colors.primary[500],
    border: `1px solid ${tokens.colors.primary[500]}`,
    borderRadius: tokens.borderRadius.md,
    cursor: disabled || isUploading ? 'not-allowed' : 'pointer',
    opacity: disabled || isUploading ? 0.6 : 1,
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.medium,
    transition: 'all 0.2s ease'
  };

  const handlePhotoUpload = async (file) => {
    if (!file) return;

    // 파일 검증 강화
    if (file.size > 10 * 1024 * 1024) {
      alert('파일 크기는 10MB 이하여야 합니다.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    // 지원하는 이미지 형식 검증
    const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!supportedTypes.includes(file.type)) {
      alert('지원하지 않는 이미지 형식입니다. JPEG, PNG, WebP 형식만 지원합니다.');
      return;
    }

    // 파일명 길이 검증
    if (file.name.length > 100) {
      alert('파일명이 너무 깁니다. 더 짧은 이름의 파일을 선택해주세요.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 1. 파일명 정규화
      const normalizedFileName = normalizeFileName(file.name);
      
      // 2. Supabase Storage에 업로드
      const { error: uploadError } = await supabase.storage
        .from('mission-photos')
        .upload(normalizedFileName, file, {
          onUploadProgress: (progress) => {
            setUploadProgress((progress.loaded / progress.total) * 100);
          }
        });

      if (uploadError) throw uploadError;

      // 3. 공개 URL 생성
      const { data: { publicUrl } } = supabase.storage
        .from('mission-photos')
        .getPublicUrl(normalizedFileName);

      // 4. 미션 완료 처리
      const result = await onSubmit(mission.mission_id, publicUrl);
      
      if (result && result.success) {
        // 성공 처리 - 상위 컴포넌트에서 처리됨
      }

    } catch (error) {
      
      // 구체적인 에러 메시지 제공
      let errorMessage = '사진 업로드에 실패했습니다.';
      
      if (error.message?.includes('Invalid key')) {
        errorMessage = '파일명에 특수문자가 포함되어 있습니다. 다른 파일을 선택해주세요.';
      } else if (error.message?.includes('File size')) {
        errorMessage = '파일 크기가 너무 큽니다. 10MB 이하의 파일을 선택해주세요.';
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

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        style={buttonStyle}
        disabled={disabled || isUploading}
      >
        {isUploading ? (
          <>
            <span>📤</span>
            <span>업로드 중... {Math.round(uploadProgress)}%</span>
          </>
        ) : (
          <>
            <span>📷</span>
            <span>사진 제출하기</span>
          </>
        )}
      </button>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handlePhotoUpload(e.target.files[0])}
        style={{ display: 'none' }}
      />
    </>
  );
};

export default PhotoSubmitButton;
