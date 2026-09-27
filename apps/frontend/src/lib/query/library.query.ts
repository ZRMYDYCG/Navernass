import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";

import {
  getChapter,
  getNovel,
  getNovelChapters,
  getNovels,
  getNovelVolumes,
  updateChapterContent,
} from "@/lib/api/library.api";
import { chapterSummarySchema, type Chapter, type ChapterSummary } from "@/schemas/library.schema";

export const libraryKeys = {
  novels: ["library", "novels"] as const,
  novel: (id: string) => ["library", "novels", id] as const,
  volumes: (novelId: string) => ["library", "novels", novelId, "volumes"] as const,
  chapters: (novelId: string) => ["library", "novels", novelId, "chapters"] as const,
  chapter: (id: string) => ["library", "chapters", id] as const,
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
