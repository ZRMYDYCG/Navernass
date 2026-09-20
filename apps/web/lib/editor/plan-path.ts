/** Normalize virtual plan path to DB slug (strip optional plan/ prefix). */
export function normalizePlanPath(path: string): string {
  const trimmed = path.trim().replace(/^\/+/, '')
  return trimmed.startsWith('plan/') ? trimmed.slice('plan/'.length) : trimmed
}

/** Virtual path shown to AI / storage convention. */
export function toVirtualPlanPath(slug: string): string {
  const normalized = normalizePlanPath(slug)
  return normalized ? `plan/${normalized}` : 'plan'
}

export const PLAN_TAB_PREFIX = 'plan:'

export function planTabId(planFileId: string): string {
  return `${PLAN_TAB_PREFIX}${planFileId}`
}

export function parsePlanTabId(tabId: string): string | null {
  return tabId.startsWith(PLAN_TAB_PREFIX) ? tabId.slice(PLAN_TAB_PREFIX.length) : null
}

export function isPlanTabId(tabId: string): boolean {
  return tabId.startsWith(PLAN_TAB_PREFIX)
}
