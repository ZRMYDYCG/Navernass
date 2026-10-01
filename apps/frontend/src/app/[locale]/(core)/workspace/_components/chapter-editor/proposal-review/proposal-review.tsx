"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { useApplyEdit, useRejectEdit } from "@/hooks/editor/queries";
import type { ChapterEdit } from "@/lib/http/modules/editor.schema";

import { ManuscriptEditor } from "../manuscript-editor/manuscript-editor";
import { buildDiffHunks } from "./build-diff-hunks";
import {
  ProposalReviewContext,
  type HunkDecision,
  type ProposalReviewState,
} from "./proposal-review-context";
import { $setReviewDocument, ProposalReviewExtension } from "./review-document";

interface ProposalReviewProps {
  edit: ChapterEdit;
  /** 提案基于的原文，即 `edit.base_revision` 对应的章节正文。 */
  text: string;
}

/** 只读审阅会话，按提案挂载（以提案 id 为 `key`）；应用或拒绝后由父组件切回可编辑的正文。 */
export function ProposalReview({ edit, text }: ProposalReviewProps) {
  const t = useTranslations("chapterEditor");
  const baseText = edit.original_content ?? text;
  const [hunks] = useState(() => buildDiffHunks(baseText, edit.operations));
  const apply = useApplyEdit(edit.id);
  const reject = useRejectEdit(edit.id);
  const [activeIndex, setActiveIndex] = useState(0);
  const [itemized, setItemized] = useState(false);
  const [decisions, setDecisions] = useState<ProposalReviewState["decisions"]>({});

  const decide = (decision: HunkDecision) => {
    const next = { ...decisions, [hunks[activeIndex].id]: decision };
    setDecisions(next);
    const undecidedIndex = hunks.findIndex((hunk) => !next[hunk.id]);
    if (undecidedIndex >= 0) {
      setActiveIndex(undecidedIndex);
      return;
    }
    const acceptedIds = hunks
      .filter((hunk) => next[hunk.id] === "accepted")
      .flatMap((hunk) => hunk.operationIds);
    if (acceptedIds.length) apply.mutate(acceptedIds);
    else reject.mutate();
  };

  const review: ProposalReviewState = {
    hunks,
    activeHunkId: hunks[activeIndex].id,
    itemized,
    decisions,
    // 成功后要等父组件卸载本会话，期间继续锁定操作，避免重复提交。
    busy: [apply, reject].some((mutation) => mutation.isPending || mutation.isSuccess),
    error: apply.error ?? reject.error,
    acceptAll: () => apply.mutate(edit.operations.map((operation) => operation.id)),
    rejectAll: () => reject.mutate(),
    decide,
    toggleItemized: () => {
      setItemized((value) => !value);
      setDecisions({});
    },
    step: (delta) => setActiveIndex((index) => (index + delta + hunks.length) % hunks.length),
  };

  return (
    <ProposalReviewContext value={review}>
      <ManuscriptEditor
        editable={false}
        extensions={[ProposalReviewExtension]}
        placeholder={t("placeholder")}
        $initialContent={() => $setReviewDocument(baseText, hunks)}
      />
    </ProposalReviewContext>
  );
}
