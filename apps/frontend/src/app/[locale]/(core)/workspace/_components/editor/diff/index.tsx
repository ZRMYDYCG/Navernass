import { diffArrays, diffChars } from "diff";
import { CheckIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { cn } from "cn";

import { Button } from "@/components/ui/button";

interface DiffProps {
  before: string;
  after: string;
  /** 每处修订都处理完后回传最终正文。 */
  onResolve: (text: string) => void;
}

type Segment =
  | { kind: "same"; lines: string[] }
  | { kind: "change"; removed: string[]; added: string[] };

type Decision = "accept" | "reject";

/** 修订模式：正文照常排版，改动以页边竖线、删除线和插入底色标出，逐处接受或拒绝。 */
export function Diff({ before, after, onResolve }: DiffProps) {
  const t = useTranslations("chapterEditor.revisions");
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
      <div className="sticky top-0 z-10 flex h-11 items-center gap-1 border-b border-border bg-background/95 px-3">
        <span className="px-2 text-sm text-muted-foreground">
          {t("pending", { count: pending })}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <Button type="button" variant="ghost" size="sm" onClick={() => decideAll("reject")}>
            {t("rejectAll")}
          </Button>
          <Button type="button" size="sm" onClick={() => decideAll("accept")}>
            {t("acceptAll")}
          </Button>
        </div>
      </div>
      <div className="mx-auto w-full max-w-3xl px-12 py-14 text-base leading-8">
        {segments.map((segment, index) =>
          segment.kind === "same" ? (
            <Paragraphs key={index} lines={segment.lines} />
          ) : (
            <Revision
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

function Revision({
  segment,
  decision,
  onDecide,
}: {
  segment: Extract<Segment, { kind: "change" }>;
  decision: Decision | undefined;
  onDecide: (decision: Decision) => void;
}) {
  const t = useTranslations("chapterEditor.revisions");
  if (decision || !hasText(segment)) {
    return <Paragraphs lines={decision === "reject" ? segment.removed : segment.added} />;
  }

  const removed = segment.removed.filter((line) => line.trim());
  const addedCount = segment.added.filter((line) => line.trim()).length;
  // 段落数一致时逐段合并成一段，字级标出增删；否则是整段增删，原文整段划掉。
  const paired = removed.length === addedCount;
  let pairIndex = 0;

  return (
    <div className="relative before:absolute before:inset-y-1 before:-left-6 before:w-0.5 before:rounded-full before:bg-primary/30">
      {paired ? (
        segment.added.map((line, index) => {
          if (!line.trim()) return <p key={index} className="mb-3 min-h-8" />;
          const original = removed[pairIndex++] ?? "";
          return (
            <p key={index} className="mb-3 whitespace-pre-wrap">
              {diffChars(original, line).map((part, partIndex) => (
                <span
                  key={partIndex}
                  className={cn(
                    part.removed && "text-muted-foreground line-through decoration-destructive/60",
                    part.added &&
                      "rounded-sm bg-accent underline decoration-primary/30 underline-offset-4",
                  )}
                >
                  {part.value}
                </span>
              ))}
            </p>
          );
        })
      ) : (
        <>
          {removed.map((line, index) => (
            <p
              key={index}
              className="mb-3 whitespace-pre-wrap text-muted-foreground line-through decoration-destructive/60"
            >
              {line}
            </p>
          ))}
          <Paragraphs lines={segment.added} />
        </>
      )}
      <div className="absolute top-1 -right-10 flex flex-col gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          title={t("accept")}
          aria-label={t("accept")}
          onClick={() => onDecide("accept")}
        >
          <CheckIcon />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          title={t("reject")}
          aria-label={t("reject")}
          onClick={() => onDecide("reject")}
        >
          <XIcon />
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

/** 只改了空行的地方不需要审阅，默认接受。 */
function hasText(segment: Extract<Segment, { kind: "change" }>) {
  return [...segment.removed, ...segment.added].some((line) => line.trim());
}

function composeText(segments: Segment[], decisions: Record<number, Decision>) {
  return segments
    .flatMap((segment, index) => {
      if (segment.kind === "same") return segment.lines;
      return decisions[index] === "reject" ? segment.removed : segment.added;
    })
    .join("\n");
}
