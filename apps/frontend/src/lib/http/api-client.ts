import ky, { HTTPError } from "ky";

import { ApiError } from "./api-error";
import { apiErrorSchema } from "@/schemas/api.schema";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

export const apiClient = ky.create({
  prefix: apiBaseUrl,
  timeout: 15_000,
  retry: {
    limit: 2,
    methods: ["get", "put", "head", "delete", "options", "trace"],
    statusCodes: [408, 429, 500, 502, 503, 504],
  },
  hooks: {
    beforeError: [
      async ({ error }) => {
        if (!(error instanceof HTTPError)) {
          return error;
        }

        const payload = apiErrorSchema.safeParse(
          await error.response
            .clone()
            .json()
            .catch(() => null),
        );

        if (payload.success) {
          return new ApiError(error.response.status, payload.data);
        }

        return error;
      },
    ],
  },
});
