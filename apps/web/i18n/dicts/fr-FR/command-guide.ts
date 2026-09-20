const commandGuide = {
  title: 'Raccourcis et référence',
  description: 'Raccourcis clavier, saisie et actions de l’interface lors de l’édition.',
  openButton: 'Raccourcis',
  viewAll: 'Voir la référence complète',
  footerHint: 'Ctrl+/ (⌘/ sur Mac) ouvre ce panneau à tout moment.',
  tabs: {
    shortcuts: 'Raccourcis',
    input: 'Insertion rapide',
    editing: 'Interface',
  },
  sections: {
    workspace: {
      title: 'Espace de travail',
      description: 'Panneaux, enregistrement, navigation',
    },
    editorShortcuts: {
      title: 'Édition',
      description: 'Raccourcis courants dans le texte du chapitre',
    },
    inputTriggers: {
      title: 'Saisie rapide',
      description: 'Saisissez ces caractères dans le document',
    },
    slashFormat: {
      title: 'Menu slash',
      description: 'Tapez / pour insérer titres, listes, citations et séparateurs',
    },
    editingUi: {
      title: 'Sélection et paragraphes',
      description: 'Actions via la souris ou la sélection de texte',
    },
    bottomBar: {
      title: 'Barre d’outils inférieure',
      description: 'Surface et typographie dans la barre d’état',
    },
  },
  items: {
    save: {
      label: 'Enregistrer',
      description: 'Enregistrer le chapitre ou document de plan actuel',
    },
    toggleLeftPanel: {
      label: 'Panneau gauche',
      description: 'Afficher ou masquer la liste des chapitres et panneaux latéraux',
    },
    toggleRightPanel: {
      label: 'Panneau droit',
      description: 'Afficher ou masquer le panneau auxiliaire droit',
    },
    immersiveMode: {
      label: 'Mode immersif',
      description: 'Masquer l’en-tête et les barres latérales',
    },
    openGuide: {
      label: 'Ouvrir cette référence',
      description: 'Voir tous les raccourcis et actions',
    },
    chapterSearch: {
      label: 'Aller au chapitre',
      description: 'Cliquer sur la barre de titre pour chercher un chapitre',
    },
    findInChapter: {
      label: 'Rechercher',
      description: 'Chercher du texte dans le chapitre actuel',
    },
    undo: {
      label: 'Annuler',
      description: 'Annuler la dernière modification',
    },
    redo: {
      label: 'Rétablir',
      description: 'Rétablir une modification annulée',
    },
    bold: {
      label: 'Gras',
      description: 'Mettre le texte sélectionné en gras',
    },
    italic: {
      label: 'Italique',
      description: 'Mettre le texte sélectionné en italique',
    },
    underline: {
      label: 'Souligné',
      description: 'Souligner le texte sélectionné',
    },
    slashMenu: {
      label: 'Ouvrir le menu d’insertion',
      description: 'Tapez / dans un paragraphe pour choisir le contenu ou le format',
    },
    selectTextToolbar: {
      label: 'Barre de formatage flottante',
      description: 'Sélectionnez du texte pour gras, italique et souligné',
    },
    dragHandle: {
      label: 'Glisser les paragraphes',
      description: 'Survolez la poignée gauche pour réorganiser',
    },
    characterNameSuggest: {
      label: 'Suggestions de noms',
      description: 'Suggérer et surligner les noms de personnages existants',
    },
    bottomSurface: {
      label: 'Style de surface',
      description: 'Changer les fonds papier (uni, brume, parchemin, etc.)',
    },
    bottomTypography: {
      label: 'Typographie',
      description: 'Retrait, interligne, largeur, lignes, focus paragraphe',
    },
    bottomCursor: {
      label: 'Style du curseur',
      description: 'Changer l’apparence du curseur dans l’éditeur',
    },
  },
  slashCommand: {
    openGuide: {
      title: 'Référence des raccourcis',
      description: 'Ouvrir le panneau de raccourcis et actions',
    },
  },
  welcome: {
    hint: 'Raccourcis courants',
    more: 'Le menu slash insère titres, listes, séparateurs et plus',
  },
} as const

export default commandGuide
