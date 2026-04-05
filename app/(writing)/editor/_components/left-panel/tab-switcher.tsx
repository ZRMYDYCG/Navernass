import type { LeftTabType } from './types'
import { User } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useI18n } from '@/hooks/use-i18n'
import { TAB_CONFIGS } from './constants'

interface TabSwitcherProps {
  activeTab: LeftTabType
  onChange: (tab: LeftTabType) => void
  onToggleCharacters?: () => void
}

export function TabSwitcher({ activeTab, onChange, onToggleCharacters }: TabSwitcherProps) {
  const { t } = useI18n()

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col items-center gap-2 py-4 px-1">
        {TAB_CONFIGS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.value
          const label = t(`editor.leftPanel.tabs.${tab.value}`)

          return (
            <Tooltip key={tab.value}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => onChange(tab.value)}
                  className={`w-9 h-9 flex items-center justify-center rounded-md cursor-pointer text-xs transition-colors ${
                    isActive
                      ? 'bg-secondary text-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  {Icon
                    ? <Icon className="w-4 h-4" />
                    : <span>{label}</span>}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                <p>{label}</p>
              </TooltipContent>
            </Tooltip>
          )
        })}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={onToggleCharacters}
              className="w-9 h-9 flex items-center justify-center rounded-md cursor-pointer text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <User className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs">
            <p>{t('editor.characters.graph')}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
