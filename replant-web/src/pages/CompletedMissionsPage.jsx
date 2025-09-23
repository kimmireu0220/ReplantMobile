import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { tokens } from '../design/tokens';
import { missionService } from '../services/missionService';
import { CompletedMissionItem } from '../components/mission';
import { PageTitle } from '../components/ui/ScreenReaderOnly';


import { getCategoryColor } from '../utils/categoryUtils';

const CompletedMissionsPage = () => {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();

  
  // URL에서 카테고리 파라미터 추출
  const searchParams = new URLSearchParams(location.search);
  const category = searchParams.get('category');
  
  // 카테고리 색상 가져오기
  const categoryColor = category ? getCategoryColor(category) : tokens.colors.primary[500];
  
  // 카테고리 표시명 매핑
  const getCategoryDisplayName = (category) => {
    const categoryMap = {
      'exercise': '운동',
      'cleaning': '청소',
      'reading': '독서',
      'selfcare': '자기돌봄',
      'social': '사회활동',
      'creativity': '창의활동'
    };
    return categoryMap[category] || category;
  };

  const loadCompletedMissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await missionService.getCompletedMissions(null, { category });
      
      if (error) {
        setError('완료한 미션을 불러오는데 실패했습니다.');
        return;
      }
      
      setMissions(data || []);
    } catch (error) {
      setError('완료한 미션을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    loadCompletedMissions();
  }, [loadCompletedMissions]);

  // 페이지 컨테이너 스타일
  const pageStyle = {
    minHeight: '100vh',
    backgroundColor: tokens.colors.background.primary,
    padding: tokens.spacing[4]
  };
  
  // 메인 컨테이너 스타일
  const containerStyle = {
    maxWidth: '480px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing[6]
  };
  


  const listStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing[3]
  };

  const loadingStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: tokens.spacing[8],
    color: tokens.colors.text.secondary,
    fontSize: tokens.typography.fontSize.lg
  };



  const errorStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacing[8],
    textAlign: 'center'
  };

  const errorTextStyle = {
    color: tokens.colors.text.secondary,
    fontSize: tokens.typography.fontSize.lg,
    marginBottom: tokens.spacing[4]
  };

  const retryButtonStyle = {
    padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
    backgroundColor: tokens.colors.primary[500],
    color: tokens.colors.text.inverse,
    border: 'none',
    borderRadius: tokens.borderRadius.full,
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.semibold,
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  };

  const emptyStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacing[8],
    textAlign: 'center'
  };

  const emptyTextStyle = {
    color: categoryColor, // 카테고리 색상 적용
    fontSize: tokens.typography.fontSize.lg,
    marginBottom: tokens.spacing[2],
    fontWeight: tokens.typography.fontWeight.semibold
  };

  const emptySubTextStyle = {
    color: tokens.colors.text.tertiary,
    fontSize: tokens.typography.fontSize.sm
  };

  const statsStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: tokens.spacing[3],
    backgroundColor: categoryColor + '15', // 카테고리 색상의 연한 버전
    borderRadius: tokens.borderRadius.lg,
    marginBottom: tokens.spacing[4],
    border: `1px solid ${categoryColor}30` // 카테고리 색상의 연한 테두리
  };

  const statItemStyle = {
    textAlign: 'center'
  };

  const statValueStyle = {
    fontSize: tokens.typography.fontSize.xl,
    fontWeight: tokens.typography.fontWeight.bold,
    color: categoryColor, // 카테고리 색상 적용
    marginBottom: tokens.spacing[1]
  };

  const statLabelStyle = {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.secondary
  };

  const totalExperience = missions.reduce((sum, mission) => sum + (mission.experience || 0), 0);

  return (
    <div style={pageStyle} role="main" aria-label="완료한 미션">
      <PageTitle title="완료한 미션" />
      <div style={containerStyle}>
        {/* 헤더 섹션 - 화면 정중앙 배치 */}
        <header style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: tokens.spacing[6],
          paddingTop: tokens.spacing[4]
        }}>

          <h1 style={{
            fontSize: tokens.typography.fontSize['2xl'],
            fontWeight: tokens.typography.fontWeight.bold,
            color: categoryColor, // 카테고리 색상 적용
            margin: 0,
            textAlign: 'center'
          }}>
            완료한 미션
          </h1>
        </header>

        {/* 통계 정보 */}
        {!loading && missions.length > 0 && (
          <div style={statsStyle}>
            <div style={statItemStyle}>
              <div style={statValueStyle}>{missions.length}</div>
              <div style={statLabelStyle}>완료한 미션</div>
            </div>
            <div style={statItemStyle}>
              <div style={statValueStyle}>{totalExperience}</div>
              <div style={statLabelStyle}>총 경험치</div>
            </div>
          </div>
        )}

        {/* 로딩 상태 */}
        {loading && (
          <div style={loadingStyle}>
            로딩 중...
          </div>
        )}

        {/* 에러 상태 */}
        {error && (
          <div style={errorStyle}>
            <div style={errorTextStyle}>{error}</div>
            <button 
              onClick={loadCompletedMissions}
              style={retryButtonStyle}
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 미션 리스트 */}
        {!loading && !error && missions.length > 0 && (
          <div style={listStyle}>
            {missions.map(mission => (
              <CompletedMissionItem key={mission.id} mission={mission} />
            ))}
          </div>
        )}

        {/* 빈 상태 */}
        {!loading && !error && missions.length === 0 && (
          <div style={emptyStyle} role="status" aria-live="polite">
            <div style={emptyTextStyle}>
              {category ? `${getCategoryDisplayName(category)} 완료한 미션이 없습니다` : '완료한 미션이 없습니다'}
            </div>
            <div style={emptySubTextStyle}>
              {category ? `${getCategoryDisplayName(category)} 미션을 완료하면 여기에 표시됩니다` : '미션을 완료하면 여기에 표시됩니다'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompletedMissionsPage; 