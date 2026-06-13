'use client'

import { ChevronDown, ClipboardList, History, Sparkles, Zap, type LucideIcon } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useI18n } from '@/hooks/use-i18n'
import { planFilesApi } from '@/lib/supabase/sdk'
import { cn } from '@/lib/utils'
import { selectOrderedPlanFiles, usePlanStore } from '@/store'
import { SkillsPanel } from './skills-panel'

interface PlanDrawerProps {
  novelId: string
  selectedPlanFileId?: string | null
  onSelectPlanFile?: (id: string) => void
}

interface PlanAccordionSectionProps {
  title: string
  icon: LucideIcon
  open: boolean
  onToggle: () => void
  badge?: string
  muted?: boolean
  scrollClassName?: string
  children?: ReactNode
}

function PlanAccordionSection({
  title,
  icon: Icon,
  open,
  onToggle,
  badge,
  muted = false,
  scrollClassName,
  children,
}: PlanAccordionSectionProps) {
  return (
    <div className={cn(muted && 'opacity-60')}>
      <button
        type="button"
        onClick={onToggle}
        className="flex h-9 w-full items-center gap-1.5 px-3 text-left transition-colors hover:bg-accent/60"
        aria-expanded={open}
      >
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200 ease-out',
            !open && '-rotate-90',
          )}
        />
        <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" strokeWidth={1.8} />
        <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">
          {title}
        </span>
        {badge && (
          <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">
            {badge}
          </span>
        )}
      </button>

      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-200 ease-out',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <div className={cn(
            'max-h-[min(28vh,200px)] overflow-y-auto px-2 pb-2 pt-0 scrollbar-none',
            scrollClassName,
          )}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export function PlanDrawer({
  novelId,
  selectedPlanFileId = null,
  onSelectPlanFile,
}: PlanDrawerProps) {
  const { t } = useI18n()
  const comingSoon = t('editor.leftPanel.planDrawer.comingSoon')
  const planFiles = usePlanStore(useShallow(selectOrderedPlanFiles))
  const hydrated = usePlanStore(s => s.plan.hydrated)

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    plan: true,
    skills: false,
    hooks: false,
    versions: false,
  })

  useEffect(() => {
    usePlanStore.getState().planActions.resetForNovel(novelId)
    let cancelled = false

    const load = async () => {
      try {
        const files = await planFilesApi.list(novelId)
        if (!cancelled) usePlanStore.getState().planActions.hydrate(novelId, files)
      } catch (error) {
        console.error('Failed to load plan files:', error)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [novelId])

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="shrink-0 bg-sidebar/30">
      <PlanAccordionSection
        title={t('editor.leftPanel.planDrawer.title')}
        icon={ClipboardList}
        open={openSections.plan}
        onToggle={() => toggleSection('plan')}
      >
        <div className="space-y-0.5">
          {!hydrated && (
            <p className="px-2 py-1.5 text-[11px] text-muted-foreground">
              {t('editor.planFile.loading')}
            </p>
          )}
          {hydrated && planFiles.length === 0 && (
            <p className="px-2 py-1.5 text-[11px] text-muted-foreground">
              {t('editor.leftPanel.planDrawer.empty')}
            </p>
          )}
          {planFiles.map((file) => {
            const isSelected = selectedPlanFileId === file.id

            return (
              <button
                key={file.id}
                type="button"
                onClick={() => onSelectPlanFile?.(file.id)}
                className={cn(
                  'flex min-h-[28px] w-full items-center rounded-lg px-2 py-0.5 text-left transition-all duration-200 ease-out',
                  isSelected
                    ? 'bg-background/95 shadow-paper-sm'
                    : 'hover:bg-background/60',
                )}
              >
                <span
                  className={cn(
                    'min-w-0 flex-1 truncate text-[12px] leading-snug',
                    isSelected ? 'font-medium text-foreground' : 'text-foreground/90',
                  )}
                >
                  {file.name}
                </span>
              </button>
            )
          })}
        </div>
      </PlanAccordionSection>

      <PlanAccordionSection
        title={t('editor.leftPanel.planDrawer.skills')}
        icon={Sparkles}
        open={openSections.skills}
        onToggle={() => toggleSection('skills')}
        scrollClassName="max-h-[min(40vh,280px)]"
      >
        <SkillsPanel active={openSections.skills} />
      </PlanAccordionSection>

      <PlanAccordionSection
        title={t('editor.leftPanel.planDrawer.hooks')}
        icon={Zap}
        open={openSections.hooks}
        onToggle={() => toggleSection('hooks')}
        badge={comingSoon}
        muted
      >
        <p className="px-2 py-1.5 text-[11px] text-muted-foreground">
          {comingSoon}
        </p>
      </PlanAccordionSection>

      <PlanAccordionSection
        title={t('editor.leftPanel.planDrawer.versions')}
        icon={History}
        open={openSections.versions}
        onToggle={() => toggleSection('versions')}
        badge={comingSoon}
        muted
      >
        <p className="px-2 py-1.5 text-[11px] text-muted-foreground">
          {comingSoon}
        </p>
      </PlanAccordionSection>
    </div>
  )
}
