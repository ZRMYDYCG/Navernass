import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/supabase/sdk/utils/handler";
import { ApiResponseBuilder } from "@/lib/supabase/sdk/utils/response";
import { ChaptersService } from "@/lib/supabase/sdk/services/chapters.service";

const chaptersService = new ChaptersService();

/**
 * POST /api/chapters/reorder
 * 批量更新章节顺序
 */
export const POST = withErrorHandler(async (req: NextRequest) => {
  const body: Array<{ id: string; order_index: number }> = await req.json();
  await chaptersService.updateOrder(body);
  return ApiResponseBuilder.success({ message: "Chapter order updated successfully" });
});

