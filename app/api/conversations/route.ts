import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/supabase/sdk/utils/handler";
import { ApiResponseBuilder } from "@/lib/supabase/sdk/utils/response";
import { ConversationsService } from "@/lib/supabase/sdk/services/conversations.service";
import type { CreateConversationDto } from "@/lib/supabase/sdk/types";

const conversationsService = new ConversationsService();

/**
 * GET /api/conversations
 * 获取对话列表
 */
export const GET = withErrorHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const novelId = searchParams.get("novelId") || undefined;

  const conversations = await conversationsService.getList({ novelId });
  return ApiResponseBuilder.success(conversations);
});

/**
 * POST /api/conversations
 * 创建新对话
 */
export const POST = withErrorHandler(async (req: NextRequest) => {
  const body: CreateConversationDto = await req.json();
  const conversation = await conversationsService.create(body);
  return ApiResponseBuilder.success(conversation);
});

