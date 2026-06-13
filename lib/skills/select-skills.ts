import type { Skill } from '@/lib/ai/agents/types'
import { isSkillCompatibleWithMode } from '@/lib/skills/router-utils'

export function selectEnabledSkillIds(input: {
  text: string
  mode: string
  modeCompatibleSkillIds: string[]
  agentSkillWhitelist: Set<string>
  skills: Skill[]
}): { skillIds: string[], reasons: string[] } {
  const enabledSkillIds: string[] = []
  const reasons: string[] = []

  for (const skill of input.skills) {
    if (!isSkillCompatibleWithMode(
      skill,
      input.mode,
      input.modeCompatibleSkillIds,
      input.agentSkillWhitelist,
    )) {
      continue
    }

    const triggered = skill.triggers ? skill.triggers({ text: input.text, mode: input.mode }) : true
    if (triggered) {
      enabledSkillIds.push(skill.id)
      reasons.push(skill.id)
    }
  }

  return { skillIds: enabledSkillIds, reasons }
}
