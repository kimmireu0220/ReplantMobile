// 퀴즈 문제 데이터
export const quizQuestions = {
  // 독서 관련 퀴즈
  'reading1': {
    id: 'reading1',
    title: '독서 퀴즈',
    description: '독서 내용을 바탕으로 퀴즈를 풀어보세요',
    questions: [
      {
        id: 1,
        question: '독서의 가장 큰 장점은 무엇일까요?',
        options: [
          '지식 습득',
          '시간 낭비',
          '눈의 피로',
          '돈 낭비'
        ],
        correctAnswer: 0,
        explanation: '독서는 새로운 지식을 습득하고 사고를 확장시키는 가장 좋은 방법입니다.'
      },
      {
        id: 2,
        question: '효과적인 독서를 위한 방법이 아닌 것은?',
        options: [
          '집중할 수 있는 환경 조성',
          '읽은 내용 요약하기',
          '빠르게 읽기만 하기',
          '중요한 부분 메모하기'
        ],
        correctAnswer: 2,
        explanation: '빠르게 읽기만 하는 것은 효과적인 독서가 아닙니다. 이해하고 생각하며 읽어야 합니다.'
      },
      {
        id: 3,
        question: '독서 습관을 기르는 좋은 방법은?',
        options: [
          '하루에 10시간 읽기',
          '매일 조금씩 꾸준히 읽기',
          '한 번에 여러 권 읽기',
          '어려운 책부터 시작하기'
        ],
        correctAnswer: 1,
        explanation: '매일 조금씩 꾸준히 읽는 것이 독서 습관을 기르는 가장 좋은 방법입니다.'
      },
      {
        id: 4,
        question: '독서 후 가장 중요한 것은?',
        options: [
          '책을 빨리 끝내기',
          '읽은 내용을 생각하고 적용하기',
          '다음 책을 바로 시작하기',
          '책을 다시 읽기'
        ],
        correctAnswer: 1,
        explanation: '읽은 내용을 생각하고 실제 생활에 적용하는 것이 독서의 진정한 가치입니다.'
      },
      {
        id: 5,
        question: '독서할 때 가장 좋은 자세는?',
        options: [
          '누워서 읽기',
          '바른 자세로 앉아서 읽기',
          '걸으면서 읽기',
          '어둡게 해서 읽기'
        ],
        correctAnswer: 1,
        explanation: '바른 자세로 앉아서 읽는 것이 집중력과 건강에 가장 좋습니다.'
      }
    ],
    passingScore: 80, // 80% 이상 정답 시 통과
    timeLimit: 300 // 5분 제한 (초 단위)
  },
  
  // 일반 상식 퀴즈
  'general1': {
    id: 'general1',
    title: '상식 퀴즈',
    description: '일반적인 상식에 대한 퀴즈를 풀어보세요',
    questions: [
      {
        id: 1,
        question: '하루에 권장되는 물 섭취량은?',
        options: [
          '1리터',
          '2리터',
          '3리터',
          '4리터'
        ],
        correctAnswer: 1,
        explanation: '성인의 경우 하루에 약 2리터의 물을 섭취하는 것이 권장됩니다.'
      },
      {
        id: 2,
        question: '건강한 수면 시간은?',
        options: [
          '4-5시간',
          '6-7시간',
          '7-9시간',
          '10시간 이상'
        ],
        correctAnswer: 2,
        explanation: '성인의 경우 7-9시간의 수면이 건강에 가장 좋습니다.'
      },
      {
        id: 3,
        question: '스트레스 해소에 도움이 되는 활동은?',
        options: [
          '운동',
          '과식',
          '게임만 하기',
          '잠만 자기'
        ],
        correctAnswer: 0,
        explanation: '적절한 운동은 스트레스 해소에 매우 효과적입니다.'
      }
    ],
    passingScore: 70,
    timeLimit: 180
  }
  ,
  // 독서 노트 확장 퀴즈 (rd6~rd10 공용 1차 확장)
  'reading2': {
    id: 'reading2',
    title: '독서 확장 퀴즈',
    description: '읽은 내용을 기반으로 심화 퀴즈를 풀어보세요',
    questions: [
      {
        id: 1,
        question: '책을 요약할 때 가장 중요한 것은?',
        options: ['주요 개념과 논지 파악', '저자 전기 작성', '문장 수 늘리기', '모든 문장 암기'],
        correctAnswer: 0,
        explanation: '핵심 개념과 논지를 파악하여 간결하게 정리하는 것이 핵심입니다.'
      },
      {
        id: 2,
        question: '서평 작성 시 포함되면 좋은 요소가 아닌 것은?',
        options: ['작품 개요', '개인적 통찰', '가격 비교', '핵심 인용문'],
        correctAnswer: 2,
        explanation: '가격 비교는 서평의 핵심 요소가 아닙니다.'
      },
      {
        id: 3,
        question: '전문 서적을 읽을 때 효과적인 방법은?',
        options: ['목차 중심의 구조 파악', '무작정 처음부터 끝까지 속독', '그림만 보기', '결론만 읽기'],
        correctAnswer: 0,
        explanation: '목차로 구조를 이해하고 장별 핵심을 파악하는 것이 좋습니다.'
      }
    ],
    passingScore: 70,
    timeLimit: 240
  }
};

// 미션 ID별 퀴즈 매핑
export const missionQuizMapping = {
  'rd1': 'reading1', // 독서 미션 - 블로그나 기사 읽기
  'rd2': 'reading1', // 독서 미션 - 뉴스 읽기
  'rd3': 'reading1', // 독서 미션 - 기사 읽기
  'rd4': 'reading1', // 독서 미션 - 전자책 읽기
  'rd5': 'reading1', // 독서 미션 - 전문서적 읽기
  'rd6': 'reading2', // 독서 미션 추가 - 독서 노트 퀴즈
  'rd7': 'reading2', // 독서 미션 추가 - 요약/서평 퀴즈
  'rd8': 'reading2', // 독서 미션 추가 - 과학 기사 퀴즈
  'rd9': 'reading2', // 독서 미션 추가 - 경제/경영 기사 퀴즈
  'rd10': 'reading2', // 독서 미션 추가 - 학술 초록 퀴즈
  'general1': 'general1'  // 일반 상식 미션
};

// 퀴즈 ID로 퀴즈 정보 가져오기
export const getQuizById = (quizId) => {
  return quizQuestions[quizId];
};

// 미션 ID로 퀴즈 정보 가져오기
export const getQuizByMissionId = (missionId) => {
  const quizId = missionQuizMapping[missionId];
  return quizId ? quizQuestions[quizId] : null;
};

// 모든 퀴즈 목록 가져오기
export const getAllQuizzes = () => {
  return Object.values(quizQuestions);
};

// 기본 export 추가
export default quizQuestions;


