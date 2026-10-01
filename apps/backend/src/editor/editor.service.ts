import type { Prisma } from "../generated/prisma/client.js";
import type {
  ApplyEdit,
  EditArticle,
  EditOperation,
  EditQuery,
  ListArticleFiles,
  PatchArticle,
  ProposeEdit,
  WriteArticle,
} from "./editor.schema.js";
import { createHash } from "node:crypto";
import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { AppError } from "../common/app-error.js";
import { PrismaService } from "../database/prisma.service.js";

interface ResolvedEdit {
  id: string;
  type: EditOperation["type"];
  start: number;
  end: number;
  oldText: string;
  newText: string;
  reason: string;
}

@Injectable()
export class EditorService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async listFiles(userId: string, novelId: string, input: ListArticleFiles) {
    await this.ownedNovel(userId, novelId);
    const chapters = await this.prisma.chapter.findMany({
      where: { user_id: userId, novel_id: novelId, deleted_at: null },
      orderBy: { order_index: "asc" },
      take: input.limit,
    });
    const normalized = input.pattern.toLocaleLowerCase();
    const files = chapters
      .map((chapter) => ({
        chapterId: chapter.id,
        path: `chapters/${String(chapter.order_index + 1).padStart(3, "0")}-${slugTitle(chapter.title)}.md`,
        title: chapter.title,
        revision: chapter.revision,
        contentHash: this.hash(chapter.content),
        wordCount: chapter.word_count,
        totalLength: chapter.content.length,
      }))
      .filter(
        (file) =>
          normalized === "**/*" ||
          normalized === "*" ||
          file.path.toLocaleLowerCase().includes(normalized.replaceAll("*", "")),
      );
    return { novelId, pattern: input.pattern, files, truncated: chapters.length === input.limit };
  }

  async read(
    userId: string,
    novelId: string,
    chapterId: string,
    range: { offset: number; limit: number },
  ) {
    const chapter = await this.ownedChapter(userId, novelId, chapterId);
    const start = Math.min(range.offset, chapter.content.length);
    const end = Math.min(start + range.limit, chapter.content.length);
    return {
      chapterId: chapter.id,
      title: chapter.title,
      revision: chapter.revision,
      contentHash: this.hash(chapter.content),
      wordCount: chapter.word_count,
      totalLength: chapter.content.length,
      startOffset: start,
      endOffset: end,
      hasMore: end < chapter.content.length,
      content: chapter.content.slice(start, end),
    };
  }

  async search(
    userId: string,
    novelId: string,
    chapterId: string,
    input: { query: string; caseSensitive: boolean; limit: number; contextChars: number },
  ) {
    const chapter = await this.ownedChapter(userId, novelId, chapterId);
    const haystack = input.caseSensitive ? chapter.content : chapter.content.toLocaleLowerCase();
    const needle = input.caseSensitive ? input.query : input.query.toLocaleLowerCase();
    const matches: Array<{
      start: number;
      end: number;
      before: string;
      match: string;
      after: string;
    }> = [];
    let cursor = 0;
    while (matches.length < input.limit) {
      const start = haystack.indexOf(needle, cursor);
      if (start < 0) break;
      const end = start + input.query.length;
      matches.push({
        start,
        end,
        before: chapter.content.slice(Math.max(0, start - input.contextChars), start),
        match: chapter.content.slice(start, end),
        after: chapter.content.slice(end, end + input.contextChars),
      });
      cursor = Math.max(end, start + 1);
    }
    return {
      chapterId: chapter.id,
      revision: chapter.revision,
      contentHash: this.hash(chapter.content),
      query: input.query,
      matches,
      truncated: matches.length === input.limit && haystack.indexOf(needle, cursor) >= 0,
    };
  }

  async edit(userId: string, novelId: string, input: EditArticle) {
    const chapter = await this.ownedChapter(userId, novelId, input.chapterId);
    this.assertBase(chapter, input.baseRevision, input.baseHash);
    const operation = this.resolveOperation(chapter.content, {
      id: "edit",
      type: "replace",
      oldText: input.oldText,
      newText: input.newText,
      occurrence: input.occurrence,
      reason: input.reason,
    });
    const nextContent = this.applyOperations(chapter.content, [operation]);
    return this.commitChapterContent(userId, chapter, nextContent, {
      reason: input.reason,
      operations: [operation],
    });
  }

  async write(userId: string, novelId: string, input: WriteArticle) {
    const chapter = await this.ownedChapter(userId, novelId, input.chapterId);
    this.assertBase(chapter, input.baseRevision, input.baseHash);
    return this.commitChapterContent(userId, chapter, input.content, {
      reason: input.reason,
      operations: [
        {
          id: "write",
          type: "replace",
          start: 0,
          end: chapter.content.length,
          oldText: chapter.content,
          newText: input.content,
          reason: input.reason,
        },
      ],
    });
  }

  async patch(userId: string, novelId: string, input: PatchArticle) {
    const chapter = await this.ownedChapter(userId, novelId, input.chapterId);
    this.assertBase(chapter, input.baseRevision, input.baseHash);
    const resolved = input.operations.map((operation) =>
      this.resolveOperation(chapter.content, operation),
    );
    this.assertNonOverlapping(resolved);
    const nextContent = this.applyOperations(chapter.content, resolved);
    return this.commitChapterContent(userId, chapter, nextContent, {
      reason: input.summary,
      operations: resolved,
    });
  }

  async propose(userId: string, novelId: string, runId: string, input: ProposeEdit) {
    const chapter = await this.ownedChapter(userId, novelId, input.chapterId);
    if (chapter.revision !== input.baseRevision) {
      throw this.conflict("章节已被修改，请重新读取正文后再生成编辑提案", {
        expectedRevision: input.baseRevision,
        currentRevision: chapter.revision,
      });
    }
    const resolved = input.operations.map((operation) =>
      this.resolveOperation(chapter.content, operation),
    );
    this.assertNonOverlapping(resolved);
    const proposedContent = this.applyOperations(chapter.content, resolved);
    if (proposedContent === chapter.content) {
      throw new AppError("ARTICLE_EDIT_INVALID", "编辑提案没有产生任何正文变化");
    }
    const proposal = await this.prisma.chapterEdit.create({
      data: {
        user_id: userId,
        novel_id: novelId,
        chapter_id: chapter.id,
        run_id: runId,
        summary: input.summary,
        base_revision: chapter.revision,
        base_hash: this.hash(chapter.content),
        result_hash: this.hash(proposedContent),
        operations: resolved as unknown as Prisma.InputJsonValue,
        original_content: chapter.content,
        proposed_content: proposedContent,
      },
    });
    return {
      proposalId: proposal.id,
      chapterId: chapter.id,
      chapterTitle: chapter.title,
      status: proposal.status,
      summary: proposal.summary,
      baseRevision: proposal.base_revision,
      baseHash: proposal.base_hash,
      resultHash: proposal.result_hash,
      operations: resolved,
      reviewRequired: true,
      applyEndpoint: `/api/v1/editor/edits/${proposal.id}/apply`,
      rejectEndpoint: `/api/v1/editor/edits/${proposal.id}/reject`,
    };
  }

  async list(userId: string, query: EditQuery) {
    const where = {
      user_id: userId,
      ...(query.chapterId && { chapter_id: query.chapterId }),
      ...(query.status && { status: query.status }),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.chapterEdit.findMany({
        where,
        select: {
          id: true,
          novel_id: true,
          chapter_id: true,
          run_id: true,
          status: true,
          summary: true,
          base_revision: true,
          base_hash: true,
          result_hash: true,
          operations: true,
          accepted_edits: true,
          created_at: true,
          updated_at: true,
          applied_at: true,
          rejected_at: true,
        },
        orderBy: { created_at: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.chapterEdit.count({ where }),
    ]);
    return { data, total };
  }

  async get(userId: string, id: string) {
    const edit = await this.prisma.chapterEdit.findFirst({ where: { id, user_id: userId } });
    if (!edit) throw AppError.notFound("ARTICLE_EDIT_NOT_FOUND", "文章编辑提案");
    return edit;
  }

  async apply(userId: string, id: string, input: ApplyEdit) {
    const edit = await this.get(userId, id);
    if (edit.status !== "pending") {
      throw this.conflict(`编辑提案当前状态为 ${edit.status}，不能重复应用`);
    }
    const chapter = await this.ownedChapter(userId, edit.novel_id, edit.chapter_id);
    if (chapter.revision !== edit.base_revision || this.hash(chapter.content) !== edit.base_hash) {
      await this.prisma.chapterEdit.update({ where: { id }, data: { status: "stale" } });
      throw this.conflict("正文已在提案后发生变化，请重新生成 diff", {
        expectedRevision: edit.base_revision,
        currentRevision: chapter.revision,
      });
    }

    const operations = edit.operations as unknown as ResolvedEdit[];
    const accepted = input.acceptedEditIds ?? operations.map((operation) => operation.id);
    const acceptedSet = new Set(accepted);
    if (acceptedSet.size !== accepted.length) {
      throw new AppError("ARTICLE_EDIT_INVALID", "acceptedEditIds 不能重复");
    }
    const selected = operations.filter((operation) => acceptedSet.has(operation.id));
    if (selected.length !== accepted.length) {
      throw new AppError("ARTICLE_EDIT_INVALID", "包含不属于该提案的编辑操作 id");
    }
    if (selected.length === 0) {
      return this.reject(userId, id, "未选择任何编辑项");
    }

    const nextContent = this.applyOperations(chapter.content, selected);
    const nextCount = countWords(nextContent);
    const wordDelta = nextCount - chapter.word_count;
    const result = await this.prisma.$transaction(async (tx) => {
      await tx.chapterRevision.upsert({
        where: {
          chapter_id_revision: { chapter_id: chapter.id, revision: chapter.revision },
        },
        create: {
          user_id: userId,
          novel_id: chapter.novel_id,
          chapter_id: chapter.id,
          edit_id: edit.id,
          revision: chapter.revision,
          content: chapter.content,
          content_hash: edit.base_hash,
          word_count: chapter.word_count,
        },
        update: {},
      });
      const updated = await tx.chapter.updateMany({
        where: { id: chapter.id, user_id: userId, revision: edit.base_revision },
        data: {
          content: nextContent,
          word_count: nextCount,
          revision: { increment: 1 },
        },
      });
      if (updated.count !== 1) throw this.conflict("正文版本冲突，请重新生成 diff");
      if (wordDelta !== 0) {
        await tx.novel.update({
          where: { id: chapter.novel_id },
          data: { word_count: { increment: wordDelta } },
        });
      }
      await tx.chapterEdit.update({
        where: { id },
        data: {
          status: "applied",
          accepted_edits: accepted as Prisma.InputJsonValue,
          applied_at: new Date(),
        },
      });
      await tx.chapterEdit.updateMany({
        where: { chapter_id: chapter.id, status: "pending", id: { not: id } },
        data: { status: "stale" },
      });
      return tx.chapter.findUniqueOrThrow({ where: { id: chapter.id } });
    });
    return {
      proposalId: id,
      status: "applied" as const,
      acceptedEditIds: accepted,
      chapter: result,
    };
  }

  async reject(userId: string, id: string, reason?: string) {
    const updated = await this.prisma.chapterEdit.updateMany({
      where: { id, user_id: userId, status: "pending" },
      data: { status: "rejected", rejection_reason: reason, rejected_at: new Date() },
    });
    if (updated.count !== 1) {
      const edit = await this.get(userId, id);
      throw this.conflict(`编辑提案当前状态为 ${edit.status}，不能拒绝`);
    }
    return { proposalId: id, status: "rejected" as const };
  }

  private async ownedChapter(userId: string, novelId: string, chapterId: string) {
    const chapter = await this.prisma.chapter.findFirst({
      where: {
        id: chapterId,
        novel_id: novelId,
        user_id: userId,
        deleted_at: null,
      },
    });
    if (!chapter) throw AppError.notFound("CHAPTER_NOT_FOUND", "章节");
    return chapter;
  }

  private async ownedNovel(userId: string, novelId: string) {
    const novel = await this.prisma.novel.findFirst({ where: { id: novelId, user_id: userId } });
    if (!novel) throw AppError.notFound("NOVEL_NOT_FOUND", "小说");
    return novel;
  }

  private assertBase(
    chapter: Awaited<ReturnType<EditorService["ownedChapter"]>>,
    revision: number,
    hash: string,
  ) {
    if (chapter.revision !== revision || this.hash(chapter.content) !== hash) {
      throw this.conflict("正文已被修改，请重新读取后再编辑", {
        expectedRevision: revision,
        currentRevision: chapter.revision,
      });
    }
  }

  private async commitChapterContent(
    userId: string,
    chapter: Awaited<ReturnType<EditorService["ownedChapter"]>>,
    nextContent: string,
    metadata: { reason: string; operations: ResolvedEdit[] },
  ) {
    if (nextContent === chapter.content) {
      throw new AppError("ARTICLE_EDIT_INVALID", "编辑没有产生任何正文变化");
    }
    const baseHash = this.hash(chapter.content);
    const resultHash = this.hash(nextContent);
    const nextCount = countWords(nextContent);
    const wordDelta = nextCount - chapter.word_count;
    const result = await this.prisma.$transaction(async (tx) => {
      await tx.chapterRevision.upsert({
        where: {
          chapter_id_revision: { chapter_id: chapter.id, revision: chapter.revision },
        },
        create: {
          user_id: userId,
          novel_id: chapter.novel_id,
          chapter_id: chapter.id,
          revision: chapter.revision,
          content: chapter.content,
          content_hash: baseHash,
          word_count: chapter.word_count,
        },
        update: {},
      });
      const updated = await tx.chapter.updateMany({
        where: { id: chapter.id, user_id: userId, revision: chapter.revision },
        data: {
          content: nextContent,
          word_count: nextCount,
          revision: { increment: 1 },
          // 连续改写时保留最早的起点，用户一次就能审阅全部改动。
          review_base_revision: chapter.review_base_revision ?? chapter.revision,
        },
      });
      if (updated.count !== 1) throw this.conflict("正文版本冲突，请重新读取后再编辑");
      if (wordDelta !== 0) {
        await tx.novel.update({
          where: { id: chapter.novel_id },
          data: { word_count: { increment: wordDelta } },
        });
      }
      await tx.chapterEdit.updateMany({
        where: { chapter_id: chapter.id, status: "pending" },
        data: { status: "stale" },
      });
      return tx.chapter.findUniqueOrThrow({ where: { id: chapter.id } });
    });
    return {
      chapterId: result.id,
      chapterTitle: result.title,
      status: "written" as const,
      reason: metadata.reason,
      baseRevision: chapter.revision,
      revision: result.revision,
      baseHash,
      resultHash,
      wordCount: result.word_count,
      wordDelta,
      operations: metadata.operations.map(({ oldText, newText, ...operation }) => ({
        ...operation,
        oldLength: oldText.length,
        newLength: newText.length,
      })),
    };
  }

  private resolveOperation(content: string, operation: EditOperation): ResolvedEdit {
    if (operation.type === "prepend") {
      return { ...operation, start: 0, end: 0, oldText: "", newText: operation.text };
    }
    if (operation.type === "append") {
      return {
        ...operation,
        start: content.length,
        end: content.length,
        oldText: "",
        newText: operation.text,
      };
    }
    if (!("anchor" in operation) && operation.type !== "replace") {
      throw new AppError("ARTICLE_EDIT_INVALID", `不支持的编辑操作：${operation.type}`);
    }
    const target = operation.type === "replace" ? operation.oldText : operation.anchor;
    const targetStart = findOccurrence(content, target, operation.occurrence);
    if (targetStart < 0) {
      throw new AppError(
        "ARTICLE_EDIT_INVALID",
        `操作 ${operation.id} 的锚点未找到，请重新读取正文并逐字复制目标文本`,
      );
    }
    if (operation.type === "replace") {
      return {
        ...operation,
        start: targetStart,
        end: targetStart + operation.oldText.length,
      };
    }
    const position =
      operation.type === "insert_before" ? targetStart : targetStart + operation.anchor.length;
    return {
      ...operation,
      start: position,
      end: position,
      oldText: "",
      newText: operation.text,
    };
  }

  private assertNonOverlapping(operations: ResolvedEdit[]) {
    const sorted = [...operations].sort(
      (left, right) => left.start - right.start || left.end - right.end,
    );
    for (let index = 1; index < sorted.length; index += 1) {
      const previous = sorted[index - 1]!;
      const current = sorted[index]!;
      const sameInsertion =
        previous.start === previous.end &&
        current.start === current.end &&
        previous.start === current.start;
      if (current.start < previous.end || sameInsertion) {
        throw new AppError(
          "ARTICLE_EDIT_INVALID",
          `编辑操作 ${previous.id} 与 ${current.id} 的范围重叠，请合并为一个操作`,
        );
      }
    }
  }

  private applyOperations(content: string, operations: ResolvedEdit[]) {
    return [...operations]
      .sort((left, right) => right.start - left.start || right.end - left.end)
      .reduce((result, operation) => {
        const current = result.slice(operation.start, operation.end);
        if (current !== operation.oldText) {
          throw this.conflict(`编辑操作 ${operation.id} 的原文已不匹配`);
        }
        return `${result.slice(0, operation.start)}${operation.newText}${result.slice(operation.end)}`;
      }, content);
  }

  private hash(content: string) {
    return createHash("sha256").update(content).digest("hex");
  }

  private conflict(message: string, details?: unknown) {
    return new AppError("ARTICLE_EDIT_CONFLICT", message, HttpStatus.CONFLICT, details);
  }
}

function findOccurrence(content: string, target: string, occurrence: number) {
  let cursor = 0;
  for (let index = 1; index <= occurrence; index += 1) {
    const found = content.indexOf(target, cursor);
    if (found < 0) return -1;
    if (index === occurrence) return found;
    cursor = found + Math.max(1, target.length);
  }
  return -1;
}

function countWords(content: string) {
  return content.replace(/<[^>]*>/gu, "").replace(/\s+/gu, "").length;
}

function slugTitle(title: string) {
  return title
    .trim()
    .replace(/[\\/:*?"<>|#]+/gu, "-")
    .replace(/\s+/gu, "-")
    .slice(0, 80);
}
