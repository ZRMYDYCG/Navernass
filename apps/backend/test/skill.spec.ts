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
  category: planning
  modes:
    - plan
    - outline
  resources:
    - references/beat-sheet.md
  related:
    - story-planning
---

请检查剧情因果和伏笔回收。`;
    const parsed = parser.parse(markdown);
    const runtime = parser.runtime(markdown, "custom-id");

    expect(parsed.frontmatter.name).toBe("plot-review");
    expect(parsed.frontmatter.metadata?.modes).toEqual(["plan", "outline"]);
    expect(parsed.frontmatter.metadata?.resources).toEqual(["references/beat-sheet.md"]);
    expect(parsed.frontmatter.metadata?.related).toEqual(["story-planning"]);
    expect(runtime.toolNames).toEqual(["getNovelSnapshot", "validateContinuity"]);
    expect(runtime.systemPrompt).toContain("剧情因果");
  });

  it("拒绝无效名称和无正文的 Skill", () => {
    expect(() => parser.parse(`---\nname: Bad_Name\ndescription: bad\n---\n`)).toThrow(
      "SKILL.md 校验失败",
    );
  });

  it("拒绝无效的 manifest 元数据", () => {
    expect(() =>
      parser.parse(`---
name: plot-review
description: 用户审核剧情时使用。
metadata:
  modes:
    - unknown
---

正文。`),
    ).toThrow("metadata.modes 包含未知模式");

    expect(() =>
      parser.parse(`---
name: plot-review
description: 用户审核剧情时使用。
metadata:
  resources:
    - ../secret.md
---

正文。`),
    ).toThrow("metadata.resources 包含无效资源路径");
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

  it("按当前 mode 收窄可自动发现的 Skill", async () => {
    const planOnly = {
      id: "story-planning",
      slug: "story-planning",
      description: "规划故事。",
      version: "1.0.0",
      checksum: "a".repeat(64),
      source: "builtin",
      is_builtin: true,
      skill_md: "",
      manifest: {
        name: "story-planning",
        description: "规划故事。",
        metadata: { modes: ["plan"], related: ["outline-editing"] },
      },
      installs: [],
      novels: [{ priority: 0 }],
    };
    const agentWide = {
      id: "craft-discussion",
      slug: "craft-discussion",
      description: "讨论写作问题。",
      version: "1.0.0",
      checksum: "b".repeat(64),
      source: "builtin",
      is_builtin: true,
      skill_md: "",
      manifest: {
        name: "craft-discussion",
        description: "讨论写作问题。",
        metadata: { modes: ["agent"] },
      },
      installs: [],
      novels: [{ priority: 0 }],
    };
    const prisma = {
      skillDef: { findMany: vi.fn().mockResolvedValue([planOnly, agentWide]) },
    };
    const registry = { skill: vi.fn(), resources: vi.fn() };
    const resolver = new SkillResolver(prisma as never, parser, registry as never);

    const result = await resolver.resolve({
      userId: "user",
      novelId: "novel",
      mode: "plan",
      text: "规划第一卷",
    });

    expect(result.prompt).toContain("story-planning");
    expect(result.prompt).toContain("<related>outline-editing</related>");
    expect(result.prompt).not.toContain("craft-discussion");
  });
});
