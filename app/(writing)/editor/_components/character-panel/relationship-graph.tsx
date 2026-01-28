'use client'

import * as d3 from 'd3'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { formatRelationshipLabel, getCharacterColor } from '@/store/characterGraphStore'
import { GraphViewSwitcher } from './graph-view-switcher'

interface RelationshipGraphProps {
  characters: Character[]
  relationships: Relationship[]
  selectedCharacterId?: string
  selectedRelationshipId?: string
  viewMode: 'force' | 'dialogue' | 'chord'
  showViewSwitcher?: boolean
  onViewModeChange?: (mode: 'force' | 'dialogue' | 'chord') => void
  onSelectCharacter: (id?: string) => void
  onSelectRelationship: (id?: string) => void
  onEditRelationship: (id: string) => void
  className?: string
}

type GraphNode = Character & d3.SimulationNodeDatum

type GraphLink = Relationship & d3.SimulationLinkDatum<GraphNode>

interface RibbonDatum {
  chord: d3.Chord
  relationship?: Relationship
  sourceId?: string
  targetId?: string
}

export function RelationshipGraph({
  characters,
  relationships,
  selectedCharacterId,
  selectedRelationshipId,
  viewMode,
  showViewSwitcher = true,
  onViewModeChange,
  onSelectCharacter,
  onSelectRelationship,
  onEditRelationship,
  className,
}: RelationshipGraphProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  const updateHighlightRef = useRef<(hoveredId?: string | null) => void>(() => {})
  const selectedCharacterIdRef = useRef<string | undefined>(selectedCharacterId)
  const selectedRelationshipIdRef = useRef<string | undefined>(selectedRelationshipId)
  const nodesRef = useRef<GraphNode[]>([])
  const linksRef = useRef<GraphLink[]>([])

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

  useEffect(() => {
    selectedCharacterIdRef.current = selectedCharacterId
    selectedRelationshipIdRef.current = selectedRelationshipId
    updateHighlightRef.current(null)
  }, [selectedCharacterId, selectedRelationshipId])

  useEffect(() => {
    if (!svgRef.current) return
    if (!dimensions.width || !dimensions.height) return

    const container = d3.select(containerRef.current)
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    svg.on('.zoom', null)
    svg.on('click', null)

    const graphLayer = svg.append('g').attr('class', 'graph-layer')
    const defs = svg.append('defs')

    // Zoom & pan for the whole canvas
    const zoomBehavior = d3.zoom<HTMLDivElement, unknown>()
      .scaleExtent([0.2, 4])
      .translateExtent([[-200, -200], [dimensions.width + 200, dimensions.height + 200]])
      .on('zoom', (event) => {
        graphLayer.attr('transform', event.transform.toString())
      })

    container.call(zoomBehavior as d3.ZoomBehavior<HTMLDivElement, unknown>)
    container.on('click', (event) => {
      if (event.target === containerRef.current || event.target === svgRef.current) {
        onSelectCharacter(undefined)
        onSelectRelationship(undefined)
      }
    })

    const nodes: GraphNode[] = characters.map(character => ({ ...character }))
    const characterIds = new Set(characters.map(c => c.id))
    const links: GraphLink[] = relationships
      .map(relationship => ({
        ...relationship,
        source: relationship.sourceId,
        target: relationship.targetId,
      }))
      .filter(link => characterIds.has(String(link.source)) && characterIds.has(String(link.target)))

    nodesRef.current = nodes
    linksRef.current = links

    const lighten = (hex: string, amount = 0.2) => {
      const safe = hex.replace('#', '')
      const num = Number.parseInt(safe, 16)
      if (Number.isNaN(num) || safe.length !== 6) return hex
      const r = Math.min(255, Math.round(((num >> 16) & 0xFF) + 255 * amount))
      const g = Math.min(255, Math.round(((num >> 8) & 0xFF) + 255 * amount))
      const b = Math.min(255, Math.round((num & 0xFF) + 255 * amount))
      return `#${[r, g, b].map(value => value.toString(16).padStart(2, '0')).join('')}`
    }

    const darken = (hex: string, amount = 0.2) => {
      const safe = hex.replace('#', '')
      const num = Number.parseInt(safe, 16)
      if (Number.isNaN(num) || safe.length !== 6) return hex
      const r = Math.max(0, Math.round(((num >> 16) & 0xFF) * (1 - amount)))
      const g = Math.max(0, Math.round(((num >> 8) & 0xFF) * (1 - amount)))
      const b = Math.max(0, Math.round((num & 0xFF) * (1 - amount)))
      return `#${[r, g, b].map(value => value.toString(16).padStart(2, '0')).join('')}`
    }

    const updateFocus = (hoveredId?: string | null) => {
      const focusNodeId = hoveredId ?? selectedCharacterIdRef.current ?? null
      const focusRelationshipId = selectedRelationshipIdRef.current ?? null

      const relatedNodeIds = new Set<string>()
      const relatedLinkIds = new Set<string>()

      if (focusRelationshipId) {
        const rel = linksRef.current.find(link => link.id === focusRelationshipId)
        if (rel) {
          relatedLinkIds.add(rel.id)
          relatedNodeIds.add(rel.sourceId)
          relatedNodeIds.add(rel.targetId)
        }
      }

      if (focusNodeId) {
        relatedNodeIds.add(focusNodeId)
        linksRef.current.forEach((link) => {
          if (link.sourceId === focusNodeId || link.targetId === focusNodeId) {
            relatedLinkIds.add(link.id)
            relatedNodeIds.add(link.sourceId)
            relatedNodeIds.add(link.targetId)
          }
        })
      }

      return {
        hasFocus: relatedNodeIds.size > 0 || relatedLinkIds.size > 0,
        relatedNodeIds,
        relatedLinkIds,
      }
    }

    if (viewMode === 'force') {
      const linkGroup = graphLayer
        .append('g')
        .attr('class', 'links')
        .selectAll<SVGGElement, GraphLink>('g')
        .data(links, (d: GraphLink) => d.id)
        .join('g')
        .style('cursor', 'pointer')
        .on('click', (event: MouseEvent, link: GraphLink) => {
          event.stopPropagation()
          onSelectRelationship(link.id)
          onEditRelationship(link.id)
        })

      linkGroup
        .append('line')
        .attr('class', 'link-hitarea')
        .attr('stroke', 'transparent')
        .attr('stroke-width', 16)

      const linkSelection = linkGroup
        .append('line')
        .attr('class', 'link-visible')
        .attr('stroke', '#94a3b8')
        .attr('stroke-width', 1.4)
        .attr('stroke-dasharray', '6 4')
        .attr('stroke-opacity', 0.7)
        .style('pointer-events', 'none')

      const labelGroup = graphLayer
        .append('g')
        .attr('class', 'link-labels')
        .selectAll<SVGGElement, GraphLink>('g')
        .data(links, (d: GraphLink) => d.id)
        .join('g')
        .style('cursor', 'pointer')
        .on('click', (event: MouseEvent, link: GraphLink) => {
          event.stopPropagation()
          onSelectRelationship(link.id)
          onEditRelationship(link.id)
        })

      labelGroup
        .append('rect')
        .attr('class', 'label-bg')
        .attr('rx', 4)
        .attr('fill', '#f1f5f9')
        .attr('stroke', '#e2e8f0')
        .attr('stroke-width', 1)

      labelGroup
        .append('text')
        .attr('class', 'label-text')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', 10)
        .attr('fill', '#0f172a')
        .text((link: GraphLink) => formatRelationshipLabel(link))

      labelGroup.each(function (this: SVGGElement) {
        const g = d3.select(this)
        const text = g.select<SVGTextElement>('.label-text').node()
        if (text) {
          const bbox = text.getBBox()
          g.select('.label-bg')
            .attr('x', -bbox.width / 2 - 6)
            .attr('y', -bbox.height / 2 - 3)
            .attr('width', bbox.width + 12)
            .attr('height', bbox.height + 6)
        }
      })

      const nodeGroup = graphLayer
        .append('g')
        .attr('class', 'nodes')
        .selectAll<SVGGElement, GraphNode>('g')
        .data(nodes, (d: GraphNode) => d.id)
        .join('g')
        .style('cursor', 'pointer')
        .on('click', (event: MouseEvent, node: GraphNode) => {
          event.stopPropagation()
          onSelectCharacter(node.id)
        })
        .on('mouseenter', (event: MouseEvent, node: GraphNode) => {
          updateHighlightRef.current(node.id)
        })
        .on('mouseleave', () => {
          updateHighlightRef.current(null)
        })

      const gradientIds = new Map<string, string>()
      nodes.forEach((node) => {
        const gradientId = `node-gradient-${node.id}`
        const baseColor = getCharacterColor(node)
        gradientIds.set(node.id, gradientId)
        const gradient = defs
          .append('linearGradient')
          .attr('id', gradientId)
          .attr('x1', '0%')
          .attr('y1', '0%')
          .attr('x2', '0%')
          .attr('y2', '100%')
        gradient.append('stop').attr('offset', '0%').attr('stop-color', lighten(baseColor, 0.15))
        gradient.append('stop').attr('offset', '100%').attr('stop-color', darken(baseColor, 0.12))
      })

      const nodeBody = nodeGroup
        .append('rect')
        .attr('x', -30)
        .attr('y', -42)
        .attr('width', 60)
        .attr('height', 84)
        .attr('rx', 18)
        .attr('fill', node => `url(#${gradientIds.get(node.id)})`)
        .attr('stroke', 'rgba(255,255,255,0.85)')
        .attr('stroke-width', 1.2)
        .style('filter', 'drop-shadow(0 6px 12px rgba(15, 23, 42, 0.15))')

      nodeGroup
        .append('circle')
        .attr('cx', -20)
        .attr('cy', -32)
        .attr('r', 4)
        .attr('fill', 'rgba(255,255,255,0.85)')

      nodeGroup
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', 26)
        .attr('fill', '#ffffff')
        .attr('font-size', 12)
        .attr('font-weight', 600)
        .style('pointer-events', 'none')
        .text(node => node.name)

      // Force simulation for node layout
      const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink<GraphNode, GraphLink>(links)
          .id(node => node.id)
          .distance(190)
          .strength(0.5))
        .force('charge', d3.forceManyBody().strength(-420))
        .force('center', d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
        .force('collide', d3.forceCollide<GraphNode>(48))

      simulation.on('tick', () => {
        linkGroup.each(function (this: SVGGElement, d: unknown, _index: number) {
          const link = d as GraphLink
          const g = d3.select(this)
          const x1 = (link.source as GraphNode).x ?? 0
          const y1 = (link.source as GraphNode).y ?? 0
          const x2 = (link.target as GraphNode).x ?? 0
          const y2 = (link.target as GraphNode).y ?? 0
          g.select('.link-hitarea').attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2)
          g.select('.link-visible').attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2)
        })

        nodeGroup
          .attr('transform', (node: GraphNode) => `translate(${node.x ?? 0}, ${node.y ?? 0})`)

        labelGroup.each(function (this: SVGGElement, d: unknown, _index: number) {
          const link = d as GraphLink
          const g = d3.select(this)
          const sourceX = (link.source as GraphNode).x ?? 0
          const targetX = (link.target as GraphNode).x ?? 0
          const sourceY = (link.source as GraphNode).y ?? 0
          const targetY = (link.target as GraphNode).y ?? 0
          const cx = (sourceX + targetX) / 2
          const cy = (sourceY + targetY) / 2
          g.attr('transform', `translate(${cx}, ${cy})`)
        })
      })

      // Dragging nodes updates their fixed position in the simulation
      const dragBehavior = d3.drag<SVGGElement, GraphNode>()
        .on('start', (event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>, node: GraphNode) => {
          if (!event.active) simulation.alphaTarget(0.3).restart()
          node.fx = node.x
          node.fy = node.y
        })
        .on('drag', (event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>, node: GraphNode) => {
          node.fx = event.x
          node.fy = event.y
        })
        .on('end', (event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>, node: GraphNode) => {
          if (!event.active) simulation.alphaTarget(0)
          node.fx = null
          node.fy = null
        })

      nodeGroup.call(dragBehavior)

      updateHighlightRef.current = () => {
        linkSelection
          .attr('stroke', '#94a3b8')
          .attr('stroke-width', 1.4)
          .attr('stroke-opacity', 0.7)

        labelGroup.attr('opacity', 0.9)
        nodeGroup.attr('opacity', 1)
        nodeBody
          .attr('stroke', 'rgba(255,255,255,0.85)')
          .attr('stroke-width', 1.2)
      }

      updateHighlightRef.current(null)

      return () => {
        simulation.stop()
      }
    }

    if (viewMode === 'dialogue') {
      const padding = { top: 56, right: 120, bottom: 48, left: 120 }
      const nodeWidth = 110
      const nodeHeight = 34
      const leftX = padding.left + nodeWidth / 2
      const rightX = dimensions.width - padding.right - nodeWidth / 2
      const sortedNodes = nodes.slice().sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
      const yScale = d3.scalePoint<string>()
        .domain(sortedNodes.map(node => node.id))
        .range([padding.top, dimensions.height - padding.bottom])
        .padding(0.6)

      const nodePositions = new Map<string, number>()
      sortedNodes.forEach((node) => {
        nodePositions.set(node.id, yScale(node.id) ?? dimensions.height / 2)
      })

      const linkLayer = graphLayer.append('g').attr('class', 'dialogue-links')
      const labelLayer = graphLayer.append('g').attr('class', 'dialogue-labels')
      const leftLayer = graphLayer.append('g').attr('class', 'dialogue-left')
      const rightLayer = graphLayer.append('g').attr('class', 'dialogue-right')

      const pathSelection = linkLayer
        .selectAll<SVGPathElement, GraphLink>('path')
        .data(links, (d: GraphLink) => d.id)
        .join('path')
        .attr('fill', 'none')
        .attr('stroke', '#94a3b8')
        .attr('stroke-width', 1.4)
        .attr('stroke-opacity', 0.6)
        .style('cursor', 'pointer')
        .attr('d', (link: GraphLink) => {
          const y1 = nodePositions.get(link.sourceId) ?? dimensions.height / 2
          const y2 = nodePositions.get(link.targetId) ?? dimensions.height / 2
          const x1 = leftX + nodeWidth / 2
          const x2 = rightX - nodeWidth / 2
          const dx = x2 - x1
          const c1x = x1 + dx * 0.35
          const c2x = x2 - dx * 0.35
          return `M ${x1} ${y1} C ${c1x} ${y1}, ${c2x} ${y2}, ${x2} ${y2}`
        })
        .on('click', (event: MouseEvent, link: GraphLink) => {
          event.stopPropagation()
          onSelectRelationship(link.id)
          onEditRelationship(link.id)
        })

      const labelSelection = labelLayer
        .selectAll<SVGTextElement, GraphLink>('text')
        .data(links, (d: GraphLink) => d.id)
        .join('text')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', 10)
        .attr('fill', '#0f172a')
        .style('pointer-events', 'none')
        .style('paint-order', 'stroke')
        .style('stroke', '#ffffff')
        .style('stroke-width', 3)
        .attr('x', (leftX + rightX) / 2)
        .attr('y', (link: GraphLink) => {
          const y1 = nodePositions.get(link.sourceId) ?? dimensions.height / 2
          const y2 = nodePositions.get(link.targetId) ?? dimensions.height / 2
          return (y1 + y2) / 2
        })
        .text((link: GraphLink) => formatRelationshipLabel(link))

      const leftNodes = leftLayer
        .selectAll<SVGGElement, GraphNode>('g')
        .data(sortedNodes, (d: GraphNode) => d.id)
        .join('g')
        .attr('transform', (node: GraphNode) => `translate(${leftX}, ${nodePositions.get(node.id) ?? dimensions.height / 2})`)
        .style('cursor', 'pointer')
        .on('click', (event: MouseEvent, node: GraphNode) => {
          event.stopPropagation()
          onSelectCharacter(node.id)
        })
        .on('mouseenter', (event: MouseEvent, node: GraphNode) => updateHighlightRef.current(node.id))
        .on('mouseleave', () => updateHighlightRef.current(null))

      const rightNodes = rightLayer
        .selectAll<SVGGElement, GraphNode>('g')
        .data(sortedNodes, (d: GraphNode) => d.id)
        .join('g')
        .attr('transform', (node: GraphNode) => `translate(${rightX}, ${nodePositions.get(node.id) ?? dimensions.height / 2})`)
        .style('cursor', 'pointer')
        .on('click', (event: MouseEvent, node: GraphNode) => {
          event.stopPropagation()
          onSelectCharacter(node.id)
        })
        .on('mouseenter', (event: MouseEvent, node: GraphNode) => updateHighlightRef.current(node.id))
        .on('mouseleave', () => updateHighlightRef.current(null))

      const leftRects = leftNodes
        .append('rect')
        .attr('x', -nodeWidth / 2)
        .attr('y', -nodeHeight / 2)
        .attr('width', nodeWidth)
        .attr('height', nodeHeight)
        .attr('rx', 12)
        .attr('fill', (node: GraphNode) => lighten(getCharacterColor(node), 0.15))
        .attr('stroke', 'rgba(255,255,255,0.9)')
        .attr('stroke-width', 1)

      leftNodes
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', 11)
        .attr('fill', '#0f172a')
        .text((node: GraphNode) => node.name)

      const rightRects = rightNodes
        .append('rect')
        .attr('x', -nodeWidth / 2)
        .attr('y', -nodeHeight / 2)
        .attr('width', nodeWidth)
        .attr('height', nodeHeight)
        .attr('rx', 12)
        .attr('fill', (node: GraphNode) => lighten(getCharacterColor(node), 0.15))
        .attr('stroke', 'rgba(255,255,255,0.9)')
        .attr('stroke-width', 1)

      rightNodes
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', 11)
        .attr('fill', '#0f172a')
        .text((node: GraphNode) => node.name)

      updateHighlightRef.current = () => {
        pathSelection
          .attr('stroke', '#94a3b8')
          .attr('stroke-width', 1.4)
          .attr('stroke-opacity', 0.6)

        labelSelection.attr('opacity', 0.9)
        leftNodes.attr('opacity', 1)
        rightNodes.attr('opacity', 1)
        leftRects
          .attr('stroke', 'rgba(255,255,255,0.9)')
          .attr('stroke-width', 1)
        rightRects
          .attr('stroke', 'rgba(255,255,255,0.9)')
          .attr('stroke-width', 1)
      }

      updateHighlightRef.current(null)

      return undefined
    }

    if (viewMode === 'chord') {
      const radius = Math.min(dimensions.width, dimensions.height) / 2 - 70
      const nodeOrder = nodes.slice().sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
      const indexById = new Map(nodeOrder.map((node, index) => [node.id, index]))
      const size = nodeOrder.length
      const matrix = Array.from({ length: size }, () => Array.from({ length: size }, () => 0))
      const relationshipMap = new Map<string, Relationship>()
      let relationshipCount = 0

      relationships.forEach((rel) => {
        const sourceIndex = indexById.get(rel.sourceId)
        const targetIndex = indexById.get(rel.targetId)
        if (sourceIndex == null || targetIndex == null) return
        matrix[sourceIndex][targetIndex] += 1
        matrix[targetIndex][sourceIndex] += 1
        relationshipMap.set(`${rel.sourceId}|${rel.targetId}`, rel)
        relationshipMap.set(`${rel.targetId}|${rel.sourceId}`, rel)
        relationshipCount += 1
      })

      if (relationshipCount === 0 && size > 0) {
        for (let i = 0; i < size; i += 1) {
          matrix[i][i] = 1
        }
      }

      const chord = d3.chord().padAngle(0.045).sortSubgroups(d3.descending)
      const chords = chord(matrix)

      const chordLayer = graphLayer
        .append('g')
        .attr('class', 'chord-layer')
        .attr('transform', `translate(${dimensions.width / 2}, ${dimensions.height / 2})`)

      const arcGenerator = d3.arc<d3.ChordGroup, d3.ChordGroup>()
        .innerRadius(radius)
        .outerRadius(radius + 14)

      const ribbonGenerator = d3.ribbon<d3.Chord, d3.Chord>()
        .radius(radius)

      const groups = chordLayer
        .append('g')
        .selectAll<SVGGElement, d3.ChordGroup>('g')
        .data(chords.groups)
        .join('g')
        .style('cursor', 'pointer')
        .on('click', (event: MouseEvent, group: d3.ChordGroup) => {
          event.stopPropagation()
          const node = nodeOrder[group.index]
          if (node) onSelectCharacter(node.id)
        })
        .on('mouseenter', (event: MouseEvent, group: d3.ChordGroup) => {
          const node = nodeOrder[group.index]
          if (node) updateHighlightRef.current(node.id)
        })
        .on('mouseleave', () => updateHighlightRef.current(null))

      const groupArcs = groups
        .append('path')
        .attr('d', arcGenerator as unknown as (d: d3.ChordGroup) => string)
        .attr('fill', (group: d3.ChordGroup) => getCharacterColor(nodeOrder[group.index]))
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 1.2)

      const groupLabels = groups
        .append('text')
        .attr('dy', '0.35em')
        .attr('font-size', 10)
        .attr('fill', '#0f172a')
        .attr('text-anchor', (group: d3.ChordGroup) => ((group.startAngle + group.endAngle) / 2 > Math.PI ? 'end' : 'start'))
        .attr('transform', (group: d3.ChordGroup) => {
          const angle = (group.startAngle + group.endAngle) / 2
          const rotate = (angle * 180) / Math.PI - 90
          const translate = radius + 20
          return `rotate(${rotate}) translate(${translate},0) ${angle > Math.PI ? 'rotate(180)' : ''}`
        })
        .text((group: d3.ChordGroup) => nodeOrder[group.index]?.name ?? '')

      const ribbonData: RibbonDatum[] = chords
        .filter(chordItem => chordItem.source.index <= chordItem.target.index)
        .map((chordItem) => {
          const sourceId = nodeOrder[chordItem.source.index]?.id
          const targetId = nodeOrder[chordItem.target.index]?.id
          const relationship = sourceId && targetId ? relationshipMap.get(`${sourceId}|${targetId}`) : undefined
          return {
            chord: chordItem,
            relationship,
            sourceId,
            targetId,
          }
        })
        .filter(item => item.relationship)

      const ribbons = chordLayer
        .append('g')
        .attr('class', 'chord-ribbons')
        .selectAll<SVGPathElement, RibbonDatum>('path')
        .data(ribbonData, d => d.relationship?.id ?? '')
        .join('path')
        .attr('d', (d: RibbonDatum) => ribbonGenerator(d.chord) ?? '')
        .attr('fill', (d: RibbonDatum) => getCharacterColor(nodeOrder[d.chord.source.index]))
        .attr('fill-opacity', 0.7)
        .attr('stroke', '#ffffff')
        .attr('stroke-opacity', 0.6)
        .attr('stroke-width', 0.6)
        .style('cursor', 'pointer')
        .on('click', (event, datum) => {
          event.stopPropagation()
          if (datum.relationship) {
            onSelectRelationship(datum.relationship.id)
            onEditRelationship(datum.relationship.id)
          }
        })

      updateHighlightRef.current = () => {
        ribbons
          .attr('fill-opacity', 0.7)
          .attr('stroke-opacity', 0.6)

        groupArcs
          .attr('opacity', 1)
          .attr('stroke-width', 1.2)

        groupLabels.attr('opacity', 1)
      }

      updateHighlightRef.current(null)

      return undefined
    }

    return undefined
  }, [characters, relationships, dimensions, onEditRelationship, onSelectCharacter, onSelectRelationship, viewMode])

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative h-full w-full overflow-hidden rounded-xl border border-border bg-background',
        'bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.35)_1px,transparent_0)] bg-[size:18px_18px]',
        className,
      )}
    >
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height} className="h-full w-full" />
      {characters.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
          暂无角色，请先新建角色
        </div>
      )}
      {showViewSwitcher && onViewModeChange && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2">
          <GraphViewSwitcher
            value={viewMode}
            onChange={onViewModeChange}
            className="pointer-events-auto"
          />
        </div>
      )}
    </div>
  )
}
