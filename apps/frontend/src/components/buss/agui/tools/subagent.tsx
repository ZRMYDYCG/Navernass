"use client";

import { BotIcon, ShieldCheckIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type { z } from "zod";

import {
  delegateSubagentInputSchema,
  delegateSubagentOutputSchema,
  validateContinuityInputSchema,
  validateContinuityOutputSchema,
} from "@/schemas/agent-tool.schema";

import { StreamText } from "../stream-text";
import { ToolExcerpt, ToolField, ToolMarkdown } from "../tool-shell";
import { defineTool, toolPhase, type ToolProps } from "./define";

type ValidateProps = ToolProps<
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

export const validateContinuity = defineTool({
  icon: ShieldCheckIcon,
  input: validateContinuityInputSchema,
  output: validateContinuityOutputSchema,
  summary: (_, { input }) => input?.focus,
  Detail: ValidateDetail,
});

type DelegateProps = ToolProps<
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

export const delegateSubagent = defineTool({
  icon: BotIcon,
  input: delegateSubagentInputSchema,
  output: delegateSubagentOutputSchema,
  title: (t, { call, input }) =>
    input
      ? t(`tools.delegateSubagent.${toolPhase(call)}`, { role: t(`subagent.${input.role}`) })
      : t(`tools.delegateSubagent.pending`),
  summary: (_, { input }) => input?.task,
  Detail: DelegateDetail,
});
