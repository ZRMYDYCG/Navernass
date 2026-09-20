'use client'

import {
  Bot,
  Check,
  ClipboardList,
  Globe2,
  ListTree,
  MessageSquare,
  Sparkles,
} from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Highlighter } from '@/components/ui/highlighter'
import { PaperCard } from '@/components/ui/paper-card'
import { SegmentedControl, SegmentedControlItem } from '@/components/ui/segmented-control'
import { useI18n } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'

const MODES = ['agent', 'ask', 'plan', 'outline', 'worldbook'] as const
type AgentMode = (typeof MODES)[number]

const MODE_ICONS = {
  agent: Bot,
  ask: MessageSquare,
  plan: ClipboardList,
  outline: ListTree,
  worldbook: Globe2,
} as const

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

export function AgentShowcase() {
  const { t } = useI18n()
  const [activeMode, setActiveMode] = useState<AgentMode>('agent')

  const sidebarItems = asStringArray(
    t(`marketing.agentShowcase.sidebarContent.${activeMode}`, { returnObjects: true }),
  )
  const toolAction = t(`marketing.agentShowcase.demo.${activeMode}.toolAction`)
  const highlights = [1, 2, 3] as const
  const ActiveIcon = MODE_ICONS[activeMode]

  return (
    <div className="w-full p-4 bg-background rounded-lg flex flex-col items-center text-center">
      <div className="mb-6 max-w-2xl">
        <h3 className="text-xl md:text-2xl font-serif text-foreground mb-2">
          <Highlighter action="underline" color="var(--primary)">
            {t('marketing.agentShowcase.title')}
          </Highlighter>
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t('marketing.agentShowcase.subtitle')}
        </p>
      </div>

      <div className="w-full max-w-5xl mb-6 overflow-x-auto">
        <SegmentedControl
          value={activeMode}
          onValueChange={value => setActiveMode(value as AgentMode)}
          size="sm"
          className="min-w-max mx-auto"
        >
          {MODES.map((mode) => {
            const Icon = MODE_ICONS[mode]
            return (
              <SegmentedControlItem key={mode} value={mode} size="sm" className="gap-1.5">
                <Icon className="h-3.5 w-3.5 shrink-0" />
                {t(`marketing.agentShowcase.modes.${mode}.name`)}
              </SegmentedControlItem>
            )
          })}
        </SegmentedControl>
      </div>

      <PaperCard variant="stack" className="w-full max-w-5xl text-left overflow-hidden">
        <div className="grid md:grid-cols-[220px_1fr] min-h-[340px]">
          <div className="border-b md:border-b-0 md:border-r border-border bg-muted/30 p-4">
            <div className="flex items-center gap-2 mb-3">
              <ActiveIcon className="h-4 w-4 text-primary shrink-0" />
              <span className="text-xs font-medium text-foreground">
                {t(`marketing.agentShowcase.sidebar.${activeMode}.title`)}
              </span>
            </div>

            {activeMode === 'ask'
              ? (
                  <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                    {t('marketing.agentShowcase.sidebar.ask.hint')}
                  </p>
                )
              : (
                  <ul className="space-y-1.5">
                    {sidebarItems.map((item, index) => (
                      <li
                        key={item}
                        className={cn(
                          'text-[11px] leading-snug px-2 py-1.5 rounded-md transition-colors',
                          index === 0
                            ? 'bg-accent text-accent-foreground font-medium'
                            : 'text-muted-foreground',
                        )}
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
          </div>

          <div className="flex flex-col bg-card">
            <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px] h-5 gap-1">
                  <ActiveIcon className="h-3 w-3" />
                  {t(`marketing.agentShowcase.modes.${activeMode}.name`)}
                </Badge>
                <span className="text-[10px] text-muted-foreground hidden sm:inline">
                  {t(`marketing.agentShowcase.modes.${activeMode}.tagline`)}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Sparkles className="h-3 w-3" />
                {t('marketing.agentShowcase.modelLabel')}
              </div>
            </div>

            <div className="flex-1 p-4 space-y-3 overflow-y-auto">
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-lg bg-primary text-primary-foreground px-3 py-2 text-xs leading-relaxed">
                  {t(`marketing.agentShowcase.demo.${activeMode}.user`)}
                </div>
              </div>

              <div className="flex justify-start">
                <div className="max-w-[90%] space-y-2">
                  <div className="rounded-lg bg-muted px-3 py-2 text-xs text-foreground leading-relaxed">
                    {t(`marketing.agentShowcase.demo.${activeMode}.assistant`)}
                  </div>

                  {toolAction
                    ? (
                        <div className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-[10px] text-muted-foreground">
                          <Check className="h-3 w-3 text-primary" />
                          {toolAction}
                        </div>
                      )
                    : null}

                  {activeMode === 'agent' && (
                    <div className="rounded-md border border-dashed border-primary/40 bg-primary/5 px-3 py-2 text-[10px] text-muted-foreground">
                      <span className="text-primary font-medium">
                        {t('marketing.agentShowcase.demo.agent.diffLabel')}
                      </span>
                      {' '}
                      {t('marketing.agentShowcase.demo.agent.diffHint')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </PaperCard>

      <div className="w-full max-w-5xl mt-6 grid gap-3 sm:grid-cols-3">
        {highlights.map((key) => (
          <div
            key={key}
            className="rounded-lg border border-border bg-card p-4 text-left"
          >
            <h4 className="text-sm font-medium text-foreground mb-1">
              {t(`marketing.agentShowcase.highlights.${key}.title`)}
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t(`marketing.agentShowcase.highlights.${key}.description`)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
