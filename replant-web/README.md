# 🌱 Replant - 감정 회복 PWA

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

사회적 고립자를 위한 감정 회복과 사회적 상호작용을 돕는 Progressive Web App입니다. 이 문서는 현재 구현된 기능과 사용 방법에 집중합니다.

## ✨ 주요 기능 (요약)
- 🏠 홈: 대표 캐릭터 표시, 추천 미션, 경험치 진행도
- 📝 감정 일기: 8가지 감정 선택, 일기 작성/조회, 감정별 통계
- 📋 미션 시스템: 6개 카테고리, 60개 미션(템플릿 기반), 완료/취소, 경험치 반영
- 🎮 미니게임: 4종류 게임 (장애물 달리기, 퍼즐, 기억력, 퀴즈)
- 📖 캐릭터 도감: 카테고리별 캐릭터, 경험치/레벨업, 대표 캐릭터 설정
- 💬 상담(모의): 세션별 메시지 저장/조회 UI
- 🔄 오프라인 우선: 핵심 기능 오프라인 동작, 동기화/충돌 해결

<!-- PWA 상세 기능 설명은 기술 문서로 이동 -->

## 🔗 데모
- **Live**: [https://kimmireu0220.github.io/Replant](https://kimmireu0220.github.io/Replant)
- **로컬 컴포넌트 데모**: [http://localhost:3000/#/components](http://localhost:3000/#/components)

## 🚀 빠른 시작
1) 의존성 설치
```bash
npm install
```
2) 환경 변수 설정 (`.env`)
```env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```
3) 개발 서버 실행
```bash
npm start
```

## 🧩 기술 스택 (요약)
- **Frontend**: React 18, React Router 6, PropTypes
- **Backend**: Supabase (PostgreSQL, Auth, Storage, RLS)
- **Build**: CRACO, React Scripts
- **PWA**: Service Worker, Manifest, 오프라인 지원
- **UI/UX**: 반응형 디자인, 접근성, 테마 시스템
- **Deployment**: GitHub Pages

## 🗂 프로젝트 구조 (요약)
```
Replant/
├── public/                 # 정적 파일, PWA 설정
├── src/
│   ├── components/         # React 컴포넌트
│   │   ├── ui/            # 기본 UI 컴포넌트
│   │   ├── features/      # 기능별 컴포넌트
│   │   └── layout/        # 레이아웃 컴포넌트
│   ├── pages/             # 페이지 컴포넌트
│   ├── services/          # 비즈니스 로직 서비스
│   ├── hooks/             # 커스텀 React 훅
│   ├── contexts/          # React Context
│   ├── config/            # 설정 파일
│   ├── design/            # 디자인 토큰
│   └── utils/             # 유틸리티 함수
├── docs/                  # 프로젝트 문서
└── scripts/               # 빌드 스크립트
```

## 📚 문서
- **시연용 가이드**: `docs/USAGE.md`
- API: `docs/API.md`
- 데이터베이스: `docs/DATABASE.md`
- 미션 템플릿 확장: 총 60개(카테고리별 10개)로 확장되었으며, 기존 사용자는 부족분만 자동 백필되어 기록이 보존됩니다. 검증 방식은 사진/영상/퀴즈/일기/타이머/스크린샷/스트레칭을 포함합니다.
- 운영 체크리스트: `docs/OPERATIONS_CHECKLIST.md`
- 기여 가이드: `docs/CONTRIBUTING.md`
- 로드맵(향후 계획): `docs/ROADMAP.md`
- PWA 기술: `docs/pwa/TECHNICAL.md`

라이선스: MIT


