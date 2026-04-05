const tiptap = {
  editor: {
    placeholder: '書き始めましょう...',
    uploadingIllustration: 'イラストをアップロード中...',
    uploadIllustrationFailed: 'イラストのアップロードに失敗しました',
    unknownRole: '不明な役割',
    aiGeneratedImageAlt: 'AI生成画像',
  },
  search: {
    placeholder: '検索...',
    previous: '前へ（Shift+Enter）',
    next: '次へ（Enter）',
    close: '閉じる（Esc）',
  },
  floatingMenu: {
    accept: '承認',
    reject: '却下',
  },
  formatToolbar: {
    bold: '太字',
    italic: '斜体',
    underline: '下線',
    sendToSideAI: '選択範囲をサイドAIパネルへ送信',
    askAI: 'AIに聞く',
  },
  dragHandle: {
    moveParagraph: 'ドラッグして段落を移動',
  },
  characterNameSuggest: {
    prefix: 'キャラクター候補：',
  },
  imageGenerationDialog: {
    title: 'AIイラスト',
    promptLabel: 'プロンプト',
    promptPlaceholder: '作りたい画像を説明してください...',
    ratioLabel: 'アスペクト比',
    generating: '生成中...',
    generate: '生成',
  },
  commandList: {
    empty: '該当するコマンドがありません',
    groups: {
      ai: 'コマンド',
      format: '書式',
      basic: '基本',
    },
  },
  slashCommand: {
    items: {
      aiContinue: {
        title: 'AIで続き',
        description: 'AIに続きを書かせる',
      },
      aiBrainstorm: {
        title: 'AIブレスト',
        description: 'アイデアや切り口を生成',
      },
      aiOutline: {
        title: 'AIアウトライン',
        description: '構成案を生成',
      },
      aiImage: {
        title: 'AIイラスト',
        description: 'AIで画像を生成',
      },
      heading1: {
        title: '見出し1',
        description: '大きい見出し',
      },
      heading2: {
        title: '見出し2',
        description: '中くらいの見出し',
      },
      heading3: {
        title: '見出し3',
        description: '小さい見出し',
      },
      bulletList: {
        title: '箇条書き',
        description: 'リストを作成',
      },
      orderedList: {
        title: '番号付きリスト',
        description: '番号のリスト',
      },
      blockquote: {
        title: '引用',
        description: '引用文',
      },
      codeBlock: {
        title: 'コードブロック',
        description: 'コードを挿入',
      },
      divider: {
        title: '区切り線',
        description: '横罫線',
      },
    },
    ai: {
      continue: {
        loading: 'AIが続きを生成中...',
        failedInline: '\nAIの続き生成に失敗しました。後でもう一度お試しください。\n',
        requestFailed: 'AIリクエストに失敗しました',
      },
      brainstorm: {
        dialog: {
          title: 'AIブレスト',
          placeholder: 'ブレストしたいテーマは？',
        },
        loading: 'AIがアイデアを生成中...',
        systemPrompt: 'このテーマについて、創造的なアイデアや切り口を5〜8個ブレインストーミングしてください。簡潔な箇条書きで出力してください。',
        requestFailed: 'AIリクエストに失敗しました',
      },
      outline: {
        dialog: {
          title: 'AIアウトライン',
          placeholder: 'テーマまたは簡単な説明を入力...',
        },
        loading: 'AIがアウトラインを生成中...',
        systemPrompt: '主なセクションとサブポイントを含む詳細なアウトラインを生成してください。階層構造で出力してください。',
        requestFailed: 'AIリクエストに失敗しました',
      },
      image: {
        loading: 'AIが画像を生成中...',
        generateFailed: '画像生成に失敗しました',
        noImageReturned: '画像が返されませんでした',
        failedInline: '\n画像生成に失敗しました。後でもう一度お試しください。\n',
      },
    },
  },
  aiAutocomplete: {
    loadingFrames: {
      one: ' AIが続き生成中。   ',
      two: ' AIが続き生成中..  ',
      three: ' AIが続き生成中... ',
    },
    requestFailed: 'AIリクエストに失敗しました',
    failedInline: '\nAIの続き生成に失敗しました。後でもう一度お試しください。\n',
  },
  aiMenu: {
    input: {
      collapsedLabel: 'アシスタントに聞く...',
      placeholder: 'アシスタントに聞く...',
      generatingAria: 'AI生成中',
      close: '閉じる',
      closeConfirmPrompt: '会話を閉じる（確認）',
      logoAlt: 'AI',
    },
    left: {
      items: {
        editAdjust: { label: '選択範囲を編集', prompt: '選択範囲を編集', hasSubmenu: true },
        rewriteTone: { label: '文体を変える', prompt: '文体を変える' },
        organize: { label: '整理する', prompt: '選択範囲を整理する' },
        writeFromSelection: { label: '選択範囲から書く', prompt: '選択範囲から書く' },
      },
    },
    right: {
      items: {
        enrich: { label: '膨らませる', prompt: '選択範囲を膨らませる' },
        shorten: { label: '短くする', prompt: '選択範囲を短くする' },
        punctuation: { label: '句読点を直す', prompt: '句読点を直す' },
        continue: { label: '続ける', prompt: '続きを書く' },
      },
    },
    result: {
      thinking: 'AIが考え中...',
      generating: 'AIが生成中...',
      stopGenerating: '生成を停止',
      applySuggestion: '提案を適用',
      insertBelow: '下に挿入',
      retry: '再試行',
    },
    state: {
      requestFailed: 'AIリクエストに失敗しました',
      unreadableResponse: '応答を読み取れませんでした',
      processFailedLog: 'AIの処理に失敗しました：',
    },
  },
} as const

export default tiptap
