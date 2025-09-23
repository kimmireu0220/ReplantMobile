import React from 'react';
import { tokens } from '../../design/tokens';
import MissionCard from '../features/MissionCard';

const MissionList = ({ missions, onComplete, onUncomplete, isLoading }) => {
  if (isLoading) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '24px', marginBottom: '12px' }}>🎯</div>
          <p>미션을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!missions || missions.length === 0) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
          <h3>미션이 준비되지 않았어요</h3>
          <p style={{ color: '#666', marginTop: '8px' }}>
            잠시 후 다시 확인해보세요!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacing[4]
      }}>
        {missions.map((mission, index) => (
          <MissionCard
            key={mission.mission_id || mission.id || `mission-${index}`}
            mission={mission}
            onToggle={(missionId, photoUrl, photoFileKey) => {
              const foundMission = missions.find(m => m.mission_id === missionId || m.id === missionId);
              if (foundMission && foundMission.completed) {
                onUncomplete(missionId);
              } else {
                onComplete(missionId, photoUrl, photoFileKey);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default MissionList; 