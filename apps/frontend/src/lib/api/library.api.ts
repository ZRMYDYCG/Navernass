import { z } from "zod";

import { apiRequest } from "@/lib/http/request";
import {
  chapterSchema,
  chapterSummarySchema,
  characterProfileSchema,
  characterRelationshipSchema,
  novelSchema,
  volumeSchema,
  type CreateCharacterPayload,
  type CreateRelationshipPayload,
  type UpdateCharacterPayload,
  type UpdateRelationshipPayload,
} from "@/schemas/library.schema";

const deletedResultSchema = z.object({ deleted: z.boolean() });

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
