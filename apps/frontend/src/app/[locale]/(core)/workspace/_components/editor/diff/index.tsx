import { diffArrays, diffChars } from "diff";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { cn } from "cn";

import { Button } from "@/components/ui/button";

interface DiffProps {
  before: string;
  after: string;
  /** 每处修改都处理完后回传最终正文。 */
  onResolve: (text: string) => void;
}

type Segment =
  | { kind: "same"; lines: string[] }
  | { kind: "change"; removed: string[]; added: string[] };

type Decision = "keep" | "revert";

/** 正文内审阅 Agent 的改写：逐处保留或撤销，段落内精确到字。 */
export function Diff({ before, after, onResolve }: DiffProps) {
  const t = useTranslations("chapterEditor.agentDiff");
  const segments = useMemo(() => buildSegments(before, after), [before, after]);
  const [decisions, setDecisions] = useState<Record<number, Decision>>({});
  const reviewable = segments.flatMap((segment, index) =>
    segment.kind === "change" && hasText(segment) ? [index] : [],
  );
  const pending = reviewable.filter((index) => !decisions[index]).length;

  function decide(next: Record<number, Decision>) {
    if (reviewable.every((index) => next[index])) onResolve(composeText(segments, next));
    else setDecisions(next);
  }

  function decideAll(decision: Decision) {
    decide(Object.fromEntries(reviewable.map((index) => [index, decision])));
  }

  return (
    <>
      <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-border bg-background px-4 py-2">
        <span className="text-xs text-muted-foreground">
          {t("summary", { count: reviewable.length, pending })}
        </span>
        <div className="flex gap-1">
          <Button type="button" variant="ghost" size="sm" onClick={() => decideAll("revert")}>
            {t("revertAll")}
          </Button>
          <Button type="button" size="sm" onClick={() => decideAll("keep")}>
            {t("keepAll")}
          </Button>
        </div>
      </div>
      <div className="mx-auto w-full max-w-3xl px-12 py-14 text-base leading-8">
        {segments.map((segment, index) =>
          segment.kind === "same" ? (
            <Paragraphs key={index} lines={segment.lines} />
          ) : (
            <Hunk
              key={index}
              segment={segment}
              decision={decisions[index]}
              onDecide={(decision) => decide({ ...decisions, [index]: decision })}
            />
          ),
        )}
      </div>
    </>
  );
}

function Hunk({
  segment,
  decision,
  onDecide,
}: {
  segment: Extract<Segment, { kind: "change" }>;
  decision: Decision | undefined;
  onDecide: (decision: Decision) => void;
}) {
  const t = useTranslations("chapterEditor.agentDiff");
  if (decision || !hasText(segment)) {
    return <Paragraphs lines={decision === "revert" ? segment.removed : segment.added} />;
  }

  const removed = segment.removed.filter((line) => line.trim());
  const added = segment.added.filter((line) => line.trim());
  // 行数一致时按位置配对做字级比对；否则多半是整段增删，按整行展示。
  const paired = removed.length === added.length;

  return (
    <div className="mb-3 overflow-hidden rounded-md border border-border">
      {removed.map((line, index) => (
        <p
          key={`removed-${index}`}
          className="bg-destructive/10 px-3 whitespace-pre-wrap text-destructive"
        >
          {paired
            ? diffChars(line, added[index] ?? "")
                .filter((part) => !part.added)
                .map((part, partIndex) => (
                  <span
                    key={partIndex}
                    className={cn(part.removed && "bg-destructive/20 line-through")}
                  >
                    {part.value}
                  </span>
                ))
            : line}
        </p>
      ))}
      {added.map((line, index) => (
        <p
          key={`added-${index}`}
          className="bg-accent px-3 whitespace-pre-wrap text-accent-foreground"
        >
          {paired
            ? diffChars(removed[index] ?? "", line)
                .filter((part) => !part.removed)
                .map((part, partIndex) => (
                  <span
                    key={partIndex}
                    className={cn(part.added && "rounded-sm bg-primary/15 font-medium")}
                  >
                    {part.value}
                  </span>
                ))
            : line}
        </p>
      ))}
      <div className="flex justify-end gap-1 bg-muted/30 px-2 py-1">
        <Button type="button" variant="ghost" size="xs" onClick={() => onDecide("revert")}>
          {t("revert")}
        </Button>
        <Button type="button" variant="secondary" size="xs" onClick={() => onDecide("keep")}>
          {t("keep")}
        </Button>
      </div>
    </div>
  );
}

function Paragraphs({ lines }: { lines: string[] }) {
  return lines.map((line, index) => (
    <p key={index} className="mb-3 min-h-8 whitespace-pre-wrap">
      {line}
    </p>
  ));
}

function buildSegments(before: string, after: string): Segment[] {
  const segments: Segment[] = [];
  for (const change of diffArrays(before.split("\n"), after.split("\n"))) {
    if (!change.added && !change.removed) {
      segments.push({ kind: "same", lines: change.value });
      continue;
    }
    let last = segments.at(-1);
    if (last?.kind !== "change") {
      last = { kind: "change", removed: [], added: [] };
      segments.push(last);
    }
    (change.added ? last.added : last.removed).push(...change.value);
  }
  return segments;
}

/** 只改了空行的地方不需要审阅，默认保留。 */
function hasText(segment: Extract<Segment, { kind: "change" }>) {
  return [...segment.removed, ...segment.added].some((line) => line.trim());
}

function composeText(segments: Segment[], decisions: Record<number, Decision>) {
  return segments
    .flatMap((segment, index) => {
      if (segment.kind === "same") return segment.lines;
      return decisions[index] === "revert" ? segment.removed : segment.added;
    })
    .join("\n");
}
