const skills = {
  title: 'Skills Marketplace',
  subtitle: 'Enable built-in writing skills or create custom SKILL.md files for AI conversations.',
  official: 'Built-in Skills',
  enabled: 'On',
  disabled: 'Off',
  badges: {
    official: 'Built-in',
    custom: 'Custom',
  },
  categories: {
    'writing-style': 'Style',
    planning: 'Planning',
    editing: 'Editing',
    brainstorm: 'Brainstorm',
    craft: 'Craft',
    worldbuilding: 'Worldbuilding',
    custom: 'Custom',
  },
  custom: {
    title: 'My Skills',
    create: 'Create',
    edit: 'Edit Skill',
    empty: 'No custom skills yet. Create a SKILL.md to define your writing preferences.',
    name: 'Identifier (kebab-case)',
    displayName: 'Display Name',
    description: 'Short Description',
    skillMd: 'SKILL.md Content',
    skillMdHint: 'Follow the Agent Skills standard: YAML frontmatter + Markdown body.',
    defaultName: 'My Writing Style',
    defaultDescription: 'Personal writing style and preferences',
  },
  errors: {
    load: 'Failed to load skills',
    update: 'Failed to update skill',
    save: 'Failed to save skill',
    delete: 'Failed to delete skill',
  },
} as const

export default skills
