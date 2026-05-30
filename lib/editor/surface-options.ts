export const DEFAULT_EDITOR_SURFACE = 'plain'

export const EDITOR_SURFACE_OPTIONS = [
  { value: 'plain', textured: false },
  { value: 'paper', textured: true },
  { value: 'mist', textured: false },
  { value: 'soft', textured: false },
  { value: 'rice', textured: true },
  { value: 'aged', textured: true },
  { value: 'cool', textured: false },
  { value: 'night', textured: false },
] as const

export type EditorSurfaceValue = (typeof EDITOR_SURFACE_OPTIONS)[number]['value']

export const getEditorSurfaceStorageKey = (novelId: string) => `editor-surface:${novelId}`

const ARC_START_ANGLE = 172
const ARC_END_ANGLE = 8

export function getSurfaceArcPosition(index: number, total: number, radius: number) {
  const t = total <= 1 ? 0.5 : index / (total - 1)
  const angleDeg = ARC_START_ANGLE - t * (ARC_START_ANGLE - ARC_END_ANGLE)
  const angleRad = (angleDeg * Math.PI) / 180

  return {
    x: Math.cos(angleRad) * radius,
    y: -Math.sin(angleRad) * radius,
  }
}
