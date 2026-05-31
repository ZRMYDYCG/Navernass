import type { ComponentType, ReactNode } from 'react'
import type { AiModel } from './types'
import { cn } from '@/lib/utils'

interface ModelIconProps {
  className?: string
}

function ModelIconBase({
  className,
  gradientId,
  from,
  to,
  glyph,
}: ModelIconProps & {
  gradientId: string
  from: string
  to: string
  glyph: ReactNode
}) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('size-3.5 shrink-0', className)}
      aria-hidden
    >
      <rect width="16" height="16" rx="4" fill={`url(#${gradientId})`} />
      {glyph}
      <defs>
        <linearGradient id={gradientId} x1="2" y1="2" x2="14" y2="14" gradientUnits="userSpaceOnUse">
          <stop stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
      </defs>
    </svg>
  )
}

function MiniMaxM27Icon({ className }: ModelIconProps) {
  return (
    <ModelIconBase
      className={className}
      gradientId="minimax-m27"
      from="#FF6B4A"
      to="#FF3D5E"
      glyph={(
        <path
          d="M4.2 11V5h1.1l1.7 3.1L8.7 5h1.1v6H8.6V7.7L6.9 11h-.7L4.5 7.7V11H4.2z"
          fill="white"
        />
      )}
    />
  )
}

function MiniMaxM21Icon({ className }: ModelIconProps) {
  return (
    <ModelIconBase
      className={className}
      gradientId="minimax-m21"
      from="#FF7A5C"
      to="#E84A6F"
      glyph={(
        <path
          d="M4.2 11V5h1.1l1.7 3.1L8.7 5h1.1v6H8.6V7.7L6.9 11h-.7L4.5 7.7V11H4.2z"
          fill="white"
        />
      )}
    />
  )
}

function MiniMaxTextIcon({ className }: ModelIconProps) {
  return (
    <ModelIconBase
      className={className}
      gradientId="minimax-text"
      from="#4F8CFF"
      to="#2B5CDB"
      glyph={(
        <path
          d="M4.5 11V5h2.2c1.1 0 1.8.6 1.8 1.5 0 .7-.4 1.2-1 1.4l1.2 2.1H7.4L6.3 8.3H5.7V11H4.5zm1.2-3.5h.9c.5 0 .8-.3.8-.7 0-.4-.3-.7-.8-.7h-.9v1.4z"
          fill="white"
        />
      )}
    />
  )
}

function AbabIcon({ className }: ModelIconProps) {
  return (
    <ModelIconBase
      className={className}
      gradientId="minimax-abab"
      from="#8B5CF6"
      to="#6D28D9"
      glyph={(
        <path
          d="M4.3 11V5h1.3l1.1 2.2.2.4.2-.4L8.2 5h1.3v6H8.1V7.5l-1.2 2.3h-.7L4.9 7.5V11H4.3z"
          fill="white"
        />
      )}
    />
  )
}

export const MODEL_ICON_MAP: Record<AiModel, ComponentType<ModelIconProps>> = {
  'MiniMax-M2.7': MiniMaxM27Icon,
  'MiniMax-M2.1': MiniMaxM21Icon,
  'MiniMax-Text-01': MiniMaxTextIcon,
  'abab6.5s-chat': AbabIcon,
}

export function ModelIcon({ model, className }: ModelIconProps & { model: AiModel }) {
  const Icon = MODEL_ICON_MAP[model]
  return <Icon className={className} />
}
