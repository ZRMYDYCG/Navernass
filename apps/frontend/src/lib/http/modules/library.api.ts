import { z } from "zod";

import { apiRequest } from "@/lib/http/request";
import {
  chapterReviewSchema,
  chapterSchema,
  chapterSummarySchema,
  characterProfileSchema,
  characterRelationshipSchema,
  novelSchema,
  volumeSchema,
  type ChapterOrderItem,
  type CreateChapterPayload,
  type CreateCharacterPayload,
  type CreateNovelPayload,
  type CreateRelationshipPayload,
  type CreateVolumePayload,
  type OrderItem,
  type UpdateCharacterPayload,
  type UpdateRelationshipPayload,
} from "@/lib/http/modules/library.schema";

const deletedResultSchema = z.object({ deleted: z.boolean() });
const updatedResultSchema = z.object({ updated: z.boolean() });

export function getNovel(id: string) {
  return apiRequest(`novels/${id}`, novelSchema);
}

export function getNovels() {
  return apiRequest("novels?page=1&pageSize=100", z.array(novelSchema));
}

export function createNovel(payload: CreateNovelPayload) {
  return apiRequest("novels", novelSchema, { method: "post", json: payload });
}

export function getNovelVolumes(novelId: string) {
  return apiRequest(`novels/${novelId}/volumes`, z.array(volumeSchema));
}

export function createVolume(payload: CreateVolumePayload) {
  return apiRequest("volumes", volumeSchema, { method: "post", json: payload });
}

export function renameVolume(id: string, title: string) {
  return apiRequest(`volumes/${id}`, volumeSchema, { method: "put", json: { title } });
}

export function deleteVolume(id: string) {
  return apiRequest(`volumes/${id}`, deletedResultSchema, { method: "delete" });
}

export function duplicateVolume(id: string, title: string) {
  return apiRequest(`volumes/${id}/duplicate`, volumeSchema, { method: "post", json: { title } });
}

export function reorderVolumes(items: OrderItem[]) {
  return apiRequest("volumes/reorder", updatedResultSchema, { method: "post", json: items });
}

export function getNovelChapters(novelId: string) {
  return apiRequest(`novels/${novelId}/chapters`, z.array(chapterSummarySchema));
}

export function renameChapter(id: string, title: string) {
  return apiRequest(`chapters/${id}`, chapterSchema, { method: "put", json: { title } });
}

export function deleteChapter(id: string) {
  return apiRequest(`chapters/${id}`, deletedResultSchema, { method: "delete" });
}

export function duplicateChapter(id: string, title: string) {
  return apiRequest(`chapters/${id}/duplicate`, chapterSchema, { method: "post", json: { title } });
}

export function reorderChapters(items: ChapterOrderItem[]) {
  return apiRequest("chapters/reorder", updatedResultSchema, { method: "post", json: items });
}

export function getChapter(id: string) {
  return apiRequest(`chapters/${id}`, chapterSchema);
}

export function getChapterReview(id: string) {
  return apiRequest(`chapters/${id}/review`, chapterReviewSchema);
}

export function resolveChapterReview(id: string) {
  return apiRequest(`chapters/${id}/review`, chapterSchema, { method: "delete" });
}

export function createChapter(payload: CreateChapterPayload) {
  return apiRequest("chapters", chapterSchema, { method: "post", json: payload });
}

export function searchChapters(novelId: string, keyword: string) {
  return apiRequest("chapters/search", z.array(chapterSchema), {
    method: "post",
    json: { novelId, keyword },
  });
}

export function updateChapterContent(id: string, content: string) {
  return apiRequest(`chapters/${id}`, chapterSchema, {
    method: "put",
    json: { content },
  });
}

export function getNovelCharacters(novelId: string) {
  return apiRequest(`novels/${novelId}/characters`, z.array(characterProfileSchema));
}

export function createCharacter(payload: CreateCharacterPayload) {
  return apiRequest("characters", characterProfileSchema, { method: "post", json: payload });
}

export function updateCharacter(id: string, payload: UpdateCharacterPayload) {
  return apiRequest(`characters/${id}`, characterProfileSchema, {
    method: "put",
    json: payload,
  });
}

export function deleteCharacter(id: string) {
  return apiRequest(`characters/${id}`, deletedResultSchema, { method: "delete" });
}

export function getNovelRelationships(novelId: string) {
  return apiRequest(`novels/${novelId}/relationships`, z.array(characterRelationshipSchema));
}

export function createRelationship(payload: CreateRelationshipPayload) {
  return apiRequest("relationships", characterRelationshipSchema, {
    method: "post",
    json: payload,
  });
}

export function updateRelationship(id: string, payload: UpdateRelationshipPayload) {
  return apiRequest(`relationships/${id}`, characterRelationshipSchema, {
    method: "put",
    json: payload,
  });
}

export function deleteRelationship(id: string) {
  return apiRequest(`relationships/${id}`, deletedResultSchema, { method: "delete" });
}
