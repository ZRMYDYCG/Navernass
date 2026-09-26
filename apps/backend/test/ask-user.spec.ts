import { describe, expect, it } from "vitest";
import { askUserInput } from "../src/agent/agent.schema.js";
import {
  assertValidAnswer,
  describeAskUserParts,
  pendingAskUserCalls,
  resolveAskUser,
  skipAllAskUser,
} from "../src/agent/ask-user.js";

const input = askUserInput.parse({
  questions: [
    {
      id: "pov",
      prompt: "这一章用哪个视角？",
      options: [
        { id: "first", label: "第一人称" },
        { id: "third", label: "第三人称" },
      ],
    },
  ],
});

const parts = [
  { type: "step-start" },
  { type: "text", text: "先确认一下视角。" },
  { type: "tool-askUser", toolCallId: "call-1", state: "input-available", input },
];

describe("askUser", () => {
  it("找出悬挂的提问并写入回答", () => {
    expect(pendingAskUserCalls(parts)).toHaveLength(1);
    const resolved = resolveAskUser(parts, "call-1", {
      status: "answered",
      answers: [{ questionId: "pov", selected: ["first"] }],
    });
    expect(resolved?.[2]).toMatchObject({ state: "output-available" });
    expect(pendingAskUserCalls(resolved)).toHaveLength(0);
    expect(resolveAskUser(resolved, "call-1", { status: "skipped", reason: "user_skipped" })).toBe(
      undefined,
    );
  });

  it("直接发新消息时把悬挂提问记为跳过", () => {
    const skipped = skipAllAskUser(parts);
    expect(skipped[2]).toMatchObject({
      state: "output-available",
      output: { status: "skipped", reason: "user_sent_message" },
    });
    expect(skipped[1]).toBe(parts[1]);
  });

  it("拒绝未知选项和单选题的多个答案", () => {
    expect(() =>
      assertValidAnswer(input, {
        status: "answered",
        answers: [{ questionId: "pov", selected: ["unknown"] }],
      }),
    ).toThrow();
    expect(() =>
      assertValidAnswer(input, {
        status: "answered",
        answers: [{ questionId: "pov", selected: ["first"], other: "都行" }],
      }),
    ).toThrow();
    expect(() =>
      assertValidAnswer(input, {
        status: "answered",
        answers: [{ questionId: "pov", selected: [], other: "第二人称" }],
      }),
    ).not.toThrow();
  });

  it("把问答渲染进文本历史", () => {
    const resolved = resolveAskUser(parts, "call-1", {
      status: "answered",
      answers: [{ questionId: "pov", selected: ["third"] }],
    });
    expect(describeAskUserParts(resolved)).toContain("这一章用哪个视角？ → 第三人称");
    expect(describeAskUserParts(parts)).toContain("尚未回答");
  });
});
