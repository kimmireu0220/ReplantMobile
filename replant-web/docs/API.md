# Replant API 참조 문서

Replant 프로젝트의 서비스 레이어 API와 사용법을 설명합니다.

## 📋 개요

Replant는 다음과 같은 서비스 레이어로 구성되어 있습니다:

- **missionService**: 미션 관리 API
- **characterService**: 캐릭터 관리 API  
- **diaryService**: 감정 일기 API
- **counselService**: 상담 서비스 API
- **categoryService**: 카테고리 관리 API
- **emotionService**: 감정 데이터 API
- **gameService**: 게임 결과 및 점수 관리 API
- **userService**: 사용자 정보 관리 API
- **storageService**: 파일 업로드 API
- **stretchingService**: 스트레칭 비디오 관리 API
- **videoService**: 영상 파일 업로드 API
- **quizService**: 퀴즈 점수 계산 API
- **hybridServices**: 오프라인 우선 PWA 서비스 (하이브리드 데이터 처리)

## 🎯 MissionService

미션 완료 상태 및 진행률 관리를 담당합니다.

### `getUserMissions()`
사용자의 모든 미션 데이터를 조회합니다.

```javascript
const missions = await missionService.getUserMissions();
```

**반환값**: `Promise<Array<Mission>>`
- `id`: 미션 고유 ID (UUID)
- `mission_id`: 미션 템플릿 ID (문자열)
- `title`: 미션 제목
- `category`: 미션 카테고리 (`exercise`, `cleaning`, `reading`, `selfcare`, `social`, `creativity`)
- `difficulty`: 난이도 (`easy`, `medium`, `hard`)
- `experience`: 완료 시 획득 경험치 (35-500)
 - `experience`: 완료 시 획득 경험치
- `completed`: 완료 여부 (boolean)
- `completed_at`: 완료 시각 (ISO 문자열)
- `photo_url`: 첨부 사진 URL (선택사항)
 - `video_url`: 첨부 영상 URL (선택사항)

**에러 처리**:
- 사용자 ID 없음: `'사용자 ID를 가져올 수 없습니다.'`
- 네트워크 오류: Supabase 에러 객체 반환

### `completeMission(missionId)`
미션을 완료 상태로 변경합니다.

```javascript
const completedMission = await missionService.completeMission('exercise_1');
```

**매개변수**:
- `missionId` (string): 완료할 미션의 ID

**반환값**: `Promise<Mission>` - 업데이트된 미션 객체

### `completeMissionWithPhoto(missionId, photoUrl)`  
사진과 함께 미션을 완료합니다.

```javascript
const mission = await missionService.completeMissionWithPhoto('exercise_1', 'https://...jpg');
```

**매개변수**:
- `missionId` (string): 미션 ID
- `photoUrl` (string): 업로드된 사진 URL

비디오 인증 타입의 경우 영상도 동일 경로로 업로드되며, 서버에서는 `photo_url`과 함께 `video_url`도 저장하여 카드 프리뷰가 안정적으로 표시되도록 합니다.

### `uncompleteMission(missionId)`
미션 완료를 취소합니다.

```javascript
await missionService.uncompleteMission('exercise_1');
```

### `getCompletedMissions(userId, options)`
완료된 미션 목록을 조회합니다.

```javascript
const { data, error } = await missionService.getCompletedMissions(userId, {
  category: 'exercise' // 선택사항
});
```

**매개변수**:
- `userId` (UUID): 사용자 ID (선택사항, 현재 사용자 기본값)
- `options.category` (string): 카테고리 필터 (선택사항)

### `getMissionStats(userId)`
완료된 미션 수와 누적 경험치를 조회합니다.

```javascript
const { completedCount, totalExperience } = await missionService.getMissionStats();
```

### `initializeUserMissions(userId)`
미션 템플릿을 기반으로 사용자 미션을 초기화합니다. 사용자 최초 진입 시 자동 호출됩니다.

### `reinitializeUserMissions(userId)`
미션 수가 비정상(예: 30개 미만)일 때 사용자 미션을 재생성합니다.

### `deleteUserMissions(userId)`
사용자의 모든 미션을 삭제합니다(관리/복구용).

## 🌱 CharacterService

캐릭터 진행 상태 및 레벨 관리를 담당합니다.

### `getUserCharacters()`
사용자의 모든 캐릭터를 조회합니다.

```javascript
const characters = await characterService.getUserCharacters();
```

**반환값**: `Promise<Array<Character>>`
- `id`: 캐릭터 고유 ID (UUID)
- `category_id`: 연결된 카테고리 ID
- `name`: 캐릭터 이름 (커스터마이징 가능)
- `level`: 현재 레벨 (1-6)
- `experience`: 현재 경험치
- `max_experience`: 다음 레벨까지 필요한 경험치
- `total_experience`: 누적 총 경험치
- `unlocked`: 해제 여부 (boolean)
- `stats`: 통계 정보 (JSON 객체)

### `addExperienceToCharacter(categoryId, experiencePoints)`
캐릭터에 경험치를 추가하고 레벨업을 처리합니다.

```javascript
const result = await characterService.addExperienceToCharacter('exercise', 50);
```

**매개변수**:
- `categoryId` (string): 대상 캐릭터의 카테고리 ID
- `experiencePoints` (number): 추가할 경험치

**반환값**: `Promise<Object>`
- `success` (boolean): 성공 여부
- `character` (Object): 업데이트된 캐릭터 정보  
- `levelUp` (boolean): 레벨업 발생 여부
- `unlocked` (boolean): 새로 해제된 캐릭터 여부
- `newName` (string): 레벨업 시 새 캐릭터 이름

### `setMainCharacter(categoryId)`
대표 캐릭터를 설정합니다.

```javascript
await characterService.setMainCharacter('exercise');
```

**제약사항**: 해제된 캐릭터만 대표 캐릭터로 설정 가능

### `getMainCharacter()`
현재 설정된 대표 캐릭터를 조회합니다.

```javascript
const mainCharacter = await characterService.getMainCharacter();
```
 
반환값: `Promise<Character | null>`

### `updateCharacterName(categoryId, newName)`
캐릭터 이름을 변경합니다.

```javascript
await characterService.updateCharacterName('exercise', '새로운 이름');
```

**제약사항**:
- 이름 길이: 1-20자
- 빈 이름 불허용

## 📝 DiaryService

감정 일기 관리를 담당합니다.

### `getUserDiaries()`
사용자의 일기 목록을 최신순으로 조회합니다.

```javascript
const diaries = await diaryService.getUserDiaries();
```

### `getDiaryByDate(date)`
특정 날짜의 일기를 조회합니다. 없으면 `null` 반환.

### `saveDiary(date, emotionId, content)`
새로운 일기를 생성합니다.

```javascript
const diary = await diaryService.saveDiary('2024-01-15', 'happy', '오늘은 정말 좋은 하루였어요!');
```

### `updateDiary(diaryId, date, emotionId, content)`
기존 일기를 수정합니다.

### `deleteDiary(diaryId)`
일기를 삭제합니다.

### `getEmotionStats()`
사용자의 감정별 일기 개수를 집계합니다. `{ [emotionId]: count }` 형태로 반환합니다.

### `getRecentDiaries(limit)`
최근 작성한 일기 목록을 조회합니다(기본 7개).

### `getMonthlyDiaryCount(year, month)`
특정 월의 일기 개수를 반환합니다.

 

## 💬 CounselService

상담 채팅 관리를 담당합니다.

### `saveMessage(sessionId, message, isUser)`
상담 메시지를 생성합니다.

```javascript
await counselService.saveMessage('session_123', '안녕하세요', true);
```

**매개변수**:
- `sessionId` (string): 상담 세션 ID
- `message` (string): 메시지 내용
- `isUser` (boolean): 사용자 메시지 여부

### `getSessionMessages(sessionId)`
특정 세션의 상담 메시지를 조회합니다.

```javascript
const messages = await counselService.getSessionMessages('session_123');
```

### `getUserSessions()`
사용자의 세션 목록과 최근 시간/메시지 수를 요약해 반환합니다.

### `deleteSession(sessionId)`
지정 세션의 모든 메시지를 삭제합니다.

### `getCounselStats()`
세션 수/메시지 수/사용자 대 시스템 메시지 수 등을 통계로 반환합니다.

### `getRecentMessages(limit)`
최근 메시지를 최신순으로 반환합니다(기본 10개).

## 🗂️ CategoryService

카테고리 정보 관리를 담당합니다.

### `getCategories()`
모든 카테고리 정보를 조회합니다.

```javascript
const categories = await categoryService.getCategories();
```

**반환값**: `Promise<Array<Category>>`
- `id`: 카테고리 ID
- `name`: 카테고리 이름
- `emoji`: 대표 이모지
- `color`: 테마 색상
- `description`: 카테고리 설명

## 😊 EmotionService

감정 데이터 관리를 담당합니다.

### `getEmotions()`
모든 감정 데이터를 조회합니다.

```javascript
const emotions = await emotionService.getEmotions();
```

**반환값**: `Promise<Array<Emotion>>`
- `id`: 감정 ID
- `emoji`: 감정 이모지
- `label`: 감정 라벨
- `color`: 테마 색상

## 🎮 GameService

게임 결과 저장 및 점수 관리를 담당합니다.

### `saveGameResult(gameType, gameData)`
게임 결과를 데이터베이스에 저장합니다.

```javascript
const result = await gameService.saveGameResult('obstacle', {
  score: 1500,
  distance: 2500,
  durationMs: 45000,
  characterId: 'character-uuid'
});
```

**매개변수**:
- `gameType` (string): 게임 타입 (`obstacle`, `puzzle`, `memory`, `quiz`)
- `gameData` (Object): 게임 결과 데이터
  - `score` (number): 최종 점수
  - `distance` (number, 선택사항): 총 이동거리 (기본값: 0)
  - `durationMs` (number, 선택사항): 게임 플레이 시간(밀리초) (기본값: 0)
  - `characterId` (string, 선택사항): 사용한 캐릭터 ID

**반환값**: `Promise<{success: boolean, error?: any}>`

### `getHighScore(gameType)`
특정 게임의 최고 점수를 조회합니다.

```javascript
const highScore = await gameService.getHighScore('obstacle');
console.log(`장애물 게임 최고점수: ${highScore}`);
```

**매개변수**:
- `gameType` (string): 게임 타입

**반환값**: `Promise<number>` - 최고 점수 (기록이 없으면 0)

### `getAllHighScores()`
모든 게임의 최고 점수를 조회합니다.

```javascript
const allHighScores = await gameService.getAllHighScores();
// 결과: { obstacle: 1500, puzzle: 2000, memory: 1200, quiz: 1800 }
```

**반환값**: `Promise<Object>` - 게임별 최고 점수 객체
- `obstacle` (number): 장애물 게임 최고점수
- `puzzle` (number): 퍼즐 게임 최고점수  
- `memory` (number): 메모리 게임 최고점수
- `quiz` (number): 퀴즈 게임 최고점수

### `isNewHighScore(gameType, score)`
새로운 최고 기록인지 확인합니다.

```javascript
const isNewRecord = await gameService.isNewHighScore('obstacle', 1600);
if (isNewRecord) {
  console.log('새로운 최고 기록입니다!');
}
```

**매개변수**:
- `gameType` (string): 게임 타입
- `score` (number): 확인할 점수

**반환값**: `Promise<boolean>` - 새 기록 여부

### `saveAndCheckRecord(gameType, gameData)`
게임 결과 저장과 새 기록 확인을 동시에 처리합니다.

```javascript
const result = await gameService.saveAndCheckRecord('puzzle', {
  score: 2500,
  durationMs: 120000
});

if (result.success && result.isNewHigh) {
  showToast('새로운 최고 기록 달성!');
}
```

**매개변수**:
- `gameType` (string): 게임 타입
- `gameData` (Object): 게임 결과 데이터 (`saveGameResult`와 동일)

**반환값**: `Promise<Object>`
- `success` (boolean): 저장 성공 여부
- `isNewHigh` (boolean): 새 기록 달성 여부
- `error` (any, 선택사항): 오류 정보

**지원 게임 타입**:
- `obstacle`: 장애물 게임 - 캐릭터가 장애물을 피하며 진행하는 게임
- `puzzle`: 퍼즐 게임 - 조각을 맞추는 퍼즐 게임
- `memory`: 메모리 게임 - 카드 기억 게임
- `quiz`: 퀴즈 게임 - 지식 문답 게임

## 👤 UserService

사용자 정보 관리를 담당합니다.

### `updateUserNickname(newNickname)`
현재 사용자의 닉네임을 변경합니다.

```javascript
const result = await userService.updateUserNickname('새로운닉네임');
if (result.success) {
  console.log('닉네임이 변경되었습니다:', result.data.newNickname);
}
```

**매개변수**:
- `newNickname` (string): 새로운 닉네임

**반환값**: `Promise<{success: boolean, data?: Object, error?: string}>`
- `success` (boolean): 성공 여부
- `data` (Object, 성공시): 변경 결과
  - `oldNickname` (string): 이전 닉네임
  - `newNickname` (string): 새로운 닉네임
  - `userId` (string): 사용자 ID
- `error` (string, 실패시): 에러 메시지

**에러 처리**:
- 유효하지 않은 닉네임: `'닉네임은 2-20자의 한글, 영문, 숫자만 가능합니다.'`
- 현재 닉네임과 동일: `'현재 닉네임과 동일합니다.'`
- 중복된 닉네임: `'이미 사용 중인 닉네임입니다.'`

### `getCurrentUser()`
현재 사용자 정보를 조회합니다.

```javascript
const result = await userService.getCurrentUser();
if (result.success) {
  console.log('사용자 정보:', result.data);
}
```

**반환값**: `Promise<{success: boolean, data?: User, error?: string}>`
- `data` (Object, 성공시): 사용자 정보
  - `id` (UUID): 사용자 고유 ID
  - `device_id` (string): 기기 고유 식별자
  - `nickname` (string): 닉네임
  - `nickname_created_at` (string): 닉네임 생성 시각
  - `settings` (Object): 사용자 설정
  - `created_at` (string): 계정 생성 시각
  - `updated_at` (string): 마지막 업데이트 시각
  - `last_active_at` (string): 마지막 활동 시각

### `updateUserSettings(settings)`
사용자 설정을 업데이트합니다.

```javascript
const result = await userService.updateUserSettings({
  mainCharacter: 'exercise',
  notifications: true,
  theme: 'light'
});
```

**매개변수**:
- `settings` (Object): 업데이트할 설정 객체

**반환값**: `Promise<{success: boolean, data?: User, error?: string}>`

**일반적인 설정 항목**:
- `mainCharacter` (string): 대표 캐릭터 카테고리 ID
- `notifications` (boolean): 알림 설정
- `theme` (string): 테마 설정
- 기타 사용자 정의 설정

### `updateLastActiveTime()`
사용자의 마지막 활동 시간을 업데이트합니다.

```javascript
await userService.updateLastActiveTime();
```

**반환값**: `Promise<{success: boolean, data?: User, error?: string}>`

**특징**:
- 로그인하지 않은 경우에도 성공으로 처리
- 자동으로 현재 시각으로 업데이트
- 사용자 활동 추적에 활용

## 📁 사진 업로드 흐름

파일 업로드는 별도 서비스 함수 대신 UI 컴포넌트인 `features/PhotoSubmitButton`에서 처리합니다.

### 동작 요약
1) Supabase Storage 버킷 `mission-photos`에 이미지 업로드
2) 공개 URL 생성
3) `missionService.completeMissionWithPhoto(missionId, publicUrl)` 호출로 미션 완료 처리

샘플 사용은 `PhotoSubmitButton` 컴포넌트와 `ComponentsPage` 데모를 참고하세요.

## 🔄 공통 패턴

### 에러 처리
모든 서비스는 일관된 에러 처리 패턴을 따릅니다:

```javascript
try {
  const result = await service.method();
  // 성공 처리
} catch (error) {
  console.error('작업 실패:', error.message);
  // 에러 처리
}
```

### 사용자 인증 확인
모든 서비스 메서드는 내부적으로 사용자 인증을 확인합니다:

```javascript
// 내부적으로 실행되는 패턴
await ensureNicknameSession();
const userId = await getCurrentUserId();
if (!userId) {
  throw new Error('사용자 ID를 가져올 수 없습니다.');
}
```

### 낙관적 업데이트
UI 반응성을 위해 낙관적 업데이트 패턴을 사용합니다:

```javascript
// 1. UI 먼저 업데이트
setMissions(optimisticUpdate);

try {
  // 2. 서버 동기화
  const result = await missionService.completeMission(missionId);
  setMissions(result);
} catch (error) {
  // 3. 실패 시 롤백
  setMissions(previousState);
  showError(error.message);
}
```

## 🎯 사용 예시

### 미션 완료 및 캐릭터 경험치 추가
```javascript
import { missionService, characterService } from '../services';

const handleMissionComplete = async (mission) => {
  try {
    // 1. 미션 완료 처리
    await missionService.completeMission(mission.mission_id);
    
    // 2. 캐릭터 경험치 추가
    const result = await characterService.addExperienceToCharacter(
      mission.category, 
      mission.experience
    );
    
    // 3. 레벨업 알림 처리
    if (result.levelUp) {
      showToast(`레벨업! ${result.newName}이 되었습니다!`);
    }
    
    // 4. 캐릭터 해제 알림 처리
    if (result.unlocked) {
      showToast('새로운 캐릭터가 해제되었습니다!');
    }
    
  } catch (error) {
    showError('미션 완료에 실패했습니다: ' + error.message);
  }
};
```

### 일기 작성 및 감정 추적
```javascript
import { diaryService, emotionService } from '../services';

const handleDiarySubmit = async (formData) => {
  try {
    // 1. 감정 데이터 검증
    const emotions = await emotionService.getEmotions();
    const selectedEmotion = emotions.find(e => e.id === formData.emotion_id);
    
    if (!selectedEmotion) {
      throw new Error('유효하지 않은 감정입니다.');
    }
    
    // 2. 일기 생성
    const diary = await diaryService.saveDiary(
      formData.date,
      formData.emotion_id,
      formData.content
    );
    
    showToast('일기가 저장되었습니다!');
    return diary;
    
  } catch (error) {
    showError('일기 저장에 실패했습니다: ' + error.message);
  }
};
```

## ⚡ 성능 최적화

### 배치 처리
대량 데이터 처리 시 배치 처리를 사용합니다:

```javascript
// missionService.initializeUserMissions()에서 사용되는 패턴
const batchSize = 10;
for (let i = 0; i < data.length; i += batchSize) {
  const batch = data.slice(i, i + batchSize);
  await processBatch(batch);
}
```

### 재시도 로직
네트워크 오류 시 자동 재시도를 지원합니다:

```javascript
const maxRetries = 3;
let retryCount = 0;

while (!success && retryCount < maxRetries) {
  try {
    const result = await operation();
    success = true;
  } catch (error) {
    retryCount++;
    if (retryCount === maxRetries) throw error;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}
```

## 🔐 보안 가이드

### 사용자 데이터 접근
모든 API는 사용자별 데이터 격리를 보장합니다:

```javascript
// 내부적으로 사용자 ID 검증
const userId = await getCurrentUserId();
if (!userId) {
  throw new Error('인증되지 않은 사용자입니다.');
}
```

### 데이터 검증
입력 데이터는 서버와 클라이언트 양쪽에서 검증됩니다:

```javascript
// 닉네임 검증 예시
const { isValid, message } = validateNickname(nickname);
if (!isValid) {
  throw new Error(message);
}
```

## 🎨 React Hook 통합

### useMission Hook
```javascript
import { useMission } from '../hooks/useMission';

const MyComponent = () => {
  const {
    missions,
    isLoading,
    error,
    completeMission,
    uncompleteMission,
    loadMissions
  } = useMission(addExperienceByCategory);
  
  // 컴포넌트 로직...
};
```

**Hook 반환값**:
- `missions` (Array): 미션 목록
- `isLoading` (boolean): 로딩 상태
- `error` (string): 에러 메시지
- `completeMission` (function): 미션 완료 함수
- `uncompleteMission` (function): 미션 완료 취소 함수
- `loadMissions` (function): 미션 데이터 새로고침

### useCharacter Hook
```javascript
import { useCharacter } from '../hooks/useCharacter';

const {
  characters,
  mainCharacter,
  isLoading,
  setMainCharacter,
  updateCharacterName
} = useCharacter();
```

 

 

 

## 🧘 StretchingService

스트레칭 비디오 관리 및 완료 처리를 담당합니다.

### `getStretchingVideoUrl(fileName)`
스트레칭 영상 공개 URL을 생성합니다.

```javascript
const videoUrl = stretchingService.getStretchingVideoUrl('stretching_video.mp4');
```

**매개변수**:
- `fileName` (string): 파일명

**반환값**: `string` - 공개 URL

### `getStretchingVideoByMissionId(missionId)`
미션 ID로 스트레칭 영상 정보를 조회합니다.

```javascript
const videoInfo = stretchingService.getStretchingVideoByMissionId('stretching_1');
```

**매개변수**:
- `missionId` (string): 미션 ID

**반환값**: `Object | null`
- `title`: 영상 제목
- `description`: 영상 설명
- `duration`: 영상 길이 (초)
- `videoUrl`: 공개 URL
- `videoFileName`: 파일명

### `completeStretchingMission(missionId, completedDuration)`
스트레칭 미션을 완료 처리합니다.

```javascript
const result = await stretchingService.completeStretchingMission('stretching_1', 300);
```

**매개변수**:
- `missionId` (string): 미션 ID
- `completedDuration` (number): 완료된 시간 (초)

**반환값**: `Promise<Object>`
- `success` (boolean): 성공 여부
- `data` (Object): 업데이트된 미션 데이터
- `completedDuration` (number): 완료된 시간
- `videoInfo` (Object): 영상 정보
- `completedAt` (string): 완료 시각

## 📹 VideoService

영상 파일 업로드 및 관리를 담당합니다.

### `uploadVideo(file, missionId)`
영상 파일을 Supabase Storage에 업로드합니다.

```javascript
const result = await videoService.uploadVideo(videoFile, 'exercise_1');
```

**매개변수**:
- `file` (File): 업로드할 영상 파일
- `missionId` (string): 미션 ID

**반환값**: `Promise<Object>`
- `success` (boolean): 성공 여부
- `url` (string): 업로드된 파일의 공개 URL
- `fileName` (string): 저장된 파일명
- `fileSize` (number): 파일 크기
- `fileType` (string): 파일 MIME 타입

### `deleteVideo(fileName)`
영상 파일을 삭제합니다.

```javascript
await videoService.deleteVideo('exercise_1_20240101_123456.mp4');
```

**매개변수**:
- `fileName` (string): 삭제할 파일명

**반환값**: `Promise<Object>`
- `success` (boolean): 성공 여부

### `getVideoUrl(fileName)`
영상 파일의 공개 URL을 반환합니다.

```javascript
const url = videoService.getVideoUrl('exercise_1_20240101_123456.mp4');
```

**매개변수**:
- `fileName` (string): 파일명

**반환값**: `string` - 공개 URL

## 🧠 QuizService

퀴즈 점수 계산 및 완료 처리를 담당합니다.

### `calculateScore(answers, questions)`
퀴즈 답변을 채점하고 점수를 계산합니다.

```javascript
const result = quizService.calculateScore(
  ['A', 'B', 'C'], 
  [
    { id: 1, correctAnswer: 'A', explanation: '설명...' },
    { id: 2, correctAnswer: 'B', explanation: '설명...' },
    { id: 3, correctAnswer: 'C', explanation: '설명...' }
  ]
);
```

**매개변수**:
- `answers` (Array): 사용자 답변 배열
- `questions` (Array): 퀴즈 문제 배열

**반환값**: `Object`
- `score` (number): 점수 (0-100)
- `correctCount` (number): 정답 개수
- `totalQuestions` (number): 총 문제 수
- `isPassed` (boolean): 통과 여부 (80점 이상)
- `results` (Array): 문제별 채점 결과

### `completeQuiz(missionId)`
퀴즈 미션을 완료 처리합니다.

```javascript
const result = await quizService.completeQuiz('quiz_1');
```

**매개변수**:
- `missionId` (string): 미션 ID

**반환값**: `Promise<Object>`
- `success` (boolean): 성공 여부
- `data` (Object): 업데이트된 미션 데이터

## 📱 Hybrid Services (PWA)

오프라인 우선 데이터 처리를 위한 하이브리드 서비스들입니다.

### HybridDiaryService
감정 일기의 오프라인/온라인 동기화를 처리합니다.

```javascript
import { hybridDiaryService } from '../services';

// 오프라인 우선 일기 저장
const diary = await hybridDiaryService.saveDiary(date, emotionId, content);

// 동기화 상태 확인
const syncStatus = await hybridDiaryService.getSyncStatus();
```

**주요 메서드**:
- `saveDiary()`: 오프라인 우선 일기 저장
- `deleteDiary()`: 오프라인 우선 일기 삭제
- `syncWithServer()`: 서버와 강제 동기화
- `getSyncStatus()`: 동기화 상태 조회

### HybridCharacterService
캐릭터 데이터의 오프라인/온라인 동기화를 처리합니다.

```javascript
import { hybridCharacterService } from '../services';

// 오프라인 우선 경험치 추가
const result = await hybridCharacterService.addExperienceToCharacter(categoryId, experience);

// 동기화 상태 확인
const syncStatus = await hybridCharacterService.getSyncStatus();
```

### HybridMissionService
미션 완료 상태의 오프라인/온라인 동기화를 처리합니다.

```javascript
import { hybridMissionService } from '../services';

// 오프라인 우선 미션 완료
const mission = await hybridMissionService.completeMission(missionId);
```

**특징**:
- 오프라인 우선 (Offline First) 아키텍처
- 네트워크 연결 시 자동 동기화
- 충돌 해결 메커니즘 내장
- 배경 동기화 지원

## 🎣 React Hook 통합

### useToast Hook
토스트 알림을 관리하는 훅입니다.

```javascript
import { useToast } from '../hooks/useToast';

const MyComponent = () => {
  const { 
    showToast, 
    showSuccess, 
    showError, 
    showWarning, 
    showInfo,
    clearAll,
    toasts 
  } = useToast();
  
  const handleSuccess = () => {
    showSuccess('작업이 완료되었습니다!', 3000);
  };
  
  const handleError = () => {
    showError('오류가 발생했습니다.');
  };
  
  return (
    <div>
      <button onClick={handleSuccess}>성공 메시지</button>
      <button onClick={handleError}>에러 메시지</button>
    </div>
  );
};
```

**Hook 반환값**:
- `showToast(message, type, duration, onClick)`: 일반 토스트 표시
- `showSuccess(message, duration, onClick)`: 성공 토스트 표시
- `showError(message, duration)`: 에러 토스트 표시
- `showWarning(message, duration)`: 경고 토스트 표시
- `showInfo(message, duration)`: 정보 토스트 표시
- `clearAll()`: 모든 토스트 제거
- `toasts`: 현재 표시 중인 토스트 배열

### useNotification Hook
알림 관리를 위한 훅입니다.

```javascript
import { useNotification } from '../hooks/useNotification';

const { 
  notifications, 
  addNotification, 
  removeNotification, 
  clearAll 
} = useNotification();
```

### useKeyboardNavigation Hook
키보드 접근성 탐색을 지원하는 훅입니다.

```javascript
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';

const { 
  currentFocusIndex, 
  handleKeyDown, 
  focusableElements 
} = useKeyboardNavigation(containerRef);
```

**특징**:
- 방향키를 통한 포커스 이동
- Tab/Shift+Tab 지원
- 접근성 표준 준수
- 커스텀 포커스 순서 지원

### useSwipeGesture Hook
터치 제스처 감지를 위한 훅입니다.

```javascript
import { useSwipeGesture } from '../hooks/useSwipeGesture';

const { 
  onTouchStart, 
  onTouchMove, 
  onTouchEnd 
} = useSwipeGesture({
  onSwipeLeft: () => console.log('왼쪽 스와이프'),
  onSwipeRight: () => console.log('오른쪽 스와이프'),
  threshold: 50
});
```

### useTouchFeedback Hook
터치 피드백 효과를 제공하는 훅입니다.

```javascript
import { useTouchFeedback } from '../hooks/useTouchFeedback';

const { isPressed, touchProps } = useTouchFeedback();
```

### useMemoryGame Hook
메모리 게임 로직을 관리하는 훅입니다.

```javascript
import { useMemoryGame } from '../hooks/useMemoryGame';

const {
  cards,
  flippedCards,
  matchedCards,
  score,
  gameStatus,
  flipCard,
  resetGame
} = useMemoryGame(cardCount);
```

### useQuiz Hook
퀴즈 게임 상태를 관리하는 훅입니다.

```javascript
import { useQuiz } from '../hooks/useQuiz';

const {
  currentQuestion,
  answers,
  score,
  isComplete,
  selectAnswer,
  nextQuestion,
  resetQuiz
} = useQuiz(questions);
```

### useVideo Hook
비디오 재생 제어를 위한 훅입니다.

```javascript
import { useVideo } from '../hooks/useVideo';

const {
  isPlaying,
  currentTime,
  duration,
  play,
  pause,
  seekTo,
  videoRef
} = useVideo();
```

### useStretching Hook
스트레칭 세션 관리를 위한 훅입니다.

```javascript
import { useStretching } from '../hooks/useStretching';

const {
  isActive,
  remainingTime,
  progress,
  startSession,
  pauseSession,
  completeSession
} = useStretching(duration);
```

## 📚 관련 문서

- [데이터베이스 스키마](DATABASE.md)
- [설정 가이드](README.md)
- [컴포넌트 가이드](src/components/README.md)
- [PWA 기술 문서](pwa/TECHNICAL.md)
 