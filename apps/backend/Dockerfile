FROM node:24-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/backend/prisma apps/backend/prisma
COPY apps/backend/prisma7.config.ts apps/backend/prisma7.config.ts
# 仅安装后端工作区，避免把 Next.js 前端和 Supabase CLI 打进 API 镜像。
RUN pnpm install --filter @narraverse/backend --frozen-lockfile

FROM deps AS build
COPY apps/backend apps/backend
RUN pnpm --filter @narraverse/backend db:generate && pnpm --filter @narraverse/backend build

FROM node:24-alpine AS runner
RUN apk add --no-cache tini && corepack enable
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=build /app/apps/backend/dist ./apps/backend/dist
COPY --from=build /app/apps/backend/src/generated ./apps/backend/src/generated
COPY --from=build /app/apps/backend/prisma ./apps/backend/prisma
COPY --from=build /app/apps/backend/prisma7.config.ts ./apps/backend/prisma7.config.ts
COPY --from=build /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=build /app/apps/backend/skills ./apps/backend/skills
USER node
EXPOSE 3001
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "apps/backend/dist/main.js"]
