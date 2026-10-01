import type { ResolvedEditOperation } from "@/lib/http/modules/editor.schema";

export interface DiffHunk {
  /** 取首个编辑操作的 id，作为文档节点与审阅状态的键。 */
  id: string;
  operationIds: string[];
  /** 原文中被替换的段落区间 [fromLine, toLine)；两者相等表示在该位置纯插入。 */
  fromLine: number;
  toLine: number;
  removedLines: string[];
  addedLines: string[];
}

interface OperationGroup {
  operations: ResolvedEditOperation[];
  fromLine: number;
  toLine: number;
}

/**
 * 把字符偏移上的编辑操作换算成段落级差异块（正文每行一个段落）。
 * 落在同一段落里的操作合并为一块，首尾未变化的段落会被裁掉。
 */
export function buildDiffHunks(text: string, operations: ResolvedEditOperation[]): DiffHunk[] {
  const lines = text.split("\n");
  const lineStarts: number[] = [];
  let offset = 0;
  for (const line of lines) {
    lineStarts.push(offset);
    offset += line.length + 1;
  }
  const lineAt = (position: number) => lineStarts.findLastIndex((start) => start <= position);

  const groups: OperationGroup[] = [];
  for (const operation of operations.toSorted((left, right) => left.start - right.start)) {
    const fromLine = lineAt(operation.start);
    const toLine = lineAt(operation.end) + 1;
    const previous = groups.at(-1);
    if (previous && fromLine < previous.toLine) {
      previous.operations.push(operation);
      previous.toLine = Math.max(previous.toLine, toLine);
    } else {
      groups.push({ operations: [operation], fromLine, toLine });
    }
  }

  return groups.flatMap((group) => {
    const base = lineStarts[group.fromLine];
    const original = lines.slice(group.fromLine, group.toLine).join("\n");
    const revised = group.operations.reduceRight(
      (result, operation) =>
        `${result.slice(0, operation.start - base)}${operation.newText}${result.slice(operation.end - base)}`,
      original,
    );
    const removedLines = original.split("\n");
    const addedLines = revised.split("\n");
    let { fromLine, toLine } = group;
    while (removedLines.length && addedLines.length && removedLines[0] === addedLines[0]) {
      removedLines.shift();
      addedLines.shift();
      fromLine += 1;
    }
    while (removedLines.length && addedLines.length && removedLines.at(-1) === addedLines.at(-1)) {
      removedLines.pop();
      addedLines.pop();
      toLine -= 1;
    }
    if (!removedLines.length && !addedLines.length) return [];
    return [
      {
        id: group.operations[0].id,
        operationIds: group.operations.map((operation) => operation.id),
        fromLine,
        toLine,
        removedLines,
        addedLines,
      },
    ];
  });
}
