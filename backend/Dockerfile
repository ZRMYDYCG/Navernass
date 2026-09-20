FROM node:24-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json backend/package.json
COPY backend/prisma backend/prisma
COPY backend/prisma7.config.ts backend/prisma7.config.ts
# 仅安装后端工作区，避免把 Next.js 前端和 Supabase CLI 打进 API 镜像。
RUN pnpm install --filter @narraverse/backend --frozen-lockfile

FROM deps AS build
COPY backend backend
RUN pnpm --dir backend db:generate && pnpm --dir backend build

FROM node:24-alpine AS runner
RUN apk add --no-cache tini && corepack enable
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/backend/src/generated ./backend/src/generated
COPY --from=build /app/backend/prisma ./backend/prisma
COPY --from=build /app/backend/prisma7.config.ts ./backend/prisma7.config.ts
COPY --from=build /app/backend/package.json ./backend/package.json
COPY --from=build /app/backend/skills ./backend/skills
USER node
EXPOSE 3001
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "backend/dist/main.js"]
