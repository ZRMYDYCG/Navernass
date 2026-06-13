const skills = {
  title: '스킬 마켓',
  subtitle: '내장 글쓰기 스킬을 활성화하거나 커스텀 SKILL.md를 만들어 AI 대화에 주입하세요.',
  official: '내장 스킬',
  enabled: '켜짐',
  disabled: '꺼짐',
  badges: {
    official: '내장',
    custom: '커스텀',
  },
  categories: {
    'writing-style': '문체',
    planning: '기획',
    editing: '편집',
    brainstorm: '브레인스토밍',
    craft: '기법',
    worldbuilding: '세계관',
    custom: '커스텀',
  },
  custom: {
    title: '내 스킬',
    create: '만들기',
    edit: '스킬 편집',
    empty: '커스텀 스킬이 없습니다. SKILL.md로 글쓰기 스타일을 정의하세요.',
    name: '식별자 (kebab-case)',
    displayName: '표시 이름',
    description: '짧은 설명',
    skillMd: 'SKILL.md 내용',
    skillMdHint: 'Agent Skills 표준: YAML frontmatter + Markdown 본문.',
    defaultName: '내 글쓰기 스타일',
    defaultDescription: '개인 글쓰기 스타일 및 선호',
  },
  errors: {
    load: '스킬을 불러오지 못했습니다',
    update: '스킬을 업데이트하지 못했습니다',
    save: '스킬을 저장하지 못했습니다',
    delete: '스킬을 삭제하지 못했습니다',
  },
} as const

export default skills
