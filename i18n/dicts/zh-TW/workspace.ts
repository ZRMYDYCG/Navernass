const workspace = {
  title: '工作台',
  recentNovels: '最近作品',
  createNovel: '建立新作品',
  allNovels: '全部作品',
  wordCount: '總字數',
  chapterCount: '章節數',
  page: {
    quote: '寫作就是修補裂痕。',
    author: '瑪格麗特·阿特伍德',
  },
  projectList: {
    title: '我的作品',
    createNew: '開啟新篇章',
    createSuccess: '建立成功',
    createError: '建立失敗',
    statusPublished: '連載中',
    statusDraft: '草稿',
    emptyDescription: '在這片空白的畫布上，等待著屬於你的故事。',
  },
  statsCard: {
    title: '創作足跡',
    creationDays: '創作天數',
    days: '天',
    finishedChapters: '已完結章節',
    worldviewEntries: '世界觀條目',
  },
  contributionGraph: {
    title: '創作日曆',
    activeDays: '本週活躍',
    days: '天',
    less: '少',
    more: '多',
    updates: '次更新',
    noActivity: '無活動',
  },
  welcome: {
    defaultName: '創作者',
    timeConfig: {
      morning: {
        greeting: '晨光熹微',
        message: '早安。讓清晨的第一縷思緒，化作筆下的世界。',
      },
      noon: {
        greeting: '日影斑駁',
        message: '午安。靈感正盛，正是推進主線的好時候。',
      },
      afternoon: {
        greeting: '午後慵懶',
        message: '喝杯咖啡，稍微放鬆一下。或者，給反派安排一個小插曲？',
      },
      evening: {
        greeting: '暮色四合',
        message: '晚安。一天的喧囂褪去，此刻是沉澱與潤色的最佳時機。',
      },
      night: {
        greeting: '夜深人靜',
        message: '夜色已深。偉大的故事往往誕生於無數個不眠之夜。',
      },
    },
  },
} as const

export default workspace
