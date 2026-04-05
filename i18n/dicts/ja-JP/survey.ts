const survey = {
  meta: {
    title: '共創アンケート',
    description: '3分であなたの執筆ストーリーを共有し、Narraverse共創プランに参加してください。',
    keywords: [
      'AI執筆アンケート',
      '小説執筆リサーチ',
      '作家フィードバック',
      'Narraverse共創',
    ],
    breadcrumbHome: 'ホーム',
    breadcrumbSurvey: 'アンケート',
  },
  header: {
    title: '共創プラン：\nあなたの執筆パートナーを見つけよう',
    subtitle:
      '私たちは単なるツールを作っているのではなく、ひらめきと踊る方法を探しています。\n3分だけ、あなたの執筆ストーリーを聞かせてください。',
  },
  sections: {
    profile: {
      step: '01',
      title: 'あなたの執筆の旅について',
      experience: '現在の執筆状況は？',
      experienceOptions: [
        { label: '初心者（書き始めたばかり）', value: 'newbie' },
        { label: '中級（累計50万字未満）', value: 'intermediate' },
        { label: '上級（累計50万字以上）', value: 'advanced' },
        { label: 'プロ（執筆で生計）', value: 'pro' },
      ],
      genres: '好きなジャンルは？（複数選択）',
      genresOptions: [
        { label: 'ファンタジー／仙侠', value: 'fantasy' },
        { label: '現代／恋愛', value: 'urban' },
        { label: 'SF／終末', value: 'scifi' },
        { label: 'サスペンス／スリラー', value: 'suspense' },
        { label: '歴史／ミリタリー', value: 'history' },
        { label: '二次創作／ライトノベル', value: 'fanfic' },
        { label: 'その他', value: 'other' },
      ],
    },
    painPoints: {
      step: '02',
      title: '筆が止まる瞬間',
      struggles: '情熱を最も消耗するのは？（複数選択）',
      strugglesOptions: [
        { label: 'スランプ（書きたいのに何を書けばいいかわからない）', value: 'idea' },
        { label: 'プロット停滞（穴、論理破綻）', value: 'outline' },
        { label: '世界観の迷宮（複雑で自己整合が取れない）', value: 'world' },
        { label: '薄いキャラ（魂や成長がない）', value: 'character' },
        { label: '執筆が遅い（本筋を進めにくい）', value: 'drafting' },
        { label: '推敲が面倒（誤字脱字や言い回し探し）', value: 'editing' },
      ],
      tools: '現在主に使っているツールは？（複数選択）',
      toolsOptions: [
        { label: 'Word／WPS／Pages', value: 'word' },
        { label: 'Notion／Obsidian／Logseq', value: 'note' },
        { label: 'Scrivener／Ulysses', value: 'scrivener' },
        { label: 'Web小説特化ツール', value: 'webnovel_tools' },
        { label: 'スマホのメモ／プレーンテキスト', value: 'memo' },
      ],
    },
    expectations: {
      step: '03',
      title: '理想のアシスタント',
      aiFeatures: 'もしAIがアシスタントなら、特に得意であってほしいのは…',
      max3: '最大3つまで選択',
      aiFeaturesOptions: [
        { label: 'ブレスト：アイデアやどんでん返しを提案', value: 'brainstorm' },
        { label: 'Wiki管理：人物／世界観を整理・可視化', value: 'wiki' },
        { label: '自動補完：文脈に沿って段落を補助', value: 'autocomplete' },
        { label: '論理チェック：プロット穴や時系列バグを発見', value: 'logic_check' },
        { label: 'アート生成：キャラ絵やシーンを制作', value: 'image_gen' },
        { label: '市場分析：トレンドや読者嗜好を分析', value: 'analytics' },
        { label: 'ロールプレイ：キャラになりきって声を探す', value: 'roleplay' },
      ],
      concerns: 'AI執筆についての最大の懸念や提案は？',
      concernsPlaceholder:
        '例：著作権が心配、文体がぶれる、AIに核心アイデアへ介入されたくない…',
    },
    contact: {
      step: '04',
      title: '連絡先',
      info: '優先的にβ版へ招待します（任意）',
      infoPlaceholder: 'メールまたはWeChat',
      promise: '約束：β招待のみに使用します。スパムは送りません。',
    },
  },
  submit: {
    button: 'フィードバックを送信',
    submitting: '送信中...',
    success: '貴重なご意見ありがとうございます！受け取りました。',
    error: '送信に失敗しました。後でもう一度お試しください。',
  },
  successScreen: {
    title: '共有ありがとうございます',
    message:
      'すべてのクリエイターの声がNarraverseの成長を育てます。\n丁寧に耳を傾け、期待に応えます。',
    backHome: 'ホームへ戻る',
  },
  community: {
    findMore: '仲間を探していますか？',
    joinGroup: 'コミュニティに参加',
    scanQr: 'QRをスキャンしてNarraverse Friendsへ参加',
  },
  footer: 'Narraverse · 知性で世界を創る',
} as const

export default survey
