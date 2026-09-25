import { z } from "zod";

export const novelListSchema = z.array(
  z.object({
    id: z.uuid(),
    title: z.string(),
  }),
);
