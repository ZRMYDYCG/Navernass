import { createZodDto } from 'nestjs-zod'
import { bindNovelSkills, customSkill, installSkill, skillQuery, updateCustomSkill } from './skill.schema.js'

export class SkillQueryDto extends createZodDto(skillQuery) {}
export class InstallSkillDto extends createZodDto(installSkill) {}
export class CustomSkillDto extends createZodDto(customSkill) {}
export class UpdateCustomSkillDto extends createZodDto(updateCustomSkill) {}
export class BindNovelSkillsDto extends createZodDto(bindNovelSkills) {}
