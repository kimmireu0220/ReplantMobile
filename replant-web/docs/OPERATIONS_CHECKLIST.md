# 운영 점검 체크리스트 (Supabase / 스토리지)

## 1) RLS 정책 점검
- 헤더 기반 인증 적용 여부: 모든 요청이 `x-nickname-b64`, `x-device-id` 헤더를 포함하는지 확인
- 모든 사용자 데이터 테이블에 RLS 활성화 및 닉네임/디바이스 기반 정책 적용
- 사용자 소유 데이터에 한해 INSERT/UPDATE/DELETE 허용, 공용 참조 테이블은 SELECT만 허용
- 세부 정책 및 예시는 `DATABASE.md`의 RLS 섹션을 참고

## 2) RPC 함수 존재/동작 점검
- 필수 RPC 목록: 
  - `set_nickname_session`, `validate_nickname`, `check_nickname_duplicate`, `create_user_with_nickname`, `get_user_by_nickname`, `update_user_nickname_safe`, `auto_levelup_character`, `reset_character_name_to_default`
- 배포/권한/동작(성공·에러 로깅) 확인, 상세 계약은 `API.md` 참고

## 3) 스토리지 버킷 점검 (mission-photos)
- 버킷 존재: `mission-photos` 버킷 생성 여부
- 퍼블릭 정책: 업로드 후 `getPublicUrl` 사용 가능 여부
- 허용 파일 형식: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`
- 업로드 제한: 개별 파일 최대 10MB (클라이언트 검증 일치)

## 4) 인덱스/성능 점검 (권장)
- 핵심 조회 경로(미션/일기/캐릭터 목록 등)에 적절한 인덱스 존재 확인
- 페이지네이션 및 선택 컬럼 최적화 적용(불필요한 전체 컬럼 조회 최소화)

## 5) 엔드투엔드 플로우 점검 (QA)
- 닉네임 플로우: 중복 확인 → 생성 → 세션 설정 → 재로그인 시 헤더 자동 적용
- 미션 플로우: 초기화(60개) → 완료/취소 → 사진 업로드 → 경험치 반영/레벨업
- 일기 플로우: 생성/수정/삭제 → 월별 카운트/최근 목록
- 상담 플로우: 세션 생성 → 메시지 저장/조회 → 세션 삭제

---
자세한 스키마/정책 예시는 `DATABASE.md`, 서비스/호출 계약은 `API.md`를 참고하세요.
