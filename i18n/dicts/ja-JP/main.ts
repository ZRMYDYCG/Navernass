const main = {
  appLogo: {
    alt: 'Narraverse ロゴ',
  },
  dock: {
    menu: {
      ai: 'Narraverse AI',
      novels: 'マイ小説',
      trash: 'ゴミ箱',
    },
    toggle: {
      show: 'ナビゲーションを表示',
      hide: 'ナビゲーションを非表示',
    },
  },
  sidebar: {
    toggleMenu: 'メニューを切り替え',
    openSidebar: 'サイドバーを開く',
    closeSidebar: 'サイドバーを閉じる',
  },
  search: {
    title: '検索',
    placeholder: '検索...',
    loading: '読み込み中...',
    empty: {
      noResults: '結果が見つかりません',
      hint: '入力して検索...',
    },
    routes: {
      chat: '執筆アシスタント',
      novels: 'マイ小説',
      trash: 'ゴミ箱',
      news: 'プロダクト更新',
    },
    types: {
      novel: '小説',
      chat: 'チャット',
      route: 'ページ',
    },
  },
  profile: {
    title: 'プロフィールを編集',
    uploadHint: 'カメラアイコンをクリックしてアバターをアップロード',
    fields: {
      penName: 'ペンネーム',
      website: 'Webサイト',
    },
    placeholders: {
      penName: 'ペンネームを入力',
    },
    actions: {
      cancel: 'キャンセル',
      save: '保存',
      uploading: 'アップロード中...',
      saving: '保存中...',
    },
    messages: {
      avatarTooLarge: 'アバターのサイズは5MB未満にしてください',
      avatarNotImage: '画像ファイルを選択してください',
      avatarUploadFailed: 'アバターのアップロードに失敗しました',
      updateFailed: '更新に失敗しました',
      updateFailedRetry: '更新に失敗しました。もう一度お試しください',
      updated: 'プロフィールを更新しました',
    },
  },
} as const

export default main
