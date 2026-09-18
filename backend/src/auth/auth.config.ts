import { betterAuth } from 'better-auth/minimal'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import type { ConfigService } from '@nestjs/config'
import type { EnvConfig } from '../config/env-schema.js'
import type { PrismaService } from '../database/prisma.service.js'

export function createAuth(prisma: PrismaService, config: ConfigService<EnvConfig, true>) {
  const adminEmail = config.get('SUPER_ADMIN_EMAIL', { infer: true })?.toLowerCase()
  return betterAuth({
    baseURL: config.get('BETTER_AUTH_URL', { infer: true }),
    basePath: '/api/auth',
    secret: config.get('BETTER_AUTH_SECRET', { infer: true }),
    trustedOrigins: [config.get('APP_URL', { infer: true })],
    database: prismaAdapter(prisma, { provider: 'mysql' }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 30,
      updateAge: 60 * 60 * 24,
      cookieCache: { enabled: true, maxAge: 60 * 5 },
    },
    advanced: {
      database: { joins: true },
      useSecureCookies: config.get('NODE_ENV', { infer: true }) === 'production',
    },
    databaseHooks: {
      user: {
        create: {
          after: async user => {
            const protectedAdmin = Boolean(adminEmail && user.email.toLowerCase() === adminEmail)
            await prisma.profile.upsert({
              where: { id: user.id },
              create: {
                id: user.id,
                full_name: user.name,
                avatar_url: user.image,
                role: protectedAdmin ? 'super_admin' : 'user',
                is_protected: protectedAdmin,
              },
              update: {},
            })
          },
        },
      },
    },
  })
}

export type AppAuth = ReturnType<typeof createAuth>
