import * as Dialog from '@radix-ui/react-dialog'
import { Calendar, Edit2, Plus, Trash2, X } from 'lucide-react'
import * as React from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DeleteConfirmDialog } from './delete-confirm-dialog'

export interface TimelineEvent {
  id: string
  title: string
  date?: string // 日期，可以是具体日期或相对时间（如"第一章"、"三年前"等）
  description?: string
  chapter_id?: string // 关联的章节ID（可选）
  created_at: string
  updated_at: string
}

interface TimelineDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  novelId: string
}

const STORAGE_KEY_PREFIX = 'novel_timeline_'

export function TimelineDialog({ open, onOpenChange, novelId }: TimelineDialogProps) {
  const [events, setEvents] = React.useState<TimelineEvent[]>([])
  const [editingEvent, setEditingEvent] = React.useState<TimelineEvent | null>(null)
  const [isCreating, setIsCreating] = React.useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)
  const [eventToDelete, setEventToDelete] = React.useState<string | null>(null)
  const [formData, setFormData] = React.useState({
    title: '',
    date: '',
    description: '',
  })

  const storageKey = `${STORAGE_KEY_PREFIX}${novelId}`

  // 加载时间线事件
  const loadEvents = React.useCallback(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsed = JSON.parse(stored) as TimelineEvent[]
        // 按日期排序（如果有日期）
        const sorted = parsed.sort((a, b) => {
          if (!a.date && !b.date) return 0
          if (!a.date) return 1
          if (!b.date) return -1
          return a.date.localeCompare(b.date)
        })
        setEvents(sorted)
      } else {
        setEvents([])
      }
    } catch (error) {
      console.error('加载时间线失败:', error)
      setEvents([])
    }
  }, [storageKey])

  // 保存时间线事件
  const saveEvents = React.useCallback((newEvents: TimelineEvent[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(newEvents))
      // 按日期排序
      const sorted = newEvents.sort((a, b) => {
        if (!a.date && !b.date) return 0
        if (!a.date) return 1
        if (!b.date) return -1
        return a.date.localeCompare(b.date)
      })
      setEvents(sorted)
    } catch (error) {
      console.error('保存时间线失败:', error)
      toast.error('保存失败')
    }
  }, [storageKey])

  // 打开对话框时加载
  React.useEffect(() => {
    if (open) {
      loadEvents()
    }
  }, [open, loadEvents])

  // 重置表单
  const resetForm = () => {
    setFormData({
      title: '',
      date: '',
      description: '',
    })
    setEditingEvent(null)
    setIsCreating(false)
  }

  // 处理创建/编辑
  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast.error('请输入事件标题')
      return
    }

    const now = new Date().toISOString()

    if (editingEvent) {
      // 编辑
      const updated = events.map(event =>
        event.id === editingEvent.id
          ? {
              ...event,
              title: formData.title.trim(),
              date: formData.date.trim() || undefined,
              description: formData.description.trim() || undefined,
              updated_at: now,
            }
          : event,
      )
      saveEvents(updated)
      toast.success('事件已更新')
    } else {
      // 创建
      const newEvent: TimelineEvent = {
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: formData.title.trim(),
        date: formData.date.trim() || undefined,
        description: formData.description.trim() || undefined,
        created_at: now,
        updated_at: now,
      }
      saveEvents([...events, newEvent])
      toast.success('事件已创建')
    }

    resetForm()
  }

  // 开始编辑
  const handleEdit = (event: TimelineEvent) => {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      date: event.date || '',
      description: event.description || '',
    })
    setIsCreating(true)
  }

  // 删除事件
  const handleDelete = (eventId: string) => {
    setEventToDelete(eventId)
    setDeleteConfirmOpen(true)
  }

  // 确认删除
  const handleConfirmDelete = () => {
    if (!eventToDelete) return
    const updated = events.filter(event => event.id !== eventToDelete)
    saveEvents(updated)
    toast.success('事件已删除')
    setEventToDelete(null)
  }

  // 开始创建
  const handleCreate = () => {
    resetForm()
    setIsCreating(true)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] animate-in fade-in-0 zoom-in-95 max-h-[90vh] overflow-hidden flex flex-col">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col h-full">
            {/* 标题栏 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  时间线
                </Dialog.Title>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  (
                  {events.length}
                  )
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={handleCreate}
                  className="h-8 text-xs bg-black dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200"
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  新建事件
                </Button>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-gray-500 dark:text-gray-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </Dialog.Close>
              </div>
            </div>

            {/* 内容区域 */}
            <div className="flex-1 overflow-y-auto p-4">
              {isCreating
                ? (
                    /* 创建/编辑表单 */
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          事件标题
                          {' '}
                          <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="text"
                          value={formData.title}
                          onChange={e => setFormData({ ...formData, title: e.target.value })}
                          placeholder="请输入事件标题"
                          className="w-full"
                          autoFocus
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          时间/日期
                        </label>
                        <Input
                          type="text"
                          value={formData.date}
                          onChange={e => setFormData({ ...formData, date: e.target.value })}
                          placeholder="如：2024年1月1日、第一章、三年前等"
                          className="w-full"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          可以是具体日期或相对时间描述
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          事件描述
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={e => setFormData({ ...formData, description: e.target.value })}
                          placeholder="详细描述这个事件..."
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 resize-none"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={handleSubmit}
                          className="flex-1 bg-black dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200"
                        >
                          {editingEvent ? '保存' : '创建'}
                        </Button>
                        <Button
                          type="button"
                          onClick={resetForm}
                          className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                          取消
                        </Button>
                      </div>
                    </div>
                  )
                : (
                    /* 时间线列表 */
                    <div className="space-y-3">
                      {events.length === 0
                        ? (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                              <p className="text-sm">暂无时间线事件</p>
                              <p className="text-xs mt-1">点击"新建事件"开始添加</p>
                            </div>
                          )
                        : (
                            <div className="relative">
                              {/* 时间线 */}
                              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-600" />
                              {events.map(event => (
                                <div
                                  key={event.id}
                                  className="relative flex gap-4 pb-4 last:pb-0"
                                >
                                  {/* 时间点 */}
                                  <div className="relative z-10 flex-shrink-0">
                                    <div className="w-8 h-8 rounded-full bg-gray-900 dark:bg-gray-100 border-2 border-white dark:border-gray-800 flex items-center justify-center">
                                      <div className="w-2 h-2 rounded-full bg-white dark:bg-gray-800" />
                                    </div>
                                  </div>

                                  {/* 事件内容 */}
                                  <div className="flex-1 min-w-0 pb-4">
                                    <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                                              {event.title}
                                            </h4>
                                          </div>
                                          {event.date && (
                                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
                                              <Calendar className="w-3 h-3" />
                                              {event.date}
                                            </div>
                                          )}
                                          {event.description && (
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-3">
                                              {event.description}
                                            </p>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <button
                                            type="button"
                                            onClick={() => handleEdit(event)}
                                            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors text-gray-600 dark:text-gray-400"
                                          >
                                            <Edit2 className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleDelete(event.id)}
                                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors text-red-600 dark:text-red-400"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                    </div>
                  )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>

      {/* 删除确认对话框 */}
      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="确认删除事件"
        description="确定要删除这个时间线事件吗？此操作无法撤销。"
        onConfirm={handleConfirmDelete}
      />
    </Dialog.Root>
  )
}
