const tiptap = {
  editor: {
    placeholder: 'Commencez à écrire...',
    uploadingIllustration: 'Téléversement de l\'illustration...',
    uploadIllustrationFailed: 'Échec du téléversement de l\'illustration',
    unknownRole: 'Rôle inconnu',
    aiGeneratedImageAlt: 'Image générée par l\'IA',
  },
  search: {
    placeholder: 'Rechercher...',
    previous: 'Précédent (Shift+Entrée)',
    next: 'Suivant (Entrée)',
    close: 'Fermer (Échap)',
  },
  floatingMenu: {
    accept: 'Accepter',
    reject: 'Refuser',
  },
  formatToolbar: {
    bold: 'Gras',
    italic: 'Italique',
    underline: 'Souligner',
    sendToSideAI: 'Envoyer la sélection au panneau IA latéral',
    askAI: 'Demander à l\'IA',
  },
  dragHandle: {
    moveParagraph: 'Glisser pour déplacer le paragraphe',
  },
  characterNameSuggest: {
    prefix: 'Suggestions de personnages :',
  },
  imageGenerationDialog: {
    title: 'Illustration IA',
    promptLabel: 'Description',
    promptPlaceholder: 'Décrivez l\'image que vous souhaitez...',
    ratioLabel: 'Ratio d\'aspect',
    generating: 'Génération...',
    generate: 'Générer',
  },
  commandList: {
    empty: 'Aucune commande correspondante',
    groups: {
      ai: 'Commandes',
      format: 'Format',
      basic: 'Basique',
    },
  },
  slashCommand: {
    items: {
      aiContinue: {
        title: 'Continuation IA',
        description: 'Laisser l\'IA continuer à écrire',
      },
      aiBrainstorm: {
        title: 'Brainstorm IA',
        description: 'Générer des idées et des angles',
      },
      aiOutline: {
        title: 'Plan IA',
        description: 'Générer un plan',
      },
      aiImage: {
        title: 'Illustration IA',
        description: 'Générer une image avec l\'IA',
      },
      heading1: {
        title: 'Titre 1',
        description: 'Grand titre',
      },
      heading2: {
        title: 'Titre 2',
        description: 'Titre moyen',
      },
      heading3: {
        title: 'Titre 3',
        description: 'Petit titre',
      },
      bulletList: {
        title: 'Liste à puces',
        description: 'Créer une liste',
      },
      orderedList: {
        title: 'Liste numérotée',
        description: 'Liste numérotée',
      },
      blockquote: {
        title: 'Citation',
        description: 'Texte en citation',
      },
      codeBlock: {
        title: 'Bloc de code',
        description: 'Insérer du code',
      },
      divider: {
        title: 'Séparateur',
        description: 'Règle horizontale',
      },
    },
    ai: {
      continue: {
        loading: 'L\'IA continue...',
        failedInline: '\nLa continuation par l\'IA a échoué. Veuillez réessayer plus tard.\n',
        requestFailed: 'La requête IA a échoué',
      },
      brainstorm: {
        dialog: {
          title: 'Brainstorm IA',
          placeholder: 'Sur quel sujet voulez-vous faire un brainstorming ?',
        },
        loading: 'L\'IA génère des idées...',
        systemPrompt: 'Générez 5-8 idées créatives ou angles sur ce sujet. Utilisez des puces concises.',
        requestFailed: 'La requête IA a échoué',
      },
      outline: {
        dialog: {
          title: 'Plan IA',
          placeholder: 'Saisissez un sujet ou une brève description...',
        },
        loading: 'L\'IA génère un plan...',
        systemPrompt: 'Générez un plan détaillé avec sections principales et sous-points. Utilisez une structure hiérarchique.',
        requestFailed: 'La requête IA a échoué',
      },
      image: {
        loading: 'L\'IA génère une image...',
        generateFailed: 'Échec de la génération d\'image',
        noImageReturned: 'Aucune image renvoyée',
        failedInline: '\nÉchec de la génération d\'image. Veuillez réessayer plus tard.\n',
      },
    },
  },
  aiAutocomplete: {
    loadingFrames: {
      one: ' IA continue.   ',
      two: ' IA continue..  ',
      three: ' IA continue... ',
    },
    requestFailed: 'La requête IA a échoué',
    failedInline: '\nLa continuation par l\'IA a échoué. Veuillez réessayer plus tard.\n',
  },
  aiMenu: {
    input: {
      collapsedLabel: 'Demandez à l\'assistant...',
      placeholder: 'Demandez à l\'assistant...',
      generatingAria: 'IA en génération',
      close: 'Fermer',
      closeConfirmPrompt: 'Fermer la conversation (confirmer)',
      logoAlt: 'IA',
    },
    left: {
      items: {
        editAdjust: { label: 'Modifier la sélection', prompt: 'Modifier la sélection', hasSubmenu: true },
        rewriteTone: { label: 'Réécrire le ton', prompt: 'Réécrire le ton' },
        organize: { label: 'Organiser la sélection', prompt: 'Organiser la sélection' },
        writeFromSelection: { label: 'Écrire à partir de la sélection', prompt: 'Écrire à partir de la sélection' },
      },
    },
    right: {
      items: {
        enrich: { label: 'Enrichir', prompt: 'Enrichir' },
        shorten: { label: 'Raccourcir', prompt: 'Raccourcir' },
        punctuation: { label: 'Corriger la ponctuation', prompt: 'Corriger la ponctuation' },
        continue: { label: 'Continuer', prompt: 'Continuer' },
      },
    },
    result: {
      thinking: 'L\'IA réfléchit...',
      generating: 'L\'IA génère...',
      stopGenerating: 'Arrêter la génération',
      applySuggestion: 'Appliquer la suggestion',
      insertBelow: 'Insérer en dessous',
      retry: 'Réessayer',
    },
    state: {
      requestFailed: 'La requête IA a échoué',
      unreadableResponse: 'Impossible de lire la réponse',
      processFailedLog: 'Échec du traitement IA :',
    },
  },
} as const

export default tiptap
