"use client";

import { cn } from "cn";
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getErrorMessage } from "@/lib/http/error";

import { useProposalReview } from "./proposal-review-context";

function DiffLine({ kind, text }: { kind: "removed" | "added"; text: string }) {
  const t = useTranslations("chapterEditor.review");

  return (
    <p
      className={cn(
        "relative -mx-2 w-fit max-w-full rounded-sm px-2",
        kind === "removed" ? "bg-destructive/10" : "bg-accent/20",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-0 -left-4 font-sans select-none",
          kind === "removed" ? "text-destructive" : "text-accent-foreground",
        )}
      >
        {kind === "removed" ? "−" : "+"}
      </span>
      <span className="sr-only">{t(kind)}</span>
      {text || "\u00A0"}
    </p>
  );
}

function ReviewToolbar() {
  const t = useTranslations("chapterEditor.review");
  const review = useProposalReview();
  const single = review.hunks.length < 2;

  return (
    <div
      role="toolbar"
      aria-label={t("title")}
      className="flex shrink-0 items-center gap-1 rounded-lg border bg-popover p-1 font-sans text-popover-foreground shadow-md"
    >
      <Button
        type="button"
        size="sm"
        disabled={review.busy}
        onClick={review.itemized ? () => review.decide("accepted") : review.acceptAll}
      >
        <CheckIcon />
        {t("accept")}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={review.busy}
        onClick={review.itemized ? () => review.decide("rejected") : review.rejectAll}
      >
        <XIcon />
        {t("reject")}
      </Button>
      <Button
        type="button"
        variant={review.itemized ? "secondary" : "outline"}
        size="sm"
        aria-pressed={review.itemized}
        disabled={review.busy}
        onClick={review.toggleItemized}
      >
        {t("itemized")}
      </Button>
      <Separator orientation="vertical" />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={t("previous")}
        disabled={single}
        onClick={() => review.step(-1)}
      >
        <ChevronLeftIcon />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={t("next")}
        disabled={single}
        onClick={() => review.step(1)}
      >
        <ChevronRightIcon />
      </Button>
    </div>
  );
}

export function ReviewDiff({ hunkId }: { hunkId: string }) {
  const review = useProposalReview();
  const containerRef = useRef<HTMLDivElement>(null);
  const hunk = review.hunks.find((item) => item.id === hunkId);
  const active = review.activeHunkId === hunkId;
  const decision = review.decisions[hunkId];

  useEffect(() => {
    if (active) containerRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [active]);

  if (!hunk) return null;

  return (
    <div ref={containerRef} className="flex items-center gap-4">
      <div className={cn("flex min-w-0 flex-1 flex-col gap-1", decision && "opacity-60")}>
        {decision === "accepted"
          ? null
          : hunk.removedLines.map((line, index) => (
              <DiffLine key={`removed-${index}`} kind="removed" text={line} />
            ))}
        {decision === "rejected"
          ? null
          : hunk.addedLines.map((line, index) => (
              <DiffLine key={`added-${index}`} kind="added" text={line} />
            ))}
        {active && review.error ? (
          <p className="font-sans text-xs text-destructive">{getErrorMessage(review.error)}</p>
        ) : null}
      </div>
      {active ? <ReviewToolbar /> : null}
    </div>
  );
}
