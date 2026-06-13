const skills = {
  title: 'Skill-Marktplatz',
  subtitle: 'Eingebaute Schreib-Skills aktivieren oder eigene SKILL.md-Dateien für KI-Gespräche erstellen.',
  official: 'Eingebaute Skills',
  enabled: 'An',
  disabled: 'Aus',
  badges: {
    official: 'Eingebaut',
    custom: 'Eigene',
  },
  categories: {
    'writing-style': 'Stil',
    planning: 'Planung',
    editing: 'Bearbeitung',
    brainstorm: 'Brainstorming',
    craft: 'Handwerk',
    worldbuilding: 'Weltbau',
    custom: 'Eigene',
  },
  custom: {
    title: 'Meine Skills',
    create: 'Erstellen',
    edit: 'Skill bearbeiten',
    empty: 'Noch keine eigenen Skills. Erstellen Sie eine SKILL.md für Ihren Schreibstil.',
    name: 'Kennung (kebab-case)',
    displayName: 'Anzeigename',
    description: 'Kurzbeschreibung',
    skillMd: 'SKILL.md-Inhalt',
    skillMdHint: 'Agent-Skills-Standard: YAML-Frontmatter + Markdown-Text.',
    defaultName: 'Mein Schreibstil',
    defaultDescription: 'Persönlicher Schreibstil und Vorlieben',
  },
  errors: {
    load: 'Skills konnten nicht geladen werden',
    update: 'Skill konnte nicht aktualisiert werden',
    save: 'Skill konnte nicht gespeichert werden',
    delete: 'Skill konnte nicht gelöscht werden',
  },
} as const

export default skills
