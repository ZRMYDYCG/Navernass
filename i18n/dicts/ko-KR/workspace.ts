const workspace = {
  title: '작업공간',
  recentNovels: '최근 소설',
  createNovel: '소설 만들기',
  allNovels: '전체 소설',
  wordCount: '총 단어 수',
  chapterCount: '장',
  page: {
    quote: '단어가 단어를 부르고, 또 단어가 단어를 부르면 그것이 힘이 된다.',
    author: 'Margaret Atwood',
  },
  projectList: {
    title: '내 작품',
    createNew: '새 장 시작하기',
    createSuccess: '생성되었습니다',
    createError: '생성에 실패했습니다',
    statusPublished: '공개됨',
    statusDraft: '초안',
    emptyDescription: '빈 캔버스 위에 당신의 이야기가 기다리고 있어요.',
  },
  statsCard: {
    title: '집필 발자국',
    creationDays: '집필한 날',
    days: '일',
    finishedChapters: '완성한 장',
    worldviewEntries: '세계관 항목',
  },
  contributionGraph: {
    title: '집필 캘린더',
    activeDays: '이번 주 활동',
    days: '일',
    less: '적게',
    more: '많이',
    updates: '회',
    noActivity: '활동 없음',
  },
  welcome: {
    defaultName: '창작자',
    timeConfig: {
      morning: {
        greeting: '아침빛',
        message: '좋은 아침이에요. 새벽의 첫 생각을 글로 옮겨보세요.',
      },
      noon: {
        greeting: '한낮의 햇살',
        message: '좋은 오후예요. 영감이 가장 높은 시간, 메인 플롯을 전진시키기 딱 좋아요.',
      },
      afternoon: {
        greeting: '느긋한 오후',
        message: '커피 한 잔 하며 잠깐 쉬어가요. 아니면 악역의 반전을 설계해 볼까요?',
      },
      evening: {
        greeting: '해질녘',
        message: '좋은 저녁이에요. 소음이 잦아드는 지금이 다듬기에 가장 좋은 시간이에요.',
      },
      night: {
        greeting: '고요한 밤',
        message: '늦은 시간이네요. 위대한 이야기는 수많은 밤샘 속에서 태어나곤 하죠.',
      },
    },
  },
} as const

export default workspace
