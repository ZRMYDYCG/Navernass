import { Injectable } from "@nestjs/common";
import type { Prisma } from "../generated/prisma/client.js";
import { PrismaService } from "../database/prisma.service.js";
import { AppError } from "../common/app-error.js";
import type {
  ChapterOrderItems,
  CreateChapterInput,
  CreateCharacterInput,
  CreateNovelInput,
  CreateRelationshipInput,
  CreateVolumeInput,
  DuplicateInput,
  UpdateChapterInput,
  UpdateCharacterInput,
  UpdateNovelInput,
  UpdateRelationshipInput,
  UpdateVolumeInput,
} from "./library.schema.js";

type Character = Omit<CreateCharacterInput, "novel_id"> & { id: string; order_index: number };
type Relationship = Omit<CreateRelationshipInput, "novel_id"> & { id: string; novel_id: string };

@Injectable()
export class LibraryService {
  constructor(private readonly prisma: PrismaService) {}

  async listNovels(
    userId: string,
    query: { page: number; pageSize: number; status?: "draft" | "published" | "archived" },
  ) {
    const where: Prisma.NovelWhereInput = {
      user_id: userId,
      status: query.status ?? { not: "archived" },
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.novel.findMany({
        where,
        orderBy: [{ order_index: "asc" }, { created_at: "desc" }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.novel.count({ where }),
    ]);
    return { data, total };
  }

  async getNovel(userId: string, id: string) {
    const novel = await this.prisma.novel.findFirst({ where: { id, user_id: userId } });
    if (!novel) throw AppError.notFound("NOVEL_NOT_FOUND", "小说");
    return novel;
  }

  async createNovel(userId: string, input: CreateNovelInput) {
    const max = await this.prisma.novel.aggregate({
      where: { user_id: userId },
      _max: { order_index: true },
    });
    return this.prisma.novel.create({
      data: {
        user_id: userId,
        ...input,
        tags: input.tags,
        characters: [],
        relationships: [],
        order_index: (max._max.order_index ?? -1) + 1,
      },
    });
  }

  async updateNovel(userId: string, id: string, input: UpdateNovelInput) {
    await this.getNovel(userId, id);
    return this.prisma.novel.update({ where: { id }, data: input });
  }

  async deleteNovel(userId: string, id: string) {
    await this.getNovel(userId, id);
    await this.prisma.novel.delete({ where: { id } });
  }

  async setNovelStatus(userId: string, id: string, status: "draft" | "published" | "archived") {
    const novel = await this.getNovel(userId, id);
    if (status === "published" && novel.chapter_count === 0) {
      throw new AppError("CANNOT_PUBLISH", "没有章节的小说不能发布", 400);
    }
    return this.prisma.$transaction(async (tx) => {
      if (status === "archived") {
        const now = new Date();
        await Promise.all([
          tx.chapter.updateMany({
            where: { novel_id: id, user_id: userId },
            data: { deleted_at: now },
          }),
          tx.volume.updateMany({
            where: { novel_id: id, user_id: userId },
            data: { deleted_at: now },
          }),
        ]);
      }
      if (status === "draft" && novel.status === "archived") {
        await Promise.all([
          tx.chapter.updateMany({
            where: { novel_id: id, user_id: userId },
            data: { deleted_at: null },
          }),
          tx.volume.updateMany({
            where: { novel_id: id, user_id: userId },
            data: { deleted_at: null },
          }),
        ]);
      }
      return tx.novel.update({
        where: { id },
        data: {
          status,
          published_at: status === "published" ? new Date() : status === "draft" ? null : undefined,
        },
      });
    });
  }

  async reorderNovels(userId: string, items: Array<{ id: string; order_index: number }>) {
    await this.ensureOwnedIds(
      "novel",
      userId,
      items.map((item) => item.id),
    );
    await this.prisma.$transaction(
      items.map((item) =>
        this.prisma.novel.update({
          where: { id: item.id },
          data: { order_index: item.order_index },
        }),
      ),
    );
  }

  async listVolumes(userId: string, novelId: string) {
    await this.getNovel(userId, novelId);
    return this.prisma.volume.findMany({
      where: { novel_id: novelId, user_id: userId, deleted_at: null },
      orderBy: { order_index: "asc" },
    });
  }

  async getVolume(userId: string, id: string) {
    const volume = await this.prisma.volume.findFirst({
      where: { id, user_id: userId, deleted_at: null },
    });
    if (!volume) throw AppError.notFound("VOLUME_NOT_FOUND", "卷");
    return volume;
  }

  async createVolume(userId: string, input: CreateVolumeInput) {
    await this.getNovel(userId, input.novel_id);
    return this.prisma.volume.create({ data: { ...input, user_id: userId } });
  }

  async updateVolume(userId: string, id: string, input: UpdateVolumeInput) {
    await this.getVolume(userId, id);
    return this.prisma.volume.update({ where: { id }, data: input });
  }

  async deleteVolume(userId: string, id: string) {
    await this.getVolume(userId, id);
    await this.prisma.$transaction([
      this.prisma.volume.update({ where: { id }, data: { deleted_at: new Date() } }),
      this.prisma.chapter.updateMany({
        where: { volume_id: id, deleted_at: null },
        data: { volume_id: null },
      }),
    ]);
  }

  /** 副本紧跟原卷，章节副本紧跟原卷最后一章，后续卷与章节顺延。 */
  async duplicateVolume(userId: string, id: string, input: DuplicateInput) {
    const source = await this.getVolume(userId, id);
    const chapters = await this.prisma.chapter.findMany({
      where: { volume_id: id, user_id: userId, deleted_at: null },
      orderBy: { order_index: "asc" },
    });
    const lastChapterIndex = chapters.at(-1)?.order_index;
    return this.prisma.$transaction(async (tx) => {
      await tx.volume.updateMany({
        where: {
          novel_id: source.novel_id,
          deleted_at: null,
          order_index: { gt: source.order_index },
        },
        data: { order_index: { increment: 1 } },
      });
      const volume = await tx.volume.create({
        data: {
          novel_id: source.novel_id,
          user_id: userId,
          title: input.title,
          description: source.description,
          order_index: source.order_index + 1,
        },
      });
      if (lastChapterIndex === undefined) return volume;
      await tx.chapter.updateMany({
        where: {
          novel_id: source.novel_id,
          deleted_at: null,
          order_index: { gt: lastChapterIndex },
        },
        data: { order_index: { increment: chapters.length } },
      });
      await tx.chapter.createMany({
        data: chapters.map((chapter, index) => ({
          novel_id: source.novel_id,
          volume_id: volume.id,
          user_id: userId,
          title: chapter.title,
          content: chapter.content,
          summary: chapter.summary,
          word_count: chapter.word_count,
          order_index: lastChapterIndex + 1 + index,
        })),
      });
      await tx.novel.update({
        where: { id: source.novel_id },
        data: {
          chapter_count: { increment: chapters.length },
          word_count: { increment: chapters.reduce((sum, chapter) => sum + chapter.word_count, 0) },
        },
      });
      return volume;
    });
  }

  async reorderVolumes(userId: string, items: Array<{ id: string; order_index: number }>) {
    await this.ensureOwnedIds(
      "volume",
      userId,
      items.map((item) => item.id),
    );
    await this.prisma.$transaction(
      items.map((item) =>
        this.prisma.volume.update({
          where: { id: item.id },
          data: { order_index: item.order_index },
        }),
      ),
    );
  }

  async listChapters(userId: string, novelId: string, volumeId?: string) {
    await this.getNovel(userId, novelId);
    return this.prisma.chapter.findMany({
      where: {
        novel_id: novelId,
        user_id: userId,
        deleted_at: null,
        ...(volumeId && { volume_id: volumeId }),
      },
      orderBy: { order_index: "asc" },
    });
  }

  async getChapter(userId: string, id: string) {
    const chapter = await this.prisma.chapter.findFirst({
      where: { id, user_id: userId, deleted_at: null },
    });
    if (!chapter) throw AppError.notFound("CHAPTER_NOT_FOUND", "章节");
    return chapter;
  }

  async getChapterReview(userId: string, id: string) {
    const chapter = await this.getChapter(userId, id);
    if (chapter.review_base_revision === null) {
      throw AppError.notFound("CHAPTER_REVIEW_NOT_FOUND", "待审阅修改");
    }
    const base = await this.prisma.chapterRevision.findUnique({
      where: {
        chapter_id_revision: { chapter_id: chapter.id, revision: chapter.review_base_revision },
      },
      select: { revision: true, content: true },
    });
    if (!base) throw AppError.notFound("CHAPTER_REVIEW_NOT_FOUND", "待审阅修改");
    return base;
  }

  /** 只改标题，供 Agent 在当前小说范围内重命名章节。 */
  async renameChapter(userId: string, novelId: string, id: string, title: string) {
    const chapter = await this.getChapter(userId, id);
    if (chapter.novel_id !== novelId) throw AppError.notFound("CHAPTER_NOT_FOUND", "章节");
    return this.prisma.chapter.update({ where: { id }, data: { title } });
  }

  async getChapterRevision(userId: string, id: string, revision: number) {
    await this.getChapter(userId, id);
    const snapshot = await this.prisma.chapterRevision.findUnique({
      where: { chapter_id_revision: { chapter_id: id, revision } },
      select: { revision: true, content: true },
    });
    if (!snapshot) throw AppError.notFound("CHAPTER_REVISION_NOT_FOUND", "章节版本");
    return snapshot;
  }

  async resolveChapterReview(userId: string, id: string) {
    await this.getChapter(userId, id);
    return this.prisma.chapter.update({ where: { id }, data: { review_base_revision: null } });
  }

  async createChapter(userId: string, input: CreateChapterInput) {
    await this.getNovel(userId, input.novel_id);
    if (input.volume_id) {
      const volume = await this.getVolume(userId, input.volume_id);
      if (volume.novel_id !== input.novel_id) throw new AppError("BAD_REQUEST", "卷与小说不匹配");
    }
    return this.prisma.$transaction(async (tx) => {
      const chapter = await tx.chapter.create({
        data: {
          ...input,
          user_id: userId,
          volume_id: input.volume_id ?? null,
          word_count: countWords(input.content),
        },
      });
      await tx.novel.update({
        where: { id: input.novel_id },
        data: {
          chapter_count: { increment: 1 },
          word_count: { increment: chapter.word_count },
        },
      });
      return chapter;
    });
  }

  async updateChapter(userId: string, id: string, input: UpdateChapterInput) {
    const existing = await this.getChapter(userId, id);
    if (input.volume_id) {
      const volume = await this.getVolume(userId, input.volume_id);
      if (volume.novel_id !== existing.novel_id)
        throw new AppError("BAD_REQUEST", "卷与章节不属于同一本小说");
    }
    const nextCount = input.content === undefined ? existing.word_count : countWords(input.content);
    return this.prisma.$transaction(async (tx) => {
      const chapter = await tx.chapter.update({
        where: { id },
        data: {
          ...input,
          word_count: nextCount,
          ...(input.content !== undefined && { revision: { increment: 1 } }),
        },
      });
      const delta = nextCount - existing.word_count;
      if (delta !== 0)
        await tx.novel.update({
          where: { id: existing.novel_id },
          data: { word_count: { increment: delta } },
        });
      return chapter;
    });
  }

  async deleteChapter(userId: string, id: string) {
    const chapter = await this.getChapter(userId, id);
    await this.prisma.$transaction([
      this.prisma.chapter.update({ where: { id }, data: { deleted_at: new Date() } }),
      this.prisma.novel.update({
        where: { id: chapter.novel_id },
        data: {
          chapter_count: { decrement: 1 },
          word_count: { decrement: chapter.word_count },
        },
      }),
    ]);
  }

  /** 副本紧跟原章节，后续章节顺延。 */
  async duplicateChapter(userId: string, id: string, input: DuplicateInput) {
    const source = await this.getChapter(userId, id);
    return this.prisma.$transaction(async (tx) => {
      await tx.chapter.updateMany({
        where: {
          novel_id: source.novel_id,
          deleted_at: null,
          order_index: { gt: source.order_index },
        },
        data: { order_index: { increment: 1 } },
      });
      const chapter = await tx.chapter.create({
        data: {
          novel_id: source.novel_id,
          volume_id: source.volume_id,
          user_id: userId,
          title: input.title,
          content: source.content,
          summary: source.summary,
          word_count: source.word_count,
          order_index: source.order_index + 1,
        },
      });
      await tx.novel.update({
        where: { id: source.novel_id },
        data: {
          chapter_count: { increment: 1 },
          word_count: { increment: source.word_count },
        },
      });
      return chapter;
    });
  }

  async publishChapter(userId: string, id: string, published: boolean) {
    await this.getChapter(userId, id);
    return this.prisma.chapter.update({
      where: { id },
      data: { status: published ? "published" : "draft" },
    });
  }

  async reorderChapters(userId: string, items: ChapterOrderItems) {
    const ids = items.map((item) => item.id);
    const chapters = await this.prisma.chapter.findMany({
      where: { id: { in: ids }, user_id: userId, deleted_at: null },
      select: { novel_id: true },
    });
    if (chapters.length !== new Set(ids).size) {
      throw AppError.forbidden("排序列表包含无权访问的数据");
    }
    const novelIds = new Set(chapters.map((chapter) => chapter.novel_id));
    if (novelIds.size > 1) throw new AppError("BAD_REQUEST", "排序列表包含多本小说的章节");
    const volumeIds = new Set(items.flatMap((item) => (item.volume_id ? [item.volume_id] : [])));
    if (volumeIds.size) {
      const count = await this.prisma.volume.count({
        where: {
          id: { in: [...volumeIds] },
          user_id: userId,
          novel_id: { in: [...novelIds] },
          deleted_at: null,
        },
      });
      if (count !== volumeIds.size) throw new AppError("BAD_REQUEST", "卷与章节不属于同一本小说");
    }
    await this.prisma.$transaction(
      items.map((item) =>
        this.prisma.chapter.update({
          where: { id: item.id },
          data: {
            order_index: item.order_index,
            ...(item.volume_id !== undefined && { volume_id: item.volume_id }),
          },
        }),
      ),
    );
  }

  async searchChapters(
    userId: string,
    input: {
      novelId: string;
      keyword: string;
      volumeId?: string | null;
      excludeVolumeId?: string | null;
    },
  ) {
    await this.getNovel(userId, input.novelId);
    return this.prisma.chapter.findMany({
      where: {
        novel_id: input.novelId,
        user_id: userId,
        deleted_at: null,
        ...(input.volumeId !== undefined && { volume_id: input.volumeId }),
        ...(input.excludeVolumeId && { NOT: { volume_id: input.excludeVolumeId } }),
        OR: [{ title: { contains: input.keyword } }, { content: { contains: input.keyword } }],
      },
      orderBy: { order_index: "asc" },
      take: 100,
    });
  }

  async publishedNovel(id: string) {
    const novel = await this.prisma.novel.findFirst({
      where: { id, status: "published" },
      select: { id: true, title: true, description: true, cover: true, published_at: true },
    });
    if (!novel) throw AppError.notFound("NOVEL_NOT_FOUND", "已发布小说");
    const [volumes, chapters] = await Promise.all([
      this.prisma.volume.findMany({
        where: { novel_id: id, deleted_at: null },
        orderBy: { order_index: "asc" },
      }),
      this.prisma.chapter.findMany({
        where: { novel_id: id, deleted_at: null, status: "published" },
        orderBy: { order_index: "asc" },
      }),
    ]);
    return { ...novel, volumes, chapters };
  }

  async listCharacters(userId: string, novelId: string) {
    const novel = await this.getNovel(userId, novelId);
    return jsonList<Character>(novel.characters);
  }

  async createCharacter(userId: string, input: CreateCharacterInput) {
    const { novel_id: _novelId, ...fields } = input;
    const id = crypto.randomUUID();

    for (let attempt = 0; attempt < 50; attempt++) {
      const novel = await this.getNovel(userId, input.novel_id);
      const list = jsonList<Character>(novel.characters);
      const character: Character = {
        ...fields,
        id,
        order_index: input.order_index ?? list.length,
      };
      const updated = await this.prisma.novel.updateMany({
        where: { id: novel.id, user_id: userId, characters: { equals: list } },
        data: { characters: [...list, character] },
      });
      if (updated.count === 1) return character;
    }

    throw new AppError("CONFLICT", "角色列表正在被修改，请重试", 409);
  }

  async updateCharacter(userId: string, id: string, input: UpdateCharacterInput) {
    for (let attempt = 0; attempt < 50; attempt++) {
      const located = await this.findCharacter(userId, id);
      const updated = { ...located.character, ...input, id };
      const list = located.characters.map((item) => (item.id === id ? updated : item));
      const result = await this.prisma.novel.updateMany({
        where: {
          id: located.novelId,
          user_id: userId,
          characters: { equals: located.characters },
        },
        data: { characters: list },
      });
      if (result.count === 1) return updated;
    }

    throw new AppError("CONFLICT", "角色列表正在被修改，请重试", 409);
  }

  async deleteCharacter(userId: string, id: string) {
    const located = await this.findCharacter(userId, id);
    const characters = located.characters.filter((item) => item.id !== id);
    const relationships = located.relationships.filter(
      (item) => item.sourceId !== id && item.targetId !== id,
    );
    await this.prisma.$transaction([
      this.prisma.novel.update({
        where: { id: located.novelId },
        data: { characters, relationships },
      }),
      this.prisma.timelineEvent.updateMany({
        where: { novel_id: located.novelId, character_id: id },
        data: { deleted_at: new Date() },
      }),
    ]);
  }

  async listRelationships(userId: string, novelId: string) {
    const novel = await this.getNovel(userId, novelId);
    return jsonList<Relationship>(novel.relationships);
  }

  async createRelationship(userId: string, input: CreateRelationshipInput) {
    const novel = await this.getNovel(userId, input.novel_id);
    const characters = jsonList<Character>(novel.characters);
    if (
      !characters.some((item) => item.id === input.sourceId) ||
      !characters.some((item) => item.id === input.targetId)
    ) {
      throw AppError.notFound("CHARACTER_NOT_FOUND", "关系中的角色");
    }
    const list = jsonList<Relationship>(novel.relationships);
    const exists = list.some(
      (item) =>
        (item.sourceId === input.sourceId && item.targetId === input.targetId) ||
        (item.sourceId === input.targetId && item.targetId === input.sourceId),
    );
    if (exists) throw new AppError("RELATION_EXISTS", "角色关系已存在", 409);
    const relationship = { ...input, id: crypto.randomUUID() };
    await this.prisma.novel.update({
      where: { id: novel.id },
      data: { relationships: [...list, relationship] },
    });
    return relationship;
  }

  async updateRelationship(userId: string, id: string, input: UpdateRelationshipInput) {
    const located = await this.findRelationship(userId, id);
    const updated = { ...located.relationship, ...input, id };
    await this.prisma.novel.update({
      where: { id: located.novelId },
      data: {
        relationships: located.relationships.map((item) => (item.id === id ? updated : item)),
      },
    });
    return updated;
  }

  async deleteRelationship(userId: string, id: string) {
    const located = await this.findRelationship(userId, id);
    await this.prisma.novel.update({
      where: { id: located.novelId },
      data: { relationships: located.relationships.filter((item) => item.id !== id) },
    });
  }

  private async findCharacter(userId: string, id: string) {
    const novels = await this.prisma.novel.findMany({
      where: { user_id: userId },
      select: { id: true, characters: true, relationships: true },
    });
    for (const novel of novels) {
      const characters = jsonList<Character>(novel.characters);
      const character = characters.find((item) => item.id === id);
      if (character)
        return {
          novelId: novel.id,
          character,
          characters,
          relationships: jsonList<Relationship>(novel.relationships),
        };
    }
    throw AppError.notFound("CHARACTER_NOT_FOUND", "角色");
  }

  private async findRelationship(userId: string, id: string) {
    const novels = await this.prisma.novel.findMany({
      where: { user_id: userId },
      select: { id: true, relationships: true },
    });
    for (const novel of novels) {
      const relationships = jsonList<Relationship>(novel.relationships);
      const relationship = relationships.find((item) => item.id === id);
      if (relationship) return { novelId: novel.id, relationship, relationships };
    }
    throw AppError.notFound("NOT_FOUND", "角色关系");
  }

  private async ensureOwnedIds(model: "novel" | "volume", userId: string, ids: string[]) {
    const count =
      model === "novel"
        ? await this.prisma.novel.count({ where: { id: { in: ids }, user_id: userId } })
        : await this.prisma.volume.count({ where: { id: { in: ids }, user_id: userId } });
    if (count !== new Set(ids).size) throw AppError.forbidden("排序列表包含无权访问的数据");
  }
}

function countWords(content: string) {
  return content.replace(/\s+/gu, "").length;
}

function jsonList<T>(value: Prisma.JsonValue): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}
