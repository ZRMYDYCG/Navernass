const skills = {
  title: 'Marketplace de compétences',
  subtitle: 'Activez des compétences d\'écriture intégrées ou créez des SKILL.md personnalisés pour les conversations IA.',
  official: 'Compétences intégrées',
  enabled: 'Activé',
  disabled: 'Désactivé',
  badges: {
    official: 'Intégré',
    custom: 'Personnalisé',
  },
  categories: {
    'writing-style': 'Style',
    planning: 'Planification',
    editing: 'Édition',
    brainstorm: 'Brainstorm',
    craft: 'Art',
    worldbuilding: 'Univers',
    custom: 'Personnalisé',
  },
  custom: {
    title: 'Mes compétences',
    create: 'Créer',
    edit: 'Modifier la compétence',
    empty: 'Aucune compétence personnalisée. Créez un SKILL.md pour définir votre style d\'écriture.',
    name: 'Identifiant (kebab-case)',
    displayName: 'Nom affiché',
    description: 'Courte description',
    skillMd: 'Contenu SKILL.md',
    skillMdHint: 'Standard Agent Skills : frontmatter YAML + corps Markdown.',
    defaultName: 'Mon style d\'écriture',
    defaultDescription: 'Style et préférences d\'écriture personnels',
  },
  errors: {
    load: 'Échec du chargement des compétences',
    update: 'Échec de la mise à jour',
    save: 'Échec de l\'enregistrement',
    delete: 'Échec de la suppression',
  },
} as const

export default skills
