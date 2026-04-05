const workspace = {
  title: '工作台',
  recentNovels: '最近作品',
  createNovel: '创建新作品',
  allNovels: '全部作品',
  wordCount: '总字数',
  chapterCount: '章节数',
  page: {
    quote: '写作就是修补裂痕。',
    author: '玛格丽特·阿特伍德',
  },
  projectList: {
    title: '我的作品',
    createNew: '开启新篇章',
    createSuccess: '创建成功',
    createError: '创建失败',
    statusPublished: '连载中',
    statusDraft: '草稿',
    emptyDescription: '在这片空白的画布上，等待着属于你的故事。',
  },
  statsCard: {
    title: '创作足迹',
    creationDays: '创作天数',
    days: '天',
    finishedChapters: '已完结章节',
    worldviewEntries: '世界观条目',
  },
  contributionGraph: {
    title: '创作日历',
    activeDays: '本周活跃',
    days: '天',
    less: '少',
    more: '多',
    updates: '次更新',
    noActivity: '无活动',
  },
  welcome: {
    defaultName: '创作者',
    timeConfig: {
      morning: {
        greeting: '晨光熹微',
        message: '早安。让清晨的第一缕思绪，化作笔下的世界。',
      },
      noon: {
        greeting: '日影斑驳',
        message: '午安。灵感正盛，正是推进主线的好时候。',
      },
      afternoon: {
        greeting: '午后慵懒',
        message: '喝杯咖啡，稍微放松一下。或者，给反派安排一个小插曲？',
      },
      evening: {
        greeting: '暮色四合',
        message: '晚安。一天的喧嚣褪去，此刻是沉淀与润色的最佳时机。',
      },
      night: {
        greeting: '夜深人静',
        message: '夜色已深。伟大的故事往往诞生于无数个不眠之夜。',
      },
    },
  },
} as const

export default workspace
