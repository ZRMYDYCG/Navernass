import { createZodDto } from 'nestjs-zod'
import * as schema from './planning.schema.js'

export class NovelQueryDto extends createZodDto(schema.novelQuery) {}
export class CreateWorldbookDto extends createZodDto(schema.createWorldbook.omit({ novel_id: true })) {}
export class UpdateWorldbookDto extends createZodDto(schema.updateWorldbook) {}
export class CreateOutlineDto extends createZodDto(schema.createOutline.omit({ novel_id: true })) {}
export class UpdateOutlineDto extends createZodDto(schema.updateOutline) {}
export class CreatePlanDto extends createZodDto(schema.createPlan.omit({ novel_id: true })) {}
export class UpdatePlanDto extends createZodDto(schema.updatePlan) {}
export class CreateTimelineDto extends createZodDto(schema.createTimeline.omit({ novel_id: true })) {}
export class UpdateTimelineDto extends createZodDto(schema.updateTimeline) {}
