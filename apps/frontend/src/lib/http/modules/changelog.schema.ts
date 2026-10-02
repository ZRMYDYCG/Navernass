import { z } from "zod";

export const changelogEntrySchema = z.object({
  sha: z.string(),
  subject: z.string(),
  author: z.string(),
  date: z.string(),
});

export type ChangelogEntry = z.infer<typeof changelogEntrySchema>;
