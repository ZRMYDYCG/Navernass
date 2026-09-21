import type { LanguageModel, ToolSet } from "ai";
import type { RunAgent } from "./agent.schema.js";
import { Inject, Injectable } from "@nestjs/common";
import { generateText, tool } from "ai";
import { z } from "zod";
import { PrismaService } from "../database/prisma.service.js";
import { EditorService } from "../editor/editor.service.js";
import { proposeEdit } from "../editor/editor.schema.js";
import { SkillResolver } from "../skill/skill.resolver.js";
import { MemoryService } from "./memory.service.js";
import { TraceService } from "./trace.service.js";

interface ToolContext {
  runId: string;
  userId: string;
  input: RunAgent;
  model: LanguageModel;
  contextText: string;
}

const subagentPrompts = {
  character: "你是角色塑造 Subagent，专注人物动机、弧光、行为一致性和关系张力。",
  plot: "你是剧情创作 Subagent，专注因果链、冲突升级、伏笔回收和章节节奏。",
  world: "你是世界观 Subagent，专注规则自洽、势力、地点、物件与历史设定。",
  style: "你是文风润色 Subagent，专注叙事视角、语言质感、节奏与可读性。",
  reviewer: "你是校验审核 Subagent，专注逻辑、事实、时间线、人物和设定一致性。",
} as const;

@Injectable()
export class ToolService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(MemoryService) private readonly memories: MemoryService,
    @Inject(TraceService) private readonly traces: TraceService,
    @Inject(SkillResolver) private readonly skills: SkillResolver,
    @Inject(EditorService) private readonly editor: EditorService,
  ) {}

  build(context: ToolContext, mode: RunAgent["mode"] = "agent"): ToolSet {
    const observed = async <T>(
      toolCallId: string,
      name: string,
      input: unknown,
      execute: () => Promise<T>,
    ) => {
      const started = Date.now();
      try {
        const output = await execute();
        await this.traces.saveTool(context.runId, {
          id: toolCallId,
          name,
          input,
          output,
          status: "completed",
          durationMs: Date.now() - started,
        });
        return output;
      } catch (error) {
        await this.traces.saveTool(context.runId, {
          id: toolCallId,
          name,
          input,
          status: "failed",
          durationMs: Date.now() - started,
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    };

    const available: ToolSet = {
      loadSkill: tool({
        description:
          "按需加载一个可用 Skill 的完整 SKILL.md 指令。只有任务确实需要该专业流程时才调用。",
        inputSchema: z.object({ skillId: z.string().min(1).max(64) }),
        execute: (input, options) =>
          observed(options.toolCallId, "loadSkill", input, () =>
            this.skills.load(context.userId, context.input.novelId, context.runId, input.skillId),
          ),
      }),
      readSkillResource: tool({
        description:
          "读取已加载内置 Skill 声明的 references、assets 或其他文本资源。禁止路径穿越。",
        inputSchema: z.object({
          skillId: z.string().min(1).max(64),
          path: z.string().min(1).max(500),
        }),
        execute: (input, options) =>
          observed(options.toolCallId, "readSkillResource", input, () =>
            this.skills.readResource(
              context.userId,
              context.input.novelId,
              context.runId,
              input.skillId,
              input.path,
            ),
          ),
      }),
      getNovelSnapshot: tool({
        description: "读取当前小说、章节目录、卷、角色、关系、世界观和大纲的结构化快照。",
        inputSchema: z.object({ includeChapterContent: z.boolean().default(false) }),
        execute: (input, options) =>
          observed(options.toolCallId, "getNovelSnapshot", input, async () => {
            const novel = await this.prisma.novel.findFirstOrThrow({
              where: { id: context.input.novelId, user_id: context.userId },
              include: {
                chapters: { where: { deleted_at: null }, orderBy: { order_index: "asc" } },
                volumes: { where: { deleted_at: null }, orderBy: { order_index: "asc" } },
                worldbook: { where: { deleted_at: null }, orderBy: { order_index: "asc" } },
                outlines: { where: { deleted_at: null }, orderBy: { order_index: "asc" } },
                timeline_events: {
                  where: { deleted_at: null },
                  orderBy: { timeline_position: "asc" },
                },
              },
            });
            return {
              ...novel,
              chapters: novel.chapters.map((chapter) => ({
                ...chapter,
                content: input.includeChapterContent ? chapter.content : undefined,
              })),
            };
          }),
      }),
      getChapter: tool({
        description:
          "兼容用的章节读取工具。编辑正文时优先使用 readArticle，它支持分段读取并返回 revision 和内容哈希。",
        inputSchema: z.object({ chapterId: z.uuid() }),
        execute: (input, options) =>
          observed(options.toolCallId, "getChapter", input, () =>
            this.prisma.chapter.findFirstOrThrow({
              where: {
                id: input.chapterId,
                novel_id: context.input.novelId,
                user_id: context.userId,
                deleted_at: null,
              },
            }),
          ),
      }),
      readArticle: tool({
        description: [
          "像读取代码文件一样分段读取章节正文。",
          "任何正文编辑前必须先调用本工具，并把返回的 revision 传给 proposeArticleEdit。",
          "offset 和 limit 使用 JavaScript UTF-16 字符偏移，与浏览器字符串和 Lexical 适配层一致。",
        ].join("\n"),
        inputSchema: z.object({
          chapterId: z.uuid(),
          offset: z.number().int().min(0).max(5_000_000).default(0),
          limit: z.number().int().min(1).max(50_000).default(20_000),
        }),
        execute: (input, options) =>
          observed(options.toolCallId, "readArticle", input, () =>
            this.editor.read(context.userId, context.input.novelId, input.chapterId, input),
          ),
      }),
      searchArticle: tool({
        description:
          "在章节正文中进行字面量搜索，返回精确 UTF-16 偏移与上下文。长文章先搜索再局部读取，避免把整章塞入上下文。",
        inputSchema: z.object({
          chapterId: z.uuid(),
          query: z.string().min(1).max(2_000),
          caseSensitive: z.boolean().default(true),
          limit: z.number().int().min(1).max(50).default(20),
          contextChars: z.number().int().min(0).max(1_000).default(160),
        }),
        execute: (input, options) =>
          observed(options.toolCallId, "searchArticle", input, () =>
            this.editor.search(context.userId, context.input.novelId, input.chapterId, input),
          ),
      }),
      proposeArticleEdit: tool({
        description: [
          "为章节创建可审阅的持久化 diff 提案，不会直接修改正文。",
          "这相当于代码编辑器的 apply_patch：oldText/anchor 必须从 readArticle 原样复制，不能概括或改写。",
          "replace 用于替换或删除；insert_before/insert_after 用锚点插入；prepend/append 用于首尾新增。",
          "同一提案的操作必须以原始正文为基准且范围不能重叠，每项使用稳定且唯一的 id。",
          "前端收到工具结果后展示 diff，用户通过 applyEndpoint 全部或逐项接受，也可通过 rejectEndpoint 拒绝。",
        ].join("\n"),
        inputSchema: proposeEdit,
        execute: (input, options) =>
          observed(options.toolCallId, "proposeArticleEdit", input, () =>
            this.editor.propose(context.userId, context.input.novelId, context.runId, input),
          ),
      }),
      searchMemory: tool({
        description: "在当前小说的语义记忆和关键词记忆中混合检索，返回带相关度的证据。",
        inputSchema: z.object({
          query: z.string().min(1).max(2_000),
          kinds: z
            .array(
              z.enum([
                "chapter",
                "character",
                "worldbook",
                "outline",
                "timeline",
                "summary",
                "conversation",
                "custom",
              ]),
            )
            .optional(),
          limit: z.number().int().min(1).max(20).default(8),
        }),
        execute: (input, options) =>
          observed(options.toolCallId, "searchMemory", input, () =>
            this.memories.search(context.userId, {
              novelId: context.input.novelId,
              chapterId: context.input.chapterId,
              providerId: context.input.providerId,
              query: input.query,
              kinds: input.kinds,
              limit: input.limit,
              minScore: 0.2,
            }),
          ),
      }),
      saveMemory: tool({
        description: "把经过确认的重要摘要、约束或新事实写入小说长期语义记忆。不要保存推测。",
        inputSchema: z.object({
          kind: z.enum(["summary", "conversation", "custom"]),
          title: z.string().max(255).optional(),
          content: z.string().min(1).max(20_000),
        }),
        execute: (input, options) =>
          observed(options.toolCallId, "saveMemory", input, () =>
            this.memories.save(context.userId, {
              novelId: context.input.novelId,
              chapterId: context.input.chapterId,
              providerId: context.input.providerId,
              kind: input.kind,
              title: input.title,
              content: input.content,
              metadata: { source: "agent", runId: context.runId },
            }),
          ),
      }),
      validateContinuity: tool({
        description: "调用审核 Subagent 检查文本和已有小说事实之间的矛盾，并给出修订建议。",
        inputSchema: z.object({
          text: z.string().min(1).max(100_000),
          focus: z.string().max(500).optional(),
        }),
        execute: (input, options) =>
          observed(options.toolCallId, "validateContinuity", input, async () => {
            const result = await generateText({
              model: context.model,
              instructions: subagentPrompts.reviewer,
              prompt: `${context.contextText}\n\n待审核文本：\n${input.text}\n\n审核重点：${input.focus ?? "全部一致性维度"}`,
              temperature: 0.1,
            });
            await this.traces.addUsage(context.runId, result.totalUsage);
            return { report: result.text, usage: result.totalUsage };
          }),
      }),
      delegateSubagent: tool({
        description: "把边界清晰的创作任务委派给角色、剧情、世界观、文风或审核 Subagent。",
        inputSchema: z.object({
          role: z.enum(["character", "plot", "world", "style", "reviewer"]),
          task: z.string().min(1).max(20_000),
        }),
        execute: (input, options) =>
          observed(options.toolCallId, "delegateSubagent", input, async () => {
            const result = await generateText({
              model: context.model,
              instructions: `${subagentPrompts[input.role]} 只处理被委派任务，输出可供主 Agent 合并的明确结果。`,
              prompt: `${context.contextText}\n\n委派任务：${input.task}`,
              temperature: context.input.temperature,
            });
            await this.traces.addUsage(context.runId, result.totalUsage);
            return { role: input.role, result: result.text, usage: result.totalUsage };
          }),
      }),
    };
    const policies: Record<RunAgent["mode"], Set<string>> = {
      ask: new Set([
        "loadSkill",
        "readSkillResource",
        "getNovelSnapshot",
        "getChapter",
        "readArticle",
        "searchArticle",
        "searchMemory",
      ]),
      plan: new Set([
        "loadSkill",
        "readSkillResource",
        "getNovelSnapshot",
        "getChapter",
        "readArticle",
        "searchArticle",
        "searchMemory",
        "saveMemory",
        "validateContinuity",
        "delegateSubagent",
      ]),
      outline: new Set([
        "loadSkill",
        "readSkillResource",
        "getNovelSnapshot",
        "getChapter",
        "readArticle",
        "searchArticle",
        "searchMemory",
        "saveMemory",
        "validateContinuity",
        "delegateSubagent",
      ]),
      worldbook: new Set([
        "loadSkill",
        "readSkillResource",
        "getNovelSnapshot",
        "getChapter",
        "readArticle",
        "searchArticle",
        "searchMemory",
        "saveMemory",
        "validateContinuity",
        "delegateSubagent",
      ]),
      agent: new Set(Object.keys(available)),
    };
    return Object.fromEntries(
      Object.entries(available).filter(([name]) => policies[mode].has(name)),
    ) as ToolSet;
  }
}
