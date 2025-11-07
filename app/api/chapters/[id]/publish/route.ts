import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/supabase/sdk/utils/handler";
import { ApiResponseBuilder } from "@/lib/supabase/sdk/utils/response";
import { ChaptersService } from "@/lib/supabase/sdk/services/chapters.service";

const chaptersService = new ChaptersService();

/**
 * POST /api/chapters/:id/publish
 * 发布章节
 */
export const POST = withErrorHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const chapter = await chaptersService.publish(params.id);
    return ApiResponseBuilder.success(chapter);
  }
);

/**
 * DELETE /api/chapters/:id/publish
 * 取消发布章节
 */
export const DELETE = withErrorHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const chapter = await chaptersService.unpublish(params.id);
    return ApiResponseBuilder.success(chapter);
  }
);

