export interface Character {
  id: string
  name: string
  avatar?: string | null
  role?: string | null
  description?: string | null
  first_appearance?: string | null
  traits?: string[] | null
  keywords?: string[] | null
  note?: string | null
  color?: string | null
  overview_x?: number | null
  overview_y?: number | null
}

export interface Relationship {
  id: string
  sourceId: string
  targetId: string
  sourceToTargetLabel: string
  targetToSourceLabel: string
  note?: string | null
}
