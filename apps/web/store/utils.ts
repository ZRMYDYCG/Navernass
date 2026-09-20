// -----------------------------------------------------------------------------
// Immer draft helpers — 仅在 set((state) => { ... }) 回调内调用
// -----------------------------------------------------------------------------

export function removeIdFromArray(arr: string[], id: string): void {
  const index = arr.indexOf(id)
  if (index !== -1) arr.splice(index, 1)
}

export function removeItemById<T extends { id: string }>(arr: T[], id: string): void {
  const index = arr.findIndex(item => item.id === id)
  if (index !== -1) arr.splice(index, 1)
}

export function replaceArrayContents<T>(target: T[], source: T[]): void {
  target.length = 0
  for (const item of source) target.push(item)
}

export function applyPartialPatch<T extends object>(target: T, patch: Partial<T>): void {
  for (const key of Object.keys(patch) as (keyof T)[]) {
    const value = patch[key]
    if (value !== undefined) {
      target[key] = value as T[typeof key]
    }
  }
}

// -----------------------------------------------------------------------------
// 角色图相关纯函数
// -----------------------------------------------------------------------------

export function getCharacterColor(character: { id: string, color?: string | null }) {
  if (character.color) return character.color
  const palette = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']
  let hash = 0
  for (let i = 0; i < character.id.length; i += 1) {
    hash = character.id.charCodeAt(i) + ((hash << 5) - hash)
  }
  return palette[Math.abs(hash) % palette.length]
}

export function formatRelationshipLabel(relationship: {
  sourceToTargetLabel?: string | null
  targetToSourceLabel?: string | null
}) {
  const a = (relationship.sourceToTargetLabel ?? '').trim()
  const b = (relationship.targetToSourceLabel ?? '').trim()
  if (a && b) return `${a} · ${b}`
  return a || b || '关系'
}
