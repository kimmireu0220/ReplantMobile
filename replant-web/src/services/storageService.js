import { supabase } from '../config/supabase';

export class StorageService {
  static BUCKET_NAME = 'character-images';
  
  // Supabase 스토리지 URL 생성
  static getImageUrl(path) {
    const { data } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(path);
    return data.publicUrl;
  }
  
  // 이미지 프리로딩
  static preloadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  }
  
  // 에러 처리 및 폴백
  static handleImageError(error, fallbackUrl) {
    return fallbackUrl;
  }
} 