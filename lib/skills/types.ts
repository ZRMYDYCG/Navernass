export interface UserCustomSkillRow {
  id: string
  user_id: string
  name: string
  display_name: string
  description: string
  skill_md: string
  enabled: boolean
}

export interface SkillMarketplaceItem {
  id: string
  name: string
  displayName: string
  description: string
  category: string
  license: 'official' | 'community' | 'user'
  version: string
  isBuiltin: boolean
  installed: boolean
  enabled: boolean
  isCustom: boolean
}
