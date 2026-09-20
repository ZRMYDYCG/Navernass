import { Injectable } from '@nestjs/common'
import { parse as parseYaml } from 'yaml'
import { AppError } from '../common/app-error.js'

export interface SkillFrontmatter {
  'name': string
  'description': string
  'license'?: string
  'compatibility'?: string
  'allowed-tools'?: string | string[]
  'argument-hint'?: string
  'user-invocable'?: boolean
  'disable-model-invocation'?: boolean
  'model'?: string
  'metadata'?: Record<string, unknown>
}

export interface ParsedSkill {
  frontmatter: SkillFrontmatter
  body: string
}

export interface RuntimeSkill {
  id: string
  systemPrompt: string
  toolNames?: string[]
}

const frontmatterPattern = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/
const namePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

@Injectable()
export class SkillParser {
  parse(skillMd: string): ParsedSkill {
    try {
      const match = skillMd.match(frontmatterPattern)
      if (!match?.[1] || match[2] === undefined) throw new Error('文件必须以 --- 包裹的 YAML frontmatter 开头')
      const frontmatter = parseYaml(match[1]) as SkillFrontmatter | null
      const body = match[2].trim()
      if (!frontmatter?.name || !namePattern.test(frontmatter.name) || frontmatter.name.length > 64) {
        throw new Error('name 必须是最长 64 位的小写 kebab-case')
      }
      if (!frontmatter.description?.trim()) throw new Error('description 不能为空')
      if (frontmatter.description.length > 1024) throw new Error('description 不能超过 1024 字符')
      if (!body) throw new Error('Skill 正文不能为空')
      return { frontmatter: { ...frontmatter, description: frontmatter.description.trim() }, body }
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new AppError('SKILL_INVALID', `SKILL.md 校验失败：${error instanceof Error ? error.message : String(error)}`)
    }
  }

  runtime(skillMd: string, id: string): RuntimeSkill {
    const parsed = this.parse(skillMd)
    const allowedTools = parsed.frontmatter['allowed-tools']
    return {
      id,
      systemPrompt: parsed.body,
      toolNames: Array.isArray(allowedTools) ? allowedTools : allowedTools?.split(/\s+/).filter(Boolean),
    }
  }
}
