'use client'

import { PanelLeft } from 'lucide-react'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import { useMemo } from 'react'

interface HeaderLeftProps {
  showLeftPanel: boolean
  onToggleLeftPanel: () => void
}

export function HeaderLeft({ showLeftPanel, onToggleLeftPanel }: HeaderLeftProps) {
  const { resolvedTheme } = useTheme()

  // 根据主题选择 logo，使用 resolvedTheme 避免 hydration 不匹配
  const logoPath = useMemo(() => {
    return resolvedTheme === 'dark'
      ? '/assets/svg/logo-dark.svg'
      : '/assets/svg/logo-light.svg'
  }, [resolvedTheme])

  return (
    <div className="flex items-center gap-1.5 h-full">
      {/* Logo */}
      <div className="flex items-center justify-center w-8 h-8">
        {resolvedTheme && (
          <Image
            src={logoPath}
            alt="Logo"
            width={20}
            height={20}
            className="object-contain"
            priority
          />
        )}
      </div>

      {/* 左侧面板折叠按钮 */}
      <button
        type="button"
        onClick={onToggleLeftPanel}
        className={`p-1.5 h-7 w-7 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors ${
          showLeftPanel
            ? 'text-gray-900 dark:text-gray-100'
            : 'text-gray-400 dark:text-gray-600'
        }`}
        title={showLeftPanel ? '隐藏左侧面板' : '显示左侧面板'}
      >
        <PanelLeft className="w-4 h-4" />
      </button>
    </div>
  )
}
