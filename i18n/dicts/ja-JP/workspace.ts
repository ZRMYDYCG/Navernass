const workspace = {
  title: 'ワークスペース',
  recentNovels: '最近の小説',
  createNovel: '小説を作成',
  allNovels: 'すべての小説',
  wordCount: '総文字数',
  chapterCount: '章数',
  page: {
    quote: '言葉のあとに言葉、また言葉。それが力だ。',
    author: 'Margaret Atwood',
  },
  projectList: {
    title: '作品一覧',
    createNew: '新しい章を始める',
    createSuccess: '作成しました',
    createError: '作成に失敗しました',
    statusPublished: '公開',
    statusDraft: '下書き',
    emptyDescription: 'この真っ白なキャンバスに、あなたの物語が待っています。',
  },
  statsCard: {
    title: '執筆の足跡',
    creationDays: '作成日数',
    days: '日',
    finishedChapters: '完了した章',
    worldviewEntries: '世界観エントリ',
  },
  contributionGraph: {
    title: '執筆カレンダー',
    activeDays: '今週のアクティブ',
    days: '日',
    less: '少',
    more: '多',
    updates: '更新',
    noActivity: '活動なし',
  },
  welcome: {
    defaultName: 'クリエイター',
    timeConfig: {
      morning: {
        greeting: '朝の光',
        message: 'おはようございます。夜明けの最初の思いを言葉にしましょう。',
      },
      noon: {
        greeting: '真昼の陽',
        message: 'こんにちは。ひらめきが高まる時間。物語の本筋を進めるのに最適です。',
      },
      afternoon: {
        greeting: '穏やかな午後',
        message: 'コーヒーを飲んで少し休憩。あるいは、悪役のどんでん返しを仕込んでみませんか？',
      },
      evening: {
        greeting: '夕暮れ',
        message: 'こんばんは。喧騒が静まる今こそ、推敲に一番向いた時間です。',
      },
      night: {
        greeting: '静かな夜',
        message: '夜も更けてきました。名作は、数えきれない眠れぬ夜から生まれることがあります。',
      },
    },
  },
} as const

export default workspace
