const tiptap = {
  editor: {
    placeholder: '开始写作...',
    uploadingIllustration: '插画上传中...',
    uploadIllustrationFailed: '插图上传失败',
    unknownRole: '未知角色',
    aiGeneratedImageAlt: 'AI 生成图片',
  },
  search: {
    placeholder: '搜索...',
    previous: '上一个 (Shift+Enter)',
    next: '下一个 (Enter)',
    close: '关闭 (Esc)',
  },
  floatingMenu: {
    accept: '接受',
    reject: '拒绝',
  },
  formatToolbar: {
    bold: '加粗',
    italic: '斜体',
    underline: '下划线',
    sendToSideAI: '将选中文本发送到右侧 AI 面板',
    askAI: '询问 AI',
  },
  dragHandle: {
    moveParagraph: '拖拽移动段落',
  },
  characterNameSuggest: {
    prefix: '角色名联想：',
  },
  imageGenerationDialog: {
    title: 'AI 生成插画',
    promptLabel: '图片描述',
    promptPlaceholder: '描述你想要生成的图片...',
    ratioLabel: '图片比例',
    generating: '生成中...',
    generate: '生成图片',
  },
  commandList: {
    empty: '没有找到匹配的命令',
    groups: {
      ai: '指令',
      format: '格式',
      basic: '基础',
    },
  },
  slashCommand: {
    items: {
      aiContinue: {
        title: 'AI 续写',
        description: '让 AI 帮你继续写作',
      },
      aiBrainstorm: {
        title: 'AI 头脑风暴',
        description: '生成创意想法和思路',
      },
      aiOutline: {
        title: 'AI 大纲',
        description: '生成文章大纲',
      },
      aiImage: {
        title: 'AI 生成插画',
        description: '使用 AI 生成图片',
      },
      heading1: {
        title: '标题 1',
        description: '大标题',
      },
      heading2: {
        title: '标题 2',
        description: '中标题',
      },
      heading3: {
        title: '标题 3',
        description: '小标题',
      },
      bulletList: {
        title: '无序列表',
        description: '创建列表',
      },
      orderedList: {
        title: '有序列表',
        description: '带编号的列表',
      },
      blockquote: {
        title: '引用',
        description: '引用文本',
      },
      codeBlock: {
        title: '代码块',
        description: '插入代码',
      },
      divider: {
        title: '分隔线',
        description: '水平分隔线',
      },
    },
    ai: {
      continue: {
        loading: 'AI 正在续写...',
        failedInline: '\nAI 续写失败，请稍后重试\n',
        requestFailed: 'AI 请求失败',
      },
      brainstorm: {
        dialog: {
          title: 'AI 头脑风暴',
          placeholder: '请输入你想要头脑风暴的主题...',
        },
        loading: 'AI 正在生成创意...',
        systemPrompt: '请围绕这个主题进行头脑风暴，列出5-8个创意想法或思路。用简洁的要点形式呈现。',
        requestFailed: 'AI 请求失败',
      },
      outline: {
        dialog: {
          title: 'AI 大纲生成',
          placeholder: '请输入文章主题或简要描述...',
        },
        loading: 'AI 正在生成大纲...',
        systemPrompt: '请为这个主题生成一个详细的文章大纲，包括主要章节和子要点。使用层级结构展示。',
        requestFailed: 'AI 请求失败',
      },
      image: {
        loading: 'AI 正在生成图片...',
        generateFailed: '图片生成失败',
        noImageReturned: '未返回生成的图片',
        failedInline: '\n图片生成失败，请稍后重试\n',
      },
    },
  },
  aiAutocomplete: {
    loadingFrames: {
      one: ' AI 续写中.   ',
      two: ' AI 续写中..  ',
      three: ' AI 续写中... ',
    },
    requestFailed: 'AI 请求失败',
    failedInline: '\nAI 续写失败，请稍后重试\n',
  },
  aiMenu: {
    input: {
      collapsedLabel: '向智能助手提问...',
      placeholder: '向智能助手提问...',
      generatingAria: 'AI 正在生成',
      close: '关闭',
      closeConfirmPrompt: '关闭对话（将提示确认）',
      logoAlt: 'AI',
    },
    left: {
      items: {
        editAdjust: { label: '编辑调整选中内容', prompt: '编辑调整', hasSubmenu: true },
        rewriteTone: { label: '改写口吻', prompt: '改写口吻' },
        organize: { label: '整理选区内容', prompt: '整理内容' },
        writeFromSelection: { label: '根据选区内容写', prompt: '根据内容写' },
      },
    },
    right: {
      items: {
        enrich: { label: '丰富内容', prompt: '丰富内容' },
        shorten: { label: '精简内容', prompt: '精简内容' },
        punctuation: { label: '修改标点符号', prompt: '修改标点符号' },
        continue: { label: '继续写', prompt: '继续写' },
      },
    },
    result: {
      thinking: 'AI 正在思考...',
      generating: 'AI 正在生成...',
      stopGenerating: '停止生成',
      applySuggestion: '采纳建议',
      insertBelow: '在下方插入',
      retry: '再试一次',
    },
    state: {
      requestFailed: 'AI 请求失败',
      unreadableResponse: '无法读取响应',
      processFailedLog: 'AI 处理失败:',
    },
  },
} as const

export default tiptap
