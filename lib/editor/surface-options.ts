export const DEFAULT_EDITOR_SURFACE = 'plain'

export const EDITOR_SURFACE_OPTIONS = [
  { value: 'plain', textured: false },
  { value: 'paper', textured: true },
  { value: 'mist', textured: false },
  { value: 'soft', textured: false },
  { value: 'rice', textured: true },
  { value: 'aged', textured: true },
  { value: 'cool', textured: false },
  { value: 'bamboo', textured: true },
  { value: 'ochre', textured: true },
  { value: 'indigo', textured: false },
  { value: 'apricot', textured: false },
  { value: 'night', textured: false },
] as const

export type EditorSurfaceValue = (typeof EDITOR_SURFACE_OPTIONS)[number]['value']

export const getEditorSurfaceStorageKey = (novelId: string) => `editor-surface:${novelId}`

export interface SurfaceArcLayout {
  radius: number
  swatchSize: number
  startAngle: number
  endAngle: number
}

/** 按选项数量动态计算弧面布局，避免色块重叠 */
export function getSurfaceArcLayout(optionCount: number): SurfaceArcLayout {
  const radius = Math.max(84, Math.min(136, 68 + optionCount * 5.5))
  const swatchSize = optionCount <= 8 ? 30 : optionCount <= 12 ? 26 : 22

  return {
    radius,
    swatchSize,
    startAngle: 176,
    endAngle: 4,
  }
}

export function getSurfaceArcPosition(
  index: number,
  total: number,
  layout: SurfaceArcLayout = getSurfaceArcLayout(total),
) {
  const t = total <= 1 ? 0.5 : index / (total - 1)
  const angleDeg = layout.startAngle - t * (layout.startAngle - layout.endAngle)
  const angleRad = (angleDeg * Math.PI) / 180

  return {
    x: Math.cos(angleRad) * layout.radius,
    y: -Math.sin(angleRad) * layout.radius,
  }
}
