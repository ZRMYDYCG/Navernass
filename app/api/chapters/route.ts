import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/supabase/sdk/utils/handler";
import { ApiResponseBuilder } from "@/lib/supabase/sdk/utils/response";
import { ChaptersService } from "@/lib/supabase/sdk/services/chapters.service";
import type { CreateChapterDto } from "@/lib/supabase/sdk/types";

const chaptersService = new ChaptersService();

/**
 * POST /api/chapters
 * 创建新章节
 */
export const POST = withErrorHandler(async (req: NextRequest) => {
  const body: CreateChapterDto = await req.json();
  const chapter = await chaptersService.create(body);
  return ApiResponseBuilder.success(chapter);
});

