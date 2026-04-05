import { AtSign } from 'lucide-react'
import { useI18n } from '@/hooks/use-i18n'

interface AtButtonProps {
  onClick?: () => void
}

export function AtButton({ onClick }: AtButtonProps) {
  const { t } = useI18n()

  return (
    <button
      type="button"
      onClick={onClick}
      className="p-1.5 h-7 w-7 flex items-center justify-center hover:bg-accent rounded-md transition-all duration-200 border border-transparent hover:border-border shrink-0 text-muted-foreground hover:text-foreground"
      title={t('editor.rightPanel.referenceChapter')}
    >
      <AtSign className="w-3.5 h-3.5" />
    </button>
  )
}
