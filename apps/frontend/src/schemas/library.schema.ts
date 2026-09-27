import { z } from "zod";

/** 与后端 LibraryService 返回的 Prisma 行对应；只声明界面需要的字段。 */

export const novelStatusSchema = z.enum(["draft", "published", "archived"]);
export const chapterStatusSchema = z.enum(["draft", "published"]);

export const novelSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  cover: z.string().nullable(),
  word_count: z.number(),
  chapter_count: z.number(),
  status: novelStatusSchema,
});

export const volumeSchema = z.object({
  id: z.string(),
  novel_id: z.string(),
  title: z.string(),
  order_index: z.number(),
});

export const chapterSummarySchema = z.object({
  id: z.string(),
  novel_id: z.string(),
  volume_id: z.string().nullable(),
  title: z.string(),
  order_index: z.number(),
  word_count: z.number(),
  status: chapterStatusSchema,
  updated_at: z.coerce.date(),
});

export const chapterSchema = chapterSummarySchema.extend({
  content: z.string(),
  revision: z.number(),
});

export type NovelStatus = z.infer<typeof novelStatusSchema>;
export type ChapterStatus = z.infer<typeof chapterStatusSchema>;
export type Novel = z.infer<typeof novelSchema>;
export type Volume = z.infer<typeof volumeSchema>;
export type ChapterSummary = z.infer<typeof chapterSummarySchema>;
export type Chapter = z.infer<typeof chapterSchema>;
