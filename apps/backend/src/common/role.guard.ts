import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PrismaService } from "../database/prisma.service.js";
import { AppError } from "./app-error.js";
import type { AuthRequest } from "./current-user.js";
import { ROLE_ROUTE } from "./role-route.js";

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const roles = this.reflector.getAllAndOverride<Array<"user" | "super_admin">>(ROLE_ROUTE, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles?.length) return true;

    const request = context.switchToHttp().getRequest<AuthRequest>();
    const user = request.user ?? (request.session as { user?: { id: string } } | undefined)?.user;
    if (!user) return false;
    const profile = await this.prisma.profile.findUnique({
      where: { id: user.id },
      select: { role: true },
    });
    if (!profile || !roles.includes(profile.role)) throw AppError.forbidden();
    return true;
  }
}
