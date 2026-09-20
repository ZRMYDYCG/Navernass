import { createZodDto } from 'nestjs-zod'
import { adminQuery, deleteQuery, resourceParam } from './admin.schema.js'

export class AdminQueryDto extends createZodDto(adminQuery) {}
export class DeleteQueryDto extends createZodDto(deleteQuery) {}
export class ResourceParamDto extends createZodDto(resourceParam) {}
