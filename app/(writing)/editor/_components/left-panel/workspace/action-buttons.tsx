import * as Tooltip from '@radix-ui/react-tooltip'
import { Download, ScanEye, Upload } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { chaptersApi } from '@/lib/supabase/sdk'
import { ExportChapterDialog } from '../../export-chapter-dialog'

interface Chapter {
  id: string
  title: string
}

interface ActionButtonsProps {
  chapters: Chapter[]
}

export function ActionButtons({ chapters }: ActionButtonsProps) {
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleExportClick = () => {
    if (chapters.length === 0) {
      toast.error('暂无章节可导出')
      return
    }
    setExportDialogOpen(true)
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
    <>
      <div className="flex gap-1">
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              type="button"
              className="p-1 h-6 w-6 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <Download className="w-3 h-3" />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content className="bg-gray-900 dark:bg-gray-700 text-white text-[11px] px-2 py-1 rounded">
              导入章节
              <Tooltip.Arrow className="fill-gray-900 dark:fill-gray-700" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              type="button"
              onClick={handleExportClick}
              className="p-1 h-6 w-6 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <Upload className="w-3 h-3" />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content className="bg-gray-900 dark:bg-gray-700 text-white text-[11px] px-2 py-1 rounded">
              导出章节
              <Tooltip.Arrow className="fill-gray-900 dark:fill-gray-700" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              type="button"
              className="p-1 h-6 w-6 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <ScanEye className="w-3 h-3" />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content className="bg-gray-900 dark:bg-gray-700 text-white text-[11px] px-2 py-1 rounded">
              预览
              <Tooltip.Arrow className="fill-gray-900 dark:fill-gray-700" />
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
