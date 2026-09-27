import { $createParagraphNode, $createTextNode, $getRoot } from "lexical";

/**
 * 正文以纯文本落库，每行对应一个段落。Agent 的 diff 与字符偏移都基于这份纯文本，
 * 因此读写必须严格互逆，不能借用 `$getRoot().getTextContent()`（它用空行分隔段落）。
 */

export function $createTextParagraph(line: string) {
  const paragraph = $createParagraphNode();
  if (line) paragraph.append($createTextNode(line));
  return paragraph;
}

export function $setPlainText(text: string) {
  const root = $getRoot().clear();
  for (const line of text.split(/\r?\n/u)) root.append($createTextParagraph(line));
}

export function $getPlainText() {
  return $getRoot()
    .getChildren()
    .map((block) => block.getTextContent())
    .join("\n");
}
