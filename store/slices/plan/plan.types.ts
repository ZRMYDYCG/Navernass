import type { PlanFile } from '@/lib/supabase/sdk'

export type PlanState = {
  currentNovelId: string | null
  planFilesById: Record<string, PlanFile>
  planFileIdsOrdered: string[]
  hydrated: boolean
  selectedPlanFileId: string | null
}

export type PlanActions = {
  hydrate: (novelId: string, files: PlanFile[]) => void
  resetForNovel: (novelId: string) => void
  upsertPlanFile: (file: PlanFile) => void
  removePlanFile: (id: string) => void
  setSelectedPlanFileId: (id: string | null) => void
}

export type PlanSlice = {
  plan: PlanState
  planActions: PlanActions
}
