import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import syncManager from '../../utils/syncManager.js';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import './SyncIndicator.css';

/**
 * 동기화 상태를 표시하는 인디케이터 컴포넌트
 * 
 * @param {Object} props - 컴포넌트 속성
 * @param {boolean} [props.showDetails=false] - 세부 정보 표시 여부
 * @param {string} [props.position='top'] - 표시 위치 ('top'|'bottom')
 * @param {function} [props.onSyncStart] - 수동 동기화 시작 콜백
 * @param {function} [props.onStatusChange] - 상태 변화 콜백
 */
export default function SyncIndicator({
  showDetails = false,
  position = 'top',
  onSyncStart,
  onStatusChange
}) {
  const { isOnline } = useOnlineStatus();
  const [syncStatus, setSyncStatus] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState(null);

  // 동기화 상태 업데이트
  const updateSyncStatus = useCallback(async () => {
    try {
      const status = await syncManager.getSyncStatus();
      setSyncStatus(status);
      
      if (onStatusChange) {
        onStatusChange(status);
      }
    } catch (error) {
      console.error('동기화 상태 조회 실패:', error);
    }
  }, [onStatusChange]);

  // 동기화 이벤트 리스너 설정
  useEffect(() => {
    const handleSyncEvent = (event) => {
      switch (event.type) {
        case 'SYNC_START':
        case 'FORCE_SYNC_START':
          setSyncInProgress(true);
          setLastSyncResult(null);
          break;
        
        case 'SYNC_COMPLETE':
        case 'FORCE_SYNC_COMPLETE':
          setSyncInProgress(false);
          setLastSyncResult(event.result);
          updateSyncStatus();
          break;
        
        case 'SYNC_ERROR':
        case 'FORCE_SYNC_ERROR':
          setSyncInProgress(false);
          setLastSyncResult({
            success: false,
            error: event.error
          });
          updateSyncStatus();
          break;
        default:
          break;
      }
    };

    syncManager.addSyncListener(handleSyncEvent);
    updateSyncStatus();

    // 30초마다 상태 업데이트
    const interval = setInterval(updateSyncStatus, 30000);

    return () => {
      syncManager.removeSyncListener(handleSyncEvent);
      clearInterval(interval);
    };
  }, [updateSyncStatus]);

  // 수동 동기화 시작
  const handleSyncStart = async () => {
    if (syncInProgress || !isOnline) return;
    
    try {
      setSyncInProgress(true);
      
      if (onSyncStart) {
        onSyncStart();
      }
      
      await syncManager.startManualSync();
    } catch (error) {
      console.error('수동 동기화 실패:', error);
      setLastSyncResult({
        success: false,
        error: error.message
      });
      setSyncInProgress(false);
    }
  };

  // 동기화 상태 정보 계산
  const getSyncInfo = () => {
    if (syncInProgress) {
      return {
        icon: '⏳',
        text: '동기화 중...',
        className: 'sync-in-progress',
        bgColor: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
        clickable: false
      };
    }

    if (!syncStatus) {
      return null;
    }

    const { totalPendingSync, totalPendingData, isOnline: statusOnline } = syncStatus;
    const hasPendingData = totalPendingSync > 0 || totalPendingData > 0;

    if (!statusOnline) {
      if (hasPendingData) {
        return {
          icon: '⏸️',
          text: `${totalPendingSync + totalPendingData}개 대기 중`,
          className: 'sync-paused',
          bgColor: 'linear-gradient(90deg, #f59e0b, #d97706)',
          subtitle: '온라인 시 자동 동기화됩니다',
          clickable: false
        };
      }
      return null;
    }

    if (hasPendingData) {
      return {
        icon: '📤',
        text: `${totalPendingSync + totalPendingData}개 동기화 필요`,
        className: 'sync-needed',
        bgColor: 'linear-gradient(90deg, #ef4444, #dc2626)',
        subtitle: '클릭하여 동기화',
        clickable: true
      };
    }

    // 최근 동기화 결과 표시
    if (lastSyncResult) {
      if (lastSyncResult.success && lastSyncResult.totalSynced > 0) {
        return {
          icon: '✅',
          text: `${lastSyncResult.totalSynced}개 동기화 완료`,
          className: 'sync-success',
          bgColor: 'linear-gradient(90deg, #10b981, #059669)',
          autoHide: true
        };
      }
      
      if (!lastSyncResult.success) {
        return {
          icon: '❌',
          text: '동기화 실패',
          className: 'sync-error',
          bgColor: 'linear-gradient(90deg, #ef4444, #dc2626)',
          subtitle: lastSyncResult.error || '알 수 없는 오류',
          clickable: true
        };
      }
    }

    return null;
  };

  const syncInfo = getSyncInfo();

  // 표시할 정보가 없거나 자동 숨김 상태이면 숨김
  useEffect(() => {
    if (syncInfo?.autoHide) {
      const timer = setTimeout(() => {
        setLastSyncResult(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [syncInfo?.autoHide]);

  if (!syncInfo) {
    return null;
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return `${diff}초 전`;
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    return date.toLocaleTimeString();
  };

  const positionClasses = {
    top: 'sync-indicator-top',
    bottom: 'sync-indicator-bottom'
  };

  return (
    <div 
      className={`sync-indicator ${positionClasses[position]} ${syncInfo.className} ${syncInfo.clickable ? 'clickable' : ''}`}
      style={{ background: syncInfo.bgColor }}
      onClick={syncInfo.clickable ? handleSyncStart : () => setIsExpanded(!isExpanded)}
      role={syncInfo.clickable ? "button" : "status"}
      aria-live="polite"
      aria-label={`동기화 상태: ${syncInfo.text}`}
      tabIndex={syncInfo.clickable ? 0 : -1}
      onKeyDown={(e) => {
        if (syncInfo.clickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleSyncStart();
        }
      }}
    >
      <div className="sync-indicator-content">
        <div className="sync-indicator-main">
          <span className="sync-icon" role="img" aria-label="동기화 상태 아이콘">
            {syncInfo.icon}
          </span>
          <div className="sync-text-container">
            <span className="sync-text">{syncInfo.text}</span>
            {syncInfo.subtitle && (
              <span className="sync-subtitle">{syncInfo.subtitle}</span>
            )}
          </div>
          
          {syncInProgress && (
            <div className="sync-spinner" aria-label="동기화 진행 중">
              <div className="spinner-ring"></div>
            </div>
          )}
        </div>
        
        {(showDetails || syncStatus?.totalPendingSync > 0) && (
          <button 
            className="sync-expand-button"
            aria-label={isExpanded ? '세부 정보 숨기기' : '세부 정보 보기'}
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            <span className={`expand-arrow ${isExpanded ? 'expanded' : ''}`}>▼</span>
          </button>
        )}
      </div>
      
      {isExpanded && syncStatus && (
        <div className="sync-details">
          <div className="detail-item">
            <span className="detail-label">대기 중인 동기화:</span>
            <span className="detail-value">{syncStatus.totalPendingSync}개</span>
          </div>
          
          <div className="detail-item">
            <span className="detail-label">대기 중인 데이터:</span>
            <span className="detail-value">{syncStatus.totalPendingData}개</span>
          </div>
          
          {syncStatus.diary && (
            <div className="detail-group">
              <div className="detail-item">
                <span className="detail-label">일기 대기:</span>
                <span className="detail-value">
                  동기화 {syncStatus.diary.pendingSync}개, 
                  데이터 {syncStatus.diary.pendingDiaries}개
                </span>
              </div>
            </div>
          )}
          
          {syncStatus.mission && (
            <div className="detail-group">
              <div className="detail-item">
                <span className="detail-label">미션 대기:</span>
                <span className="detail-value">
                  동기화 {syncStatus.mission.pendingSync}개, 
                  데이터 {syncStatus.mission.pendingMissions}개
                </span>
              </div>
            </div>
          )}
          
          {syncStatus.lastSyncTime && (
            <div className="detail-item">
              <span className="detail-label">마지막 동기화:</span>
              <span className="detail-value">{formatTime(syncStatus.lastSyncTime)}</span>
            </div>
          )}
          
          {lastSyncResult && lastSyncResult.success && (
            <div className="detail-group">
              <div className="detail-item">
                <span className="detail-label">마지막 결과:</span>
                <span className="detail-value">
                  성공 {lastSyncResult.totalSynced || 0}개, 
                  실패 {lastSyncResult.totalErrors || 0}개
                </span>
              </div>
            </div>
          )}
          
          {isOnline && syncStatus.totalPendingSync > 0 && (
            <div className="sync-actions">
              <button
                className="sync-action-button"
                onClick={handleSyncStart}
                disabled={syncInProgress}
                aria-label="지금 동기화"
              >
                {syncInProgress ? '동기화 중...' : '지금 동기화'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

SyncIndicator.propTypes = {
  showDetails: PropTypes.bool,
  position: PropTypes.oneOf(['top', 'bottom']),
  onSyncStart: PropTypes.func,
  onStatusChange: PropTypes.func
};