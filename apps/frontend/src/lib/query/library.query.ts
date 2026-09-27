import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { useCallback } from "react";

import {
  createCharacter as createCharacterApi,
  createRelationship as createRelationshipApi,
  deleteCharacter as deleteCharacterApi,
  deleteRelationship as deleteRelationshipApi,
  getChapter,
  getNovel,
  getNovelChapters,
  getNovels,
  getNovelVolumes,
  searchChapters,
  updateCharacter as updateCharacterApi,
  updateChapterContent,
  updateRelationship as updateRelationshipApi,
} from "@/lib/api/library.api";
import {
  chapterSummarySchema,
  type Chapter,
  type ChapterSummary,
  type CharacterProfile,
  type CharacterRelationship,
  type CreateCharacterPayload,
  type CreateRelationshipPayload,
  type UpdateCharacterPayload,
  type UpdateRelationshipPayload,
} from "@/schemas/library.schema";

export const libraryKeys = {
  novels: ["library", "novels"] as const,
  novel: (id: string) => ["library", "novels", id] as const,
  volumes: (novelId: string) => ["library", "novels", novelId, "volumes"] as const,
  chapters: (novelId: string) => ["library", "novels", novelId, "chapters"] as const,
  chapter: (id: string) => ["library", "chapters", id] as const,
  chapterSearch: (novelId: string, keyword: string) =>
    ["library", "novels", novelId, "chapter-search", keyword] as const,
  characters: (novelId: string) => ["library", "novels", novelId, "characters"] as const,
  relationships: (novelId: string) => ["library", "novels", novelId, "relationships"] as const,
};

export function useNovels() {
  return useQuery({ queryKey: libraryKeys.novels, queryFn: getNovels });
}

export function useNovel(id: string) {
  return useQuery({ queryKey: libraryKeys.novel(id), queryFn: () => getNovel(id) });
}

export function useNovelVolumes(novelId: string) {
  return useQuery({
    queryKey: libraryKeys.volumes(novelId),
    queryFn: () => getNovelVolumes(novelId),
  });
}

export function useChapterSearch(novelId: string, keyword: string) {
  return useQuery({
    queryKey: libraryKeys.chapterSearch(novelId, keyword),
    queryFn: () => searchChapters(novelId, keyword),
    enabled: keyword.length > 0,
    placeholderData: keepPreviousData,
    staleTime: 0,
  });
}

export function useNovelChapters(novelId: string) {
  return useQuery({
    queryKey: libraryKeys.chapters(novelId),
    queryFn: () => getNovelChapters(novelId),
  });
}

export function useChapter(id: string) {
  return useQuery({ queryKey: libraryKeys.chapter(id), queryFn: () => getChapter(id) });
}

/** 服务端返回最新章节后，同步详情、目录字数与小说总字数。 */
export function syncChapterCache(queryClient: QueryClient, chapter: Chapter) {
  queryClient.setQueryData(libraryKeys.chapter(chapter.id), chapter);
  const summary = chapterSummarySchema.parse(chapter);
  queryClient.setQueryData<ChapterSummary[]>(libraryKeys.chapters(chapter.novel_id), (list) =>
    list?.map((item) => (item.id === chapter.id ? summary : item)),
  );
  void Promise.all([
    queryClient.invalidateQueries({
      queryKey: libraryKeys.novel(chapter.novel_id),
      exact: true,
    }),
    queryClient.invalidateQueries({ queryKey: libraryKeys.novels, exact: true }),
  ]);
}

/** 同一章节的保存串行执行，保证后发出的正文最后落库。 */
export function useUpdateChapterContent(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => updateChapterContent(id, content),
    scope: { id: `chapter-content:${id}` },
    onSuccess: (chapter) => syncChapterCache(queryClient, chapter),
  });
}

function requireNovelId(novelId: string | undefined) {
  if (!novelId) throw new Error("尚未选择小说");
  return novelId;
}

const UPDATE_DEBOUNCE_MS = 400;

const updateTimers = new Map<string, ReturnType<typeof setTimeout>>();
const pendingUpdatePatches = new Map<string, Record<string, unknown>>();

/** 同一实体的连续修改先乐观写入缓存，再防抖合并成一次请求落库。 */
function useEntityUpdate<TEntity extends { id: string }, TPatch extends Partial<TEntity>>(config: {
  novelId: string | undefined;
  listKey: (novelId: string) => readonly unknown[];
  updateApi: (id: string, patch: TPatch) => Promise<TEntity>;
}) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: TPatch }) => {
      if (!config.novelId) throw new Error("尚未选择小说");
      return config.updateApi(id, patch);
    },
    scope: { id: `entity-update:${config.novelId ?? "none"}` },
    onSuccess: (entity) => {
      queryClient.setQueryData<TEntity[]>(config.listKey(config.novelId ?? "none"), (list) =>
        list?.map((item) => (item.id === entity.id ? entity : item)),
      );
    },
    onError: () => {
      if (config.novelId)
        void queryClient.invalidateQueries({ queryKey: config.listKey(config.novelId) });
    },
  });

  return useCallback(
    (id: string, patch: TPatch) => {
      if (!config.novelId) return;
      const listKey = config.listKey(config.novelId);
      queryClient.setQueryData<TEntity[]>(listKey, (list) =>
        list?.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      );
      const mergeKey = `${config.novelId}:${id}`;
      const merged = { ...pendingUpdatePatches.get(mergeKey), ...patch };
      pendingUpdatePatches.set(mergeKey, merged);
      const timer = updateTimers.get(mergeKey);
      if (timer) clearTimeout(timer);
      updateTimers.set(
        mergeKey,
        setTimeout(() => {
          updateTimers.delete(mergeKey);
          const patch = pendingUpdatePatches.get(mergeKey);
          pendingUpdatePatches.delete(mergeKey);
          if (patch) mutation.mutate({ id, patch: patch as TPatch });
        }, UPDATE_DEBOUNCE_MS),
      );
    },
    [config, mutation, queryClient],
  );
}

export function useUpdateCharacter(novelId: string | undefined) {
  return useEntityUpdate<CharacterProfile, UpdateCharacterPayload>({
    novelId,
    listKey: libraryKeys.characters,
    updateApi: (id, payload) => updateCharacterApi(id, payload),
  });
}

export function useUpdateRelationship(novelId: string | undefined) {
  return useEntityUpdate<CharacterRelationship, UpdateRelationshipPayload>({
    novelId,
    listKey: libraryKeys.relationships,
    updateApi: (id, payload) => updateRelationshipApi(id, payload),
  });
}

export function useCreateCharacter(novelId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCharacterPayload) =>
      createCharacterApi({ ...payload, novel_id: requireNovelId(novelId) }),
    onSuccess: (character) => {
      queryClient.setQueryData<CharacterProfile[]>(
        libraryKeys.characters(novelId ?? ""),
        (list) => [...(list ?? []), character],
      );
    },
  });
}

export function useCreateRelationship(novelId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRelationshipPayload) =>
      createRelationshipApi({ ...payload, novel_id: requireNovelId(novelId) }),
    onSuccess: (relationship) => {
      queryClient.setQueryData<CharacterRelationship[]>(
        libraryKeys.relationships(novelId ?? ""),
        (list) => [...(list ?? []), relationship],
      );
    },
  });
}

export function useDeleteCharacter(novelId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (_id: string) => deleteCharacterApi(requireNovelId(novelId)),
    onMutate: async (id) => {
      if (!novelId) return undefined;
      const charactersKey = libraryKeys.characters(novelId);
      const relationshipsKey = libraryKeys.relationships(novelId);
      await Promise.all([
        queryClient.cancelQueries({ queryKey: charactersKey }),
        queryClient.cancelQueries({ queryKey: relationshipsKey }),
      ]);
      const characters = queryClient.getQueryData<CharacterProfile[]>(charactersKey);
      const relationships = queryClient.getQueryData<CharacterRelationship[]>(relationshipsKey);
      queryClient.setQueryData<CharacterProfile[]>(charactersKey, (list) =>
        list?.filter((item) => item.id !== id),
      );
      queryClient.setQueryData<CharacterRelationship[]>(relationshipsKey, (list) =>
        list?.filter((item) => item.sourceId !== id && item.targetId !== id),
      );
      return { characters, relationships };
    },
    onError: (_error, _id, context) => {
      if (!novelId || !context) return;
      queryClient.setQueryData(libraryKeys.characters(novelId), context.characters);
      queryClient.setQueryData(libraryKeys.relationships(novelId), context.relationships);
    },
  });
}

export function useDeleteRelationship(novelId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (_id: string) => deleteRelationshipApi(requireNovelId(novelId)),
    onMutate: async (id) => {
      if (!novelId) return undefined;
      const relationshipsKey = libraryKeys.relationships(novelId);
      await queryClient.cancelQueries({ queryKey: relationshipsKey });
      const relationships = queryClient.getQueryData<CharacterRelationship[]>(relationshipsKey);
      queryClient.setQueryData<CharacterRelationship[]>(relationshipsKey, (list) =>
        list?.filter((item) => item.id !== id),
      );
      return { relationships };
    },
    onError: (_error, _id, context) => {
      if (!novelId || !context) return;
      queryClient.setQueryData(libraryKeys.relationships(novelId), context.relationships);
    },
  });
}
