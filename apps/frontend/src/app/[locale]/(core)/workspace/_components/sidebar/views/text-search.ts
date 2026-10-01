export interface SearchOptions {
  matchCase: boolean;
  wholeWord: boolean;
}

export interface TextMatch {
  /** 正文按换行拆分后的行号，与编辑器的段落一一对应。 */
  line: number;
  before: string;
  match: string;
  after: string;
}

const contextBefore = 16;
const contextAfter = 60;

export function buildSearchPattern(keyword: string, { matchCase, wholeWord }: SearchOptions) {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  // `\b` 只认 ASCII，这里用 Unicode 字母数字判断词边界。
  const source = wholeWord ? `(?<![\\p{L}\\p{N}_])${escaped}(?![\\p{L}\\p{N}_])` : escaped;
  return new RegExp(source, matchCase ? "gu" : "giu");
}

export function findMatches(text: string, pattern: RegExp): TextMatch[] {
  const matches: TextMatch[] = [];
  text.split(/\r?\n/u).forEach((line, index) => {
    for (const found of line.matchAll(pattern)) {
      const start = found.index;
      const end = start + found[0].length;
      const clipped = start > contextBefore;
      matches.push({
        line: index,
        before: `${clipped ? "…" : ""}${line.slice(clipped ? start - contextBefore : 0, start).trimStart()}`,
        match: found[0],
        after: line.slice(end, end + contextAfter),
      });
    }
  });
  return matches;
}
