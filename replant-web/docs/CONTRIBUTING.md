# Replant 기여 가이드

프로젝트에 기여해주셔서 감사합니다. 이 문서는 기여 흐름과 최소 규칙만 간결하게 정리합니다.

## 시작 전 확인
- 프로젝트 개요와 실행: [README](../README.md)
- 서비스 API 참조: [API.md](./API.md)
- 데이터베이스 구조: [DATABASE.md](./DATABASE.md)

## 환경 설정 (필수)

### 1. 환경 변수 파일 생성
프로젝트 루트에 `.env` 파일을 생성하세요:

```bash
# 프로젝트 루트에서
touch .env
```

### 2. Supabase 프로젝트 정보 설정
`.env` 파일에 다음 내용을 추가하세요:

```env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Supabase 프로젝트 정보 확인 방법
1. [Supabase 대시보드](https://supabase.com/dashboard) 접속
2. 해당 프로젝트 선택
3. Settings → API 메뉴 클릭
4. Project URL과 anon public 키 복사

### 4. 개발 서버 재시작
환경 변수 설정 후 개발 서버를 재시작하세요:

```bash
npm start
```

**주의**: `.env` 파일은 Git에 커밋되지 않습니다. 각 개발자가 개별적으로 설정해야 합니다.

## 워크플로우
1) GitHub Issue 선택/생성 → 2) 브랜치 생성 → 3) 구현/테스트 → 4) PR 생성 → 5) 리뷰/머지

## 브랜치 규칙
- 기능: `feature/<short-name>` 예) `feature/diary-filter`
- 버그: `fix/<short-name>` 예) `fix/mission-exp-calc`
- 문서: `docs/<short-name>` 예) `docs/update-contributing`

## 커밋 컨벤션(요약)
- `feat:` 기능 추가
- `fix:` 버그 수정
- `docs:` 문서 변경
- `style:` 스타일/포맷 변경(로직 무관)
- `refactor:` 리팩토링(기능 변화 없음)

예) `feat: 감정 일기 필터링 추가`

## 테스트와 빌드
- 단위/통합 테스트 실행: `npm test`
- 빌드 확인: `npm run build`
- PR 전 테스트 통과와 빌드 성공을 확인합니다.

## PR 체크리스트(핵심)
- [ ] 기능이 의도대로 동작하며 에러 처리를 포함함
- [ ] 접근성(레이블/포커스/키보드) 고려
- [ ] 성능에 불필요한 회귀 없음
- [ ] PropTypes(또는 타입) 정의
- [ ] 테스트 통과 및 수동 확인
- [ ] 관련 문서(README/API/DATABASE) 업데이트

## 커뮤니케이션
- 이슈: 버그 리포트/기능 제안/질문
- PR: 변경사항 설명, 테스트 방법, 스크린샷(필요 시) 포함

## 행동 강령
존중/포용/건설적 피드백을 원칙으로 하며, 누구에게나 안전한 협업 환경을 지향합니다.

---

작은 기여도 환영합니다. 감사합니다! 🌱