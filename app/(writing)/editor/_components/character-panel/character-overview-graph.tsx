'use client'

import type { Character, Relationship } from './types'
import * as d3 from 'd3'
import debounce from 'lodash-es/debounce'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { charactersApi } from '@/lib/supabase/sdk/characters'
import { cn } from '@/lib/utils'
import { formatRelationshipLabel, getCharacterColor } from '@/store/characterGraphStore'
import { useCharacterMaterialStore } from '@/store/characterMaterialStore'

interface CharacterOverviewGraphProps {
  novelId: string
  characters: Character[]
  relationships: Relationship[]
  linkingSourceId?: string | null
  onSelectCharacter: (id?: string) => void
  onSelectRelationship: (id?: string) => void
  onEditCharacter: (id: string) => void
  onEditRelationship: (id: string) => void
  onStartLink: (id: string) => void
  onCompleteLink: (targetId: string, sourceId?: string) => void
  onCancelLink: () => void
  className?: string
}

type GraphNode = Character & d3.SimulationNodeDatum
type GraphLink = Relationship & d3.SimulationLinkDatum<GraphNode> & {
  parallelIndex: number
  parallelTotal: number
}

const CARD_WIDTH = 240
const CARD_HEIGHT = 300
const CARD_GAP_MIN = 100
const CARD_GAP_MAX = 200
const CARD_LINK_PADDING = -4
const LINK_STROKE = '#9aa489'
const LINK_STROKE_WIDTH = 2
const LINK_LABEL_FILL = '#f8fafc'
const LINK_LABEL_STROKE = '#d6dccb'
const LINK_LABEL_TEXT = '#334155'
const LINK_LABEL_PADDING_X = 10
const LINK_LABEL_PADDING_Y = 6
const LINK_CURVE_MAX = 160

function getCardEdgePoint(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  padding = CARD_LINK_PADDING,
) {
  const dx = toX - fromX
  const dy = toY - fromY
  if (dx === 0 && dy === 0) {
    return { x: fromX, y: fromY }
  }
  const halfWidth = CARD_WIDTH / 2 + padding
  const halfHeight = CARD_HEIGHT / 2 + padding
  const scale = 1 / Math.max(Math.abs(dx) / halfWidth, Math.abs(dy) / halfHeight)
  return {
    x: fromX + dx * scale,
    y: fromY + dy * scale,
  }
}

function getQuadraticControlPoint(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
) {
  const midX = (startX + endX) / 2
  const midY = (startY + endY) / 2
  const dx = endX - startX
  const dy = endY - startY
  const dr = Math.hypot(dx, dy) || 1
  const curve = Math.min(LINK_CURVE_MAX, dr * 0.35)
  const normX = -dy / dr
  const normY = dx / dr
  return {
    controlX: midX + normX * curve,
    controlY: midY + normY * curve,
  }
}

function getParallelOffset(distance: number, parallelIndex = 0, parallelTotal = 1) {
  if (parallelTotal <= 1) return 0
  const step = Math.min(24, Math.max(8, distance * 0.08))
  return (parallelIndex - (parallelTotal - 1) / 2) * step
}

function buildCurvedPath(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
) {
  const { controlX, controlY } = getQuadraticControlPoint(startX, startY, endX, endY)
  return `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`
}

function buildCurvedPathWithControl(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  controlX: number,
  controlY: number,
) {
  return `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`
}

function getLinkGeometry(link: GraphLink, source: GraphNode, target: GraphNode) {
  const sourceX = source.x ?? 0
  const sourceY = source.y ?? 0
  const targetX = target.x ?? 0
  const targetY = target.y ?? 0
  const startBase = getCardEdgePoint(sourceX, sourceY, targetX, targetY)
  const endBase = getCardEdgePoint(targetX, targetY, sourceX, sourceY)
  const dx = endBase.x - startBase.x
  const dy = endBase.y - startBase.y
  const dist = Math.hypot(dx, dy) || 1
  const nx = -dy / dist
  const ny = dx / dist
  const offset = getParallelOffset(dist, link.parallelIndex, link.parallelTotal)
  const start = { x: startBase.x + nx * offset, y: startBase.y + ny * offset }
  const end = { x: endBase.x + nx * offset, y: endBase.y + ny * offset }
  const { controlX, controlY } = getQuadraticControlPoint(startBase.x, startBase.y, endBase.x, endBase.y)
  return {
    start,
    end,
    control: {
      x: controlX + nx * offset,
      y: controlY + ny * offset,
    },
  }
}

function buildWavePath(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  options?: { phase?: number, amplitudeScale?: number },
) {
  const dx = endX - startX
  const dy = endY - startY
  const distance = Math.hypot(dx, dy)
  if (distance < 12) {
    return buildCurvedPath(startX, startY, endX, endY)
  }

  const { controlX, controlY } = getQuadraticControlPoint(startX, startY, endX, endY)
  const amplitudeScale = options?.amplitudeScale ?? 1
  const phase = options?.phase ?? 0
  const amplitude = Math.min(6, Math.max(2, distance * 0.035)) * amplitudeScale
  const wavelength = Math.max(26, Math.min(42, distance * 0.25))
  const waveCount = Math.max(1, Math.round(distance / wavelength))
  const segments = Math.max(24, Math.round(distance / 5))

  let path = ''
  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments
    const mt = 1 - t
    const x = mt * mt * startX + 2 * mt * t * controlX + t * t * endX
    const y = mt * mt * startY + 2 * mt * t * controlY + t * t * endY
    const dxdt = 2 * mt * (controlX - startX) + 2 * t * (endX - controlX)
    const dydt = 2 * mt * (controlY - startY) + 2 * t * (endY - controlY)
    const len = Math.hypot(dxdt, dydt) || 1
    const nx = -dydt / len
    const ny = dxdt / len
    const offset = Math.sin(t * Math.PI * 2 * waveCount + phase) * amplitude
    const px = x + nx * offset
    const py = y + ny * offset
    path += i === 0 ? `M ${px} ${py}` : ` L ${px} ${py}`
  }
  return path
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function darken(hex: string, amount = 0.18) {
  const safe = hex.replace('#', '')
  const num = Number.parseInt(safe, 16)
  if (Number.isNaN(num) || safe.length !== 6) return hex
  const r = Math.max(0, Math.round(((num >> 16) & 0xFF) * (1 - amount)))
  const g = Math.max(0, Math.round(((num >> 8) & 0xFF) * (1 - amount)))
  const b = Math.max(0, Math.round((num & 0xFF) * (1 - amount)))
  return `#${[r, g, b].map(value => value.toString(16).padStart(2, '0')).join('')}`
}

function lighten(hex: string, amount = 0.2) {
  const safe = hex.replace('#', '')
  const num = Number.parseInt(safe, 16)
  if (Number.isNaN(num) || safe.length !== 6) return hex
  const r = Math.min(255, Math.round(((num >> 16) & 0xFF) + (255 - ((num >> 16) & 0xFF)) * amount))
  const g = Math.min(255, Math.round(((num >> 8) & 0xFF) + (255 - ((num >> 8) & 0xFF)) * amount))
  const b = Math.min(255, Math.round((num & 0xFF) + (255 - (num & 0xFF)) * amount))
  return `#${[r, g, b].map(value => value.toString(16).padStart(2, '0')).join('')}`
}

function hexToRgba(hex: string, alpha: number) {
  const safe = hex.replace('#', '')
  const num = Number.parseInt(safe, 16)
  if (Number.isNaN(num) || safe.length !== 6) return `rgba(0,0,0,${alpha})`
  const r = (num >> 16) & 0xFF
  const g = (num >> 8) & 0xFF
  const b = num & 0xFF
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function CharacterOverviewGraph({
  novelId,
  characters,
  relationships,
  linkingSourceId,
  onSelectCharacter,
  onSelectRelationship,
  onEditCharacter,
  onEditRelationship,
  onStartLink,
  onCompleteLink,
  onCancelLink,
  className,
}: CharacterOverviewGraphProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const cardLayerRef = useRef<HTMLDivElement | null>(null)
  const simulationRef = useRef<d3.Simulation<GraphNode, undefined> | null>(null)
  const zoomLayerRef = useRef<SVGGElement | null>(null)
  const nodePositionsRef = useRef<Map<string, { x: number, y: number }>>(new Map())
  // 防抖保存函数（300ms）
  const debouncedSavePosition = useMemo(() => debounce(async (id: string, x: number, y: number) => {
    try {
      const updated = await charactersApi.update(id, { novel_id: novelId, overview_x: x, overview_y: y })
      // 更新本地 store
      try {
        useCharacterMaterialStore.getState().upsertCharacter(updated as any)
      } catch (_) {}
    } catch (err) {
      console.error('Failed to save position', err)
    }
  }, 300), [novelId])
  const linkingSourceIdRef = useRef<string | null>(null)
  const linksRef = useRef<GraphLink[]>([])
  const cardSelectionRef = useRef<d3.Selection<HTMLDivElement, GraphNode, HTMLDivElement, unknown> | null>(null)
  const linkSelectionRef = useRef<d3.Selection<SVGGElement, GraphLink, SVGGElement, unknown> | null>(null)
  const labelSelectionRef = useRef<d3.Selection<SVGGElement, GraphLink, SVGGElement, unknown> | null>(null)
  const gradientSelectionRef = useRef<d3.Selection<SVGLinearGradientElement, GraphLink, SVGDefsElement, unknown> | null>(null)
  const onEditCharacterRef = useRef(onEditCharacter)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const sortedRelationships = useMemo(() => (relationships ?? []).slice(), [relationships])
  const [dragLine, setDragLine] = useState<{ sourceId: string, startX: number, startY: number, endX: number, endY: number } | null>(null)
  const [hoverTargetId, setHoverTargetId] = useState<string | null>(null)
  const hoverTargetIdRef = useRef<string | null>(null)
  const handleBackgroundClick = useCallback(() => {
    onSelectCharacter(undefined)
    onSelectRelationship(undefined)
    onCancelLink()
  }, [onCancelLink, onSelectCharacter, onSelectRelationship])

  useEffect(() => {
    linkingSourceIdRef.current = linkingSourceId ?? null
  }, [linkingSourceId])

  useEffect(() => {
    onEditCharacterRef.current = onEditCharacter
  }, [onEditCharacter])

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const { width, height } = entry.contentRect
      setDimensions({
        width: Math.max(1, Math.floor(width)),
        height: Math.max(1, Math.floor(height)),
      })
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const updateHighlight = useCallback(() => {
    const cardSelection = cardSelectionRef.current
    if (!cardSelection) return

    cardSelection
      .classed('opacity-40', false)
      .classed('opacity-100', true)
      .classed('ring-2', false)
      .classed('is-dragging', false)
  }, [])

  useEffect(() => {
    updateHighlight()
  }, [updateHighlight])

  useEffect(() => {
    const cardSelection = cardSelectionRef.current
    if (!cardSelection) return
    const sourceId = dragLine?.sourceId ?? linkingSourceId ?? null
    cardSelection
      .classed('is-linking', node => Boolean(sourceId && node.id === sourceId))
      .classed('is-linking-target', node => Boolean(hoverTargetId && node.id === hoverTargetId))
  }, [dragLine, hoverTargetId, linkingSourceId])

  const buildCardHtml = useCallback((node: GraphNode) => {
    const baseColor = getCharacterColor(node)
    const gradientTop = baseColor
    const gradientBottom = darken(baseColor, 0.24)
    const ringColor = lighten(baseColor, 0.25)
    const shadowColor = hexToRgba(baseColor, 0.35)
    const name = escapeHtml(node.name)
    const description = escapeHtml(node.description ?? '暂无人物描述...')
    const firstAppearance = escapeHtml(node.first_appearance ?? '')
    const appearanceText = firstAppearance || '未出场'
    const avatar = escapeHtml(node.avatar ?? '/assets/mock-avatar.svg')
    const placeholderHtml = node.avatar
      ? ''
      : '<div class="absolute inset-0 flex items-center justify-center px-6 text-center text-[11px] text-white/85"><span>补充人物信息后，与你的角色见面</span></div>'

    return `
      <div class="character-card-shell relative rounded-2xl border border-border/70 bg-card shadow-[0_12px_24px_rgba(15,23,42,0.08)] p-0.5 overflow-hidden">
        <div class="relative z-10 rounded-[18px] border border-border/60 bg-background overflow-hidden">
          <div class="px-2 pt-2">
            <div class="relative h-[150px] rounded-[16px] overflow-hidden" style="background: linear-gradient(180deg, ${gradientTop} 0%, ${gradientBottom} 100%);">
              <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_55%)]"></div>
              <div class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/45"></div>
              ${placeholderHtml}
              <div class="absolute top-3 right-3 h-10 w-10 rounded-full border border-white/80 bg-white/10 shadow-sm overflow-hidden">
                <img src="${avatar}" alt="${name} 头像" class="h-full w-full object-cover" />
              </div>
              <div class="absolute bottom-3 left-3 text-white drop-shadow-sm">
                <div class="text-sm font-semibold">${name}</div>
              </div>
              <div
                data-action="connector"
                style="--accent:${baseColor}; --accent-ring:${ringColor}; --accent-shadow:${shadowColor};"
                class="absolute bottom-2 right-2 h-9 w-9 rounded-full bg-white/95 border border-white/80 opacity-0 transition-all duration-200 cursor-crosshair hover:scale-110"
              >
                <span class="absolute inset-0 rounded-full" style="box-shadow:0 0 0 2px var(--accent-ring), 0 6px 14px var(--accent-shadow);"></span>
                <span class="relative z-10 grid h-full w-full place-items-center">
                  <span class="grid grid-cols-2 gap-1">
                    <span class="h-1.5 w-1.5 rounded-full" style="background:var(--accent);"></span>
                    <span class="h-1.5 w-1.5 rounded-full" style="background:var(--accent);"></span>
                    <span class="h-1.5 w-1.5 rounded-full" style="background:var(--accent);"></span>
                    <span class="h-1.5 w-1.5 rounded-full" style="background:var(--accent);"></span>
                  </span>
                </span>
              </div>
            </div>
          </div>
          <div class="space-y-2 px-3 pb-3 pt-2">
            <div class="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
              <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 5h14a2 2 0 0 1 2 2v12"/>
                <path d="M4 19h14a2 2 0 0 0 2-2"/>
                <path d="M4 5v14a2 2 0 0 0 2 2"/>
                <path d="M6 8h8"/>
                <path d="M6 11h8"/>
                <path d="M6 14h6"/>
              </svg>
              <span>${appearanceText}</span>
            </div>
            <p class="line-clamp-2 text-[11px] text-muted-foreground" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${description}</p>
            <div class="flex items-center gap-2 pt-1">
              <button data-action="image" class="flex-1 inline-flex items-center justify-center gap-1 rounded-full border border-border px-2 py-1 text-[11px] text-foreground hover:bg-muted">
                <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 3l1.7 3.5L17 8l-3.3 1.5L12 13l-1.7-3.5L7 8l3.3-1.5L12 3z"/>
                  <path d="M5 13l1 2 2 .9-2 .9-1 2-1-2-2-.9 2-.9 1-2z"/>
                </svg>
                生成画像
              </button>
              <button data-action="edit" class="flex-1 inline-flex items-center justify-center gap-1 rounded-full border border-border px-2 py-1 text-[11px] text-foreground hover:bg-muted">
                <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
                </svg>
                编辑
              </button>
            </div>
          </div>
        </div>
      </div>
    `
  }, [])

  const updatePositions = useCallback(() => {
    const cardSelection = cardSelectionRef.current
    const linkSelection = linkSelectionRef.current
    const labelSelection = labelSelectionRef.current
    const gradientSelection = gradientSelectionRef.current
    if (!cardSelection || !linkSelection || !labelSelection) return

    cardSelection
      .style('transform', (node) => {
        const x = (node.x ?? 0) - CARD_WIDTH / 2
        const y = (node.y ?? 0) - CARD_HEIGHT / 2
        return `translate(${x}px, ${y}px)`
      })

    linkSelection
      .each(function (link) {
        const source = link.source as GraphNode
        const target = link.target as GraphNode
        const geometry = getLinkGeometry(link, source, target)
        const path = buildCurvedPathWithControl(
          geometry.start.x,
          geometry.start.y,
          geometry.end.x,
          geometry.end.y,
          geometry.control.x,
          geometry.control.y,
        )
        const group = d3.select(this)
        group.select<SVGPathElement>('.link-hit').attr('d', path)
        group.select<SVGPathElement>('.link-path').attr('d', path)
        group.selectAll<SVGPathElement, GraphLink>('.link-pulse').attr('d', path)
      })

    if (gradientSelection) {
      gradientSelection
        .attr('x1', (link) => {
          const source = link.source as GraphNode
          const target = link.target as GraphNode
          return getLinkGeometry(link, source, target).start.x
        })
        .attr('y1', (link) => {
          const source = link.source as GraphNode
          const target = link.target as GraphNode
          return getLinkGeometry(link, source, target).start.y
        })
        .attr('x2', (link) => {
          const source = link.source as GraphNode
          const target = link.target as GraphNode
          return getLinkGeometry(link, source, target).end.x
        })
        .attr('y2', (link) => {
          const source = link.source as GraphNode
          const target = link.target as GraphNode
          return getLinkGeometry(link, source, target).end.y
        })
    }

    labelSelection
      .attr('transform', (link) => {
        const source = link.source as GraphNode
        const target = link.target as GraphNode
        const geometry = getLinkGeometry(link, source, target)
        const labelX = (geometry.start.x + geometry.end.x + 2 * geometry.control.x) / 4
        const labelY = (geometry.start.y + geometry.end.y + 2 * geometry.control.y) / 4
        return `translate(${labelX}, ${labelY})`
      })
  }, [])

  useEffect(() => {
    if (!svgRef.current || !cardLayerRef.current) return
    if (!dimensions.width || !dimensions.height) return

    const container = d3.select(containerRef.current as HTMLDivElement)
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const defs = svg.append('defs')
    const zoomLayer = svg.append('g').attr('class', 'zoom-layer')
    zoomLayerRef.current = zoomLayer.node()
    const linkLayer = zoomLayer.append('g').attr('class', 'link-layer')
    const labelLayer = zoomLayer.append('g').attr('class', 'label-layer')

    const cardLayer = d3.select(cardLayerRef.current)
    cardLayer.selectAll('*').remove()
    cardLayer.style('transform-origin', '0 0').style('will-change', 'transform')

    const applyZoomTransform = (transform: d3.ZoomTransform) => {
      zoomLayer.attr('transform', transform.toString())
      cardLayer.style('transform', `matrix(${transform.k}, 0, 0, ${transform.k}, ${transform.x}, ${transform.y})`)
    }

    const zoomBehavior = d3.zoom<HTMLDivElement, unknown>()
      .scaleExtent([0.3, 3])
      .translateExtent([[-1000, -1000], [dimensions.width + 1000, dimensions.height + 1000]])
      .on('zoom', (event) => {
        applyZoomTransform(event.transform)
      })

    container.call(zoomBehavior as d3.ZoomBehavior<HTMLDivElement, unknown>)

    const currentTransform = d3.zoomTransform(container.node() as HTMLDivElement)
    applyZoomTransform(currentTransform)

    container.on('wheel', (event) => {
      event.preventDefault()
      event.stopPropagation()
      if (event.ctrlKey) {
        const scale = event.deltaY > 0 ? 0.9 : 1.1
        container.call(zoomBehavior.scaleBy, scale)
      } else {
        const delta = event.deltaY > 0 ? 60 : -60
        container.call(zoomBehavior.translateBy, 0, delta)
      }
    })

    container.on('click', (event) => {
      const targetNode = event.target as EventTarget | null
      if (targetNode === containerRef.current) {
        handleBackgroundClick()
      }
    })

    const count = characters.length
    const gapSlots = Math.max(1, count - 1)
    const availableGap = (dimensions.width - count * CARD_WIDTH) / gapSlots
    const cardGap = Number.isFinite(availableGap)
      ? Math.max(CARD_GAP_MIN, Math.min(CARD_GAP_MAX, availableGap))
      : CARD_GAP_MIN
    const totalWidth = count * CARD_WIDTH + (count - 1) * cardGap
    const startX = dimensions.width / 2 - totalWidth / 2 + CARD_WIDTH / 2

    const nodes: GraphNode[] = characters.map((character, index) => {
      const stored = nodePositionsRef.current.get(character.id)
      const initialX = character.overview_x ?? undefined
      const initialY = character.overview_y ?? undefined
      const baseX = count <= 1
        ? dimensions.width / 2
        : startX + index * (CARD_WIDTH + cardGap)
      const baseY = dimensions.height / 2 + (index % 2 === 0 ? -40 : 40)
      return {
        ...character,
        x: stored?.x ?? initialX ?? baseX,
        y: stored?.y ?? initialY ?? baseY,
      }
    })

    const nodeMap = new Map(nodes.map(node => [node.id, node]))

    const links = sortedRelationships
      .map(relationship => ({
        ...relationship,
        source: relationship.sourceId,
        target: relationship.targetId,
      }))

    const validLinks = links
      .map((link) => {
        const sourceNode = nodeMap.get(String(link.source))
        const targetNode = nodeMap.get(String(link.target))
        if (!sourceNode || !targetNode) return null
        return {
          ...link,
          source: sourceNode,
          target: targetNode,
          parallelIndex: 0,
          parallelTotal: 1,
        }
      })
      .filter(link => link !== null) as GraphLink[]

    const parallelMap = new Map<string, GraphLink[]>()
    validLinks.forEach((link) => {
      const key = [link.sourceId, link.targetId].sort().join('|')
      const group = parallelMap.get(key)
      if (group) {
        group.push(link)
      } else {
        parallelMap.set(key, [link])
      }
    })

    parallelMap.forEach((group) => {
      if (group.length <= 1) return
      const sorted = group.slice().sort((a, b) => a.id.localeCompare(b.id))
      sorted.forEach((link, index) => {
        link.parallelIndex = index
        link.parallelTotal = sorted.length
      })
    })

    linksRef.current = validLinks

    const linkEdgeColor = lighten(LINK_STROKE, 0.45)
    const linkPulseColor = lighten(LINK_STROKE, 0.55)

    const gradientSelection = defs
      .selectAll<SVGLinearGradientElement, GraphLink>('linearGradient')
      .data(validLinks, (d: GraphLink) => d.id)
      .join((enter) => {
        const gradient = enter
          .append('linearGradient')
          .attr('id', link => `overview-link-gradient-${link.id}`)
          .attr('gradientUnits', 'userSpaceOnUse')

        gradient.append('stop').attr('class', 'stop-start')
        gradient.append('stop').attr('class', 'stop-mid-start')
        gradient.append('stop').attr('class', 'stop-mid-end')
        gradient.append('stop').attr('class', 'stop-end')

        return gradient
      })

    gradientSelection.select<SVGStopElement>('.stop-start')
      .attr('offset', '0%')
      .attr('stop-color', linkEdgeColor)
      .attr('stop-opacity', 0.4)
    gradientSelection.select<SVGStopElement>('.stop-mid-start')
      .attr('offset', '28%')
      .attr('stop-color', LINK_STROKE)
      .attr('stop-opacity', 0.85)
    gradientSelection.select<SVGStopElement>('.stop-mid-end')
      .attr('offset', '72%')
      .attr('stop-color', LINK_STROKE)
      .attr('stop-opacity', 0.85)
    gradientSelection.select<SVGStopElement>('.stop-end')
      .attr('offset', '100%')
      .attr('stop-color', linkEdgeColor)
      .attr('stop-opacity', 0.4)

    const linkSelection = linkLayer
      .selectAll<SVGGElement, GraphLink>('g')
      .data(validLinks, (d: GraphLink) => d.id)
      .join((enter) => {
        const group = enter.append('g').attr('class', 'link-item')
        group
          .append('path')
          .attr('class', 'link-hit')
          .attr('fill', 'none')
          .attr('stroke', 'transparent')
          .attr('stroke-width', 12)
          .attr('stroke-linecap', 'round')
          .attr('stroke-linejoin', 'round')
          .style('pointer-events', 'stroke')

        group
          .append('path')
          .attr('class', 'link-path')
          .attr('fill', 'none')
          .attr('stroke', link => `url(#overview-link-gradient-${link.id})`)
          .attr('stroke-width', LINK_STROKE_WIDTH)
          .attr('stroke-linecap', 'round')
          .attr('stroke-linejoin', 'round')
          .style('pointer-events', 'none')

        group
          .append('path')
          .attr('class', 'link-pulse link-pulse-left')
          .attr('fill', 'none')
          .attr('stroke', linkPulseColor)
          .attr('stroke-width', 2.6)
          .attr('stroke-linecap', 'round')
          .attr('stroke-linejoin', 'round')
          .attr('pathLength', 1)
          .style('pointer-events', 'none')

        group
          .append('path')
          .attr('class', 'link-pulse link-pulse-right')
          .attr('fill', 'none')
          .attr('stroke', linkPulseColor)
          .attr('stroke-width', 2.6)
          .attr('stroke-linecap', 'round')
          .attr('stroke-linejoin', 'round')
          .attr('pathLength', 1)
          .style('pointer-events', 'none')

        return group
      })
      .style('cursor', 'pointer')
      .on('click', (event, link) => {
        event.stopPropagation()
        onSelectRelationship(link.id)
        onEditRelationship(link.id)
      })

    const labelSelection = labelLayer
      .selectAll<SVGGElement, GraphLink>('g')
      .data(validLinks, (d: GraphLink) => d.id)
      .join((enter) => {
        const group = enter.append('g').attr('class', 'link-label').style('pointer-events', 'none')
        group
          .append('rect')
          .attr('class', 'label-bg')
          .attr('rx', 999)
          .attr('fill', LINK_LABEL_FILL)
          .attr('stroke', LINK_LABEL_STROKE)
          .attr('stroke-width', 1)
          .style('filter', 'drop-shadow(0 1px 2px rgba(15, 23, 42, 0.08))')
        group
          .append('text')
          .attr('class', 'label-text')
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('font-size', 11)
          .attr('fill', LINK_LABEL_TEXT)
        return group
      })

    labelSelection.select<SVGTextElement>('.label-text').text(link => formatRelationshipLabel(link))

    labelSelection.each((_, index, nodes) => {
      const g = d3.select(nodes[index] as SVGGElement)
      const text = g.select<SVGTextElement>('.label-text').node()
      if (!text) return
      const bbox = text.getBBox()
      const width = bbox.width + LINK_LABEL_PADDING_X * 2
      const height = bbox.height + LINK_LABEL_PADDING_Y * 2
      g.select<SVGRectElement>('.label-bg')
        .attr('x', -width / 2)
        .attr('y', -height / 2)
        .attr('width', width)
        .attr('height', height)
        .attr('rx', height / 2)
    })

    const cardSelection = cardLayer
      .selectAll<HTMLDivElement, GraphNode>('div.character-card')
      .data(nodes, d => d.id)
      .join('div')
      .attr('class', 'character-card absolute w-[240px] h-[300px] pointer-events-auto select-none isolate cursor-grab active:cursor-grabbing')
      .style('position', 'absolute')
      .style('width', `${CARD_WIDTH}px`)
      .style('height', `${CARD_HEIGHT}px`)
      .style('transform-origin', '0 0')
      .each(function (node) {
        const element = this as HTMLDivElement
        element.setAttribute('data-node-id', node.id)
        element.style.setProperty('--card-accent', getCharacterColor(node))
        element.innerHTML = buildCardHtml(node)
        element.onmouseenter = () => {
          d3.select(element).raise().classed('z-50', true).classed('is-hovered', true)
        }
        element.onmouseleave = () => {
          d3.select(element).classed('z-50', false).classed('is-hovered', false)
        }
        element.onclick = (event) => {
          event.stopPropagation()
          onSelectCharacter(node.id)
        }

        const editButton = element.querySelector('[data-action="edit"]') as HTMLButtonElement | null
        if (editButton) {
          editButton.onclick = (event) => {
            event.stopPropagation()
            onEditCharacterRef.current(node.id)
          }
        }

        const imageButton = element.querySelector('[data-action="image"]') as HTMLButtonElement | null
        if (imageButton) {
          imageButton.onclick = (event) => {
            event.stopPropagation()
          }
        }

        const connector = element.querySelector('[data-action="connector"]') as HTMLDivElement | null
        if (connector) {
          let isDragging = false

          connector.onmousedown = (event) => {
            event.preventDefault()
            event.stopPropagation()
            isDragging = true
            const containerRect = containerRef.current?.getBoundingClientRect()
            if (!containerRect) return
            const rect = connector.getBoundingClientRect()
            const startX = rect.left + rect.width / 2 - containerRect.left
            const startY = rect.top + rect.height / 2 - containerRect.top
            onStartLink(node.id)
            setDragLine({
              sourceId: node.id,
              startX,
              startY,
              endX: startX,
              endY: startY,
            })
            hoverTargetIdRef.current = null
            setHoverTargetId(null)

            const resolveTargetId = (clientX: number, clientY: number) => {
              const hovered = document.elementFromPoint(clientX, clientY) as HTMLElement | null
              const hoveredCard = hovered?.closest?.('.character-card') as HTMLElement | null
              if (hoveredCard) {
                const cardData = hoveredCard.dataset?.nodeId
                if (cardData && cardData !== node.id) return cardData
              }

              const allCards = cardSelectionRef.current?.nodes() || []
              for (const card of allCards) {
                const cardRect = (card as HTMLElement).getBoundingClientRect()
                if (clientX >= cardRect.left && clientX <= cardRect.right
                  && clientY >= cardRect.top && clientY <= cardRect.bottom) {
                  const cardData = (card as HTMLElement).dataset?.nodeId
                  if (cardData && cardData !== node.id) {
                    return cardData
                  }
                }
              }
              return null
            }

            const onMouseMove = (e: MouseEvent) => {
              if (!isDragging) return
              const containerRect = containerRef.current?.getBoundingClientRect()
              if (!containerRect) return
              const endX = e.clientX - containerRect.left
              const endY = e.clientY - containerRect.top
              setDragLine(prev => prev ? { ...prev, endX, endY } : null)

              const foundTarget = resolveTargetId(e.clientX, e.clientY)
              hoverTargetIdRef.current = foundTarget
              setHoverTargetId(foundTarget)
            }

            const onMouseUp = (e: MouseEvent) => {
              if (!isDragging) return
              isDragging = false
              const resolvedTarget = resolveTargetId(e.clientX, e.clientY) ?? hoverTargetIdRef.current
              if (resolvedTarget) {
                onCompleteLink(resolvedTarget, node.id)
              } else {
                onCancelLink()
              }
              setDragLine(null)
              hoverTargetIdRef.current = null
              setHoverTargetId(null)
              document.removeEventListener('mousemove', onMouseMove)
              document.removeEventListener('mouseup', onMouseUp)
            }

            document.addEventListener('mousemove', onMouseMove)
            document.addEventListener('mouseup', onMouseUp)
          }

          connector.onclick = (event) => {
            event.stopPropagation()
          }
        }
      })

    const dragBehavior = d3.drag<HTMLDivElement, GraphNode>()
      .filter((event) => {
        const target = event.target as HTMLElement | null
        if (!target) return true
        if (target.closest('[data-action], button, a, input, textarea, select, [contenteditable="true"]')) {
          return false
        }
        return true
      })
      .on('start', function (this: HTMLDivElement, event, node) {
        if (!event.active) {
          simulationRef.current?.alphaTarget(0.15).restart()
        }
        node.fx = event.x
        node.fy = event.y
        d3.select(this).classed('is-dragging', false)
      })
      .on('drag', function (this: HTMLDivElement, event, node) {
        node.fx = event.x
        node.fy = event.y
        d3.select(this).classed('is-dragging', true)
      })
      .on('end', function (this: HTMLDivElement, event, node) {
        if (!event.active) {
          simulationRef.current?.alphaTarget(0)
        }
        node.fx = null
        node.fy = null
        d3.select(this).classed('is-dragging', false)
        // 持久化位置到数据库
        const nx = node.x ?? null
        const ny = node.y ?? null
        if (nx != null && ny != null) {
          debouncedSavePosition(node.id, nx, ny)
        }
      })

    cardSelection.call(dragBehavior)

    const simulation = d3.forceSimulation(nodes)
      .velocityDecay(1)
      .alphaDecay(1)

    simulation.on('tick', () => {
      nodes.forEach((node) => {
        if (node.x != null && node.y != null) {
          nodePositionsRef.current.set(node.id, { x: node.x, y: node.y })
        }
      })
      updatePositions()
    })

    simulationRef.current = simulation
    cardSelectionRef.current = cardSelection
    linkSelectionRef.current = linkSelection
    labelSelectionRef.current = labelSelection
    gradientSelectionRef.current = gradientSelection

    updatePositions()
    updateHighlight()

    return () => {
      simulation.stop()
    }
  }, [
    buildCardHtml,
    characters,
    dimensions,
    handleBackgroundClick,
    onCancelLink,
    onCompleteLink,
    onEditRelationship,
    onSelectCharacter,
    onSelectRelationship,
    onStartLink,
    sortedRelationships,
    updateHighlight,
    updatePositions,
  ])

  const dragPath = dragLine
    ? {
        main: buildWavePath(dragLine.startX, dragLine.startY, dragLine.endX, dragLine.endY),
        thread: buildWavePath(dragLine.startX, dragLine.startY, dragLine.endX, dragLine.endY, {
          phase: Math.PI / 2,
          amplitudeScale: 0.7,
        }),
      }
    : null

  const sourceColor = useMemo(() => {
    if (!dragLine) return LINK_STROKE
    const source = characters.find(c => c.id === dragLine.sourceId)
    return source ? getCharacterColor(source) : LINK_STROKE
  }, [dragLine, characters])

  const sourceColorLight = useMemo(() => lighten(sourceColor, 0.3), [sourceColor])

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative h-full w-full overflow-hidden rounded-xl border border-border bg-background',
        'bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.35)_1px,transparent_0)] bg-[size:18px_18px]',
        className,
      )}
    >
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height} className="absolute inset-0 h-full w-full" />
      <svg className="absolute inset-0 h-full w-full pointer-events-none">
        {dragLine && dragPath && (
          <>
            <path
              d={dragPath.thread}
              stroke={sourceColorLight}
              strokeWidth={1.4}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.7}
              className="link-drag-thread"
            />
            <path
              d={dragPath.main}
              stroke={sourceColor}
              strokeWidth={2.2}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.8}
              className="link-drag-wave"
            />
            <path
              d={dragPath.main}
              stroke={sourceColorLight}
              strokeWidth={4}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.7}
              className="link-drag-pulse"
              style={{ filter: `drop-shadow(0 0 6px ${sourceColorLight})` }}
            />
            <circle
              cx={dragLine.endX}
              cy={dragLine.endY}
              r={6}
              fill="rgba(255,255,255,0.95)"
              stroke={sourceColor}
              strokeWidth={2}
              className="link-drag-dot-core"
            />
            <circle
              cx={dragLine.endX}
              cy={dragLine.endY}
              r={9}
              fill="none"
              stroke={sourceColorLight}
              strokeWidth={1.6}
              opacity={0.6}
              className="link-drag-dot-pulse"
            />
          </>
        )}
      </svg>
      <div
        ref={cardLayerRef}
        className="absolute inset-0 pointer-events-none"
      />

      {characters.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
          暂无角色，请先新建角色
        </div>
      )}
      <style jsx global>
        {`
        .character-card:is(.is-dragging, .is-linking, .is-linking-target) {
          z-index: 60;
        }
        .character-card:is(.is-dragging, .is-linking, .is-linking-target) .character-card-shell {
          border-color: var(--card-accent);
        }
        .character-card:is(.is-dragging, .is-linking, .is-linking-target) .character-card-shell::before {
          content: '';
          position: absolute;
          inset: -8px;
          border-radius: 24px;
          padding: 3px;
          background: repeating-conic-gradient(
            from 0deg,
            color-mix(in oklab, var(--card-accent) 88%, white) 0deg 18deg,
            transparent 18deg 32deg,
            var(--card-accent) 32deg 50deg,
            transparent 50deg 64deg
          );
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          animation: character-card-border-spin 3.2s linear infinite;
          pointer-events: none;
          z-index: 0;
          filter: blur(0.2px);
        }
        @keyframes character-card-border-spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .character-card.is-hovered [data-action="connector"] {
          opacity: 1;
        }
        .link-item:hover .link-path {
          stroke-opacity: 1;
        }
        .link-path {
          stroke-opacity: 0.85;
        }
        .link-pulse {
          stroke-dasharray: 0.035 0.965;
          stroke-dashoffset: 0.5;
          opacity: 0.9;
        }
        .link-pulse-left {
          animation: link-pulse-left 0.85s linear infinite;
        }
        .link-pulse-right {
          animation: link-pulse-right 0.85s linear infinite;
        }
        @keyframes link-pulse-left {
          0% {
            stroke-dashoffset: 0.5;
            opacity: 0.95;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 0.2;
          }
        }
        @keyframes link-pulse-right {
          0% {
            stroke-dashoffset: 0.5;
            opacity: 0.95;
          }
          100% {
            stroke-dashoffset: 1;
            opacity: 0.2;
          }
        }
        .link-drag-thread {
          opacity: 0.6;
        }
        .link-drag-wave {
          opacity: 0.75;
        }
        .link-drag-pulse {
          stroke-dasharray: 14 40;
          animation: link-drag-pulse-flow 1.1s linear infinite;
        }
        @keyframes link-drag-pulse-flow {
          to {
            stroke-dashoffset: -54;
          }
        }
        .link-drag-dot-core {
          filter: drop-shadow(0 3px 8px rgba(15, 23, 42, 0.2));
        }
        .link-drag-dot-pulse {
          transform-origin: center;
          transform-box: fill-box;
          animation: link-drag-dot-pulse 1.2s ease-out infinite;
        }
        @keyframes link-drag-dot-pulse {
          0% {
            transform: scale(0.7);
            opacity: 0.7;
          }
          100% {
            transform: scale(1.7);
            opacity: 0;
          }
        }
      `}
      </style>
    </div>
  )
}
