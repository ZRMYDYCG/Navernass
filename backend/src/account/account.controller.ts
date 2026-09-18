import { Body, Controller, Get, Patch } from '@nestjs/common'
import { CurrentUser, type AuthUser } from '../common/current-user.js'
import { ZodPipe } from '../common/zod-pipe.js'
import { AccountService } from './account.service.js'
import { updateProfile, type UpdateProfile } from './account.schema.js'

@Controller()
export class AccountController {
  constructor(private readonly account: AccountService) {}

  @Get('profile')
  profile(@CurrentUser() user: AuthUser) {
    return this.account.profile(user.id)
  }

  @Patch('profile')
  update(@CurrentUser() user: AuthUser, @Body(new ZodPipe(updateProfile)) body: UpdateProfile) {
    return this.account.updateProfile(user.id, body)
  }

  @Get('workspace')
  workspace(@CurrentUser() user: AuthUser) {
    return this.account.workspace(user.id)
  }
}
