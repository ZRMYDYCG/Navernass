/** 与后端 LibraryService 的 countWords 保持一致，否则保存前后的字数会跳变。 */
export function countWords(text: string) {
  return text.replace(/\s+/gu, "").length;
}
