const main = {
  appLogo: {
    alt: 'Narraverse 標誌',
  },
  dock: {
    menu: {
      ai: 'Narraverse AI',
      novels: '我的小說',
      trash: '回收站',
    },
    toggle: {
      show: '顯示導覽列',
      hide: '隱藏導覽列',
    },
  },
  sidebar: {
    toggleMenu: '切換選單',
    openSidebar: '打開側邊欄',
    closeSidebar: '關閉側邊欄',
  },
  search: {
    title: '搜尋',
    placeholder: '搜尋...',
    loading: '載入中...',
    empty: {
      noResults: '未找到相關內容',
      hint: '輸入關鍵字搜尋...',
    },
    routes: {
      chat: '創作助手',
      novels: '我的小說',
      trash: '回收站',
      news: '產品動態',
    },
    types: {
      novel: '小說',
      chat: '對話',
      route: '頁面',
    },
  },
  profile: {
    title: '編輯個人資料',
    uploadHint: '點擊相機圖示上傳頭像',
    fields: {
      penName: '筆名',
      website: '網站',
    },
    placeholders: {
      penName: '輸入你的筆名',
    },
    actions: {
      cancel: '取消',
      save: '儲存',
      uploading: '上傳中...',
      saving: '儲存中...',
    },
    messages: {
      avatarTooLarge: '頭像大小不能超過 5MB',
      avatarNotImage: '請選擇圖片檔案',
      avatarUploadFailed: '頭像上傳失敗',
      updateFailed: '更新失敗',
      updateFailedRetry: '更新失敗，請重試',
      updated: '個人資料更新成功',
    },
  },
} as const

export default main
