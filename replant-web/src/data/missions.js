// 미션별 인증 방법 매핑
export const missionVerificationTypes = {
  // 청소 카테고리 (사진 인증)
  'cl1': { type: 'photo', buttonText: '사진 제출하기', description: '정리된 방을 사진으로 찍어주세요' },
  'cl2': { type: 'photo', buttonText: '사진 제출하기', description: '정리된 책상을 사진으로 찍어주세요' },
  'cl3': { type: 'photo', buttonText: '사진 제출하기', description: '깨끗한 그릇들을 사진으로 찍어주세요' },
  'cl4': { type: 'photo', buttonText: '사진 제출하기', description: '정리된 옷장을 사진으로 찍어주세요' },
  'cl5': { type: 'photo', buttonText: '사진 제출하기', description: '청소된 화장실을 사진으로 찍어주세요' },
  'cl6': { type: 'photo', buttonText: '사진 제출하기', description: '분리수거 완료 사진을 제출해주세요' },
  'cl7': { type: 'photo', buttonText: '사진 제출하기', description: '침구 정리 또는 교체 후 사진을 제출해주세요' },
  'cl8': { type: 'photo', buttonText: '사진 제출하기', description: '정리된 냉장고 선반(한 칸) 사진을 제출해주세요' },
  'cl9': { type: 'photo', buttonText: '사진 제출하기', description: '베란다/현관 바닥 청소 완료 사진을 제출해주세요' },
  'cl10': { type: 'photo', buttonText: '사진 제출하기', description: '빨래를 개서 수납한 사진을 제출해주세요' },
  
  // 창작 카테고리
  'cr1': { type: 'audio', buttonText: '음악 듣기', description: '좋아하는 음악을 5분간 들어주세요. 타이머를 사용하여 진행 상황을 확인할 수 있습니다.' },
  'cr2': { type: 'photo', buttonText: '그림 제출하기', description: '그린 그림을 사진으로 찍어주세요' },
  'cr3': { type: 'diary', buttonText: '일기 작성하기', description: '오늘의 생각을 일기로 작성해주세요. 일기 작성 완료 후 미션이 완료됩니다.' },
  'cr4': { type: 'photo', buttonText: '요리 사진 제출하기', description: '만든 요리를 사진으로 찍어주세요' },
  'cr5': { type: 'photo', buttonText: '사진 제출하기', description: '찍은 사진을 제출해주세요' },
  'cr6': { type: 'timer', buttonText: '타이머 시작', description: '악기 연습 5분 타이머를 완료해주세요' },
  'cr7': { type: 'diary', buttonText: '일기 작성하기', description: '짧은 시/글귀를 일기 모달에 작성해주세요' },
  'cr8': { type: 'photo', buttonText: '사진 제출하기', description: '색칠/도안 채색 결과물을 사진으로 제출해주세요' },
  'cr9': { type: 'photo', buttonText: '사진 제출하기', description: '캘리그래피 연습 결과물을 사진으로 제출해주세요' },
  'cr10': { type: 'video', buttonText: '영상 촬영', description: '춤/퍼포먼스 1분 영상을 촬영하여 업로드해주세요' },
  
  // 운동 카테고리
  'ex1': { type: 'stretching', buttonText: '스트레칭 따라하기', description: '제공된 스트레칭 영상을 따라해주세요' },
  'ex2': { type: 'photo', buttonText: '산책 사진 제출하기', description: '산책 경로나 풍경을 사진으로 찍어주세요' },
  'ex3': { type: 'video', buttonText: '운동 영상 촬영', description: '홈 운동하는 모습을 영상으로 촬영해주세요' },
  'ex4': { type: 'timer', buttonText: '명상 타이머 시작', description: '5분간 명상을 진행해주세요' },
  'ex5': { type: 'video', buttonText: '줄넘기 영상 촬영', description: '줄넘기하는 모습을 영상으로 촬영해주세요' },
  'ex6': { type: 'timer', buttonText: '타이머 시작', description: '빠르게 걷기 5분 타이머를 완료해주세요' },
  'ex7': { type: 'timer', buttonText: '타이머 시작', description: '코어 인터벌 5분 타이머를 완료해주세요' },
  'ex8': { type: 'video', buttonText: '운동 영상 촬영', description: '스쿼트 50회 동작을 영상으로 촬영해주세요' },
  'ex9': { type: 'photo', buttonText: '사진 제출하기', description: '자전거 타는 모습이나 풍경 사진을 제출해주세요' },
  'ex10': { type: 'stretching', buttonText: '스트레칭 따라하기', description: 'HIIT 스트레칭 영상을 따라해주세요' },
  
  // 독서 카테고리
  'rd1': { type: 'quiz', buttonText: '독서 퀴즈 풀기', description: '읽은 책에 대한 퀴즈를 풀어주세요' },
  'rd2': { type: 'quiz', buttonText: '뉴스 퀴즈 풀기', description: '읽은 뉴스에 대한 퀴즈를 풀어주세요' },
  'rd3': { type: 'quiz', buttonText: '기사 퀴즈 풀기', description: '읽은 기사에 대한 퀴즈를 풀어주세요' },
  'rd4': { type: 'quiz', buttonText: '전자책 퀴즈 풀기', description: '읽은 전자책에 대한 퀴즈를 풀어주세요' },
  'rd5': { type: 'quiz', buttonText: '전문서 퀴즈 풀기', description: '읽은 전문서에 대한 퀴즈를 풀어주세요' },
  'rd6': { type: 'quiz', buttonText: '독서 노트 퀴즈 풀기', description: '독서 노트를 바탕으로 퀴즈를 풀어주세요' },
  'rd7': { type: 'quiz', buttonText: '요약/서평 퀴즈 풀기', description: '요약/서평 내용을 바탕으로 퀴즈를 풀어주세요' },
  'rd8': { type: 'quiz', buttonText: '과학 기사 퀴즈 풀기', description: '읽은 과학 기사에 대한 퀴즈를 풀어주세요' },
  'rd9': { type: 'quiz', buttonText: '경제/경영 기사 퀴즈 풀기', description: '읽은 경제/경영 기사에 대한 퀴즈를 풀어주세요' },
  'rd10': { type: 'quiz', buttonText: '학술 초록 퀴즈 풀기', description: '읽은 학술 논문 초록에 대한 퀴즈를 풀어주세요' },
  
  // 자기관리 카테고리
  'sc1': { type: 'timer', buttonText: '목욕 타이머 시작', description: '5분간 편안한 목욕을 즐겨주세요' },
  'sc2': { type: 'video', buttonText: '마사지 영상 촬영', description: '마사지하는 모습을 영상으로 촬영해주세요' },
  'sc3': { type: 'photo', buttonText: '음식 사진 제출하기', description: '먹는 음식을 사진으로 찍어주세요' },
  'sc4': { type: 'photo', buttonText: '취미 활동 사진 제출하기', description: '취미 활동 모습을 사진으로 찍어주세요' },
  'sc5': { type: 'photo', buttonText: '아로마 환경 사진 제출하기', description: '아로마 테라피 환경을 사진으로 찍어주세요' },
  'sc6': { type: 'timer', buttonText: '타이머 시작', description: '디지털 디톡스 5분 타이머를 완료해주세요' },
  'sc7': { type: 'diary', buttonText: '일기 작성하기', description: '감사한 일 3가지를 일기 모달에 작성해주세요' },
  'sc8': { type: 'screenshot', buttonText: '스크린샷 제출하기', description: '수분 섭취 기록 화면을 스크린샷하여 제출해주세요' },
  'sc9': { type: 'photo', buttonText: '사진 제출하기', description: '실내 식물 물주기 완료 사진을 제출해주세요' },
  'sc10': { type: 'photo', buttonText: '사진 제출하기', description: '수면 준비 루틴(세안/스킨케어 등) 사진을 제출해주세요' },
  
  // 사회활동 카테고리
  'so1': { type: 'screenshot', buttonText: '메시지 스크린샷 제출하기', description: '친구에게 보낸 메시지 스크린샷을 찍어서 제출해주세요' },
  'so2': { type: 'timer', buttonText: '가족 대화 타이머 시작', description: '가족과 5분간 대화를 나눠주세요' },
  'so3': { type: 'screenshot', buttonText: '커뮤니티 참여 스크린샷 제출하기', description: '온라인 커뮤니티 참여 화면을 스크린샷해서 제출해주세요' },
  'so4': { type: 'photo', buttonText: '봉사활동 사진 제출하기', description: '봉사활동 모습을 사진으로 찍어주세요' },
  'so5': { type: 'photo', buttonText: '모임 사진 제출하기', description: '동호회나 모임 모습을 사진으로 찍어주세요' },
  'so6': { type: 'timer', buttonText: '타이머 시작', description: '멘토/동료와의 통화 5분 타이머를 완료해주세요' },
  'so7': { type: 'screenshot', buttonText: '스크린샷 제출하기', description: '온라인 프로필 업데이트 완료 화면을 스크린샷하여 제출해주세요' },
  'so8': { type: 'photo', buttonText: '사진 제출하기', description: '커피챗 진행 인증 사진을 제출해주세요' },
  'so9': { type: 'photo', buttonText: '사진 제출하기', description: '스터디 참여 인증 사진을 제출해주세요' },
  'so10': { type: 'video', buttonText: '영상 촬영', description: '발표 영상을 촬영하여 업로드해주세요' }
};

// 인증 타입별 아이콘 매핑
export const verificationTypeIcons = {
  'photo': '📷',
  'video': '🎥',
  'quiz': '❓',
  'diary': '📝',
  'timer': '⏰',
  'audio': '🎵',
  'screenshot': '🖥️',
  'stretching': '🧘‍♀️'
};

// 인증 타입별 색상 매핑
export const verificationTypeColors = {
  'photo': '#3B82F6', // blue
  'video': '#8B5CF6', // purple
  'quiz': '#F59E0B',  // amber
  'diary': '#10B981', // emerald
  'timer': '#EF4444', // red
  'audio': '#EC4899', // pink
  'screenshot': '#6B7280', // gray
  'stretching': '#059669' // emerald-600
};
