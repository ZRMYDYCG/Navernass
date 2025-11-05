import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/supabase/sdk/utils/handler";
import { ApiResponseBuilder } from "@/lib/supabase/sdk/utils/response";
import { NovelsService } from "@/lib/supabase/sdk/services/novels.service";

const novelsService = new NovelsService();

/**
 * POST /api/novels/:id/archive
 * 归档小说
 */
export const POST = withErrorHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const novel = await novelsService.archive(params.id);
    return ApiResponseBuilder.success(novel);
  }
);

