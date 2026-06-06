'use client'

import type { Outline, WorldbookCategory, WorldbookEntry } from '@/lib/supabase/sdk'
import { Globe2, ListTree, Loader2, Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useShallow } from 'zustand/react/shallow'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { outlinesApi, worldbookApi } from '@/lib/supabase/sdk'
import { cn } from '@/lib/utils'
import {
  selectOrderedOutlines,
  selectOrderedWorldbookEntries,
  useAppStore,
} from '@/store'

const CATEGORIES: { value: WorldbookCategory, label: string }[] = [
  { value: 'setting', label: '世界设定' },
  { value: 'location', label: '地点' },
  { value: 'item', label: '物品' },
  { value: 'faction', label: '势力' },
  { value: 'event', label: '事件' },
  { value: 'rule', label: '规则' },
  { value: 'character_lore', label: '角色背景' },
  { value: 'other', label: '其他' },
]

interface WorldviewTabProps {
  novelId: string
}

type SubTab = 'worldbook' | 'outlines'

/**
 * 左侧 worldview tab 主组件
 *
 * 数据来源：useAppStore（zustand + immer）
 *   - REST 操作（CRUD UI）→ 写 store
 *   - AI tool 落库 → AutoWriteToolPart 写 store
 *   - 因此任何路径建/改/删条目，UI 立即同步
 */
export function WorldviewTab({ novelId }: WorldviewTabProps) {
  const [subTab, setSubTab] = useState<SubTab>('worldbook')
  const resetForNovel = useAppStore(s => s.worldviewActions.resetForNovel)

  // 切换小说时清空缓存
  useEffect(() => {
    if (novelId) resetForNovel(novelId)
  }, [novelId, resetForNovel])

  return (
    <div className="h-full flex flex-col">
      <div className="flex border-b border-border">
        <SubTabButton
          icon={<Globe2 className="w-3.5 h-3.5" />}
          label="世界观"
          active={subTab === 'worldbook'}
          onClick={() => setSubTab('worldbook')}
        />
        <SubTabButton
          icon={<ListTree className="w-3.5 h-3.5" />}
          label="大纲"
          active={subTab === 'outlines'}
          onClick={() => setSubTab('outlines')}
        />
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {subTab === 'worldbook'
          ? <WorldbookPanel novelId={novelId} />
          : <OutlinesPanel novelId={novelId} />}
      </div>
    </div>
  )
}

function SubTabButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex-1 flex items-center justify-center gap-1.5 py-2 text-[11.5px] font-medium transition-colors',
        active
          ? 'text-foreground border-b-2 border-primary -mb-px'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent/40',
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

// ============== Worldbook ==============

function WorldbookPanel({ novelId }: { novelId: string }) {
  const entries = useAppStore(useShallow(selectOrderedWorldbookEntries))
  const hydrated = useAppStore(s => s.worldview.worldbookHydrated)
  const hydrate = useAppStore(s => s.worldviewActions.hydrateWorldbook)
  const upsert = useAppStore(s => s.worldviewActions.upsertWorldbookEntry)
  const remove = useAppStore(s => s.worldviewActions.removeWorldbookEntry)

  const [loading, setLoading] = useState(!hydrated)
  const [filter, setFilter] = useState<WorldbookCategory | 'all'>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  // 首次进入加载到 store；hydrated 后切换不再请求
  useEffect(() => {
    if (!novelId || hydrated) return
    let cancelled = false
    setLoading(true)
    worldbookApi.list(novelId)
      .then((list) => {
        if (cancelled) return
        hydrate(novelId, list)
      })
      .catch((err) => {
        console.error(err)
        toast.error('加载世界观失败')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [novelId, hydrated, hydrate])

  const filtered = useMemo(() => {
    if (filter === 'all') return entries
    return entries.filter(e => e.category === filter)
  }, [entries, filter])

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条世界观条目吗？（软删除，可恢复）')) return
    try {
      await worldbookApi.delete(id)
      remove(id)
      toast.success('已删除')
    } catch (err) {
      console.error(err)
      toast.error('删除失败')
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-border">
        <Select value={filter} onValueChange={v => setFilter(v as any)}>
          <SelectTrigger className="h-7 text-[11px] flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-[11px]">全部</SelectItem>
            {CATEGORIES.map(c => (
              <SelectItem key={c.value} value={c.value} className="text-[11px]">
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-[11px]"
          onClick={() => setCreating(true)}
        >
          <Plus className="w-3 h-3" />
          新建
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-1.5 space-y-1 scrollbar-none">
        {loading
          ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            )
          : filtered.length === 0
            ? (
                <div className="text-center text-[11px] text-muted-foreground py-8">
                  暂无条目，可让 AI 帮你创建
                </div>
              )
            : (
                filtered.map(entry => (
                  <WorldbookCard
                    key={entry.id}
                    entry={entry}
                    isEditing={editingId === entry.id}
                    onStartEdit={() => setEditingId(entry.id)}
                    onCancelEdit={() => setEditingId(null)}
                    onSaved={(updated) => {
                      upsert(updated)
                      setEditingId(null)
                    }}
                    onDelete={() => handleDelete(entry.id)}
                  />
                ))
              )}
      </div>

      {creating && (
        <WorldbookEditor
          novelId={novelId}
          onSaved={(created) => {
            upsert(created)
            setCreating(false)
          }}
          onCancel={() => setCreating(false)}
        />
      )}
    </div>
  )
}

function WorldbookCard({
  entry,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onSaved,
  onDelete,
}: {
  entry: WorldbookEntry
  isEditing: boolean
  onStartEdit: () => void
  onCancelEdit: () => void
  onSaved: (updated: WorldbookEntry) => void
  onDelete: () => void
}) {
  if (isEditing) {
    return (
      <WorldbookEditor
        novelId={entry.novel_id}
        initial={entry}
        onSaved={onSaved}
        onCancel={onCancelEdit}
      />
    )
  }

  const category = CATEGORIES.find(c => c.value === entry.category)
  return (
    <div
      className="group rounded-md border border-border bg-card px-2 py-1.5 hover:border-foreground/30 transition-colors cursor-pointer"
      onClick={onStartEdit}
    >
      <div className="flex items-start gap-1.5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] px-1 py-0.5 rounded bg-muted text-muted-foreground">
              {category?.label || entry.category}
            </span>
            <h4 className="text-[12px] font-medium text-foreground truncate">{entry.title}</h4>
          </div>
          <p className="text-[10.5px] text-muted-foreground mt-0.5 line-clamp-2">
            {entry.content || '（暂无内容）'}
          </p>
        </div>
        <button
          type="button"
          className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-destructive/10 rounded text-destructive transition-opacity"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          title="删除"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

function WorldbookEditor({
  novelId,
  initial,
  onSaved,
  onCancel,
}: {
  novelId: string
  initial?: WorldbookEntry
  onSaved: (entry: WorldbookEntry) => void
  onCancel: () => void
}) {
  const [category, setCategory] = useState<WorldbookCategory>(initial?.category || 'setting')
  const [title, setTitle] = useState(initial?.title || '')
  const [content, setContent] = useState(initial?.content || '')
  const [keywords, setKeywords] = useState((initial?.keywords || []).join(', '))
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('标题不能为空')
      return
    }
    setSaving(true)
    try {
      const kw = keywords.split(',').map(s => s.trim()).filter(Boolean)
      const data = initial
        ? await worldbookApi.update(initial.id, { category, title, content, keywords: kw })
        : await worldbookApi.create({ novel_id: novelId, category, title, content, keywords: kw })
      onSaved(data)
      toast.success(initial ? '已保存' : '已创建')
    } catch (err) {
      console.error(err)
      toast.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="border-t border-border bg-background p-2 space-y-1.5">
      <div className="flex gap-1.5">
        <Select value={category} onValueChange={v => setCategory(v as WorldbookCategory)}>
          <SelectTrigger className="h-7 text-[11px] w-28 shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(c => (
              <SelectItem key={c.value} value={c.value} className="text-[11px]">
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="标题"
          className="h-7 text-[11px] flex-1"
        />
      </div>
      <Textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="详细内容（AI 续写时会读这里）"
        className="text-[11px] min-h-[80px] resize-none"
        rows={4}
      />
      <Input
        value={keywords}
        onChange={e => setKeywords(e.target.value)}
        placeholder="触发关键词，用逗号分隔（可选）"
        className="h-7 text-[11px]"
      />
      <div className="flex gap-1.5 justify-end pt-0.5">
        <Button variant="ghost" size="sm" className="h-7 text-[11px]" onClick={onCancel}>
          取消
        </Button>
        <Button size="sm" className="h-7 text-[11px]" onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
          {initial ? '保存' : '创建'}
        </Button>
      </div>
    </div>
  )
}

// ============== Outlines ==============

function OutlinesPanel({ novelId }: { novelId: string }) {
  const outlines = useAppStore(useShallow(selectOrderedOutlines))
  const hydrated = useAppStore(s => s.worldview.outlinesHydrated)
  const hydrate = useAppStore(s => s.worldviewActions.hydrateOutlines)
  const upsert = useAppStore(s => s.worldviewActions.upsertOutline)
  const remove = useAppStore(s => s.worldviewActions.removeOutline)

  const [loading, setLoading] = useState(!hydrated)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (!novelId || hydrated) return
    let cancelled = false
    setLoading(true)
    outlinesApi.list(novelId)
      .then((list) => {
        if (cancelled) return
        hydrate(novelId, list)
      })
      .catch((err) => {
        console.error(err)
        toast.error('加载大纲失败')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [novelId, hydrated, hydrate])

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个大纲节点吗？')) return
    try {
      await outlinesApi.delete(id)
      remove(id)
      toast.success('已删除')
    } catch (err) {
      console.error(err)
      toast.error('删除失败')
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-end px-2 py-1.5 border-b border-border">
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-[11px]"
          onClick={() => setCreating(true)}
        >
          <Plus className="w-3 h-3" />
          新建大纲
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-1.5 space-y-1 scrollbar-none">
        {loading
          ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            )
          : outlines.length === 0
            ? (
                <div className="text-center text-[11px] text-muted-foreground py-8">
                  暂无大纲，可让 AI 帮你规划
                </div>
              )
            : (
                outlines.map(o => (
                  <OutlineCard
                    key={o.id}
                    outline={o}
                    isEditing={editingId === o.id}
                    onStartEdit={() => setEditingId(o.id)}
                    onCancelEdit={() => setEditingId(null)}
                    onSaved={(updated) => {
                      upsert(updated)
                      setEditingId(null)
                    }}
                    onDelete={() => handleDelete(o.id)}
                  />
                ))
              )}
      </div>

      {creating && (
        <OutlineEditor
          novelId={novelId}
          onSaved={(created) => {
            upsert(created)
            setCreating(false)
          }}
          onCancel={() => setCreating(false)}
        />
      )}
    </div>
  )
}

function OutlineCard({
  outline,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onSaved,
  onDelete,
}: {
  outline: Outline
  isEditing: boolean
  onStartEdit: () => void
  onCancelEdit: () => void
  onSaved: (updated: Outline) => void
  onDelete: () => void
}) {
  if (isEditing) {
    return (
      <OutlineEditor
        novelId={outline.novel_id}
        initial={outline}
        onSaved={onSaved}
        onCancel={onCancelEdit}
      />
    )
  }
  return (
    <div
      className="group rounded-md border border-border bg-card px-2 py-1.5 hover:border-foreground/30 transition-colors cursor-pointer"
      onClick={onStartEdit}
    >
      <div className="flex items-start gap-1.5">
        <div className="flex-1 min-w-0">
          <h4 className="text-[12px] font-medium text-foreground truncate">{outline.title}</h4>
          <p className="text-[10.5px] text-muted-foreground mt-0.5 line-clamp-3 whitespace-pre-wrap">
            {outline.content || '（暂无内容）'}
          </p>
        </div>
        <button
          type="button"
          className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-destructive/10 rounded text-destructive transition-opacity"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          title="删除"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

function OutlineEditor({
  novelId,
  initial,
  onSaved,
  onCancel,
}: {
  novelId: string
  initial?: Outline
  onSaved: (o: Outline) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(initial?.title || '')
  const [content, setContent] = useState(initial?.content || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('标题不能为空')
      return
    }
    setSaving(true)
    try {
      const data = initial
        ? await outlinesApi.update(initial.id, { title, content })
        : await outlinesApi.create({ novel_id: novelId, title, content })
      onSaved(data)
      toast.success(initial ? '已保存' : '已创建')
    } catch (err) {
      console.error(err)
      toast.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="border-t border-border bg-background p-2 space-y-1.5">
      <Input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="大纲标题（如：第一卷·开端）"
        className="h-7 text-[11px]"
      />
      <Textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="详细规划：剧情走向、场景列表、关键事件等"
        className="text-[11px] min-h-[100px] resize-none"
        rows={5}
      />
      <div className="flex gap-1.5 justify-end pt-0.5">
        <Button variant="ghost" size="sm" className="h-7 text-[11px]" onClick={onCancel}>
          取消
        </Button>
        <Button size="sm" className="h-7 text-[11px]" onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
          {initial ? '保存' : '创建'}
        </Button>
      </div>
    </div>
  )
}
