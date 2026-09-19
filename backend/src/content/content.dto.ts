import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import * as schema from './content.schema.js'

export class PageQueryDto extends createZodDto(schema.pageQuery) {}
export class NewsQueryDto extends createZodDto(schema.newsQuery) {}
export class CreateNewsDto extends createZodDto(schema.createNews) {}
export class UpdateNewsDto extends createZodDto(schema.updateNews) {}
export class CreateSurveyDto extends createZodDto(schema.createSurvey) {}
export class CreateTodoDto extends createZodDto(schema.createTodo) {}
export class UpdateTodoDto extends createZodDto(schema.updateTodo) {}
export class CreateWallDto extends createZodDto(schema.createWall) {}
export class IdQueryDto extends createZodDto(z.object({ id: z.uuid() })) {}
