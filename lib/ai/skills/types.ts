import type { Skill } from '../agents/types'

const skills = new Map<string, Skill>()

export function registerSkill(skill: Skill) {
  if (skills.has(skill.id)) {
    throw new Error(`Skill already registered: ${skill.id}`)
  }
  skills.set(skill.id, skill)
}

export function getSkill(id: string): Skill | undefined {
  return skills.get(id)
}

export function listSkills(): Skill[] {
  return Array.from(skills.values())
}
