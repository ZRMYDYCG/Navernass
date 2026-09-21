import { describe, expect, it, vi } from "vitest";
import { askUserInput, runAgent } from "../src/agent/agent.schema.js";
import { QuestionService } from "../src/agent/question.service.js";
import type { PrismaService } from "../src/database/prisma.service.js";

const id = "00000000-0000-4000-8000-000000000001";

const question = askUserInput.parse({
  title: "确定创作方向",
  questions: [
    {
      id: "pov",
      header: "叙事视角",
      question: "这一章采用哪个视角？",
      type: "singleChoice",
      options: [
        { value: "first", label: "第一人称" },
        { value: "third", label: "第三人称" },
      ],
    },
    {
      id: "note",
      header: "额外要求",
      question: "还有什么需要强调？",
      type: "text",
      required: false,
    },
  ],
});

describe("AskUser 持久化中断", () => {
  it("严格校验用户答案并原子占用待处理问题", async () => {
    const row = {
      id,
      session_id: id,
      run_id: id,
      user_id: "user-1",
      novel_id: id,
      chapter_id: null,
      tool_call_id: "call-1",
      status: "pending",
      question,
      answer: null,
      model_messages: [],
      resume_config: runAgent.parse({ novelId: id, prompt: "继续创作" }),
      instructions: "system",
      created_at: new Date(),
      updated_at: new Date(),
      answered_at: null,
      run: { status: "waiting_input" },
      session: { id },
    };
    const prisma = {
      agentQuestion: {
        findFirst: vi.fn().mockResolvedValue(row),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
    } as unknown as PrismaService;
    const service = new QuestionService(prisma);

    await expect(
      service.claim("user-1", id, { answers: { pov: "unknown" } }),
    ).rejects.toMatchObject({ code: "AGENT_ANSWER_INVALID" });

    const claimed = await service.claim("user-1", id, { answers: { pov: "first" } });
    expect(claimed.answers).toEqual({ pov: "first" });
    expect(prisma.agentQuestion.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: "processing" }) }),
    );
  });

  it("拒绝没有足够选项的选择题", () => {
    const parsed = askUserInput.safeParse({
      questions: [
        {
          id: "choice",
          header: "选择",
          question: "请选择",
          type: "singleChoice",
          options: [{ value: "only", label: "唯一选项" }],
        },
      ],
    });

    expect(parsed.success).toBe(false);
  });
});
