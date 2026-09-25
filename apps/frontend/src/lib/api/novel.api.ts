import { apiRequest } from "@/lib/http/request";
import { novelListSchema } from "@/schemas/novel.schema";

export function listNovels() {
  return apiRequest("novels", novelListSchema, { searchParams: { page: 1, pageSize: 10 } });
}
