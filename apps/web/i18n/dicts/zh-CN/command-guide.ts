const commandGuide = {
  title: '快捷键与操作参考',
  description: '编辑章节时可用的键盘快捷键、输入方式与界面操作。',
  openButton: '快捷键参考',
  viewAll: '查看完整参考',
  footerHint: '按 Ctrl+/（Mac 为 ⌘/）可随时打开本面板。',
  tabs: {
    shortcuts: '快捷键',
    input: '快速插入',
    editing: '界面操作',
  },
  sections: {
    workspace: {
      title: '工作区',
      description: '面板切换、保存与导航',
    },
    editorShortcuts: {
      title: '正文编辑',
      description: '章节正文内的常用编辑快捷键',
    },
    inputTriggers: {
      title: '快速输入',
      description: '在正文中输入特定字符打开功能',
    },
    slashFormat: {
      title: '斜杠菜单',
      description: '输入 / 后可插入标题、列表、引用与分隔符等',
    },
    editingUi: {
      title: '选区与段落',
      description: '通过鼠标或选区进行的操作',
    },
    bottomBar: {
      title: '底部工具栏',
      description: '状态栏中的卷面与排版设置',
    },
  },
  items: {
    save: {
      label: '保存',
      description: '保存当前章节或计划文档',
    },
    toggleLeftPanel: {
      label: '切换左侧面板',
      description: '显示或隐藏章节目录、角色等侧边栏',
    },
    toggleRightPanel: {
      label: '切换右侧面板',
      description: '显示或隐藏右侧辅助面板',
    },
    immersiveMode: {
      label: '沉浸模式',
      description: '隐藏顶栏与侧栏，扩大写作区域',
    },
    openGuide: {
      label: '打开本参考',
      description: '查看全部快捷键与操作说明',
    },
    chapterSearch: {
      label: '跳转章节',
      description: '点击顶栏标题栏，搜索并切换章节',
    },
    findInChapter: {
      label: '查找',
      description: '在当前章节正文中查找文字',
    },
    undo: {
      label: '撤销',
      description: '撤销上一步编辑',
    },
    redo: {
      label: '重做',
      description: '恢复被撤销的编辑',
    },
    bold: {
      label: '加粗',
      description: '将选中文本加粗',
    },
    italic: {
      label: '斜体',
      description: '将选中文本设为斜体',
    },
    underline: {
      label: '下划线',
      description: '为选中文本添加下划线',
    },
    slashMenu: {
      label: '打开插入菜单',
      description: '在段落中输入 /，选择要插入的内容或格式',
    },
    selectTextToolbar: {
      label: '浮动格式条',
      description: '选中文字后，上方会出现格式条，可设置加粗、斜体、下划线',
    },
    dragHandle: {
      label: '段落拖拽',
      description: '悬停段落左侧把手，可调整段落顺序',
    },
    characterNameSuggest: {
      label: '角色名联想',
      description: '输入角色名时自动联想并高亮已有角色',
    },
    bottomSurface: {
      label: '卷面风格',
      description: '切换宣白、素净、古卷等纸张背景',
    },
    bottomTypography: {
      label: '排版设置',
      description: '首行缩进、行距、栏宽、横线稿纸与段落聚焦',
    },
    bottomCursor: {
      label: '光标样式',
      description: '切换编辑器内的光标外观',
    },
  },
  slashCommand: {
    openGuide: {
      title: '查看快捷键参考',
      description: '打开快捷键与操作参考面板',
    },
  },
  welcome: {
    hint: '常用快捷键',
    more: '斜杠菜单可快速插入标题、列表与分隔符等',
  },
} as const

export default commandGuide
