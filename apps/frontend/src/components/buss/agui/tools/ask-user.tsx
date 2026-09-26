"use client";

import { MessageCircleQuestionMarkIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  askUserInputSchema,
  askUserOutputSchema,
  type AskUserInput,
  type AskUserOutput,
} from "@/schemas/agent.schema";

import { defineTool, type ToolProps } from "./define";

function answerOf(question: AskUserInput["questions"][number], output: AskUserOutput | undefined) {
  if (output?.status !== "answered") return undefined;
  const answer = output.answers.find((item) => item.questionId === question.id);
  if (!answer) return undefined;
  const labels = answer.selected.map(
    (id) => question.options.find((option) => option.id === id)?.label ?? id,
  );
  if (answer.other) labels.push(answer.other);
  return labels.join("、");
}

function AskUserDetail({ input, output }: ToolProps<AskUserInput, AskUserOutput>) {
  const t = useTranslations("agui.tools.askUser");
  if (!input) return null;
  return (
    <ol className="flex flex-col gap-2">
      {input.questions.map((question, index) => (
        <li key={question.id} className="flex flex-col gap-0.5">
          <span>
            {index + 1}. {question.prompt}
          </span>
          <span className="text-muted-foreground/70">
            {answerOf(question, output) ?? t("noAnswer")}
          </span>
        </li>
      ))}
    </ol>
  );
}

export const askUser = defineTool({
  icon: MessageCircleQuestionMarkIcon,
  input: askUserInputSchema,
  output: askUserOutputSchema,
  title: (t, { call, output }) => {
    if (call.status !== "done") return t("tools.askUser.running");
    return output?.status === "answered" ? t("tools.askUser.done") : t("tools.askUser.skipped");
  },
  summary: (_, { input }) => input?.title ?? input?.questions[0]?.prompt,
  Detail: AskUserDetail,
});
