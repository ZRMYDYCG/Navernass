import { z } from "zod";

import { apiRequest } from "@/lib/http/request";
import {
  chapterSchema,
  chapterSummarySchema,
  novelSchema,
  volumeSchema,
} from "@/schemas/library.schema";

export function getNovel(id: string) {
  return apiRequest(`novels/${id}`, novelSchema);
}

export function getNovels() {
  return apiRequest("novels?page=1&pageSize=100", z.array(novelSchema));
}

export function getNovelVolumes(novelId: string) {
  return apiRequest(`novels/${novelId}/volumes`, z.array(volumeSchema));
}

export function getNovelChapters(novelId: string) {
  return apiRequest(`novels/${novelId}/chapters`, z.array(chapterSummarySchema));
}

export function getChapter(id: string) {
  return apiRequest(`chapters/${id}`, chapterSchema);
}

export function updateChapterContent(id: string, content: string) {
  return apiRequest(`chapters/${id}`, chapterSchema, {
    method: "put",
    json: { content },
  });
}
