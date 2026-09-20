import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthModule as BetterAuthModule } from "@thallesp/nestjs-better-auth";
import type { EnvConfig } from "../config/env-schema.js";
import { PrismaService } from "../database/prisma.service.js";
import { createAuth } from "./auth.config.js";

@Global()
@Module({
  imports: [
    BetterAuthModule.forRootAsync({
      inject: [PrismaService, ConfigService],
      useFactory: (prisma: PrismaService, config: ConfigService<EnvConfig, true>) => ({
        auth: createAuth(prisma, config),
      }),
    }),
  ],
})
export class AuthCoreModule {}
