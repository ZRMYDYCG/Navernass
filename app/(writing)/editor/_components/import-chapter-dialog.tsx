import * as Dialog from '@radix-ui/react-dialog'
import { FileText, Upload, X } from 'lucide-react'
import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface ParsedChapter {
  title: string
  content: string
  volumeTitle?: string
  volumeId?: string
}

interface ImportChapterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (chapters: ParsedChapter[], fileName: string) => void
  isImporting: boolean
  volumes?: Array<{ id: string, title: string }>
}

const EMPTY_VOLUMES: Array<{ id: string, title: string }> = []

export function ImportChapterDialog({
  open,
  onOpenChange,
  onImport,
  isImporting,
  volumes = EMPTY_VOLUMES,
}: ImportChapterDialogProps) {
  const [file, setFile] = React.useState<File | null>(null)
  const [fileContent, setFileContent] = React.useState<string>('')
  const [selectedVolumeId, setSelectedVolumeId] = React.useState<string>('')
  const [previewChapters, setPreviewChapters] = React.useState<ParsedChapter[]>([])
  const [error, setError] = React.useState<string>('')

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // 解析文本并预览
  const parseAndPreview = React.useCallback((text: string) => {
    try {
      // 直接将整个文件作为一个章节
      const content = textToHtml(text)
      const chapters: ParsedChapter[] = [{
        title: '', // 标题会在导入时设置为文件名
        content,
      }]
      setPreviewChapters(chapters)
      setError('')
    } catch (err) {
      setError('解析文件失败，请检查文件格式')
      console.error('解析失败:', err)
      setPreviewChapters([])
    }
  }, [])

  // 处理文件选择
  const handleFileSelect = React.useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    // 只接受文本文件
    if (!selectedFile.type.startsWith('text/') && !selectedFile.name.endsWith('.txt')) {
      setError('请选择 TXT 格式的文本文件')
      return
    }

    setFile(selectedFile)
    setError('')

    try {
      const text = await selectedFile.text()
      setFileContent(text)
      // 自动解析预览
      parseAndPreview(text)
    } catch (err) {
      setError('读取文件失败，请确保文件格式正确')
      console.error('读取文件失败:', err)
    }
  }, [parseAndPreview])

  // 当设置改变时重新解析
  React.useEffect(() => {
    if (fileContent) {
      parseAndPreview(fileContent)
    }
  }, [fileContent, parseAndPreview])

  // 处理导入
  const handleImport = () => {
    if (previewChapters.length === 0) {
      setError('没有可导入的章节')
      return
    }
    if (!file) {
      setError('请先选择文件')
      return
    }

    // 获取文件名（去掉扩展名）
    const fileName = file.name.replace(/\.txt$/i, '').trim() || file.name

    // 如果选择了卷，为所有章节设置 volumeId
    const chaptersWithVolume = selectedVolumeId && selectedVolumeId !== '__none__'
      ? previewChapters.map(ch => ({ ...ch, volumeId: selectedVolumeId }))
      : previewChapters

    // 使用文件名作为章节标题
    const chaptersWithFileName = chaptersWithVolume.map((ch, index) => ({
      ...ch,
      title: chaptersWithVolume.length === 1 ? fileName : `${fileName} - ${index + 1}`,
    }))

    onImport(chaptersWithFileName, fileName)
  }

  // 重置
  const handleReset = () => {
    setFile(null)
    setFileContent('')
    setPreviewChapters([])
    setError('')
    setSelectedVolumeId('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // 关闭对话框时重置
  const handleOpenChangeWithReset = (newOpen: boolean) => {
    if (!newOpen) {
      handleReset()
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChangeWithReset}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] animate-in fade-in-0 zoom-in-95 max-h-[90vh] overflow-hidden flex flex-col">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col h-full">
            {/* 标题栏 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                批量导入章节
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-gray-500 dark:text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>

            {/* 内容区域 */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* 文件选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  选择文件
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
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg cursor-pointer transition-colors text-sm"
                  >
                    <Upload className="w-4 h-4" />
                    选择 TXT 文件
                  </label>
                  {file && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <FileText className="w-4 h-4" />
                      <span>{file.name}</span>
                      <span className="text-gray-400 dark:text-gray-500">
                        (
                        {(file.size / 1024).toFixed(1)}
                        {' '}
                        KB)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 错误提示 */}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
                  {error}
                </div>
              )}

              {/* 导入到卷 */}
              {fileContent && volumes.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      导入到卷（可选）
                    </label>
                    <Select
                      value={selectedVolumeId || undefined}
                      onValueChange={value => setSelectedVolumeId(value || '')}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="不导入到卷（根目录）" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">不导入到卷（根目录）</SelectItem>
                        {volumes.map(volume => (
                          <SelectItem key={volume.id} value={volume.id}>
                            {volume.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      选择要将章节导入到哪个卷中，留空则导入到根目录
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 按钮组 */}
            <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <Dialog.Close asChild>
                <Button
                  type="button"
                  className="flex-1 bg-gray-200 dark:bg-zinc-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600"
                  disabled={isImporting}
                >
                  取消
                </Button>
              </Dialog.Close>
              <Button
                onClick={handleImport}
                className="flex-1 bg-black dark:bg-zinc-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200"
                disabled={isImporting || !file || !fileContent}
              >
                {isImporting ? '导入中...' : '导入'}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// 将文本转换为 HTML
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

  // 处理最后一个段落
  if (currentParagraph.length > 0) {
    paragraphs.push(`<p>${currentParagraph.join('')}</p>`)
  }

  return paragraphs.join('')
}
