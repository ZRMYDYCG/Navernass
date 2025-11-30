import { useState } from 'react'
import { PaperCard } from '@/components/ui/paper-card'

type UnderlineStyle = 'none' | 'solid' | 'wavy' | 'dotted'

export interface EditorSettingsState {
  underlineStyle: UnderlineStyle
  underlineColor: string
}

interface EditorSettingsProps {
  onSettingsChange?: (settings: EditorSettingsState) => void
}

const UNDERLINE_STYLES: { value: UnderlineStyle, label: string }[] = [
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

  const applyEditorSettings = (settings: EditorSettingsState) => {
    const editorElement = document.querySelector('.ProseMirror') as HTMLElement
    if (editorElement) {
      editorElement.classList.remove('underline-solid', 'underline-wavy', 'underline-dotted')
      if (settings.underlineStyle !== 'none') {
        editorElement.classList.add(`underline-${settings.underlineStyle}`)
      }
      editorElement.style.setProperty('--underline-color', settings.underlineColor)
    }
  }

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

  return (
    <PaperCard className="p-2 space-y-1.5">
      <h3 className="text-xs font-medium text-stone-600 dark:text-stone-300 px-1 font-serif">
        行下划线
      </h3>
      <div className="space-y-1">
        <div className="px-2 py-1.5 rounded bg-stone-100/50 dark:bg-zinc-700/30 border border-stone-200/60 dark:border-zinc-600/50">
          <div className="text-[10px] text-stone-500 dark:text-stone-400 mb-1">样式</div>
          <div className="grid grid-cols-4 gap-0.5">
            {UNDERLINE_STYLES.map(style => (
              <button
                type="button"
                key={style.value}
                onClick={() => handleStyleChange(style.value)}
                className={`
                  px-1.5 py-1 text-[10px] rounded transition-all duration-200
                  ${
              underlineStyle === style.value
                ? 'bg-stone-800 dark:bg-stone-200 text-stone-50 dark:text-stone-900 shadow-sm'
                : 'bg-stone-50 dark:bg-zinc-600/50 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-zinc-500/50'
              }
                `}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>

        {underlineStyle !== 'none' && (
          <div className="px-2 py-1.5 rounded bg-stone-100/50 dark:bg-zinc-700/30 border border-stone-200/60 dark:border-zinc-600/50 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="text-[10px] text-stone-500 dark:text-stone-400 mb-1">颜色</div>
            <div className="flex items-center gap-1.5">
              {PRESET_COLORS.map(color => (
                <button
                  type="button"
                  key={color}
                  onClick={() => handleColorChange(color)}
                  className={`
                    w-5 h-5 rounded-full border transition-all duration-200 hover:scale-110
                    ${
                underlineColor === color
                  ? 'border-stone-800 dark:border-stone-200 border-2 ring-1 ring-stone-800/20 dark:ring-stone-200/20'
                  : 'border-stone-300 dark:border-zinc-500'
                }
                  `}
                  style={{ backgroundColor: color }}
                />
              ))}
              <div className="relative w-5 h-5 rounded-full overflow-hidden border border-stone-300 dark:border-zinc-500 cursor-pointer hover:scale-110 transition-transform duration-200">
                <input
                  type="color"
                  value={underlineColor}
                  onChange={e => handleColorChange(e.target.value)}
                  className="absolute -top-2 -left-2 w-9 h-9 cursor-pointer opacity-0"
                />
                <div
                  className="w-full h-full"
                  style={{
                    background: 'conic-gradient(from 0deg, red, yellow, lime, aqua, blue, magenta, red)',
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </PaperCard>
  )
}
