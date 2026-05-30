'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { Check, FileText, Loader2, Upload, X } from 'lucide-react'
import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useI18n } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'
import { ImportCharacterAnalysisPanel } from './import-character-analysis-panel'

export interface ParsedChapter {
  title: string
  content: string
  volumeTitle?: string
  volumeId?: string
}

export interface ImportResult {
  chapterTitles: string[]
  plainText: string
}

type ImportPhase = 'select' | 'importing' | 'analyzing' | 'done'

interface ImportChapterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  novelId: string
  onImport: (chapters: ParsedChapter[], fileName: string) => Promise<ImportResult | void>
  isImporting: boolean
  volumes?: Array<{ id: string, title: string }>
  onAnalysisComplete?: () => void
}

const EMPTY_VOLUMES: Array<{ id: string, title: string }> = []

const PHASES: ImportPhase[] = ['select', 'importing', 'analyzing', 'done']

export function ImportChapterDialog({
  open,
  onOpenChange,
  novelId,
  onImport,
  isImporting,
  volumes = EMPTY_VOLUMES,
  onAnalysisComplete,
}: ImportChapterDialogProps) {
  const { t } = useI18n()
  const [file, setFile] = React.useState<File | null>(null)
  const [fileContent, setFileContent] = React.useState<string>('')
  const [selectedVolumeId, setSelectedVolumeId] = React.useState<string>('')
  const [previewChapters, setPreviewChapters] = React.useState<ParsedChapter[]>([])
  const [error, setError] = React.useState<string>('')
  const [phase, setPhase] = React.useState<ImportPhase>('select')
  const [analysisComplete, setAnalysisComplete] = React.useState(false)
  const [analysisText, setAnalysisText] = React.useState('')
  const [chapterTitles, setChapterTitles] = React.useState<string[]>([])

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const parseAndPreview = React.useCallback((text: string) => {
    try {
      const content = textToHtml(text)
      const chapters: ParsedChapter[] = [{
        title: '',
        content,
      }]
      setPreviewChapters(chapters)
      setError('')
    } catch (err) {
      setError(t('editor.importChapterDialog.errors.parseFailed'))
      console.error('Failed to parse file:', err)
      setPreviewChapters([])
    }
  }, [t])

  const handleFileSelect = React.useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.type.startsWith('text/') && !selectedFile.name.endsWith('.txt')) {
      setError(t('editor.importChapterDialog.errors.txtOnly'))
      return
    }

    setFile(selectedFile)
    setError('')

    try {
      const text = await selectedFile.text()
      setFileContent(text)
      parseAndPreview(text)
    } catch (err) {
      setError(t('editor.importChapterDialog.errors.readFailed'))
      console.error('Failed to read file:', err)
    }
  }, [parseAndPreview, t])

  const handleImport = async () => {
    if (previewChapters.length === 0) {
      setError(t('editor.importChapterDialog.errors.noChapters'))
      return
    }
    if (!file) {
      setError(t('editor.importChapterDialog.errors.selectFileFirst'))
      return
    }

    const fileName = file.name.replace(/\.txt$/i, '').trim() || file.name

    const chaptersWithVolume = selectedVolumeId && selectedVolumeId !== '__none__'
      ? previewChapters.map(ch => ({ ...ch, volumeId: selectedVolumeId }))
      : previewChapters

    const chaptersWithFileName = chaptersWithVolume.map((ch, index) => ({
      ...ch,
      title: chaptersWithVolume.length === 1 ? fileName : `${fileName} - ${index + 1}`,
    }))

    setPhase('importing')
    setError('')

    try {
      const result = await onImport(chaptersWithFileName, fileName)
      const plainText = result?.plainText || fileContent
      const titles = result?.chapterTitles || chaptersWithFileName.map(ch => ch.title)

      setAnalysisText(plainText)
      setChapterTitles(titles)
      setPhase('analyzing')
    } catch (err) {
      console.error('Import failed:', err)
      setPhase('select')
      setError(t('editor.importChapterDialog.errors.importFailed'))
    }
  }

  const handleReset = () => {
    setFile(null)
    setFileContent('')
    setPreviewChapters([])
    setError('')
    setSelectedVolumeId('')
    setPhase('select')
    setAnalysisComplete(false)
    setAnalysisText('')
    setChapterTitles([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClose = () => {
    handleReset()
    onOpenChange(false)
  }

  const handleOpenChangeWithReset = (newOpen: boolean) => {
    if (!newOpen && phase === 'importing') return
    if (!newOpen && phase === 'analyzing' && !analysisComplete) return
    if (!newOpen) {
      handleReset()
    }
    onOpenChange(newOpen)
  }

  const handleAnalysisComplete = () => {
    setAnalysisComplete(true)
    onAnalysisComplete?.()
  }

  const isAnalysisPhase = phase === 'analyzing'
  const phaseIndex = phase === 'analyzing' && analysisComplete ? PHASES.indexOf('done') : PHASES.indexOf(phase)

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChangeWithReset}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in-0" />
        <Dialog.Content
          className={cn(
            'fixed left-[50%] top-[50%] z-50 w-full translate-x-[-50%] translate-y-[-50%] animate-in fade-in-0 zoom-in-95 flex flex-col',
            isAnalysisPhase ? 'max-w-3xl h-[min(92vh,720px)]' : 'max-w-2xl max-h-[90vh]',
          )}
          onPointerDownOutside={(e) => {
            if (phase === 'importing' || (isAnalysisPhase && !analysisComplete)) e.preventDefault()
          }}
          onEscapeKeyDown={(e) => {
            if (phase === 'importing' || (isAnalysisPhase && !analysisComplete)) e.preventDefault()
          }}
        >
          <div className={cn(
            'bg-card rounded-lg shadow-lg border border-border flex flex-col min-h-0 h-full overflow-hidden',
          )}
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <Dialog.Title className="text-xl font-semibold text-foreground">
                {t('editor.importChapterDialog.title')}
              </Dialog.Title>
              {analysisComplete && (
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-1 hover:bg-accent rounded transition-colors text-muted-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              {phase === 'select' && (
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="p-1 hover:bg-accent rounded transition-colors text-muted-foreground"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </Dialog.Close>
              )}
            </div>

            {/* 步骤指示器 */}
            {phase !== 'select' && (
              <div className="px-6 pt-4 pb-2">
                <div className="flex items-center gap-1">
                  {(['import', 'analyze', 'done'] as const).map((step, i) => {
                    const stepPhaseIndex = i === 0 ? 1 : i === 1 ? 2 : 3
                    const isActive = phaseIndex >= stepPhaseIndex
                    const isCurrent = (step === 'import' && phase === 'importing')
                      || (step === 'analyze' && isAnalysisPhase && !analysisComplete)
                      || (step === 'done' && isAnalysisPhase && analysisComplete)
                    return (
                      <React.Fragment key={step}>
                        {i > 0 && (
                          <div className={cn(
                            'flex-1 h-px',
                            isActive ? 'bg-primary/50' : 'bg-border',
                          )}
                          />
                        )}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <div className={cn(
                            'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium border',
                            isActive
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-muted text-muted-foreground border-border',
                            isCurrent && 'ring-2 ring-primary/30',
                          )}
                          >
                            {isActive && step !== 'analyze' && phaseIndex > stepPhaseIndex
                              ? <Check className="w-3 h-3" />
                              : i + 1}
                          </div>
                          <span className={cn(
                            'text-[10.5px] hidden sm:inline',
                            isCurrent ? 'text-foreground font-medium' : 'text-muted-foreground',
                          )}
                          >
                            {t(`editor.importChapterDialog.phases.${step}`)}
                          </span>
                        </div>
                      </React.Fragment>
                    )
                  })}
                </div>
              </div>
            )}

            <div className={cn(
              'flex-1 min-h-0 overflow-hidden',
              isAnalysisPhase ? 'px-6 py-4 flex flex-col' : 'overflow-y-auto p-6',
            )}
            >
              {phase === 'select' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t('editor.importChapterDialog.selectFile')}
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".txt,text/plain"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-input"
                      />
                      <label
                        htmlFor="file-input"
                        className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-secondary rounded-lg cursor-pointer transition-colors text-sm"
                      >
                        <Upload className="w-4 h-4" />
                        {t('editor.importChapterDialog.selectTxt')}
                      </label>
                      {file && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="w-4 h-4" />
                          <span>{file.name}</span>
                          <span className="text-muted-foreground">
                            (
                            {(file.size / 1024).toFixed(1)}
                            {' '}
                            KB)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
                      {error}
                    </div>
                  )}

                  {fileContent && volumes.length > 0 && (
                    <div className="border-t border-border pt-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          {t('editor.importChapterDialog.importToVolumeLabel')}
                        </label>
                        <Select
                          value={selectedVolumeId || undefined}
                          onValueChange={value => setSelectedVolumeId(value || '')}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={t('editor.importChapterDialog.rootPlaceholder')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">{t('editor.importChapterDialog.rootPlaceholder')}</SelectItem>
                            {volumes.map(volume => (
                              <SelectItem key={volume.id} value={volume.id}>
                                {volume.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {t('editor.importChapterDialog.importToVolumeHint')}
                        </p>
                      </div>
                    </div>
                  )}

                  {fileContent && (
                    <div className="rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground">
                      {t('editor.importChapterDialog.analysisHint')}
                    </div>
                  )}
                </div>
              )}

              {phase === 'importing' && (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    {t('editor.importChapterDialog.importing')}
                  </p>
                </div>
              )}

              {isAnalysisPhase && analysisText && (
                <ImportCharacterAnalysisPanel
                  novelId={novelId}
                  importText={analysisText}
                  chapterTitles={chapterTitles}
                  isComplete={analysisComplete}
                  onComplete={handleAnalysisComplete}
                />
              )}
            </div>

            <div className="flex gap-3 p-6 border-t border-border shrink-0">
              {phase === 'select' && (
                <>
                  <Dialog.Close asChild>
                    <Button
                      type="button"
                      variant="secondary"
                      className="flex-1"
                      disabled={isImporting}
                    >
                      {t('common.cancel')}
                    </Button>
                  </Dialog.Close>
                  <Button
                    onClick={handleImport}
                    className="flex-1"
                    disabled={isImporting || !file || !fileContent}
                  >
                    {t('editor.importChapterDialog.importAndAnalyze')}
                  </Button>
                </>
              )}

              {isAnalysisPhase && analysisComplete && (
                <Button
                  type="button"
                  className="flex-1"
                  onClick={handleClose}
                >
                  {t('editor.importChapterDialog.analysis.done')}
                </Button>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function textToHtml(text: string): string {
  if (!text) return ''

  const lines = text.split('\n')
  const paragraphs: string[] = []
  let currentParagraph: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed) {
      currentParagraph.push(trimmed)
    } else {
      if (currentParagraph.length > 0) {
        paragraphs.push(`<p>${currentParagraph.join('')}</p>`)
        currentParagraph = []
      }
    }
  }

  if (currentParagraph.length > 0) {
    paragraphs.push(`<p>${currentParagraph.join('')}</p>`)
  }

  return paragraphs.join('')
}

export function htmlToPlainText(html: string): string {
  if (!html) return ''
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html
  const scripts = tempDiv.querySelectorAll('script, style')
  scripts.forEach(script => script.remove())
  return (tempDiv.textContent || '').replace(/\n{3,}/g, '\n\n').trim()
}
