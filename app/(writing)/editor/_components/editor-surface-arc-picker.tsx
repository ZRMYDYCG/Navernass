'use client'

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import { useI18n } from '@/hooks/use-i18n'
import { useIsMobile } from '@/hooks/use-media-query'
import {
  EDITOR_SURFACE_OPTIONS,
  getSurfaceArcLayout,
  getSurfaceArcPosition,
  type EditorSurfaceValue,
} from '@/lib/editor/surface-options'
import { cn } from '@/lib/utils'

interface EditorSurfacePickerProps {
  value: EditorSurfaceValue
  onChange: (value: EditorSurfaceValue) => void
}

interface ArcAnchor {
  x: number
  y: number
}

function EditorSurfaceMobileSelect({ value, onChange }: EditorSurfacePickerProps) {
  const { t } = useI18n()
  const current = EDITOR_SURFACE_OPTIONS.find(option => option.value === value) ?? EDITOR_SURFACE_OPTIONS[0]

  return (
    <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-7 min-w-24 border-none bg-transparent px-2 text-xs shadow-none focus:ring-0">
          <div className="flex min-w-0 items-center gap-2">
            <span
              data-editor-surface={current.value}
              className="editor-surface-swatch h-2.5 w-2.5 rounded-full border border-border/60"
            />
            <span>{t(`editor.surface.options.${current.value}`)}</span>
          </div>
        </SelectTrigger>
        <SelectContent side="top" align="start" className="z-[120] min-w-28 max-h-48">
          {EDITOR_SURFACE_OPTIONS.map(option => (
            <SelectItem key={option.value} value={option.value} className="text-xs">
              <div className="flex items-center gap-2">
                <span
                  data-editor-surface={option.value}
                  className="editor-surface-swatch h-2.5 w-2.5 rounded-full border border-border/60"
                />
                <span>{t(`editor.surface.options.${option.value}`)}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
  )
}

function EditorSurfaceArcMenu({ value, onChange }: EditorSurfacePickerProps) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [anchor, setAnchor] = useState<ArcAnchor | null>(null)
  const [hoveredValue, setHoveredValue] = useState<EditorSurfaceValue | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const current = EDITOR_SURFACE_OPTIONS.find(option => option.value === value) ?? EDITOR_SURFACE_OPTIONS[0]
  const hovered = hoveredValue ?? current.value

  const updateAnchor = useCallback(() => {
    const trigger = triggerRef.current
    if (!trigger) return

    const rect = trigger.getBoundingClientRect()
    setAnchor({
      x: rect.left + rect.width / 2,
      y: rect.top,
    })
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  useLayoutEffect(() => {
    if (!open) {
      setAnchor(null)
      setHoveredValue(null)
      return
    }

    updateAnchor()
  }, [open, updateAnchor])

  useEffect(() => {
    if (!open) return

    const handleReposition = () => updateAnchor()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    window.addEventListener('resize', handleReposition)
    window.addEventListener('scroll', handleReposition, true)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('resize', handleReposition)
      window.removeEventListener('scroll', handleReposition, true)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, updateAnchor])

  const handleSelect = (nextValue: EditorSurfaceValue) => {
    onChange(nextValue)
    setOpen(false)
  }

  const optionCount = EDITOR_SURFACE_OPTIONS.length
  const arcLayout = useMemo(() => getSurfaceArcLayout(optionCount), [optionCount])

  const hoveredIndex = Math.max(0, EDITOR_SURFACE_OPTIONS.findIndex(option => option.value === hovered))
  const hoveredLabelPosition = useMemo(
    () => getSurfaceArcPosition(hoveredIndex, optionCount, arcLayout),
    [hoveredIndex, optionCount, arcLayout],
  )

  const { radius: arcRadius, swatchSize } = arcLayout
  const svgPad = swatchSize / 2 + 6
  const svgWidth = arcRadius * 2 + svgPad * 2
  const svgHeight = arcRadius + svgPad
  const svgOriginX = svgWidth / 2
  const svgOriginY = svgHeight

  const spokeLines = useMemo(
    () => EDITOR_SURFACE_OPTIONS.map((option, index) => {
      const position = getSurfaceArcPosition(index, optionCount, arcLayout)
      const length = Math.hypot(position.x, position.y) || 1
      const inset = swatchSize / 2

      return {
        value: option.value,
        x2: svgOriginX + position.x * (1 - inset / length),
        y2: svgOriginY + position.y * (1 - inset / length),
      }
    }),
    [arcLayout, optionCount, svgOriginX, svgOriginY, swatchSize],
  )

  const arcPanel = open && anchor && mounted
    ? createPortal(
        <>
          <div
            className="fixed inset-0 z-[119]"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <div
            ref={panelRef}
            className="fixed z-[120] pointer-events-none"
            style={{ left: anchor.x, top: anchor.y }}
            role="listbox"
            aria-label={t('editor.surface.label')}
          >
            <div className="relative" style={{ width: 0, height: 0 }}>
              <svg
                className="absolute overflow-visible pointer-events-none"
                width={svgWidth}
                height={svgHeight}
                style={{ left: 0, top: -svgHeight, transform: 'translateX(-50%)' }}
                aria-hidden
              >
                {spokeLines.map((line, index) => {
                  const isHighlighted = line.value === hovered

                  return (
                    <line
                      key={line.value}
                      x1={svgOriginX}
                      y1={svgOriginY}
                      x2={line.x2}
                      y2={line.y2}
                      stroke="var(--border)"
                      strokeWidth={isHighlighted ? 1.25 : 1}
                      strokeOpacity={isHighlighted ? 0.6 : 0.32}
                      strokeLinecap="round"
                      className="transition-all duration-300 ease-[var(--ease-bounce)]"
                      style={{ transitionDelay: open ? `${index * 35}ms` : '0ms' }}
                    />
                  )
                })}
                <circle
                  cx={svgOriginX}
                  cy={svgOriginY}
                  r={3}
                  fill="var(--muted)"
                  fillOpacity={0.55}
                  stroke="var(--border)"
                  strokeWidth={1}
                  strokeOpacity={0.5}
                />
              </svg>

              {EDITOR_SURFACE_OPTIONS.map((option, index) => {
                const position = getSurfaceArcPosition(index, optionCount, arcLayout)
                const isSelected = option.value === value

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    aria-label={t(`editor.surface.options.${option.value}`)}
                    className={cn(
                      'absolute left-0 top-0 pointer-events-auto rounded-full border transition-all duration-300 ease-[var(--ease-bounce)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      isSelected
                        ? 'border-foreground/50 shadow-paper-md'
                        : 'border-border/60 hover:border-foreground/35',
                      open ? 'opacity-100' : 'opacity-0',
                    )}
                    style={{
                      width: swatchSize,
                      height: swatchSize,
                      transitionDelay: open ? `${index * 35}ms` : '0ms',
                      transform: open
                        ? `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${isSelected ? 1.1 : 1})`
                        : 'translate(-50%, -50%) scale(0.5)',
                    }}
                    onMouseEnter={() => setHoveredValue(option.value)}
                    onMouseLeave={() => setHoveredValue(null)}
                    onClick={() => handleSelect(option.value)}
                  >
                    <span
                      data-editor-surface={option.value}
                      className="editor-surface-swatch block h-full w-full rounded-full"
                    />
                  </button>
                )
              })}

              <div
                className={cn(
                  'absolute left-0 top-0 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-[11px] text-popover-foreground shadow-paper-sm transition-all duration-200 pointer-events-none',
                  open ? 'opacity-100' : 'opacity-0',
                )}
                style={{
                  transform: `translate(calc(-50% + ${hoveredLabelPosition.x}px), calc(-50% + ${hoveredLabelPosition.y - 26}px))`,
                }}
              >
                {t(`editor.surface.options.${hovered}`)}
              </div>
            </div>
          </div>
        </>,
        document.body,
      )
    : null

  return (
    <>
      <Button
          ref={triggerRef}
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            'h-7 gap-2 px-2 text-xs text-muted-foreground hover:text-foreground',
            open && 'bg-accent/60 text-foreground',
          )}
          aria-expanded={open}
          aria-haspopup="listbox"
          onClick={() => setOpen(prev => !prev)}
        >
          <span
            data-editor-surface={current.value}
            className="editor-surface-swatch h-3 w-3 rounded-full border border-border/60"
          />
          <span>{t(`editor.surface.options.${current.value}`)}</span>
        </Button>
      {arcPanel}
    </>
  )
}

export function EditorSurfaceArcPicker(props: EditorSurfacePickerProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return <EditorSurfaceMobileSelect {...props} />
  }

  return <EditorSurfaceArcMenu {...props} />
}
