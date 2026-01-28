'use client'

import { BookOpenText, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useCharacterMaterialStore } from '@/store/characterMaterialStore'
import { CharacterModal } from './character-modal'
import { TagInput } from './tag-input'

interface CharacterPanelProps {
  novelId: string | null
}

function FieldRenderer({
  field,
  value,
  onChange,
}: {
  field: { type: string, placeholder?: string, options?: string[] }
  value: unknown
  onChange: (value: unknown) => void
}) {
  if (field.type === 'tags') {
    return (
      <TagInput
        value={Array.isArray(value) ? value : []}
        onChange={onChange}
        placeholder={field.placeholder}
      />
    )
  }

  if (field.type === 'textarea') {
    return (
      <Textarea
        value={typeof value === 'string' ? value : ''}
        onChange={event => onChange(event.target.value)}
        placeholder={field.placeholder}
        className="min-h-[90px] text-xs"
      />
    )
  }

  if (field.type === 'select' && field.options) {
    return (
      <Select
        value={typeof value === 'string' ? value : ''}
        onValueChange={(next: string) => onChange(next)}
      >
        <SelectTrigger className="h-8 text-xs">
          <SelectValue placeholder={field.placeholder || '请选择'} />
        </SelectTrigger>
        <SelectContent>
          {field.options.map(option => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  return (
    <Input
      value={typeof value === 'string' || typeof value === 'number' ? String(value) : ''}
      onChange={event => onChange(event.target.value)}
      placeholder={field.placeholder}
      className="h-8 text-xs"
      type="text"
    />
  )
}

export function CharacterPanel({ novelId }: CharacterPanelProps) {
  const {
    selectedCharacterId,
    characterModalOpen,
    editingCharacterId,
    openCharacterModal,
    closeCharacterModal,
    characters,
  } = useCharacterMaterialStore()

  const selectedCharacter = characters.find(item => item.id === selectedCharacterId) ?? null

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="border-b border-border px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">角色图谱</p>
            <p className="text-xs text-muted-foreground">同步角色设定与正文写作</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => openCharacterModal(selectedCharacterId)}
              disabled={!selectedCharacterId}
            >
              <Pencil className="h-3.5 w-3.5" />
              编辑角色
            </Button>
            <Button
              size="sm"
              onClick={() => openCharacterModal()}
            >
              新建角色
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {!selectedCharacter && (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
            请选择一个角色开始编辑详情，或创建一个新的角色
          </div>
        )}

        {selectedCharacter && (
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-base font-semibold text-foreground">{selectedCharacter.name}</p>
                <p className="text-xs text-muted-foreground">{selectedCharacter.role || '未设定角色定位'}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
              >
                <BookOpenText className="h-3.5 w-3.5" />
                插入角色
              </Button>
            </div>
          </div>
        )}
      </div>

      <CharacterModal
        open={characterModalOpen}
        onOpenChange={open => (open ? openCharacterModal(editingCharacterId) : closeCharacterModal())}
        character={editingCharacterId ? characters.find(item => item.id === editingCharacterId) ?? null : null}
        novelId={novelId}
      />
    </div>
  )
}
