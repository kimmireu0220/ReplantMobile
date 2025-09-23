# PWA 기술 문서 - Replant

## 📱 PWA 아키텍처 개요

### 핵심 구성 요소
- **Manifest**: 앱 메타데이터 및 설치 정보
- **Service Worker**: 캐싱, 오프라인, 배경 동기화
- **하이브리드 서비스**: 오프라인 우선 데이터 레이어
- **동기화 매니저**: 배경 동기화 및 충돌 해결

---

## 🗂️ 관련 파일

```
public/
├── manifest.json
├── sw.js
└── offline.html

src/
├── services/
│   ├── hybridCharacterService.js
│   ├── hybridDiaryService.js
│   └── hybridMissionService.js
├── utils/
│   ├── syncManager.js
│   ├── offlineDatabase.js
│   ├── networkManager.js
│   └── conflictResolver.js
└── components/ui/
    └── SyncIndicator.jsx
```

---

## 📋 PWA Manifest

자세한 설정은 `public/manifest.json`을 참고하세요. 주요 키만 유지합니다.
- `name`, `short_name`
- `start_url`, `scope`
- `display` (standalone)
- `theme_color`, `background_color`

---

## ⚙️ Service Worker

구현은 `public/sw.js`에 있습니다. 전략 요약만 기록합니다.
- 정적 리소스: Cache First
- 동적 컨텐츠: Stale-While-Revalidate
- API/실시간 데이터: Network First
- Background Sync: 오프라인 큐를 온라인 시 처리

---

## 🔄 하이브리드 데이터 서비스

오프라인 우선(Offline First)로 동작하며, 로컬 저장 → UI 반영 → 백그라운드 동기화 순으로 진행합니다.
- 일기: `src/services/hybridDiaryService.js`
- 캐릭터: `src/services/hybridCharacterService.js`
- 미션: `src/services/hybridMissionService.js`

---

## 🗄️ 오프라인 데이터베이스 (IndexedDB)

스토어와 초기화는 `src/utils/offlineDatabase.js`를 참고하세요. 사용 스토어:
- `diaries`
- `characters`
- `missions`
- `syncQueue`

---

## 🔁 동기화 매니저

세부 구현은 `src/utils/syncManager.js`에 있습니다. 동기화 유형:
- 즉시 동기화: 온라인 시 테이블 동기화
- 백그라운드 동기화: 큐 처리 및 재시도
- 수동 동기화: 전체 테이블 강제 동기화

---

## 🤝 충돌 해결

전략은 `src/utils/conflictResolver.js`를 참고하세요.
- Server Authority
- Last Write Wins
- Data Merge

---

## 🌐 네트워크 관리

`src/utils/networkManager.js`에서 온라인/오프라인 이벤트를 감지하고 복구 시 백그라운드 동기화를 트리거합니다.

---

## 🎯 동기화 상태 UI

컴포넌트는 `src/components/ui/SyncIndicator.jsx`에 있습니다. 상태 맵:
- 🟢 온라인
- 🟡 동기화 중
- 🔴 오프라인
- ⚠️ 오류

---

## 🧪 테스트 전략

권장 시나리오만 남깁니다.
- 완전 오프라인
- 불안정한 네트워크
- 느린 네트워크
- 네트워크 복구 후 자동 동기화 확인

---

## 📊 성능 최적화 체크리스트

- IndexedDB: 인덱스/트랜잭션/배치 처리
- 동기화: Delta Sync, 배치, 우선순위
- 메모리: 리스너 정리, 캐시 크기 관리

---

## 🚨 에러 처리 가이드

- 네트워크 오류: 큐에 재시도, 지수 백오프
- 서버 오류: 로깅 및 사용자 피드백
- 충돌: 전략 기반 자동/반자동 해결
- UX: 토스트/진행률/재시도 제공

---

## 📈 모니터링 및 분석

- 동기화 성공률, 평균 시간
- 오프라인 사용률, 충돌 빈도
- 복구 후 동기화 완료 시간

---

해당 문서는 구현 세부 코드 대신 핵심 개념과 실제 소스 참조만 제공합니다. 상세 로직은 각 파일을 확인하세요.