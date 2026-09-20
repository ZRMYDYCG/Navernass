import { Module } from '@nestjs/common'
import { SkillController } from './skill.controller.js'
import { SkillParser } from './skill.parser.js'
import { SkillRegistry } from './skill.registry.js'
import { SkillResolver } from './skill.resolver.js'
import { SkillService } from './skill.service.js'

@Module({
  controllers: [SkillController],
  providers: [SkillParser, SkillRegistry, SkillResolver, SkillService],
  exports: [SkillResolver],
})
export class SkillModule {}
