# 🌱 Replant Mobile App

감정 회복을 위한 모바일 앱입니다. 매일의 감정을 기록하고, 미션을 완료하며, 캐릭터와 함께 성장해보세요.

## ✨ 주요 기능

### 🎯 미션 시스템
- **카테고리별 미션**: 운동, 청소, 독서, 자기돌봄, 사회활동, 창의활동
- **사진 인증**: 카메라 또는 갤러리에서 사진을 선택하여 미션 완료 인증
- **진행률 추적**: 전체 미션 진행률을 시각적으로 확인
- **경험치 획득**: 미션 완료 시 캐릭터에게 경험치 제공

### 📝 다이어리 시스템
- **감정 기록**: 8가지 감정 중 선택하여 오늘의 기분 기록
- **자유 작성**: 오늘의 이야기를 자유롭게 작성
- **일기 관리**: 작성, 수정, 삭제 기능
- **감정 추적**: 시간에 따른 감정 변화 추적

### 🌱 캐릭터 시스템
- **성장 시스템**: 미션 완료로 경험치 획득하여 레벨업
- **다양한 캐릭터**: 여러 캐릭터 중 선택 가능
- **시각적 피드백**: 레벨에 따른 캐릭터 변화 (🌰 → 🌱 → 🌿 → 🌳)

### 🎨 테마 시스템
- **다크/라이트 모드**: 사용자 선호에 따른 테마 변경
- **일관된 디자인**: 디자인 토큰 기반의 일관된 UI/UX

## 🚀 기술 스택

### Frontend
- **React Native**: 크로스 플랫폼 모바일 앱 개발
- **React Navigation**: 네비게이션 관리
- **Context API**: 전역 상태 관리
- **AsyncStorage**: 로컬 데이터 저장

### Backend
- **AsyncStorage**: 로컬 데이터 저장

### 개발 도구
- **TypeScript**: 타입 안전성
- **ESLint**: 코드 품질 관리
- **Prettier**: 코드 포맷팅
- **Jest**: 테스트 프레임워크

## 📱 설치 및 실행

### 사전 요구사항
- Node.js (v18 이상)
- React Native CLI
- Xcode (iOS 개발용)
- Android Studio (Android 개발용)

### 설치
```bash
# 의존성 설치
npm install

# iOS 의존성 설치
cd ios && pod install && cd ..
```

### 실행
```bash
# iOS 시뮬레이터에서 실행
npx react-native run-ios

# Android 에뮬레이터에서 실행
npx react-native run-android
```

## 🔧 환경 설정

### 로컬 데이터 설정
1. AsyncStorage를 사용한 로컬 데이터 저장
2. 사용자별 데이터 격리

### iOS 권한 설정
`ios/ReplantMobileApp/Info.plist`에 다음 권한이 설정되어 있습니다:
- `NSCameraUsageDescription`: 카메라 사용 권한
- `NSPhotoLibraryUsageDescription`: 갤러리 접근 권한

## 📁 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── ui/             # 기본 UI 컴포넌트
│   └── specialized/    # 특화된 비즈니스 컴포넌트
├── contexts/           # React Context (상태 관리)
├── hooks/              # 커스텀 훅
├── navigation/         # 네비게이션 설정
├── screens/            # 화면 컴포넌트
├── services/           # 외부 서비스 연동
└── utils/              # 유틸리티 함수 및 상수
```

## 🎯 핵심 기능 상세

### 인증 시스템
- **닉네임 기반**: 이메일 없이 닉네임으로 간편 가입
- **중복 검사**: 닉네임 중복 확인
- **디바이스 ID**: 디바이스 기반 사용자 식별

### 데이터 동기화
- **로컬 데이터**: AsyncStorage를 통한 로컬 데이터 저장
- **오프라인 지원**: AsyncStorage를 통한 오프라인 데이터 저장
- **자동 백업**: 클라우드 자동 백업

## 🚀 배포

### iOS App Store
1. Xcode에서 프로젝트 열기
2. Archive 생성
3. App Store Connect에 업로드
4. 심사 제출

### Google Play Store
1. Android Studio에서 APK/AAB 생성
2. Google Play Console에 업로드
3. 심사 제출

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 지원

문제가 있거나 질문이 있으시면 이슈를 생성해 주세요.

---

**Replant** - 감정 회복을 위한 여정에 함께하세요! 🌱