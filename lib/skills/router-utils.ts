import type { Skill } from '@/lib/ai/agents/types'

export function isSkillCompatibleWithMode(
  skill: Skill,
  modeId: string,
  modeCompatibleSkillIds: string[],
  agentSkillWhitelist: Set<string>,
): boolean {
  if (skill.compatibleModes?.length) {
    return skill.compatibleModes.includes(modeId)
  }
  if (skill.isUserSkill) {
    return true
  }
  return modeCompatibleSkillIds.includes(skill.id) && agentSkillWhitelist.has(skill.id)
}

export function buildSkillLookup(skills: Skill[]): Map<string, Skill> {
  return new Map(skills.map(skill => [skill.id, skill]))
}

export function pickSkillsByIds(skillIds: string[], lookup: Map<string, Skill>): Skill[] {
  return skillIds
    .map(id => lookup.get(id))
    .filter((skill): skill is Skill => Boolean(skill))
}
