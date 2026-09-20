import type { NovelEditorStats } from '@/components/tiptap/core/types'

export function calculateEditorStats(text: string): NovelEditorStats {
  const characters = text.length
  const chineseChars = (text.match(/[\u4E00-\u9FA5]/g) || []).length
  const englishWords = (text.match(/[a-z]+/gi) || []).length
  const words = chineseChars + englishWords
  return { words, characters }
}
