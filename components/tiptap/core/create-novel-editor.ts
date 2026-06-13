import type { Extensions } from '@tiptap/core'
import CharacterCount from '@tiptap/extension-character-count'
import { Color } from '@tiptap/extension-color'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import Underline from '@tiptap/extension-underline'
import StarterKit from '@tiptap/starter-kit'
import { AIAutocomplete } from '@/components/tiptap/extensions/ai/ai-autocomplete'
import { SuggestionAdd, SuggestionDel } from '@/components/tiptap/extensions/ai/suggestion-track'
import { CharacterHighlight } from '@/components/tiptap/extensions/character/character-highlight'
import { CharacterNameSuggest } from '@/components/tiptap/extensions/character/character-name-suggest'
import { EditorSearch } from '@/components/tiptap/extensions/novel/editor-search'
import { SearchHighlight } from '@/components/tiptap/extensions/novel/search-highlight'
import { SlashCommand } from '@/components/tiptap/extensions/novel/slash-command'
import type { NovelEditorMode } from './types'

type TFunctionLike = (key: string, options?: Record<string, unknown>) => string

export interface CreateNovelEditorExtensionsOptions {
  mode: NovelEditorMode
  placeholder: string
  t: TFunctionLike
  enableAi?: boolean
}

const IMAGE_HTML_ATTRIBUTES = {
  class: 'my-4 rounded-md max-w-full h-auto',
  loading: 'lazy',
  decoding: 'async',
} as const

export function createNovelEditorExtensions({
  mode,
  placeholder,
  t,
  enableAi = mode !== 'lite',
}: CreateNovelEditorExtensionsOptions): Extensions {
  const headingLevels = mode === 'lite' ? [1, 2, 3] as const : [1, 2, 3, 4, 5, 6] as const

  const base: Extensions = [
    StarterKit.configure({
      heading: { levels: [...headingLevels] },
    }),
    Placeholder.configure({ placeholder }),
    CharacterCount,
    Underline,
  ]

  if (mode === 'lite') {
    return base
  }

  const rich: Extensions = [
    ...base,
    Image.configure({ HTMLAttributes: IMAGE_HTML_ATTRIBUTES }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    TextStyle,
    Color,
    SearchHighlight,
    EditorSearch,
    SlashCommand.configure({ t }),
  ]

  if (enableAi) {
    rich.push(
      SuggestionAdd,
      SuggestionDel,
      AIAutocomplete.configure({
        trigger: '++',
        debounceDelay: 500,
        t,
      }),
    )
  }

  if (mode === 'chapter') {
    rich.push(CharacterHighlight, CharacterNameSuggest)
  }

  return rich
}

export const PROSE_MIRROR_CLASS
  = 'prose dark:prose-invert prose-gray max-w-none focus:outline-none min-h-full'
