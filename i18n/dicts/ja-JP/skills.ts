const skills = {
  title: 'スキルマーケット',
  subtitle: '組み込みライティングスキルを有効化するか、カスタム SKILL.md を作成して AI 会話に注入します。',
  official: '組み込みスキル',
  enabled: 'オン',
  disabled: 'オフ',
  badges: {
    official: '組み込み',
    custom: 'カスタム',
  },
  categories: {
    'writing-style': '文体',
    planning: '企画',
    editing: '編集',
    brainstorm: 'ブレスト',
    craft: '技法',
    worldbuilding: '世界観',
    custom: 'カスタム',
  },
  custom: {
    title: 'マイスキル',
    create: '作成',
    edit: 'スキルを編集',
    empty: 'カスタムスキルはまだありません。SKILL.md で執筆スタイルを定義してください。',
    name: '識別子（kebab-case）',
    displayName: '表示名',
    description: '短い説明',
    skillMd: 'SKILL.md 内容',
    skillMdHint: 'Agent Skills 標準に従う：YAML frontmatter + Markdown 本文。',
    defaultName: '私の執筆スタイル',
    defaultDescription: '個人の執筆スタイルと嗜好',
  },
  errors: {
    load: 'スキルの読み込みに失敗しました',
    update: 'スキルの更新に失敗しました',
    save: 'スキルの保存に失敗しました',
    delete: 'スキルの削除に失敗しました',
  },
} as const

export default skills
