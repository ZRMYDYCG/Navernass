import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/supabase/sdk/utils/handler";
import { ApiResponseBuilder } from "@/lib/supabase/sdk/utils/response";
import { ChaptersService } from "@/lib/supabase/sdk/services/chapters.service";

const chaptersService = new ChaptersService();

/**
 * GET /api/novels/:id/chapters
 * 获取小说的所有章节
 */
export const GET = withErrorHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const chapters = await chaptersService.getByNovelId(params.id);
    return ApiResponseBuilder.success(chapters);
  }
);

