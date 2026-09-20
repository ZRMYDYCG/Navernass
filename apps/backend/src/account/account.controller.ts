import type { AuthUser } from "../common/current-user.js";
import type { UpdateProfile } from "./account.schema.js";
import { Body, Controller, Get, Inject, Patch } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../common/current-user.js";
import { ZodPipe } from "../common/zod-pipe.js";
import { ApiDoc, ApiZodBody } from "../openapi/api-doc.js";
import { ResourceResult } from "../openapi/api-model.js";
import { UpdateProfileDto } from "./account.dto.js";
import { updateProfile } from "./account.schema.js";
import { AccountService } from "./account.service.js";

@Controller()
@ApiTags("账号与工作台")
export class AccountController {
  constructor(@Inject(AccountService) private readonly account: AccountService) {}

  @Get("profile")
  @ApiDoc({ summary: "获取当前用户资料", type: ResourceResult })
  profile(@CurrentUser() user: AuthUser) {
    return this.account.profile(user.id);
  }

  @Patch("profile")
  @ApiDoc({ summary: "更新当前用户资料", type: ResourceResult })
  @ApiZodBody(UpdateProfileDto)
  update(@CurrentUser() user: AuthUser, @Body(new ZodPipe(updateProfile)) body: UpdateProfile) {
    return this.account.updateProfile(user.id, body);
  }

  @Get("workspace")
  @ApiDoc({ summary: "获取当前用户工作台聚合数据", type: ResourceResult })
  workspace(@CurrentUser() user: AuthUser) {
    return this.account.workspace(user.id);
  }
}
