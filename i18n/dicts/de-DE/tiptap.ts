const tiptap = {
  editor: {
    placeholder: 'Schreiben Sie los...',
    uploadingIllustration: 'Illustration wird hochgeladen...',
    uploadIllustrationFailed: 'Illustrations-Upload fehlgeschlagen',
    unknownRole: 'Unbekannte Rolle',
    aiGeneratedImageAlt: 'KI-generiertes Bild',
  },
  search: {
    placeholder: 'Suchen...',
    previous: 'Vorherige (Umschalt+Eingabetaste)',
    next: 'Nächste (Eingabetaste)',
    close: 'Schließen (Esc)',
  },
  floatingMenu: {
    accept: 'Annehmen',
    reject: 'Ablehnen',
  },
  formatToolbar: {
    bold: 'Fett',
    italic: 'Kursiv',
    underline: 'Unterstrichen',
    sendToSideAI: 'Auswahl an das seitliche KI-Panel senden',
    askAI: 'KI fragen',
  },
  dragHandle: {
    moveParagraph: 'Ziehen, um den Absatz zu verschieben',
  },
  characterNameSuggest: {
    prefix: 'Figurenvorschläge:',
  },
  imageGenerationDialog: {
    title: 'KI-Illustration',
    promptLabel: 'Beschreibung',
    promptPlaceholder: 'Beschreiben Sie das gewünschte Bild...',
    ratioLabel: 'Seitenverhältnis',
    generating: 'Wird generiert...',
    generate: 'Generieren',
  },
  commandList: {
    empty: 'Keine passenden Befehle',
    groups: {
      ai: 'Befehle',
      format: 'Format',
      basic: 'Grundlegend',
    },
  },
  slashCommand: {
    items: {
      aiContinue: {
        title: 'KI fortsetzen',
        description: 'KI weiterschreiben lassen',
      },
      aiBrainstorm: {
        title: 'KI-Brainstorming',
        description: 'Ideen und Blickwinkel generieren',
      },
      aiOutline: {
        title: 'KI-Gliederung',
        description: 'Eine Gliederung erstellen',
      },
      aiImage: {
        title: 'KI-Illustration',
        description: 'Ein Bild mit KI generieren',
      },
      heading1: {
        title: 'Überschrift 1',
        description: 'Große Überschrift',
      },
      heading2: {
        title: 'Überschrift 2',
        description: 'Mittlere Überschrift',
      },
      heading3: {
        title: 'Überschrift 3',
        description: 'Kleine Überschrift',
      },
      bulletList: {
        title: 'Aufzählung',
        description: 'Eine Liste erstellen',
      },
      orderedList: {
        title: 'Nummerierte Liste',
        description: 'Nummerierte Liste',
      },
      blockquote: {
        title: 'Zitat',
        description: 'Zitattext',
      },
      codeBlock: {
        title: 'Codeblock',
        description: 'Code einfügen',
      },
      divider: {
        title: 'Trennlinie',
        description: 'Horizontale Linie',
      },
    },
    ai: {
      continue: {
        loading: 'KI schreibt weiter...',
        failedInline: '\nKI-Fortsetzung fehlgeschlagen. Bitte versuchen Sie es später erneut.\n',
        requestFailed: 'KI-Anfrage fehlgeschlagen',
      },
      brainstorm: {
        dialog: {
          title: 'KI-Brainstorming',
          placeholder: 'Zu welchem Thema möchten Sie brainstormen?',
        },
        loading: 'KI generiert Ideen...',
        systemPrompt: 'Brainstorme 5–8 kreative Ideen oder Blickwinkel zu diesem Thema. Nutze kurze Stichpunkte.',
        requestFailed: 'KI-Anfrage fehlgeschlagen',
      },
      outline: {
        dialog: {
          title: 'KI-Gliederung',
          placeholder: 'Geben Sie ein Thema oder eine kurze Beschreibung ein...',
        },
        loading: 'KI erstellt eine Gliederung...',
        systemPrompt: 'Erstelle eine detaillierte Gliederung mit Hauptabschnitten und Unterpunkten. Nutze eine hierarchische Struktur.',
        requestFailed: 'KI-Anfrage fehlgeschlagen',
      },
      image: {
        loading: 'KI generiert ein Bild...',
        generateFailed: 'Bildgenerierung fehlgeschlagen',
        noImageReturned: 'Kein Bild zurückgegeben',
        failedInline: '\nBildgenerierung fehlgeschlagen. Bitte versuchen Sie es später erneut.\n',
      },
    },
  },
  aiAutocomplete: {
    loadingFrames: {
      one: ' KI schreibt weiter.   ',
      two: ' KI schreibt weiter..  ',
      three: ' KI schreibt weiter... ',
    },
    requestFailed: 'KI-Anfrage fehlgeschlagen',
    failedInline: '\nKI-Fortsetzung fehlgeschlagen. Bitte versuchen Sie es später erneut.\n',
  },
  aiMenu: {
    input: {
      collapsedLabel: 'Assistenten fragen...',
      placeholder: 'Assistenten fragen...',
      generatingAria: 'KI generiert',
      close: 'Schließen',
      closeConfirmPrompt: 'Konversation schließen (Bestätigungsaufforderung)',
      logoAlt: 'KI',
    },
    left: {
      items: {
        editAdjust: { label: 'Auswahl bearbeiten', prompt: 'Auswahl bearbeiten', hasSubmenu: true },
        rewriteTone: { label: 'Ton umschreiben', prompt: 'Ton umschreiben' },
        organize: { label: 'Auswahl strukturieren', prompt: 'Auswahl strukturieren' },
        writeFromSelection: { label: 'Aus Auswahl schreiben', prompt: 'Aus Auswahl schreiben' },
      },
    },
    right: {
      items: {
        enrich: { label: 'Anreichern', prompt: 'Anreichern' },
        shorten: { label: 'Kürzen', prompt: 'Kürzen' },
        punctuation: { label: 'Interpunktion korrigieren', prompt: 'Interpunktion korrigieren' },
        continue: { label: 'Fortsetzen', prompt: 'Fortsetzen' },
      },
    },
    result: {
      thinking: 'KI denkt nach...',
      generating: 'KI generiert...',
      stopGenerating: 'Generierung stoppen',
      applySuggestion: 'Vorschlag anwenden',
      insertBelow: 'Darunter einfügen',
      retry: 'Erneut versuchen',
    },
    state: {
      requestFailed: 'KI-Anfrage fehlgeschlagen',
      unreadableResponse: 'Antwort konnte nicht gelesen werden',
      processFailedLog: 'KI-Verarbeitung fehlgeschlagen:',
    },
  },
} as const

export default tiptap
