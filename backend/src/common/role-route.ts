import { SetMetadata } from '@nestjs/common'

export const ROLE_ROUTE = 'role-route'
export const RoleRoute = (...roles: Array<'user' | 'super_admin'>) => SetMetadata(ROLE_ROUTE, roles)
