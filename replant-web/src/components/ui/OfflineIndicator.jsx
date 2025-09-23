import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useOnlineStatus, useNetworkQuality, useCacheStatus } from '../../hooks/useOnlineStatus';
import './OfflineIndicator.css';

/**
 * 오프라인 상태와 네트워크 품질을 표시하는 인디케이터 컴포넌트
 * 
 * @param {Object} props - 컴포넌트 속성
 * @param {boolean} [props.showNetworkQuality=false] - 네트워크 품질 표시 여부
 * @param {boolean} [props.showCacheInfo=false] - 캐시 정보 표시 여부  
 * @param {string} [props.position='top'] - 표시 위치 ('top'|'bottom')
 * @param {function} [props.onStatusChange] - 상태 변화 콜백
 */
export default function OfflineIndicator({ 
  showNetworkQuality = false,
  showCacheInfo = false,
  position = 'top',
  onStatusChange 
}) {
  const { isOnline, wasOffline, lastOffline, lastOnline } = useOnlineStatus();
  const { quality, rtt, downlink } = useNetworkQuality();
  const { hasCache, cacheCount, isServiceWorkerReady } = useCacheStatus();
  
  const [showRecoveryMessage, setShowRecoveryMessage] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // 상태 변화 시 부모 컴포넌트에 알림
  useEffect(() => {
    if (onStatusChange) {
      onStatusChange({
        isOnline,
        quality,
        hasCache,
        isServiceWorkerReady
      });
    }
  }, [isOnline, quality, hasCache, isServiceWorkerReady, onStatusChange]);

  // 연결 복구 시 일시적으로 복구 메시지 표시
  useEffect(() => {
    if (wasOffline && isOnline) {
      setShowRecoveryMessage(true);
      
      const timer = setTimeout(() => {
        setShowRecoveryMessage(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [wasOffline, isOnline]);

  // 온라인 상태이고 복구 메시지도 없으면 숨김
  if (isOnline && !showRecoveryMessage && !showNetworkQuality) {
    return null;
  }

  const getStatusInfo = () => {
    if (showRecoveryMessage) {
      return {
        icon: '✅',
        text: '연결이 복구되었습니다',
        className: 'online-recovery',
        bgColor: 'linear-gradient(90deg, #10b981, #059669)'
      };
    }
    
    if (!isOnline) {
      return {
        icon: '📡',
        text: '오프라인 모드',
        className: 'offline',
        bgColor: 'linear-gradient(90deg, #ef4444, #dc2626)',
        subtitle: hasCache ? '캐시된 콘텐츠 사용 가능' : '인터넷 연결을 확인해주세요'
      };
    }
    
    if (showNetworkQuality && quality !== 'unknown') {
      const qualityInfo = {
        fast: { icon: '⚡', text: '고속 연결', className: 'fast' },
        medium: { icon: '📶', text: '보통 연결', className: 'medium' },
        slow: { icon: '🐌', text: '느린 연결', className: 'slow' }
      };
      
      return {
        ...qualityInfo[quality],
        bgColor: quality === 'fast' ? 
          'linear-gradient(90deg, #10b981, #059669)' : 
          quality === 'medium' ?
            'linear-gradient(90deg, #f59e0b, #d97706)' :
            'linear-gradient(90deg, #ef4444, #dc2626)'
      };
    }
    
    return null;
  };

  const statusInfo = getStatusInfo();
  
  if (!statusInfo) return null;

  const formatTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return `${diff}초 전`;
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    return date.toLocaleTimeString();
  };

  const positionClasses = {
    top: 'offline-indicator-top',
    bottom: 'offline-indicator-bottom'
  };

  return (
    <div 
      className={`offline-indicator ${positionClasses[position]} ${statusInfo.className}`}
      style={{ background: statusInfo.bgColor }}
      onClick={() => setIsExpanded(!isExpanded)}
      role="status"
      aria-live="polite"
      aria-label={`네트워크 상태: ${statusInfo.text}`}
    >
      <div className="offline-indicator-content">
        <div className="offline-indicator-main">
          <span className="offline-icon" role="img" aria-label="상태 아이콘">
            {statusInfo.icon}
          </span>
          <div className="offline-text-container">
            <span className="offline-text">{statusInfo.text}</span>
            {statusInfo.subtitle && (
              <span className="offline-subtitle">{statusInfo.subtitle}</span>
            )}
          </div>
        </div>
        
        {(showNetworkQuality || showCacheInfo || !isOnline) && (
          <button 
            className="offline-expand-button"
            aria-label={isExpanded ? '세부 정보 숨기기' : '세부 정보 보기'}
          >
            <span className={`expand-arrow ${isExpanded ? 'expanded' : ''}`}>▼</span>
          </button>
        )}
      </div>
      
      {isExpanded && (
        <div className="offline-details">
          {!isOnline && lastOffline && (
            <div className="detail-item">
              <span className="detail-label">연결 끊김:</span>
              <span className="detail-value">{formatTime(lastOffline)}</span>
            </div>
          )}
          
          {showRecoveryMessage && lastOnline && (
            <div className="detail-item">
              <span className="detail-label">연결 복구:</span>
              <span className="detail-value">{formatTime(lastOnline)}</span>
            </div>
          )}
          
          {showNetworkQuality && rtt !== null && (
            <div className="detail-item">
              <span className="detail-label">응답 시간:</span>
              <span className="detail-value">{rtt}ms</span>
            </div>
          )}
          
          {showNetworkQuality && downlink !== null && (
            <div className="detail-item">
              <span className="detail-label">다운로드 속도:</span>
              <span className="detail-value">{downlink}Mbps</span>
            </div>
          )}
          
          {showCacheInfo && (
            <>
              <div className="detail-item">
                <span className="detail-label">캐시된 항목:</span>
                <span className="detail-value">{cacheCount}개</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Service Worker:</span>
                <span className="detail-value">
                  {isServiceWorkerReady ? '활성화' : '비활성화'}
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

OfflineIndicator.propTypes = {
  showNetworkQuality: PropTypes.bool,
  showCacheInfo: PropTypes.bool,
  position: PropTypes.oneOf(['top', 'bottom']),
  onStatusChange: PropTypes.func
};