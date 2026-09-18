import { z } from 'zod'

const booleanText = z.string().default('false').transform(value => value === 'true')

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  API_PREFIX: z.string().default('api/v1'),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
  TRUST_PROXY: booleanText,
  DATABASE_URL: z.url({ protocol: /^mysql$/ }),
  DATABASE_HOST: z.string().min(1),
  DATABASE_PORT: z.coerce.number().int().default(3306),
  DATABASE_USER: z.string().min(1),
  DATABASE_PASSWORD: z.string(),
  DATABASE_NAME: z.string().min(1),
  DATABASE_POOL_SIZE: z.coerce.number().int().min(1).max(100).default(10),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
  APP_URL: z.url(),
  SUPER_ADMIN_EMAIL: z.email().optional(),
})

export type EnvConfig = z.infer<typeof envSchema>

export function validateEnv(input: Record<string, unknown>): EnvConfig {
  const parsed = envSchema.safeParse(input)
  if (!parsed.success) {
    throw new Error(`环境变量校验失败：${z.prettifyError(parsed.error)}`)
  }
  return parsed.data
}
