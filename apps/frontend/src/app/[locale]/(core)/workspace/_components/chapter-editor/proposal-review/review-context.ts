import { createContext, use } from "react";

import type { DiffHunk } from "./diff-hunks";

export type HunkDecision = "accepted" | "rejected";

export interface ProposalReviewState {
  hunks: DiffHunk[];
  activeHunkId: string;
  /** 逐项审阅：接受/拒绝只作用于当前差异块，全部定夺后一次性提交。 */
  itemized: boolean;
  decisions: Partial<Record<string, HunkDecision>>;
  busy: boolean;
  error: Error | null;
  acceptAll: () => void;
  rejectAll: () => void;
  decide: (decision: HunkDecision) => void;
  toggleItemized: () => void;
  step: (delta: 1 | -1) => void;
}

/** 差异块由 Lexical 以装饰器渲染，通过 Context 共享审阅会话状态。 */
export const ProposalReviewContext = createContext<ProposalReviewState | null>(null);

export function useProposalReview() {
  const review = use(ProposalReviewContext);
  if (!review) throw new Error("useProposalReview 必须在 ProposalReview 内使用");
  return review;
}
