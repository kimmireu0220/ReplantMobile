# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
- 추가 예정: Push 알림 시스템
- 추가 예정: 상담 서비스 실연동
- 추가 예정: 캐릭터 성장 연출 확장

## [0.1.0] - 2024-01-15

### Added
- **핵심 기능**
  - 감정 일기 시스템 (8가지 감정, CRUD 기능)
  - 미션 시스템 (6개 카테고리, 60개 미션)
  - 캐릭터 도감 시스템 (레벨업, 대표 캐릭터 설정)
  - 미니게임 (장애물 달리기, 퍼즐, 기억력, 퀴즈)
  - 상담 서비스 (세션별 메시지 관리)

- **PWA 기능**
  - 오프라인 우선 아키텍처
  - 서비스 워커 기반 캐싱
  - 하이브리드 데이터 동기화
  - 앱 설치 지원

- **기술적 특징**
  - React 18 기반 SPA
  - Supabase 백엔드 (PostgreSQL, 실시간 동기화)
  - 헤더 기반 닉네임 인증
  - RLS(Row Level Security) 적용

- **UI/UX**
  - 반응형 디자인 (모바일 우선)
  - 라이트/다크 모드 지원
  - 접근성 준수 (WCAG 2.1 AA)
  - 터치 친화적 인터페이스

- **미션 인증 시스템**
  - 사진 인증 (청소 카테고리 등)
  - 영상 인증 (운동 카테고리 등)
  - 퀴즈 인증 (독서 카테고리)
  - 타이머 인증 (자기관리 카테고리)
  - 일기 인증 (창작 카테고리)
  - 스크린샷 인증 (사회활동 카테고리)
  - 스트레칭 인증 (운동 카테고리)

### Technical Details
- **Frontend**: React 18, React Router 6
- **Backend**: Supabase (PostgreSQL, Auth, Storage, RLS)
- **Build**: CRACO, React Scripts
- **Deployment**: GitHub Pages
- **Testing**: Jest, React Testing Library
- **PWA**: Workbox, IndexedDB

### Database Schema
- 사용자 데이터: `users`, `characters`, `missions`, `diaries`
- 상담 데이터: `counsel_messages`
- 게임 데이터: `game_results`
- 참조 데이터: `categories`, `emotions`, `mission_templates`, `character_templates`

### Security
- RLS(Row Level Security) 모든 테이블 적용
- 헤더 기반 닉네임 인증 (`x-nickname-b64`)
- Base64 인코딩으로 한글 닉네임 안전 처리
- 데이터 격리 및 공용 데이터 분리

[Unreleased]: https://github.com/kimmireu0220/Replant/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/kimmireu0220/Replant/releases/tag/v0.1.0