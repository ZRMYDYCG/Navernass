const commandGuide = {
  title: 'Tastenkürzel & Referenz',
  description: 'Tastenkürzel, Eingaben und Oberflächenaktionen beim Bearbeiten.',
  openButton: 'Tastenkürzel',
  viewAll: 'Vollständige Referenz',
  footerHint: 'Ctrl+/ (⌘/ auf Mac) öffnet dieses Panel jederzeit.',
  tabs: {
    shortcuts: 'Tastenkürzel',
    input: 'Schnelleinfügung',
    editing: 'Oberfläche',
  },
  sections: {
    workspace: {
      title: 'Arbeitsbereich',
      description: 'Panels, Speichern, Navigation',
    },
    editorShortcuts: {
      title: 'Bearbeitung',
      description: 'Gängige Tastenkürzel im Kapiteltext',
    },
    inputTriggers: {
      title: 'Schnelleingabe',
      description: 'Diese Zeichen im Text eingeben',
    },
    slashFormat: {
      title: 'Slash-Menü',
      description: '/ für Überschriften, Listen, Zitate und Trennlinien',
    },
    editingUi: {
      title: 'Auswahl & Absätze',
      description: 'Aktionen per Maus oder Textauswahl',
    },
    bottomBar: {
      title: 'Untere Symbolleiste',
      description: 'Oberfläche und Typografie in der Statusleiste',
    },
  },
  items: {
    save: {
      label: 'Speichern',
      description: 'Aktuelles Kapitel oder Plandokument speichern',
    },
    toggleLeftPanel: {
      label: 'Linkes Panel',
      description: 'Kapitelliste und Seitenleisten ein-/ausblenden',
    },
    toggleRightPanel: {
      label: 'Rechtes Panel',
      description: 'Rechtes Hilfspanel ein-/ausblenden',
    },
    immersiveMode: {
      label: 'Immersiver Modus',
      description: 'Kopfzeile und Seitenleisten ausblenden',
    },
    openGuide: {
      label: 'Diese Referenz öffnen',
      description: 'Alle Tastenkürzel und Aktionen anzeigen',
    },
    chapterSearch: {
      label: 'Kapitel wechseln',
      description: 'Titelleiste anklicken, um Kapitel zu suchen',
    },
    findInChapter: {
      label: 'Suchen',
      description: 'Text im aktuellen Kapitel suchen',
    },
    undo: {
      label: 'Rückgängig',
      description: 'Letzte Bearbeitung rückgängig machen',
    },
    redo: {
      label: 'Wiederholen',
      description: 'Rückgängig gemachte Bearbeitung wiederherstellen',
    },
    bold: {
      label: 'Fett',
      description: 'Ausgewählten Text fett formatieren',
    },
    italic: {
      label: 'Kursiv',
      description: 'Ausgewählten Text kursiv formatieren',
    },
    underline: {
      label: 'Unterstrichen',
      description: 'Ausgewählten Text unterstreichen',
    },
    slashMenu: {
      label: 'Einfügemenü öffnen',
      description: '/ in einem Absatz eingeben, Inhalt oder Format wählen',
    },
    selectTextToolbar: {
      label: 'Schwebende Formatleiste',
      description: 'Text auswählen für Fett, Kursiv, Unterstreichen',
    },
    dragHandle: {
      label: 'Absätze ziehen',
      description: 'Linken Griff zum Umsortieren von Absätzen',
    },
    characterNameSuggest: {
      label: 'Charakternamenvorschläge',
      description: 'Beim Tippen vorhandene Charakternamen vorschlagen',
    },
    bottomSurface: {
      label: 'Oberflächenstil',
      description: 'Papierhintergründe wie schlicht oder Pergament wechseln',
    },
    bottomTypography: {
      label: 'Typografie',
      description: 'Einzug, Zeilenhöhe, Spaltenbreite, Linienpapier, Absatzfokus',
    },
    bottomCursor: {
      label: 'Cursor-Stil',
      description: 'Cursor-Aussehen im Editor wechseln',
    },
  },
  slashCommand: {
    openGuide: {
      title: 'Tastenkürzel-Referenz',
      description: 'Referenzpanel für Tastenkürzel und Aktionen öffnen',
    },
  },
  welcome: {
    hint: 'Häufige Tastenkürzel',
    more: 'Slash-Menü für Überschriften, Listen, Trennlinien und mehr',
  },
} as const

export default commandGuide
