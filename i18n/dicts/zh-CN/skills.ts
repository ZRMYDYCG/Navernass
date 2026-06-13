const skills = {
  title: '技能市场',
  subtitle: '启用内置写作技能，或创建自定义 SKILL.md 注入 AI 对话。',
  official: '内置技能',
  enabled: '已启用',
  disabled: '未启用',
  badges: {
    official: '内置',
    custom: '自定义',
  },
  categories: {
    'writing-style': '文风',
    planning: '规划',
    editing: '编辑',
    brainstorm: '脑暴',
    craft: '技巧',
    worldbuilding: '世界观',
    custom: '自定义',
  },
  custom: {
    title: '我的技能',
    create: '新建',
    edit: '编辑技能',
    empty: '还没有自定义技能。创建 SKILL.md 定义你的写作风格与偏好。',
    name: '标识名（kebab-case）',
    displayName: '显示名称',
    description: '简短描述',
    skillMd: 'SKILL.md 内容',
    skillMdHint: '遵循 Agent Skills 标准：YAML frontmatter + Markdown 正文。',
    defaultName: '我的写作风格',
    defaultDescription: '个人写作风格与偏好规范',
  },
  errors: {
    load: '加载技能失败',
    update: '更新技能失败',
    save: '保存技能失败',
    delete: '删除技能失败',
  },
} as const

export default skills
