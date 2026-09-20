'use client'

import { PanelLeftOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useI18n } from '@/hooks/use-i18n'
import { useSidebarToggle } from './sidebar-toggle-context'

/**
 * 展开侧边栏按钮。仅在 SidebarToggleContext 提供 toggle 时渲染。
 * 用法：放在每个顶层页面的 header 起始位置。
 */
export function SidebarOpenButton() {
  const onOpenSidebar = useSidebarToggle()
  const { t } = useI18n()

  if (!onOpenSidebar) return null

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onOpenSidebar}
            className="text-muted-foreground hover:text-foreground cursor-pointer hover:bg-accent"
            aria-label={t('main.sidebar.openSidebar')}
          >
            <PanelLeftOpen className="w-5 h-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('main.sidebar.openSidebar')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
