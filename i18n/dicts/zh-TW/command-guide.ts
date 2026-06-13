const commandGuide = {
  title: '快捷鍵與操作參考',
  description: '編輯章節時可用的鍵盤快捷鍵、輸入方式與介面操作。',
  openButton: '快捷鍵參考',
  viewAll: '查看完整參考',
  footerHint: '按 Ctrl+/（Mac 為 ⌘/）可隨時開啟本面板。',
  tabs: {
    shortcuts: '快捷鍵',
    input: '快速插入',
    editing: '介面操作',
  },
  sections: {
    workspace: {
      title: '工作區',
      description: '面板切換、儲存與導覽',
    },
    editorShortcuts: {
      title: '正文編輯',
      description: '章節正文內的常用編輯快捷鍵',
    },
    inputTriggers: {
      title: '快速輸入',
      description: '在正文中輸入特定字元開啟功能',
    },
    slashFormat: {
      title: '斜線選單',
      description: '輸入 / 後可插入標題、列表、引用與分隔符等',
    },
    editingUi: {
      title: '選區與段落',
      description: '透過滑鼠或選區進行的操作',
    },
    bottomBar: {
      title: '底部工具列',
      description: '狀態列中的卷面與排版設定',
    },
  },
  items: {
    save: {
      label: '儲存',
      description: '儲存目前章節或計畫文件',
    },
    toggleLeftPanel: {
      label: '切換左側面板',
      description: '顯示或隱藏章節目錄、角色等側邊欄',
    },
    toggleRightPanel: {
      label: '切換右側面板',
      description: '顯示或隱藏右側輔助面板',
    },
    immersiveMode: {
      label: '沉浸模式',
      description: '隱藏頂欄與側欄，擴大寫作區域',
    },
    openGuide: {
      label: '開啟本參考',
      description: '查看全部快捷鍵與操作說明',
    },
    chapterSearch: {
      label: '跳轉章節',
      description: '點擊頂欄標題列，搜尋並切換章節',
    },
    findInChapter: {
      label: '尋找',
      description: '在目前章節正文中尋找文字',
    },
    undo: {
      label: '復原',
      description: '復原上一步編輯',
    },
    redo: {
      label: '重做',
      description: '恢復被復原的編輯',
    },
    bold: {
      label: '粗體',
      description: '將選取文字設為粗體',
    },
    italic: {
      label: '斜體',
      description: '將選取文字設為斜體',
    },
    underline: {
      label: '底線',
      description: '為選取文字加上底線',
    },
    slashMenu: {
      label: '開啟插入選單',
      description: '在段落中輸入 /，選擇要插入的內容或格式',
    },
    selectTextToolbar: {
      label: '浮動格式列',
      description: '選取文字後，上方會出現格式列，可設定粗體、斜體、底線',
    },
    dragHandle: {
      label: '段落拖曳',
      description: '懸停段落左側把手，可調整段落順序',
    },
    characterNameSuggest: {
      label: '角色名聯想',
      description: '輸入角色名時自動聯想並高亮已有角色',
    },
    bottomSurface: {
      label: '卷面風格',
      description: '切換宣白、素淨、古卷等紙張背景',
    },
    bottomTypography: {
      label: '排版設定',
      description: '首行縮排、行距、欄寬、橫線稿紙與段落聚焦',
    },
    bottomCursor: {
      label: '游標樣式',
      description: '切換編輯器內的游標外觀',
    },
  },
  slashCommand: {
    openGuide: {
      title: '查看快捷鍵參考',
      description: '開啟快捷鍵與操作參考面板',
    },
  },
  welcome: {
    hint: '常用快捷鍵',
    more: '斜線選單可快速插入標題、列表與分隔符等',
  },
} as const

export default commandGuide
