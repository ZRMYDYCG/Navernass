import * as Dialog from '@radix-ui/react-dialog'
import { Check, FileCode, FileText } from 'lucide-react'
import * as React from 'react'
import { Button } from '@/components/ui/button'

type ExportFormat = 'text' | 'md'

interface Chapter {
  id: string
  title: string
}

interface ExportChapterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  chapters: Chapter[]
  onExport: (chapterIds: string[], format: ExportFormat) => void
  isExporting: boolean
}

export function ExportChapterDialog({
  open,
  onOpenChange,
  chapters,
  onExport,
  isExporting,
}: ExportChapterDialogProps) {
  const [selectedFormat, setSelectedFormat] = React.useState<ExportFormat>('md')
  const [selectedChapters, setSelectedChapters] = React.useState<Set<string>>(() => new Set())

  const handleToggleChapter = (chapterId: string) => {
    setSelectedChapters((prev) => {
      const next = new Set(prev)
      if (next.has(chapterId)) {
        next.delete(chapterId)
      } else {
        next.add(chapterId)
      }
      return next
    })
  }

  const handleSelectAll = () => {
    if (selectedChapters.size === chapters.length) {
      setSelectedChapters(new Set())
    } else {
      setSelectedChapters(new Set(chapters.map(c => c.id)))
    }
  }

  const handleExport = () => {
    if (selectedChapters.size === 0) {
      return
    }
    onExport(Array.from(selectedChapters), selectedFormat)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] animate-in fade-in-0 zoom-in-95">
          <div className="bg-card rounded-lg shadow-lg border border-border p-6 max-h-[80vh] flex flex-col">
            <Dialog.Title className="text-xl font-semibold text-foreground mb-2">
              导出章节
            </Dialog.Title>
            <Dialog.Description className="text-sm text-muted-foreground mb-4">
              选择要导出的章节和格式
            </Dialog.Description>

            <div className="flex-1 overflow-hidden flex flex-col space-y-4">
              {/* 章节列表 */}
              <div className="flex-1 overflow-y-auto border border-border rounded-lg">
                <div className="p-2 border-b border-border bg-muted sticky top-0">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-sm text-foreground hover:text-foreground"
                    disabled={isExporting || chapters.length === 0}
                  >
                    {selectedChapters.size === chapters.length && chapters.length > 0
                      ? '取消全选'
                      : '全选'}
                    {' '}
                    (
                    {selectedChapters.size}
                    /
                    {chapters.length}
                    )
                  </button>
                </div>
                <div className="p-2 space-y-1">
                  {chapters.length === 0
                    ? (
                        <div className="text-sm text-muted-foreground text-center py-8">
                          暂无章节
                        </div>
                      )
                    : (
                        chapters.map((chapter) => {
                          const isSelected = selectedChapters.has(chapter.id)
                          return (
                            <button
                              key={chapter.id}
                              type="button"
                              onClick={() => handleToggleChapter(chapter.id)}
                              disabled={isExporting}
                              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors flex items-center gap-2 ${
                                isSelected
                                  ? 'bg-accent text-foreground'
                                  : 'text-foreground hover:bg-accent'
                              }`}
                            >
                              <div
                                className={`w-4 h-4 border-2 rounded flex items-center justify-center shrink-0 ${
                                  isSelected
                                    ? 'border-primary bg-primary'
                                    : 'border-border'
                                }`}
                              >
                                {isSelected && (
                                  <Check className="w-3 h-3 text-primary-foreground" />
                                )}
                              </div>
                              <span className="truncate">{chapter.title}</span>
                            </button>
                          )
                        })
                      )}
                </div>
              </div>

              {/* 格式选择 */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  导出格式
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedFormat('md')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedFormat === 'md'
                        ? 'border-primary bg-accent'
                        : 'border-border hover:border-border'
                    }`}
                    disabled={isExporting}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <FileCode className="w-6 h-6 text-foreground" />
                      <span className="text-sm font-medium text-foreground">Markdown</span>
                      <span className="text-xs text-muted-foreground">.md</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFormat('text')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedFormat === 'text'
                        ? 'border-primary bg-accent'
                        : 'border-border hover:border-border'
                    }`}
                    disabled={isExporting}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="w-6 h-6 text-foreground" />
                      <span className="text-sm font-medium text-foreground">纯文本</span>
                      <span className="text-xs text-muted-foreground">.txt</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* 按钮组 */}
            <div className="flex gap-3 mt-6">
              <Dialog.Close asChild>
                <Button
                  type="button"
                  className="flex-1 bg-secondary text-foreground hover:bg-accent"
                  disabled={isExporting}
                >
                  取消
                </Button>
              </Dialog.Close>
              <Button
                onClick={handleExport}
                className="flex-1 bg-primary text-primary-foreground hover:opacity-90"
                disabled={isExporting || selectedChapters.size === 0}
              >
                {isExporting
                  ? `导出中... (${selectedChapters.size}个章节)`
                  : `导出 (${selectedChapters.size}个章节)`}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
