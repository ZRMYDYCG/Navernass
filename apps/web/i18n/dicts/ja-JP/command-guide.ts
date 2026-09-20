const commandGuide = {
  title: 'ショートカットと操作リファレンス',
  description: '章編集時に使えるキーボードショートカット、入力方法、画面操作。',
  openButton: 'ショートカット',
  viewAll: 'リファレンスを見る',
  footerHint: 'Ctrl+/（Mac は ⌘/）でいつでもこのパネルを開けます。',
  tabs: {
    shortcuts: 'ショートカット',
    input: 'クイック挿入',
    editing: '画面操作',
  },
  sections: {
    workspace: {
      title: 'ワークスペース',
      description: 'パネル切替、保存、ナビゲーション',
    },
    editorShortcuts: {
      title: '本文編集',
      description: '章本文で使える編集ショートカット',
    },
    inputTriggers: {
      title: 'クイック入力',
      description: '本文に入力して機能を起動',
    },
    slashFormat: {
      title: 'スラッシュメニュー',
      description: '/ で見出し、リスト、引用、区切りなどを挿入',
    },
    editingUi: {
      title: '選択と段落',
      description: 'マウスや選択範囲での操作',
    },
    bottomBar: {
      title: '下部ツールバー',
      description: 'ステータスバーの版面・組版設定',
    },
  },
  items: {
    save: {
      label: '保存',
      description: '現在の章または計画ドキュメントを保存',
    },
    toggleLeftPanel: {
      label: '左パネル切替',
      description: '章一覧・キャラクターなどのサイドバーを表示/非表示',
    },
    toggleRightPanel: {
      label: '右パネル切替',
      description: '右側の補助パネルを表示/非表示',
    },
    immersiveMode: {
      label: '没入モード',
      description: 'ヘッダーとサイドバーを非表示にし執筆領域を広げる',
    },
    openGuide: {
      label: 'このリファレンスを開く',
      description: 'すべてのショートカットと操作を確認',
    },
    chapterSearch: {
      label: '章へ移動',
      description: 'ヘッダーのタイトルバーをクリックして章を検索・切替',
    },
    findInChapter: {
      label: '検索',
      description: '現在の章本文内で文字を検索',
    },
    undo: {
      label: '元に戻す',
      description: '直前の編集を取り消す',
    },
    redo: {
      label: 'やり直す',
      description: '取り消した編集を復元',
    },
    bold: {
      label: '太字',
      description: '選択テキストを太字にする',
    },
    italic: {
      label: '斜体',
      description: '選択テキストを斜体にする',
    },
    underline: {
      label: '下線',
      description: '選択テキストに下線を付ける',
    },
    slashMenu: {
      label: '挿入メニューを開く',
      description: '段落で / を入力し、挿入する内容や書式を選択',
    },
    selectTextToolbar: {
      label: 'フローティング書式バー',
      description: 'テキスト選択時に太字・斜体・下線を設定できるバーを表示',
    },
    dragHandle: {
      label: '段落のドラッグ',
      description: '段落左のハンドルで順序を変更',
    },
    characterNameSuggest: {
      label: 'キャラクター名の候補',
      description: 'キャラクター名入力時に既存名を候補表示・ハイライト',
    },
    bottomSurface: {
      label: '版面スタイル',
      description: '宣白・素浄・古巻などの用紙背景を切替',
    },
    bottomTypography: {
      label: '組版設定',
      description: '字下げ、行間、欄幅、横罫線、段落フォーカス',
    },
    bottomCursor: {
      label: 'カーソルスタイル',
      description: 'エディター内のカーソル外観を切替',
    },
  },
  slashCommand: {
    openGuide: {
      title: 'ショートカットリファレンス',
      description: 'ショートカットと操作の参考パネルを開く',
    },
  },
  welcome: {
    hint: 'よく使うショートカット',
    more: 'スラッシュメニューで見出し、リスト、区切りなどを素早く挿入',
  },
} as const

export default commandGuide
