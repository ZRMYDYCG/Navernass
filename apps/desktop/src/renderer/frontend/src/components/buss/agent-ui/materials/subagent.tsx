"use client";

import { BotIcon, ShieldCheckIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type { z } from "zod";

import {
  delegateSubagentInputSchema,
  delegateSubagentOutputSchema,
  validateContinuityInputSchema,
  validateContinuityOutputSchema,
} from "@/lib/http/modules/agent-tool.schema";

import {
  defineMaterial,
  ToolExcerpt,
  ToolField,
  ToolMarkdown,
  toolPhase,
  type MaterialContext,
} from "../protocol";
import { StreamText } from "../stream-text";

type ValidateProps = MaterialContext<
  z.infer<typeof validateContinuityInputSchema>,
  z.infer<typeof validateContinuityOutputSchema>
>;

function ValidateDetail({ input, output }: ValidateProps) {
  const t = useTranslations("agui.detail");
  return (
    <>
      {input ? (
        <ToolField label={t("reviewText")}>
          <ToolExcerpt>{input.text}</ToolExcerpt>
        </ToolField>
      ) : null}
      {output ? (
        <ToolField label={t("report")}>
          <ToolMarkdown>
            <StreamText text={output.report} />
          </ToolMarkdown>
        </ToolField>
      ) : null}
    </>
  );
}

const validateContinuity = defineMaterial({
  tool: "validateContinuity",
  icon: ShieldCheckIcon,
  input: validateContinuityInputSchema,
  output: validateContinuityOutputSchema,
  summary: (_, { input }) => input?.focus,
  detail: ValidateDetail,
});

type DelegateProps = MaterialContext<
  z.infer<typeof delegateSubagentInputSchema>,
  z.infer<typeof delegateSubagentOutputSchema>
>;

function DelegateDetail({ input, output }: DelegateProps) {
  const t = useTranslations("agui.detail");
  return (
    <>
      {input ? (
        <ToolField label={t("task")}>
          <ToolExcerpt>{input.task}</ToolExcerpt>
        </ToolField>
      ) : null}
      {output ? (
        <ToolField label={t("result")}>
          <ToolMarkdown>
            <StreamText text={output.result} />
          </ToolMarkdown>
        </ToolField>
      ) : null}
    </>
  );
}

const delegateSubagent = defineMaterial({
  tool: "delegateSubagent",
  icon: BotIcon,
  input: delegateSubagentInputSchema,
  output: delegateSubagentOutputSchema,
  title: (t, { call, input }) =>
    input
      ? t(`tools.delegateSubagent.${toolPhase(call)}`, { role: t(`subagent.${input.role}`) })
      : t(`tools.delegateSubagent.pending`),
  summary: (_, { input }) => input?.task,
  detail: DelegateDetail,
});

export default [validateContinuity, delegateSubagent];
