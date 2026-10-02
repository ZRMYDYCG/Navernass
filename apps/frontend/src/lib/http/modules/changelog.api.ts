import { z } from "zod";

import { apiRequest } from "@/lib/http/request";
import { changelogEntrySchema } from "@/lib/http/modules/changelog.schema";

export function getChangelog(page: number, pageSize = 30) {
  return apiRequest(`changelog?page=${page}&pageSize=${pageSize}`, z.array(changelogEntrySchema));
}
