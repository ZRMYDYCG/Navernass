const main = {
  appLogo: {
    alt: 'Narraverse 标志',
  },
  dock: {
    menu: {
      ai: 'Narraverse AI',
      novels: '我的小说',
      trash: '回收站',
    },
    toggle: {
      show: '显示导航栏',
      hide: '隐藏导航栏',
    },
  },
  sidebar: {
    toggleMenu: '切换菜单',
    openSidebar: '打开侧边栏',
    closeSidebar: '关闭侧边栏',
  },
  search: {
    title: '搜索',
    placeholder: '搜索...',
    loading: '加载中...',
    empty: {
      noResults: '未找到相关内容',
      hint: '输入关键词搜索...',
    },
    routes: {
      chat: '创作助手',
      novels: '我的小说',
      trash: '回收站',
      news: '产品动态',
    },
    types: {
      novel: '小说',
      chat: '对话',
      route: '页面',
    },
  },
  profile: {
    title: '编辑个人资料',
    uploadHint: '点击相机图标上传头像',
    fields: {
      penName: '笔名',
      website: '网站',
    },
    placeholders: {
      penName: '输入你的笔名',
    },
    actions: {
      cancel: '取消',
      save: '保存',
      uploading: '上传中...',
      saving: '保存中...',
    },
    messages: {
      avatarTooLarge: '头像大小不能超过 5MB',
      avatarNotImage: '请选择图片文件',
      avatarUploadFailed: '头像上传失败',
      updateFailed: '更新失败',
      updateFailedRetry: '更新失败，请重试',
      updated: '个人资料更新成功',
    },
  },
} as const

export default main
