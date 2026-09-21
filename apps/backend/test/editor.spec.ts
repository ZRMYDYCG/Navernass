import type { PrismaService } from "../src/database/prisma.service.js";
import { describe, expect, it, vi } from "vitest";
import { EditorService } from "../src/editor/editor.service.js";

const chapter = {
  id: "00000000-0000-4000-8000-000000000002",
  novel_id: "00000000-0000-4000-8000-000000000001",
  user_id: "user-1",
  volume_id: null,
  title: "第一章",
  content: "清晨，林远推开门。\n雨已经停了。\n他决定出发。",
  summary: null,
  order_index: 0,
  word_count: 22,
  status: "draft",
  revision: 3,
  created_at: new Date(),
  updated_at: new Date(),
  deleted_at: null,
} as const;

function createService() {
  const created: Array<Record<string, unknown>> = [];
  const prisma = {
    chapter: { findFirst: vi.fn().mockResolvedValue(chapter) },
    chapterEdit: {
      create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
        created.push(data);
        return { id: "edit-1", status: "pending", ...data };
      }),
    },
  } as unknown as PrismaService;
  return { service: new EditorService(prisma), created };
}

describe("文章编辑工具", () => {
  it("分段读取时返回 revision、hash 和绝对偏移", async () => {
    const { service } = createService();
    const result = await service.read("user-1", chapter.novel_id, chapter.id, {
      offset: 3,
      limit: 8,
    });

    expect(result.revision).toBe(3);
    expect(result.contentHash).toHaveLength(64);
    expect(result.startOffset).toBe(3);
    expect(result.endOffset).toBe(11);
    expect(result.content).toBe(chapter.content.slice(3, 11));
  });

  it("生成持久化提案但不直接修改章节", async () => {
    const { service, created } = createService();
    const result = await service.propose("user-1", chapter.novel_id, "run-1", {
      chapterId: chapter.id,
      baseRevision: 3,
      summary: "增强雨后出发的画面感",
      operations: [
        {
          id: "edit-rain",
          type: "replace",
          oldText: "雨已经停了。",
          newText: "檐角的雨珠还在一滴滴坠落。",
          occurrence: 1,
          reason: "用可见细节替代概述",
        },
      ],
    });

    expect(result.reviewRequired).toBe(true);
    expect(result.operations[0]).toMatchObject({
      id: "edit-rain",
      oldText: "雨已经停了。",
      newText: "檐角的雨珠还在一滴滴坠落。",
    });
    expect(created[0]?.proposed_content).toContain("檐角的雨珠");
    expect(created[0]?.original_content).toBe(chapter.content);
  });

  it("拒绝过期版本和无法精确定位的原文", async () => {
    const { service } = createService();
    await expect(
      service.propose("user-1", chapter.novel_id, "run-1", {
        chapterId: chapter.id,
        baseRevision: 2,
        summary: "过期修改",
        operations: [
          {
            id: "edit-1",
            type: "replace",
            oldText: "雨已经停了。",
            newText: "雨停了。",
            occurrence: 1,
            reason: "精简",
          },
        ],
      }),
    ).rejects.toMatchObject({ code: "ARTICLE_EDIT_CONFLICT" });

    await expect(
      service.propose("user-1", chapter.novel_id, "run-1", {
        chapterId: chapter.id,
        baseRevision: 3,
        summary: "错误锚点",
        operations: [
          {
            id: "edit-2",
            type: "replace",
            oldText: "并不存在的原文",
            newText: "新文字",
            occurrence: 1,
            reason: "测试",
          },
        ],
      }),
    ).rejects.toMatchObject({ code: "ARTICLE_EDIT_INVALID" });
  });
});
