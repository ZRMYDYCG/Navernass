'use client'

import { useState } from 'react'

type UnderlineStyle = 'none' | 'solid' | 'wavy' | 'dotted'

interface EditorSettingsProps {
  onSettingsChange?: (settings: EditorSettings) => void
}

export interface EditorSettings {
  underlineStyle: UnderlineStyle
  underlineColor: string
}

const UNDERLINE_STYLES: { value: UnderlineStyle; label: string }[] = [
  { value: 'none', label: '无' },
  { value: 'solid', label: '实线' },
  { value: 'wavy', label: '波浪' },
  { value: 'dotted', label: '点状' },
]

const PRESET_COLORS = [
  '#9ca3af',
  '#93c5fd',
  '#fca5a5',
  '#6ee7b7',
  '#fcd34d',
  '#c4b5fd',
]

export default function EditorSettings({ onSettingsChange }: EditorSettingsProps) {
  const [underlineStyle, setUnderlineStyle] = useState<UnderlineStyle>('none')
  const [underlineColor, setUnderlineColor] = useState('#3b82f6')

  const handleStyleChange = (style: UnderlineStyle) => {
    setUnderlineStyle(style)
    const settings = { underlineStyle: style, underlineColor }
    onSettingsChange?.(settings)
    applyEditorSettings(settings)
  }

  const handleColorChange = (color: string) => {
    setUnderlineColor(color)
    const settings = { underlineStyle, underlineColor: color }
    onSettingsChange?.(settings)
    applyEditorSettings(settings)
  }

  const applyEditorSettings = (settings: EditorSettings) => {
    const editorElement = document.querySelector('.ProseMirror') as HTMLElement
    if (editorElement) {
      editorElement.classList.remove('underline-solid', 'underline-wavy', 'underline-dotted')
      if (settings.underlineStyle !== 'none') {
        editorElement.classList.add(`underline-${settings.underlineStyle}`)
      }
      editorElement.style.setProperty('--underline-color', settings.underlineColor)
    }
  }

  return (
    <div className="space-y-1.5">
      <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300 px-1">
        行下划线
      </h3>
      <div className="space-y-1">
        <div className="px-1.5 py-1 rounded bg-white dark:bg-zinc-700/50 border border-gray-200 dark:border-gray-600">
          <div className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">样式</div>
          <div className="grid grid-cols-4 gap-0.5">
            {UNDERLINE_STYLES.map((style) => (
              <button
                key={style.value}
                onClick={() => handleStyleChange(style.value)}
                className={`
                  px-1.5 py-0.5 text-[10px] rounded transition-colors
                  ${
                    underlineStyle === style.value
                      ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                      : 'bg-gray-100 dark:bg-zinc-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-500'
                  }
                `}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>

        {underlineStyle !== 'none' && (
          <div className="px-1.5 py-1 rounded bg-white dark:bg-zinc-700/50 border border-gray-200 dark:border-gray-600">
            <div className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">颜色</div>
            <div className="flex items-center gap-1">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorChange(color)}
                  className={`
                    w-5 h-5 rounded border transition-all
                    ${
                      underlineColor === color
                        ? 'border-gray-900 dark:border-gray-100 border-2'
                        : 'border-gray-300 dark:border-zinc-500'
                    }
                  `}
                  style={{ backgroundColor: color }}
                />
              ))}
              <input
                type="color"
                value={underlineColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-5 h-5 rounded cursor-pointer border border-gray-300 dark:border-zinc-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
