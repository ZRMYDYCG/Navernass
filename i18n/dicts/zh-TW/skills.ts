const skills = {
  title: '技能市場',
  subtitle: '啟用內建寫作技能，或建立自訂 SKILL.md 注入 AI 對話。',
  official: '內建技能',
  enabled: '已啟用',
  disabled: '未啟用',
  badges: {
    official: '內建',
    custom: '自訂',
  },
  categories: {
    'writing-style': '文風',
    planning: '規劃',
    editing: '編輯',
    brainstorm: '腦暴',
    craft: '技巧',
    worldbuilding: '世界觀',
    custom: '自訂',
  },
  custom: {
    title: '我的技能',
    create: '新建',
    edit: '編輯技能',
    empty: '還沒有自訂技能。建立 SKILL.md 定義你的寫作風格與偏好。',
    name: '識別名（kebab-case）',
    displayName: '顯示名稱',
    description: '簡短描述',
    skillMd: 'SKILL.md 內容',
    skillMdHint: '遵循 Agent Skills 標準：YAML frontmatter + Markdown 正文。',
    defaultName: '我的寫作風格',
    defaultDescription: '個人寫作風格與偏好規範',
  },
  errors: {
    load: '載入技能失敗',
    update: '更新技能失敗',
    save: '儲存技能失敗',
    delete: '刪除技能失敗',
  },
} as const

export default skills
