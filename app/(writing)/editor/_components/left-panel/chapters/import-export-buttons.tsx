'use client'

import type { ImportResult, ParsedChapter } from '../../import-chapter-dialog'
import type { Volume } from '../types'
import { Download, Upload } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useI18n } from '@/hooks/use-i18n'
import { chaptersApi } from '@/lib/supabase/sdk'
import { useAppStore } from '@/store'
import { ExportChapterDialog } from '../../export-chapter-dialog'
import { htmlToPlainText, ImportChapterDialog } from '../../import-chapter-dialog'

interface Chapter {
  id: string
  title: string
}

interface ImportExportButtonsProps {
  chapters: Chapter[]
  novelId: string
  volumes?: Volume[]
  onChaptersImported?: () => void
  buttonClassName: string
}

const EMPTY_VOLUMES: Volume[] = []

export function ImportExportButtons({
  chapters,
  novelId,
  volumes = EMPTY_VOLUMES,
  onChaptersImported,
  buttonClassName,
}: ImportExportButtonsProps) {
  const { t } = useI18n()
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const handleExportClick = () => {
    if (chapters.length === 0) {
      toast.error(t('editor.leftPanel.chapters.importExport.noChaptersToExport'))
      return
    }
    setExportDialogOpen(true)
  }

  const handleImportClick = () => {
    setImportDialogOpen(true)
  }

  const handleImport = async (parsedChapters: ParsedChapter[], _fileName: string): Promise<ImportResult> => {
    if (parsedChapters.length === 0) {
      toast.error(t('editor.leftPanel.chapters.importExport.noChaptersToImport'))
      throw new Error('No chapters')
    }

    try {
      setIsImporting(true)

      const existingChapters = await chaptersApi.getByNovelId(novelId)
      const maxOrderIndex = existingChapters.length > 0
        ? Math.max(...existingChapters.map(c => c.order_index))
        : -1

      let successCount = 0
      let failCount = 0
      let currentOrderIndex = maxOrderIndex + 1
      const chapterTitles: string[] = []
      const plainTextParts: string[] = []

      for (const parsedChapter of parsedChapters) {
        try {
          const chapterVolumeId = parsedChapter.volumeId || undefined

          if (chapterVolumeId) {
            const volumeChapters = existingChapters
              .filter(c => c.volume_id === chapterVolumeId)
              .sort((a, b) => a.order_index - b.order_index)

            if (volumeChapters.length > 0) {
              currentOrderIndex = Math.max(...volumeChapters.map(c => c.order_index)) + 1
            } else {
              const volume = volumes.find(v => v.id === chapterVolumeId)
              if (volume) {
                currentOrderIndex = (volume.order_index ?? 0) * 1000
              } else {
                currentOrderIndex = maxOrderIndex + 1
              }
            }
          } else {
            const rootChapters = existingChapters
              .filter(c => !c.volume_id)
              .sort((a, b) => a.order_index - b.order_index)

            if (rootChapters.length > 0) {
              currentOrderIndex = Math.max(...rootChapters.map(c => c.order_index)) + 1
            } else {
              currentOrderIndex = maxOrderIndex + 1
            }
          }

          await chaptersApi.create({
            novel_id: novelId,
            title: parsedChapter.title,
            content: parsedChapter.content || '',
            order_index: currentOrderIndex,
            volume_id: chapterVolumeId,
          })

          successCount++
          currentOrderIndex++
          chapterTitles.push(parsedChapter.title)
          plainTextParts.push(htmlToPlainText(parsedChapter.content || ''))

          existingChapters.push({
            id: '',
            novel_id: novelId,
            volume_id: chapterVolumeId,
            user_id: '',
            title: parsedChapter.title,
            content: parsedChapter.content || '',
            order_index: currentOrderIndex - 1,
            word_count: 0,
            status: 'draft',
            created_at: '',
            updated_at: '',
          })
        } catch (error) {
          console.error('Failed to import chapter:', error)
          failCount++
        }
      }

      if (failCount === 0) {
        toast.success(t('editor.leftPanel.chapters.importExport.importSuccess', { count: successCount }))
      } else {
        toast.warning(t('editor.leftPanel.chapters.importExport.importSummary', { success: successCount, fail: failCount }))
      }

      // 不在此处刷新页面数据，避免 loadData 触发全页 loading 导致分析弹窗被卸载
      // 章节/角色刷新推迟到 AI 分析完成后（handleAnalysisComplete）

      return {
        chapterTitles,
        plainText: plainTextParts.join('\n\n'),
      }
    } catch (error) {
      console.error('Import failed:', error)
      toast.error(t('editor.leftPanel.chapters.importExport.importFailed'))
      throw error
    } finally {
      setIsImporting(false)
    }
  }

  const handleAnalysisComplete = () => {
    window.dispatchEvent(new CustomEvent('novel-characters-changed', { detail: { novelId } }))
    useAppStore.getState().characterGraphActions.loadRelationships(novelId, { force: true })
    onChaptersImported?.()
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleExport = async (chapterIds: string[], format: 'text' | 'md') => {
    if (chapterIds.length === 0) return

    try {
      setIsExporting(true)

      const extension = format === 'md' ? 'md' : 'txt'
      const mimeType = format === 'md' ? 'text/markdown' : 'text/plain'

      if (chapterIds.length === 1) {
        const chapterId = chapterIds[0]
        const chapter = await chaptersApi.getById(chapterId)
        if (!chapter) {
          toast.error(t('editor.leftPanel.chapters.importExport.unableFetchChapter'))
          return
        }

        const content = chapter.content || ''
        const title = chapter.title || t('editor.leftPanel.chapters.importExport.unnamedChapter')

        const exportContent = format === 'md' ? htmlToMarkdown(content) : htmlToText(content)
        const filename = `${title}.${extension}`

        downloadFile(exportContent, filename, mimeType)
        toast.success(t('editor.leftPanel.chapters.importExport.exportSuccess'))
      } else {
        let successCount = 0
        let failCount = 0

        for (const chapterId of chapterIds) {
          try {
            const chapter = await chaptersApi.getById(chapterId)
            if (!chapter) {
              failCount++
              continue
            }

            const content = chapter.content || ''
            const title = chapter.title || t('editor.leftPanel.chapters.importExport.unnamedChapter')

            const exportContent = format === 'md' ? htmlToMarkdown(content) : htmlToText(content)
            const filename = `${title}.${extension}`

            downloadFile(exportContent, filename, mimeType)
            successCount++

            await new Promise(resolve => setTimeout(resolve, 100))
          } catch {
            failCount++
          }
        }

        if (failCount === 0) {
          toast.success(t('editor.leftPanel.chapters.importExport.exportCountSuccess', { count: successCount }))
        } else {
          toast.warning(t('editor.leftPanel.chapters.importExport.exportSummary', { success: successCount, fail: failCount }))
        }
      }

      setExportDialogOpen(false)
    } catch (error) {
      console.error('Export failed:', error)
      toast.error(t('editor.leftPanel.chapters.importExport.exportFailed'))
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={handleImportClick}
            className={buttonClassName}
          >
            <Download className="w-3.5 h-3.5" strokeWidth={1.8} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-popover text-popover-foreground text-[11px] px-2 py-1 rounded shadow-md animate-in fade-in-0 zoom-in-95 z-[9999]">
          <p>{t('editor.leftPanel.chapters.importExport.import')}</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={handleExportClick}
            className={buttonClassName}
          >
            <Upload className="w-3.5 h-3.5" strokeWidth={1.8} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-popover text-popover-foreground text-[11px] px-2 py-1 rounded shadow-md animate-in fade-in-0 zoom-in-95 z-[9999]">
          <p>{t('editor.leftPanel.chapters.importExport.export')}</p>
        </TooltipContent>
      </Tooltip>

      {exportDialogOpen && (
        <ExportChapterDialog
          key={exportDialogOpen ? 'open' : 'closed'}
          open={exportDialogOpen}
          onOpenChange={setExportDialogOpen}
          chapters={chapters}
          onExport={handleExport}
          isExporting={isExporting}
        />
      )}

      {importDialogOpen && (
        <ImportChapterDialog
          open={importDialogOpen}
          onOpenChange={setImportDialogOpen}
          novelId={novelId}
          onImport={handleImport}
          isImporting={isImporting}
          volumes={volumes.map(v => ({ id: v.id, title: v.title }))}
          onAnalysisComplete={handleAnalysisComplete}
        />
      )}
    </>
  )
}

function htmlToMarkdown(html: string): string {
  if (!html) return ''

  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html

  function convertNode(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || ''
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return ''
    }

    const element = node as HTMLElement
    const tagName = element.tagName.toLowerCase()
    const children = Array.from(element.childNodes)
      .map(child => convertNode(child))
      .join('')

    switch (tagName) {
      case 'h1':
        return `# ${children}\n\n`
      case 'h2':
        return `## ${children}\n\n`
      case 'h3':
        return `### ${children}\n\n`
      case 'h4':
        return `#### ${children}\n\n`
      case 'h5':
        return `##### ${children}\n\n`
      case 'h6':
        return `###### ${children}\n\n`
      case 'p':
        return `${children}\n\n`
      case 'br':
        return '\n'
      case 'strong':
      case 'b':
        return `**${children}**`
      case 'em':
      case 'i':
        return `*${children}*`
      case 'code':
        return `\`${children}\``
      case 'pre':
        return `\`\`\`\n${children}\n\`\`\`\n\n`
      case 'blockquote':
        return `> ${children}\n\n`
      case 'ul':
        return `${children}\n`
      case 'ol':
        return `${children}\n`
      case 'li':
        return `- ${children}\n`
      case 'a': {
        const href = element.getAttribute('href') || ''
        return `[${children}](${href})`
      }
      case 'hr':
        return '---\n\n'
      default:
        return children
    }
  }

  return convertNode(tempDiv).trim()
}

function htmlToText(html: string): string {
  if (!html) return ''

  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html

  const scripts = tempDiv.querySelectorAll('script, style')
  scripts.forEach(script => script.remove())

  let text = tempDiv.textContent || ''

  text = text.replace(/\n{3,}/g, '\n\n')

  return text.trim()
}
