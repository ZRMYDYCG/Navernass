import type { AnswerQuestion, AskUserInput, DismissQuestion, RunAgent } from "./agent.schema.js";
import { Inject, Injectable } from "@nestjs/common";
import { AppError } from "../common/app-error.js";
import { PrismaService } from "../database/prisma.service.js";
import { Prisma } from "../generated/prisma/client.js";
import { askUserInput, runAgent } from "./agent.schema.js";

interface CaptureInput {
  userId: string;
  sessionId: string;
  runId: string;
  novelId: string;
  chapterId?: string;
  toolCallId: string;
  question: unknown;
  resumeConfig: RunAgent;
  instructions: string;
}

/** 管理不进入聊天气泡的 AskUser 持久化中断点。 */
@Injectable()
export class QuestionService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async assertNoPending(userId: string, sessionId: string) {
    const pending = await this.prisma.agentQuestion.findFirst({
      where: { user_id: userId, session_id: sessionId, status: { in: ["pending", "processing"] } },
      orderBy: { created_at: "desc" },
    });
    if (pending) {
      throw new AppError("AGENT_INPUT_REQUIRED", "当前会话正在等待用户回答", 409, {
        question: this.publicQuestion(pending),
      });
    }
  }

  async capture(input: CaptureInput) {
    const question = askUserInput.parse(input.question);
    const existing = await this.prisma.agentQuestion.findFirst({
      where: {
        user_id: input.userId,
        session_id: input.sessionId,
        status: "pending",
        NOT: { run_id: input.runId, tool_call_id: input.toolCallId },
      },
    });
    if (existing) return existing;
    const data = {
      user_id: input.userId,
      session_id: input.sessionId,
      run_id: input.runId,
      novel_id: input.novelId,
      chapter_id: input.chapterId,
      question: question as unknown as Prisma.InputJsonValue,
      resume_config: input.resumeConfig as unknown as Prisma.InputJsonValue,
      instructions: input.instructions,
    };
    return this.prisma.agentQuestion.upsert({
      where: {
        run_id_tool_call_id: { run_id: input.runId, tool_call_id: input.toolCallId },
      },
      create: { ...data, tool_call_id: input.toolCallId },
      update: data,
    });
  }

  async checkpoint(runId: string, messages: unknown[]) {
    await this.prisma.agentQuestion.updateMany({
      where: { run_id: runId, status: "pending" },
      data: { model_messages: messages as Prisma.InputJsonValue },
    });
  }

  async pending(userId: string, sessionId: string) {
    const session = await this.prisma.agentSession.findFirst({
      where: { id: sessionId, user_id: userId },
      select: { id: true },
    });
    if (!session) throw AppError.notFound("AGENT_SESSION_NOT_FOUND", "Agent 会话");
    const question = await this.prisma.agentQuestion.findFirst({
      where: { user_id: userId, session_id: sessionId, status: { in: ["pending", "processing"] } },
      orderBy: { created_at: "desc" },
    });
    return question ? this.publicQuestion(question) : null;
  }

  async claim(userId: string, id: string, input: AnswerQuestion) {
    const question = await this.prisma.agentQuestion.findFirst({
      where: { id, user_id: userId },
      include: { run: true, session: true },
    });
    if (!question) throw AppError.notFound("AGENT_QUESTION_NOT_FOUND", "Agent 提问");
    if (question.status !== "pending")
      throw new AppError("AGENT_QUESTION_RESOLVED", "该问题已回答、取消或正在处理", 409);
    if (question.run.status !== "waiting_input")
      throw new AppError("CONFLICT", "对应的 Agent 执行当前不在等待输入状态", 409);
    if (!question.model_messages)
      throw new AppError("CONFLICT", "提问断点仍在写入，请稍后重试", 409);
    const definition = askUserInput.parse(question.question);
    this.validateAnswers(definition, input.answers);
    const claimed = await this.prisma.agentQuestion.updateMany({
      where: { id, user_id: userId, status: "pending" },
      data: { status: "processing", answer: input.answers as Prisma.InputJsonValue },
    });
    if (!claimed.count)
      throw new AppError("AGENT_QUESTION_RESOLVED", "该问题已被其他请求处理", 409);
    return {
      ...question,
      definition,
      config: runAgent.parse(question.resume_config),
      answers: input.answers,
    };
  }

  async complete(id: string, answers: AnswerQuestion["answers"]) {
    const question = await this.prisma.agentQuestion.findUniqueOrThrow({ where: { id } });
    await this.prisma.$transaction([
      this.prisma.agentQuestion.update({
        where: { id },
        data: {
          status: "answered",
          answer: answers as Prisma.InputJsonValue,
          answered_at: new Date(),
        },
      }),
      this.prisma.agentToolCall.updateMany({
        where: { run_id: question.run_id, tool_call_id: question.tool_call_id },
        data: { status: "completed", output: answers as Prisma.InputJsonValue },
      }),
      this.prisma.agentSession.update({
        where: { id: question.session_id },
        data: { updated_at: new Date() },
      }),
    ]);
  }

  async release(id: string) {
    await this.prisma.agentQuestion.updateMany({
      where: { id, status: "processing" },
      data: { status: "pending" },
    });
  }

  async rollbackNewQuestions(runId: string, answeredQuestionId: string) {
    await this.prisma.agentQuestion.deleteMany({
      where: {
        run_id: runId,
        id: { not: answeredQuestionId },
        status: "pending",
        model_messages: { equals: Prisma.DbNull },
      },
    });
  }

  async dismiss(userId: string, id: string, input: DismissQuestion) {
    const question = await this.prisma.agentQuestion.findFirst({ where: { id, user_id: userId } });
    if (!question) throw AppError.notFound("AGENT_QUESTION_NOT_FOUND", "Agent 提问");
    if (!(["pending", "processing"] as string[]).includes(question.status))
      throw new AppError("AGENT_QUESTION_RESOLVED", "该问题已结束", 409);
    await this.prisma.$transaction([
      this.prisma.agentQuestion.update({
        where: { id },
        data: {
          status: "dismissed",
          answer: { dismissed: true, reason: input.reason },
          answered_at: new Date(),
        },
      }),
      this.prisma.agentRun.update({
        where: { id: question.run_id },
        data: {
          status: "cancelled",
          finish_reason: "user-dismissed",
          completed_at: new Date(),
        },
      }),
      this.prisma.agentToolCall.updateMany({
        where: { run_id: question.run_id, tool_call_id: question.tool_call_id },
        data: { status: "cancelled", output: { dismissed: true, reason: input.reason } },
      }),
    ]);
    return { dismissed: true };
  }

  publicQuestion(question: {
    id: string;
    session_id: string;
    run_id: string;
    status: string;
    question: unknown;
    created_at: Date;
    updated_at: Date;
  }) {
    return {
      id: question.id,
      sessionId: question.session_id,
      runId: question.run_id,
      status: question.status,
      ...askUserInput.parse(question.question),
      createdAt: question.created_at,
      updatedAt: question.updated_at,
    };
  }

  private validateAnswers(definition: AskUserInput, answers: AnswerQuestion["answers"]) {
    const byId = new Map(definition.questions.map((question) => [question.id, question]));
    const unknown = Object.keys(answers).filter((id) => !byId.has(id));
    if (unknown.length)
      throw new AppError("AGENT_ANSWER_INVALID", `包含未知问题：${unknown.join("、")}`, 400);
    for (const question of definition.questions) {
      const answer = answers[question.id];
      if (answer === undefined) {
        if (question.required)
          throw new AppError("AGENT_ANSWER_INVALID", `问题 ${question.id} 必须回答`, 400);
        continue;
      }
      if (question.type === "confirm" && typeof answer !== "boolean")
        throw new AppError("AGENT_ANSWER_INVALID", `问题 ${question.id} 必须回答确认或拒绝`, 400);
      if (question.type === "text" && typeof answer !== "string")
        throw new AppError("AGENT_ANSWER_INVALID", `问题 ${question.id} 必须填写文本`, 400);
      if (question.type === "singleChoice") {
        if (typeof answer !== "string")
          throw new AppError("AGENT_ANSWER_INVALID", `问题 ${question.id} 只能选择一个选项`, 400);
        this.assertAllowed(question, [answer]);
      }
      if (question.type === "multiChoice") {
        if (!Array.isArray(answer) || (question.required && !answer.length))
          throw new AppError("AGENT_ANSWER_INVALID", `问题 ${question.id} 必须提交选项数组`, 400);
        if (new Set(answer).size !== answer.length)
          throw new AppError("AGENT_ANSWER_INVALID", `问题 ${question.id} 的选项不能重复`, 400);
        this.assertAllowed(question, answer);
      }
    }
  }

  private assertAllowed(question: AskUserInput["questions"][number], answers: string[]) {
    if (question.allowCustom) return;
    const allowed = new Set(question.options.map((option) => option.value));
    if (answers.some((answer) => !allowed.has(answer)))
      throw new AppError("AGENT_ANSWER_INVALID", `问题 ${question.id} 包含无效选项`, 400);
  }
}
