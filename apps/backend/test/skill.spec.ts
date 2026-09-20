import { describe, expect, it, vi } from "vitest";
import { SkillParser } from "../src/skill/skill.parser.js";
import { SkillResolver } from "../src/skill/skill.resolver.js";

const parser = new SkillParser();

describe("skill 基础设施", () => {
  it("解析标准 SKILL.md 和 allowed-tools", () => {
    const markdown = `---
name: plot-review
description: 检查剧情冲突，用户要求审核剧情、因果或伏笔时使用。
allowed-tools: getNovelSnapshot validateContinuity
metadata:
  version: "1.0.0"
---

请检查剧情因果和伏笔回收。`;
    const parsed = parser.parse(markdown);
    const runtime = parser.runtime(markdown, "custom-id");

    expect(parsed.frontmatter.name).toBe("plot-review");
    expect(runtime.toolNames).toEqual(["getNovelSnapshot", "validateContinuity"]);
    expect(runtime.systemPrompt).toContain("剧情因果");
  });

  it("拒绝无效名称和无正文的 Skill", () => {
    expect(() => parser.parse(`---\nname: Bad_Name\ndescription: bad\n---\n`)).toThrow(
      "SKILL.md 校验失败",
    );
  });

  it("只常驻元数据，并在 loadSkill 时加载正文和记录快照", async () => {
    const markdown = `---\nname: plot-review\ndescription: 用户审核剧情时使用。\n---\n\n# 剧情审核\n\n这是按需加载的正文。`;
    const definition = {
      id: "plot-review",
      slug: "plot-review",
      description: "用户审核剧情时使用。",
      version: "1.0.0",
      checksum: "a".repeat(64),
      source: "builtin",
      is_builtin: true,
      skill_md: markdown,
      installs: [],
      novels: [],
    };
    const update = vi.fn();
    const prisma = {
      skillDef: { findMany: vi.fn().mockResolvedValue([definition]) },
      agentRun: {
        findFirst: vi.fn().mockResolvedValue({ skill_ids: [], skill_snapshot: [] }),
        update,
      },
    };
    const registry = {
      skill: vi.fn().mockResolvedValue(markdown),
      resources: vi.fn().mockResolvedValue([]),
    };
    const resolver = new SkillResolver(prisma as never, parser, registry as never);
    const discovered = await resolver.resolve({
      userId: "user",
      novelId: "novel",
      mode: "agent",
      text: "审核剧情",
    });

    expect(discovered.ids).toEqual([]);
    expect(discovered.prompt).toContain("用户审核剧情时使用。");
    expect(discovered.prompt).not.toContain("这是按需加载的正文");

    const loaded = await resolver.load("user", "novel", "run", "plot-review");
    expect(loaded.instructions).toContain("这是按需加载的正文");
    expect(update).toHaveBeenCalledOnce();
  });
});
