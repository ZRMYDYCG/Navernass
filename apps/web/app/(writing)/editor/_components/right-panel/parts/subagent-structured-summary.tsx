'use client'

import { useI18n } from '@/hooks/use-i18n'
import type { SubagentStructuredSummary } from '@/lib/ai/agents/subagents/subagent-summary-schema'

interface SubagentStructuredSummaryViewProps {
  summary: SubagentStructuredSummary
}

const PRIORITY_KEYS = {
  high: 'editor.rightPanel.tools.subagent.structured.priorityHigh',
  medium: 'editor.rightPanel.tools.subagent.structured.priorityMedium',
  low: 'editor.rightPanel.tools.subagent.structured.priorityLow',
} as const

export function SubagentStructuredSummaryView({ summary }: SubagentStructuredSummaryViewProps) {
  const { t } = useI18n()

  return (
    <div className="space-y-2 text-foreground/90">
      <div>
        <div className="text-muted-foreground mb-0.5">
          {t('editor.rightPanel.tools.subagent.structured.overview')}
        </div>
        <p className="whitespace-pre-wrap break-words">{summary.overview}</p>
      </div>

      {summary.contradictions.length > 0 ? (
        <div>
          <div className="text-muted-foreground mb-0.5">
            {t('editor.rightPanel.tools.subagent.structured.contradictions')}
          </div>
          <ul className="list-disc pl-4 space-y-0.5">
            {summary.contradictions.map((item, i) => (
              <li key={i} className="whitespace-pre-wrap break-words">
                {item.description}
                {item.sources?.length ? (
                  <span className="text-muted-foreground">
                    {' '}
                    (
                    {item.sources.join('、')}
                    )
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {summary.citations.length > 0 ? (
        <div>
          <div className="text-muted-foreground mb-0.5">
            {t('editor.rightPanel.tools.subagent.structured.citations')}
          </div>
          <ul className="space-y-1 pl-2 border-l border-border/60">
            {summary.citations.map((item, i) => (
              <li key={i} className="whitespace-pre-wrap break-words">
                <span className="font-medium text-foreground/80">{item.location}</span>
                {item.excerpt ? (
                  <p className="text-muted-foreground mt-0.5">
                    {item.excerpt}
                  </p>
                ) : null}
                {item.note ? (
                  <p className="text-muted-foreground/80 mt-0.5 text-[9px]">
                    {item.note}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {summary.suggestions.length > 0 ? (
        <div>
          <div className="text-muted-foreground mb-0.5">
            {t('editor.rightPanel.tools.subagent.structured.suggestions')}
          </div>
          <ul className="list-disc pl-4 space-y-0.5">
            {summary.suggestions.map((item, i) => (
              <li key={i} className="whitespace-pre-wrap break-words">
                {item.priority ? (
                  <span className="text-primary/80 mr-1">
                    [
                    {t(PRIORITY_KEYS[item.priority])}
                    ]
                  </span>
                ) : null}
                {item.action}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {summary.timelineUpdates && summary.timelineUpdates.length > 0 ? (
        <div>
          <div className="text-muted-foreground mb-0.5">
            {t('editor.rightPanel.tools.subagent.structured.timelineUpdates')}
          </div>
          <ul className="list-disc pl-4 space-y-0.5">
            {summary.timelineUpdates.map((item, i) => (
              <li key={i} className="whitespace-pre-wrap break-words">
                {item.eventType || item.chapterRef ? (
                  <span className="text-muted-foreground text-[9px] mr-1">
                    [
                    {[item.eventType, item.chapterRef].filter(Boolean).join(' · ')}
                    ]
                    {' '}
                  </span>
                ) : null}
                {item.description}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
