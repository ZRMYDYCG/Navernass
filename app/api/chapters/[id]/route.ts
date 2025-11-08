import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/supabase/sdk/utils/handler";
import { ApiResponseBuilder } from "@/lib/supabase/sdk/utils/response";
import { ChaptersService } from "@/lib/supabase/sdk/services/chapters.service";
import type { UpdateChapterDto } from "@/lib/supabase/sdk/types";

const chaptersService = new ChaptersService();

/**
 * GET /api/chapters/:id
 * 获取章节详情
 */
export const GET = withErrorHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const chapter = await chaptersService.getById(id);
    return ApiResponseBuilder.success(chapter);
  }
);

/**
 * PUT /api/chapters/:id
 * 更新章节
 */
export const PUT = withErrorHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const body: Partial<UpdateChapterDto> = await req.json();
    const chapter = await chaptersService.update(id, body);
    return ApiResponseBuilder.success(chapter);
  }
);

/**
 * DELETE /api/chapters/:id
 * 删除章节
 */
export const DELETE = withErrorHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    await chaptersService.delete(id);
    return ApiResponseBuilder.success({ message: "Chapter deleted successfully" });
  }
);

