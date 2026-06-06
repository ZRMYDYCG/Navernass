'use client'

import type { NovelCharacter } from '@/lib/supabase/sdk'
import type { Relationship } from '@/lib/supabase/sdk/types'
import * as d3 from 'd3'
import { useEffect, useMemo, useRef, useState } from 'react'
import { findCharactersInChapter, filterRelationshipsForCharacters } from '@/lib/editor/chapter-characters'
import { cn } from '@/lib/utils'
import { getCharacterColor, useAppStore } from '@/store'

interface ChapterCharacterPreviewGraphProps {
  novelId: string
  chapterId: string
  chapterTitle: string
  chapterContent?: string | null
  className?: string
}

type GraphNode = NovelCharacter & d3.SimulationNodeDatum

type GraphLink = d3.SimulationLinkDatum<GraphNode> & Relationship & {
  source: GraphNode
  target: GraphNode
}

const NODE_RADIUS = 14

function ChapterPreviewEmptyState({ width, height }: { width: number, height: number }) {
  const cx = width / 2
  const cy = height / 2
  const spread = Math.min(width, height) * 0.22

  const nodes = [
    { x: cx - spread * 0.9, y: cy - spread * 0.35 },
    { x: cx + spread, y: cy - spread * 0.2 },
    { x: cx - spread * 0.15, y: cy + spread * 0.75 },
  ]

  const links = [
    [0, 1],
    [1, 2],
    [0, 2],
  ] as const

  return (
    <svg
      width={width}
      height={height}
      className="block h-full w-full text-muted-foreground/25"
      aria-hidden
    >
      {links.map(([from, to]) => (
        <line
          key={`${from}-${to}`}
          x1={nodes[from].x}
          y1={nodes[from].y}
          x2={nodes[to].x}
          y2={nodes[to].y}
          stroke="currentColor"
          strokeWidth={1}
          strokeOpacity={0.5}
        />
      ))}
      {nodes.map((node, index) => (
        <circle
          key={index}
          cx={node.x}
          cy={node.y}
          r={9}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.25}
          strokeDasharray="3 4"
          strokeOpacity={0.65}
        />
      ))}
    </svg>
  )
}

export function ChapterCharacterPreviewGraph({
  novelId,
  chapterId,
  chapterTitle,
  chapterContent,
  className,
}: ChapterCharacterPreviewGraphProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  const characters = useAppStore(state => state.characterMaterial.characters)
  const relationshipsByNovel = useAppStore(state => state.characterGraph.relationshipsByNovel)

  const relationships = relationshipsByNovel[novelId] ?? []

  const chapterCharacters = useMemo(
    () => findCharactersInChapter(chapterContent ?? '', characters, chapterTitle),
    [chapterContent, characters, chapterTitle],
  )

  const characterIds = useMemo(
    () => new Set(chapterCharacters.map(character => character.id)),
    [chapterCharacters],
  )

  const chapterRelationships = useMemo(
    () => filterRelationshipsForCharacters(relationships, characterIds),
    [relationships, characterIds],
  )

  const nodeIdsKey = useMemo(
    () => chapterCharacters.map(character => character.id).sort().join('|'),
    [chapterCharacters],
  )

  const linkIdsKey = useMemo(
    () => chapterRelationships.map(relationship => relationship.id).sort().join('|'),
    [chapterRelationships],
  )

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
    if (!svgRef.current || !dimensions.width || !dimensions.height) return
    if (chapterCharacters.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const graphLayer = svg.append('g').attr('class', 'graph-layer')

    const nodes: GraphNode[] = chapterCharacters.map(character => ({ ...character }))
    const nodeMap = new Map(nodes.map(node => [node.id, node]))

    const links: GraphLink[] = []
    for (const relationship of chapterRelationships) {
      const source = nodeMap.get(relationship.sourceId)
      const target = nodeMap.get(relationship.targetId)
      if (!source || !target) continue
      links.push({ ...relationship, source, target })
    }

    const linkGroup = graphLayer
      .append('g')
      .attr('class', 'links')
      .selectAll<SVGLineElement, GraphLink>('line')
      .data(links, link => link.id)
      .join('line')
      .attr('stroke', 'var(--muted-foreground)')
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.35)

    const nodeGroup = graphLayer
      .append('g')
      .attr('class', 'nodes')
      .selectAll<SVGGElement, GraphNode>('g')
      .data(nodes, node => node.id)
      .join('g')
      .style('cursor', 'grab')

    nodeGroup
      .append('circle')
      .attr('r', NODE_RADIUS)
      .attr('fill', node => getCharacterColor(node))
      .attr('stroke', 'var(--background)')
      .attr('stroke-width', 2)

    nodeGroup
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', NODE_RADIUS + 14)
      .attr('fill', 'var(--muted-foreground)')
      .attr('font-size', 11)
      .style('pointer-events', 'none')
      .text(node => node.name)

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(links)
        .id(node => node.id)
        .distance(90)
        .strength(0.6))
      .force('charge', d3.forceManyBody().strength(-220))
      .force('center', d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force('collide', d3.forceCollide<GraphNode>(NODE_RADIUS + 18))

    simulation.on('tick', () => {
      linkGroup
        .attr('x1', link => (link.source as GraphNode).x ?? 0)
        .attr('y1', link => (link.source as GraphNode).y ?? 0)
        .attr('x2', link => (link.target as GraphNode).x ?? 0)
        .attr('y2', link => (link.target as GraphNode).y ?? 0)

      nodeGroup.attr('transform', node => `translate(${node.x ?? 0}, ${node.y ?? 0})`)
    })

    const dragBehavior = d3.drag<SVGGElement, GraphNode>()
      .on('start', (event, node) => {
        if (!event.active) simulation.alphaTarget(0.25).restart()
        node.fx = node.x
        node.fy = node.y
      })
      .on('drag', (event, node) => {
        node.fx = event.x
        node.fy = event.y
      })
      .on('end', (event, node) => {
        if (!event.active) simulation.alphaTarget(0)
        node.fx = null
        node.fy = null
      })

    nodeGroup.call(dragBehavior)

    simulation.tick(300)
    simulation.stop()

    linkGroup
      .attr('x1', link => (link.source as GraphNode).x ?? 0)
      .attr('y1', link => (link.source as GraphNode).y ?? 0)
      .attr('x2', link => (link.target as GraphNode).x ?? 0)
      .attr('y2', link => (link.target as GraphNode).y ?? 0)

    nodeGroup.attr('transform', node => `translate(${node.x ?? 0}, ${node.y ?? 0})`)

    return () => {
      simulation.stop()
    }
  }, [chapterCharacters, chapterRelationships, dimensions.width, dimensions.height, nodeIdsKey, linkIdsKey])

  return (
    <div ref={containerRef} className={cn('relative h-full w-full', className)}>
      {chapterCharacters.length > 0
        ? (
            <svg
              ref={svgRef}
              width={dimensions.width}
              height={dimensions.height}
              className="block h-full w-full"
            />
          )
        : dimensions.width > 0 && dimensions.height > 0
          ? (
              <ChapterPreviewEmptyState
                width={dimensions.width}
                height={dimensions.height}
              />
            )
          : null}
    </div>
  )
}
