import ky, { HTTPError } from "ky";

import { apiErrorSchema } from "@/schemas/api.schema";

import { ApiError } from "./error";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

export const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? `${backendUrl}/api/v1`;

const baseClient = ky.create({
  credentials: "include",
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

/** Nest 业务接口，响应带 `{ success, data }` 信封。 */
export const apiClient = baseClient.extend({ prefix: apiBaseUrl });
