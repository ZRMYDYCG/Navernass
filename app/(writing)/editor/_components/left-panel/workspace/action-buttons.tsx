import type { ParsedChapter } from '../../import-chapter-dialog'
import type { Volume } from '../types'
import * as Tooltip from '@radix-ui/react-tooltip'
import { Download, ScanEye, Upload } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { chaptersApi } from '@/lib/supabase/sdk'
import { ExportChapterDialog } from '../../export-chapter-dialog'
import { ImportChapterDialog } from '../../import-chapter-dialog'

interface Chapter {
  id: string
  title: string
}

interface ActionButtonsProps {
  chapters: Chapter[]
  novelId: string
  volumes?: Volume[]
  onChaptersImported?: () => void
}

const EMPTY_VOLUMES: Volume[] = []

export function ActionButtons({ chapters, novelId, volumes = EMPTY_VOLUMES, onChaptersImported }: ActionButtonsProps) {
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const handleExportClick = () => {
    if (chapters.length === 0) {
      toast.error('暂无章节可导出')
      return
    }
    setExportDialogOpen(true)
  }

  const handleImportClick = () => {
    setImportDialogOpen(true)
  }

  // ... (keep existing handler functions: handleImport, downloadFile, handleExport)
  const handleImport = async (parsedChapters: ParsedChapter[], _fileName: string) => {
    if (parsedChapters.length === 0) {
      toast.error('没有可导入的章节')
      return
    }

    try {
      setIsImporting(true)

      // 获取当前所有章节，用于计算 order_index
      const existingChapters = await chaptersApi.getByNovelId(novelId)
      const maxOrderIndex = existingChapters.length > 0
        ? Math.max(...existingChapters.map(c => c.order_index))
        : -1

      let successCount = 0
      let failCount = 0
      let currentOrderIndex = maxOrderIndex + 1

      // 按顺序创建章节
      for (const parsedChapter of parsedChapters) {
        try {
          // 使用章节的 volumeId（如果已设置）
          const chapterVolumeId = parsedChapter.volumeId || undefined

          // 计算 order_index
          if (chapterVolumeId) {
            // 如果章节在卷中，需要计算卷内的 order_index
            const volumeChapters = existingChapters
              .filter(c => c.volume_id === chapterVolumeId)
              .sort((a, b) => a.order_index - b.order_index)

            if (volumeChapters.length > 0) {
              currentOrderIndex = Math.max(...volumeChapters.map(c => c.order_index)) + 1
            } else {
              // 卷的第一个章节，查找卷的 order_index
              const volume = volumes.find(v => v.id === chapterVolumeId)
              if (volume) {
                currentOrderIndex = (volume.order_index ?? 0) * 1000
              } else {
                currentOrderIndex = maxOrderIndex + 1
              }
            }
          } else {
            // 不在卷中，计算根目录的 order_index
            const rootChapters = existingChapters
              .filter(c => !c.volume_id)
              .sort((a, b) => a.order_index - b.order_index)

            if (rootChapters.length > 0) {
              currentOrderIndex = Math.max(...rootChapters.map(c => c.order_index)) + 1
            } else {
              currentOrderIndex = maxOrderIndex + 1
            }
          }

          // 创建章节（使用文件名作为标题）
          await chaptersApi.create({
            novel_id: novelId,
            title: parsedChapter.title, // 已经在对话框中设置为文件名
            content: parsedChapter.content || '',
            order_index: currentOrderIndex,
            volume_id: chapterVolumeId,
          })

          successCount++
          currentOrderIndex++

          // 更新 existingChapters（用于后续计算）
          existingChapters.push({
            id: '', // 临时ID，仅用于计算
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
          console.error('导入章节失败:', error)
          failCount++
        }
      }

      if (failCount === 0) {
        toast.success(`成功导入 ${successCount} 个章节`)
      } else {
        toast.warning(`导入完成：成功 ${successCount} 个，失败 ${failCount} 个`)
      }

      setImportDialogOpen(false)

      // 通知父组件刷新章节列表
      if (onChaptersImported) {
        onChaptersImported()
      } else {
        // 如果没有回调，延迟刷新页面
        setTimeout(() => {
          window.location.reload()
        }, 500)
      }
    } catch (error) {
      console.error('导入失败:', error)
      toast.error('导入失败')
    } finally {
      setIsImporting(false)
    }
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
          toast.error('无法获取章节内容')
          return
        }

        const content = chapter.content || ''
        const title = chapter.title || '未命名章节'

        const exportContent = format === 'md' ? htmlToMarkdown(content) : htmlToText(content)
        const filename = `${title}.${extension}`

        downloadFile(exportContent, filename, mimeType)
        toast.success('导出成功')
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
            const title = chapter.title || '未命名章节'

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
          toast.success(`成功导出 ${successCount} 个章节`)
        } else {
          toast.warning(`导出完成：成功 ${successCount} 个，失败 ${failCount} 个`)
        }
      }

      setExportDialogOpen(false)
    } catch (error) {
      console.error('导出失败:', error)
      toast.error('导出失败')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium text-stone-600 dark:text-stone-300 px-1 font-serif">
        文件操作
      </span>
      <div className="flex gap-1">
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              type="button"
              onClick={handleImportClick}
              className="p-1.5 h-7 w-7 flex items-center justify-center hover:bg-stone-100 dark:hover:bg-zinc-700/50 rounded-md transition-all text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content className="bg-stone-800 dark:bg-zinc-700 text-stone-50 text-[11px] px-2 py-1 rounded shadow-md animate-in fade-in-0 zoom-in-95">
              导入章节
              <Tooltip.Arrow className="fill-stone-800 dark:fill-zinc-700" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              type="button"
              onClick={handleExportClick}
              className="p-1.5 h-7 w-7 flex items-center justify-center hover:bg-stone-100 dark:hover:bg-zinc-700/50 rounded-md transition-all text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content className="bg-stone-800 dark:bg-zinc-700 text-stone-50 text-[11px] px-2 py-1 rounded shadow-md animate-in fade-in-0 zoom-in-95">
              导出章节
              <Tooltip.Arrow className="fill-stone-800 dark:fill-zinc-700" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              type="button"
              className="p-1.5 h-7 w-7 flex items-center justify-center hover:bg-stone-100 dark:hover:bg-zinc-700/50 rounded-md transition-all text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:shadow-sm"
            >
              <ScanEye className="w-3.5 h-3.5" />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content className="bg-stone-800 dark:bg-zinc-700 text-stone-50 text-[11px] px-2 py-1 rounded shadow-md animate-in fade-in-0 zoom-in-95">
              预览
              <Tooltip.Arrow className="fill-stone-800 dark:fill-zinc-700" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </div>

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
          key={importDialogOpen ? 'open' : 'closed'}
          open={importDialogOpen}
          onOpenChange={setImportDialogOpen}
          onImport={handleImport}
          isImporting={isImporting}
          volumes={volumes.map(v => ({ id: v.id, title: v.title }))}
        />
      )}
    </div>
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
