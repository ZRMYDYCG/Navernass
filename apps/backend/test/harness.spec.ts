import { describe, expect, it, vi } from "vitest";
import { runAgent } from "../src/agent/agent.schema.js";
import type { ContextSnapshot } from "../src/agent/context.service.js";
import { HarnessService } from "../src/agent/harness.service.js";

const novelId = "00000000-0000-4000-8000-000000000001";

const context: ContextSnapshot = {
  version: "2.0",
  role: "main",
  strategy: "balanced",
  sources: ["novel"],
  budget: {
    maxChars: 120_000,
    maxBlockChars: 30_000,
    usedChars: 12,
    estimatedTokens: 3,
    includedBlocks: 1,
    droppedBlocks: 0,
    truncatedBlocks: 0,
  },
  blocks: [],
  warnings: [],
};

function setup(mode: "ask" | "plan" | "agent", interactive = false) {
  const build = vi.fn((_context, _mode, options: { allowedTools?: Iterable<string> }) =>
    Object.fromEntries([...(options.allowedTools ?? [])].map((name) => [name, {}])),
  );
  const service = new HarnessService({ build } as never);
  const input = runAgent.parse({ novelId, prompt: "继续写", mode });
  const plan = service.build({
    runId: "run",
    userId: "user",
    input,
    model: {} as never,
    context,
    contextText: "小说：测试",
    interactive,
  });
  return { build, plan };
}

describe("novel agent harness", () => {
  it("keeps write tools out of planning modes", () => {
    const { plan } = setup("plan");
    expect(plan.policy.allowedTools).toContain("readArticle");
    expect(plan.policy.allowedTools).toContain("delegateSubagent");
    expect(plan.policy.allowedTools).not.toContain("editArticle");
    expect(plan.policy.writeTools).toEqual([]);
  });

  it("enables direct article writes in agent mode", () => {
    const { plan } = setup("agent");
    expect(plan.policy.writeTools).toEqual([
      "editArticle",
      "writeArticle",
      "patchArticle",
      "proposeArticleEdit",
    ]);
    expect(plan.tools).toHaveProperty("editArticle");
    expect(plan.instructions).toContain("Narraverse 小说 Agent Harness");
    expect(plan.instructions).toContain("baseRevision 和 baseHash");
  });

  it("only exposes askUser when interactive", () => {
    expect(setup("ask").plan.policy.allowedTools).not.toContain("askUser");
    expect(setup("ask", true).plan.policy.allowedTools).toContain("askUser");
  });
});
