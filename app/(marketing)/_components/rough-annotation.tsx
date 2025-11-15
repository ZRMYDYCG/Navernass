'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

interface RoughAnnotationProps {
  children: React.ReactNode
  className?: string
}

// 简单的哈希函数，用于根据文本内容生成稳定的随机数
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

// 伪随机数生成器，基于种子
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

export function RoughAnnotation({ children, className = '' }: RoughAnnotationProps) {
  const containerRef = useRef<HTMLSpanElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // 获取文本内容作为种子
  const textContent = typeof children === 'string'
    ? children
    : (children && typeof children === 'object' && 'props' in children && (children.props as { children?: string })?.children) || ''

  const seed = useMemo(() => hashString(String(textContent)), [textContent])

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        requestAnimationFrame(() => {
          setDimensions({ width: rect.width, height: rect.height })
        })
      }
    }

    updateDimensions()
    // 监听窗口大小变化
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [children])

  const generateRoughPath = (w: number, h: number, seedValue: number) => {
    const padding = 4
    const w2 = w + padding * 2
    const h2 = h + padding * 2
    const roughness = 1.5

    const points = [
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

  const path = useMemo(() => {
    if (dimensions.width > 0 && dimensions.height > 0) {
      return generateRoughPath(dimensions.width, dimensions.height, seed)
    }
    return ''
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
