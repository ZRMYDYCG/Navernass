import type { AskUserInput, AskUserOutput } from "./agent.schema.js";
import { AppError } from "../common/app-error.js";
import { askUserInput, askUserOutput } from "./agent.schema.js";

export const askUserPartType = "tool-askUser";

interface AskUserPart {
  type: typeof askUserPartType;
  toolCallId: string;
  state: string;
  input?: unknown;
  output?: unknown;
}

function isAskUserPart(part: unknown): part is AskUserPart {
  return (
    typeof part === "object" &&
    part !== null &&
    "type" in part &&
    part.type === askUserPartType &&
    "toolCallId" in part &&
    typeof part.toolCallId === "string"
  );
}

function partsOf(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function pendingAskUserCalls(parts: unknown) {
  return partsOf(parts).filter(
    (part): part is AskUserPart => isAskUserPart(part) && part.state === "input-available",
  );
}

/** 把指定 askUser 调用补上结果，返回新的 parts；toolCallId 不存在或已有结果时返回 undefined。 */
export function resolveAskUser(parts: unknown, toolCallId: string, output: AskUserOutput) {
  const list = partsOf(parts);
  const index = list.findIndex(
    (part) =>
      isAskUserPart(part) && part.toolCallId === toolCallId && part.state === "input-available",
  );
  if (index < 0) return undefined;
  const next = [...list];
  next[index] = { ...(list[index] as AskUserPart), state: "output-available", output };
  return next;
}

export function skipAllAskUser(parts: unknown) {
  return partsOf(parts).map((part) =>
    isAskUserPart(part) && part.state === "input-available"
      ? {
          ...part,
          state: "output-available",
          output: { status: "skipped", reason: "user_sent_message" },
        }
      : part,
  );
}

export function assertValidAnswer(input: unknown, output: AskUserOutput) {
  if (output.status === "skipped") return;
  const definition = askUserInput.parse(input);
  const questions = new Map(definition.questions.map((question) => [question.id, question]));
  for (const answer of output.answers) {
    const question = questions.get(answer.questionId);
    if (!question) throw new AppError("BAD_REQUEST", `未知问题：${answer.questionId}`);
    if (!answer.selected.length && !answer.other)
      throw new AppError("BAD_REQUEST", `问题 ${answer.questionId} 没有回答`);
    if (!question.allowMultiple && answer.selected.length + (answer.other ? 1 : 0) > 1)
      throw new AppError("BAD_REQUEST", `问题 ${answer.questionId} 只能选择一项`);
    const allowed = new Set(question.options.map((option) => option.id));
    if (answer.selected.some((id) => !allowed.has(id)))
      throw new AppError("BAD_REQUEST", `问题 ${answer.questionId} 包含无效选项`);
  }
}

function describeAnswer(definition: AskUserInput, output: AskUserOutput) {
  if (output.status === "skipped") return "用户跳过了提问";
  return output.answers
    .map((answer) => {
      const question = definition.questions.find((item) => item.id === answer.questionId);
      const labels = answer.selected.map(
        (id) => question?.options.find((option) => option.id === id)?.label ?? id,
      );
      if (answer.other) labels.push(answer.other);
      return `${question?.prompt ?? answer.questionId} → ${labels.join("、")}`;
    })
    .join("；");
}

/** 聊天历史按纯文本注入上下文，askUser 的问答需要显式渲染，否则后续轮次看不到。 */
export function describeAskUserParts(parts: unknown) {
  return partsOf(parts)
    .filter(isAskUserPart)
    .map((part) => {
      const definition = askUserInput.safeParse(part.input);
      if (!definition.success) return "";
      const questions = definition.data.questions
        .map(
          (question) =>
            `${question.prompt}（${question.options.map((option) => option.label).join(" / ")}）`,
        )
        .join("；");
      const output = askUserOutput.safeParse(part.output);
      const answer = output.success ? describeAnswer(definition.data, output.data) : "尚未回答";
      return `[向用户提问] ${questions}\n[用户回答] ${answer}`;
    })
    .filter(Boolean)
    .join("\n");
}
