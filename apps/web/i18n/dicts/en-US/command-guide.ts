const commandGuide = {
  title: 'Shortcuts & Reference',
  description: 'Keyboard shortcuts, input triggers, and interface actions while editing.',
  openButton: 'Shortcuts',
  viewAll: 'View full reference',
  footerHint: 'Press Ctrl+/ (⌘/ on Mac) to open this panel anytime.',
  tabs: {
    shortcuts: 'Shortcuts',
    input: 'Quick Insert',
    editing: 'Interface',
  },
  sections: {
    workspace: {
      title: 'Workspace',
      description: 'Panels, save, and navigation',
    },
    editorShortcuts: {
      title: 'Editing',
      description: 'Common shortcuts in chapter content',
    },
    inputTriggers: {
      title: 'Quick Input',
      description: 'Type these characters in the document',
    },
    slashFormat: {
      title: 'Slash Menu',
      description: 'Type / to insert headings, lists, quotes, and dividers',
    },
    editingUi: {
      title: 'Selection & Paragraphs',
      description: 'Actions via mouse or text selection',
    },
    bottomBar: {
      title: 'Bottom Toolbar',
      description: 'Surface and typography in the status bar',
    },
  },
  items: {
    save: {
      label: 'Save',
      description: 'Save the current chapter or plan document',
    },
    toggleLeftPanel: {
      label: 'Toggle left panel',
      description: 'Show or hide the chapter list and side panels',
    },
    toggleRightPanel: {
      label: 'Toggle right panel',
      description: 'Show or hide the right auxiliary panel',
    },
    immersiveMode: {
      label: 'Immersive mode',
      description: 'Hide header and sidebars for a larger writing area',
    },
    openGuide: {
      label: 'Open this reference',
      description: 'View all shortcuts and actions',
    },
    chapterSearch: {
      label: 'Go to chapter',
      description: 'Click the title bar to search and switch chapters',
    },
    findInChapter: {
      label: 'Find',
      description: 'Search text in the current chapter',
    },
    undo: {
      label: 'Undo',
      description: 'Undo the last edit',
    },
    redo: {
      label: 'Redo',
      description: 'Redo a previously undone edit',
    },
    bold: {
      label: 'Bold',
      description: 'Bold the selected text',
    },
    italic: {
      label: 'Italic',
      description: 'Italicize the selected text',
    },
    underline: {
      label: 'Underline',
      description: 'Underline the selected text',
    },
    slashMenu: {
      label: 'Open insert menu',
      description: 'Type / in a paragraph to choose content or formatting to insert',
    },
    selectTextToolbar: {
      label: 'Floating format bar',
      description: 'Select text to show a bar for bold, italic, and underline',
    },
    dragHandle: {
      label: 'Drag paragraphs',
      description: 'Hover the left handle to reorder paragraphs',
    },
    characterNameSuggest: {
      label: 'Character name suggestions',
      description: 'Suggest and highlight existing character names as you type',
    },
    bottomSurface: {
      label: 'Surface style',
      description: 'Switch paper backgrounds such as plain, mist, or aged parchment',
    },
    bottomTypography: {
      label: 'Typography',
      description: 'First-line indent, line height, column width, ruled lines, paragraph focus',
    },
    bottomCursor: {
      label: 'Cursor style',
      description: 'Change the cursor appearance in the editor',
    },
  },
  slashCommand: {
    openGuide: {
      title: 'View shortcuts reference',
      description: 'Open the shortcuts and actions reference panel',
    },
  },
  welcome: {
    hint: 'Common shortcuts',
    more: 'The slash menu inserts headings, lists, dividers, and more',
  },
} as const

export default commandGuide
