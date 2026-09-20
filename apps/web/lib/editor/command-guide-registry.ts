import type { KeyToken } from './keyboard-labels'

export type CommandGuideTab = 'shortcuts' | 'input' | 'editing'

export interface CommandGuideItemDef {
  id: string
  labelKey: string
  descriptionKey?: string
  keys?: KeyToken[]
  trigger?: string
}

export interface CommandGuideSectionDef {
  id: string
  titleKey: string
  descriptionKey?: string
  tab: CommandGuideTab
  items: CommandGuideItemDef[]
}

export const COMMAND_GUIDE_SECTIONS: CommandGuideSectionDef[] = [
  {
    id: 'workspace',
    titleKey: 'commandGuide.sections.workspace.title',
    descriptionKey: 'commandGuide.sections.workspace.description',
    tab: 'shortcuts',
    items: [
      {
        id: 'save',
        labelKey: 'commandGuide.items.save.label',
        descriptionKey: 'commandGuide.items.save.description',
        keys: ['mod', 'S'],
      },
      {
        id: 'toggle-left-panel',
        labelKey: 'commandGuide.items.toggleLeftPanel.label',
        descriptionKey: 'commandGuide.items.toggleLeftPanel.description',
        keys: ['Ctrl', 'E'],
      },
      {
        id: 'toggle-right-panel',
        labelKey: 'commandGuide.items.toggleRightPanel.label',
        descriptionKey: 'commandGuide.items.toggleRightPanel.description',
        keys: ['Ctrl', 'L'],
      },
      {
        id: 'immersive-mode',
        labelKey: 'commandGuide.items.immersiveMode.label',
        descriptionKey: 'commandGuide.items.immersiveMode.description',
        keys: ['mod', '\\'],
      },
      {
        id: 'open-guide',
        labelKey: 'commandGuide.items.openGuide.label',
        descriptionKey: 'commandGuide.items.openGuide.description',
        keys: ['mod', '/'],
      },
      {
        id: 'chapter-search',
        labelKey: 'commandGuide.items.chapterSearch.label',
        descriptionKey: 'commandGuide.items.chapterSearch.description',
      },
    ],
  },
  {
    id: 'editor-shortcuts',
    titleKey: 'commandGuide.sections.editorShortcuts.title',
    descriptionKey: 'commandGuide.sections.editorShortcuts.description',
    tab: 'shortcuts',
    items: [
      {
        id: 'find-in-chapter',
        labelKey: 'commandGuide.items.findInChapter.label',
        descriptionKey: 'commandGuide.items.findInChapter.description',
        keys: ['mod', 'F'],
      },
      {
        id: 'undo',
        labelKey: 'commandGuide.items.undo.label',
        descriptionKey: 'commandGuide.items.undo.description',
        keys: ['mod', 'Z'],
      },
      {
        id: 'redo',
        labelKey: 'commandGuide.items.redo.label',
        descriptionKey: 'commandGuide.items.redo.description',
        keys: ['mod', 'shift', 'Z'],
      },
      {
        id: 'bold',
        labelKey: 'commandGuide.items.bold.label',
        descriptionKey: 'commandGuide.items.bold.description',
        keys: ['mod', 'B'],
      },
      {
        id: 'italic',
        labelKey: 'commandGuide.items.italic.label',
        descriptionKey: 'commandGuide.items.italic.description',
        keys: ['mod', 'I'],
      },
      {
        id: 'underline',
        labelKey: 'commandGuide.items.underline.label',
        descriptionKey: 'commandGuide.items.underline.description',
        keys: ['mod', 'U'],
      },
    ],
  },
  {
    id: 'input-triggers',
    titleKey: 'commandGuide.sections.inputTriggers.title',
    descriptionKey: 'commandGuide.sections.inputTriggers.description',
    tab: 'input',
    items: [
      {
        id: 'slash-menu',
        labelKey: 'commandGuide.items.slashMenu.label',
        descriptionKey: 'commandGuide.items.slashMenu.description',
        trigger: '/',
      },
    ],
  },
  {
    id: 'slash-format',
    titleKey: 'commandGuide.sections.slashFormat.title',
    descriptionKey: 'commandGuide.sections.slashFormat.description',
    tab: 'input',
    items: [
      {
        id: 'slash-heading1',
        labelKey: 'tiptap.slashCommand.items.heading1.title',
        descriptionKey: 'tiptap.slashCommand.items.heading1.description',
        trigger: '/',
      },
      {
        id: 'slash-heading2',
        labelKey: 'tiptap.slashCommand.items.heading2.title',
        descriptionKey: 'tiptap.slashCommand.items.heading2.description',
        trigger: '/',
      },
      {
        id: 'slash-heading3',
        labelKey: 'tiptap.slashCommand.items.heading3.title',
        descriptionKey: 'tiptap.slashCommand.items.heading3.description',
        trigger: '/',
      },
      {
        id: 'slash-bullet-list',
        labelKey: 'tiptap.slashCommand.items.bulletList.title',
        descriptionKey: 'tiptap.slashCommand.items.bulletList.description',
        trigger: '/',
      },
      {
        id: 'slash-ordered-list',
        labelKey: 'tiptap.slashCommand.items.orderedList.title',
        descriptionKey: 'tiptap.slashCommand.items.orderedList.description',
        trigger: '/',
      },
      {
        id: 'slash-blockquote',
        labelKey: 'tiptap.slashCommand.items.blockquote.title',
        descriptionKey: 'tiptap.slashCommand.items.blockquote.description',
        trigger: '/',
      },
      {
        id: 'slash-code-block',
        labelKey: 'tiptap.slashCommand.items.codeBlock.title',
        descriptionKey: 'tiptap.slashCommand.items.codeBlock.description',
        trigger: '/',
      },
      {
        id: 'slash-scene-break',
        labelKey: 'tiptap.slashCommand.items.sceneBreak.title',
        descriptionKey: 'tiptap.slashCommand.items.sceneBreak.description',
        trigger: '/',
      },
      {
        id: 'slash-divider',
        labelKey: 'tiptap.slashCommand.items.divider.title',
        descriptionKey: 'tiptap.slashCommand.items.divider.description',
        trigger: '/',
      },
      {
        id: 'slash-open-guide',
        labelKey: 'commandGuide.slashCommand.openGuide.title',
        descriptionKey: 'commandGuide.slashCommand.openGuide.description',
        trigger: '/',
      },
    ],
  },
  {
    id: 'editing-ui',
    titleKey: 'commandGuide.sections.editingUi.title',
    descriptionKey: 'commandGuide.sections.editingUi.description',
    tab: 'editing',
    items: [
      {
        id: 'select-text-toolbar',
        labelKey: 'commandGuide.items.selectTextToolbar.label',
        descriptionKey: 'commandGuide.items.selectTextToolbar.description',
      },
      {
        id: 'drag-handle',
        labelKey: 'commandGuide.items.dragHandle.label',
        descriptionKey: 'commandGuide.items.dragHandle.description',
      },
      {
        id: 'character-name-suggest',
        labelKey: 'commandGuide.items.characterNameSuggest.label',
        descriptionKey: 'commandGuide.items.characterNameSuggest.description',
      },
    ],
  },
  {
    id: 'bottom-bar',
    titleKey: 'commandGuide.sections.bottomBar.title',
    descriptionKey: 'commandGuide.sections.bottomBar.description',
    tab: 'editing',
    items: [
      {
        id: 'bottom-surface',
        labelKey: 'commandGuide.items.bottomSurface.label',
        descriptionKey: 'commandGuide.items.bottomSurface.description',
      },
      {
        id: 'bottom-typography',
        labelKey: 'commandGuide.items.bottomTypography.label',
        descriptionKey: 'commandGuide.items.bottomTypography.description',
      },
      {
        id: 'bottom-cursor',
        labelKey: 'commandGuide.items.bottomCursor.label',
        descriptionKey: 'commandGuide.items.bottomCursor.description',
      },
    ],
  },
]

export const COMMAND_GUIDE_TABS: CommandGuideTab[] = ['shortcuts', 'input', 'editing']
