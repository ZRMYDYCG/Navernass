'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

interface RoughAnnotationProps {
  children: React.ReactNode
  className?: string
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function getTextSeed(children: React.ReactNode) {
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children)
  }

  if (children && typeof children === 'object' && 'props' in children) {
    const propsChildren = (children as { props?: { children?: React.ReactNode } }).props?.children
    if (typeof propsChildren === 'string' || typeof propsChildren === 'number') {
      return String(propsChildren)
    }
  }

  return ''
}

function generateRoughPath(w: number, h: number, seedValue: number) {
  const padding = 4
  const w2 = w + padding * 2
  const h2 = h + padding * 2
  const roughness = 1.5

  const points: Array<[number, number]> = [
    [padding, padding + seededRandom(seedValue + 1) * roughness],
    [w2 * 0.25, padding + seededRandom(seedValue + 2) * roughness],
    [w2 * 0.5, padding + seededRandom(seedValue + 3) * roughness],
    [w2 * 0.75, padding + seededRandom(seedValue + 4) * roughness],
    [w2 - padding, padding + seededRandom(seedValue + 5) * roughness],
    [w2 - padding, h2 * 0.25 + seededRandom(seedValue + 6) * roughness],
    [w2 - padding, h2 * 0.5 + seededRandom(seedValue + 7) * roughness],
    [w2 - padding, h2 * 0.75 + seededRandom(seedValue + 8) * roughness],
    [w2 - padding, h2 - padding + seededRandom(seedValue + 9) * roughness],
    [w2 * 0.75, h2 - padding + seededRandom(seedValue + 10) * roughness],
    [w2 * 0.5, h2 - padding + seededRandom(seedValue + 11) * roughness],
    [w2 * 0.25, h2 - padding + seededRandom(seedValue + 12) * roughness],
    [padding, h2 - padding + seededRandom(seedValue + 13) * roughness],
    [padding, h2 * 0.75 + seededRandom(seedValue + 14) * roughness],
    [padding, h2 * 0.5 + seededRandom(seedValue + 15) * roughness],
    [padding, h2 * 0.25 + seededRandom(seedValue + 16) * roughness],
  ]

  let path = `M ${points[0][0]} ${points[0][1]}`
  for (let i = 1; i < points.length; i++) {
    const [x, y] = points[i]
    const [prevX, prevY] = points[i - 1]
    const midX = (x + prevX) / 2
    const midY = (y + prevY) / 2
    path += ` Q ${prevX} ${prevY}, ${midX} ${midY}`
  }
  path += ` Q ${points[points.length - 1][0]} ${points[points.length - 1][1]}, ${points[0][0]} ${points[0][1]}`

  return path
}

export function RoughAnnotation({ children, className = '' }: RoughAnnotationProps) {
  const containerRef = useRef<HTMLSpanElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  const seed = useMemo(() => hashString(getTextSeed(children)), [children])

  useEffect(() => {
    const target = containerRef.current
    if (!target) return

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(entries => {
        const entry = entries[0]
        const { width, height } = entry.contentRect
        setDimensions(prev => (prev.width === width && prev.height === height ? prev : { width, height }))
      })

      observer.observe(target)
      return () => observer.disconnect()
    }

    const update = () => {
      const rect = target.getBoundingClientRect()
      setDimensions(prev => (prev.width === rect.width && prev.height === rect.height ? prev : { width: rect.width, height: rect.height }))
    }

    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [children])

  const path = useMemo(() => {
    if (dimensions.width <= 0 || dimensions.height <= 0) return ''
    return generateRoughPath(dimensions.width, dimensions.height, seed)
  }, [dimensions.width, dimensions.height, seed])

  return (
    <span ref={containerRef} className={`relative inline-block ${className}`}>
      {children}
      {dimensions.width > 0 && (
        <svg
          className="absolute pointer-events-none overflow-visible"
          style={{
            top: '-4px',
            left: '-4px',
            width: `${dimensions.width + 8}px`,
            height: `${dimensions.height + 8}px`,
          }}
        >
          <path
            d={path}
            fill="none"
            stroke="#b71c1c"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-80"
          />
        </svg>
      )}
    </span>
  )
}
