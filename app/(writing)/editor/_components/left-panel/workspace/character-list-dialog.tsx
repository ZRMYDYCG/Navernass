import * as Dialog from '@radix-ui/react-dialog'
import { Edit2, Plus, Trash2, Users, X } from 'lucide-react'
import * as React from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DeleteConfirmDialog } from './delete-confirm-dialog'

export interface Character {
  id: string
  name: string
  description?: string
  role?: string // 角色定位：主角、配角、反派等
  age?: string
  gender?: 'male' | 'female' | 'other'
  created_at: string
  updated_at: string
}

interface CharacterListDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  novelId: string
}

const STORAGE_KEY_PREFIX = 'novel_characters_'

export function CharacterListDialog({ open, onOpenChange, novelId }: CharacterListDialogProps) {
  const [characters, setCharacters] = React.useState<Character[]>([])
  const [editingCharacter, setEditingCharacter] = React.useState<Character | null>(null)
  const [isCreating, setIsCreating] = React.useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)
  const [characterToDelete, setCharacterToDelete] = React.useState<string | null>(null)
  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    role: '',
    age: '',
    gender: '__none__' as 'male' | 'female' | 'other' | '' | '__none__',
  })

  const storageKey = `${STORAGE_KEY_PREFIX}${novelId}`

  // 加载角色列表
  const loadCharacters = React.useCallback(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsed = JSON.parse(stored) as Character[]
        setCharacters(parsed)
      } else {
        setCharacters([])
      }
    } catch (error) {
      console.error('加载角色列表失败:', error)
      setCharacters([])
    }
  }, [storageKey])

  // 保存角色列表
  const saveCharacters = React.useCallback((newCharacters: Character[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(newCharacters))
      setCharacters(newCharacters)
    } catch (error) {
      console.error('保存角色列表失败:', error)
      toast.error('保存失败')
    }
  }, [storageKey])

  // 打开对话框时加载
  React.useEffect(() => {
    if (open) {
      loadCharacters()
    }
  }, [open, loadCharacters])

  // 重置表单
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      role: '',
      age: '',
      gender: '__none__',
    })
    setEditingCharacter(null)
    setIsCreating(false)
  }

  // 处理创建/编辑
  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('请输入角色名称')
      return
    }

    const now = new Date().toISOString()
    // 处理 gender，将 __none__ 转换为空字符串
    const genderValue = formData.gender === '__none__' ? '' : formData.gender

    if (editingCharacter) {
      // 编辑
      const updated = characters.map(char =>
        char.id === editingCharacter.id
          ? {
              ...char,
              name: formData.name.trim(),
              description: formData.description.trim() || undefined,
              role: formData.role.trim() || undefined,
              age: formData.age.trim() || undefined,
              gender: genderValue || undefined,
              updated_at: now,
            }
          : char,
      )
      saveCharacters(updated)
      toast.success('角色已更新')
    } else {
      // 创建
      const newCharacter: Character = {
        id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        role: formData.role.trim() || undefined,
        age: formData.age.trim() || undefined,
        gender: genderValue || undefined,
        created_at: now,
        updated_at: now,
      }
      saveCharacters([...characters, newCharacter])
      toast.success('角色已创建')
    }

    resetForm()
  }

  // 开始编辑
  const handleEdit = (character: Character) => {
    setEditingCharacter(character)
    setFormData({
      name: character.name,
      description: character.description || '',
      role: character.role || '',
      age: character.age || '',
      gender: character.gender || '__none__',
    })
    setIsCreating(true)
  }

  // 删除角色
  const handleDelete = (characterId: string) => {
    setCharacterToDelete(characterId)
    setDeleteConfirmOpen(true)
  }

  // 确认删除
  const handleConfirmDelete = () => {
    if (!characterToDelete) return
    const updated = characters.filter(char => char.id !== characterToDelete)
    saveCharacters(updated)
    toast.success('角色已删除')
    setCharacterToDelete(null)
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
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col h-full">
            {/* 标题栏 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  角色列表
                </Dialog.Title>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  (
                  {characters.length}
                  )
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={handleCreate}
                  className="h-8 text-xs bg-black dark:bg-zinc-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200"
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  新建角色
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
                          角色名称
                          {' '}
                          <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="text"
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                          placeholder="请输入角色名称"
                          className="w-full"
                          autoFocus
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          角色定位
                        </label>
                        <Input
                          type="text"
                          value={formData.role}
                          onChange={e => setFormData({ ...formData, role: e.target.value })}
                          placeholder="如：主角、配角、反派等"
                          className="w-full"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            性别
                          </label>
                          <Select
                            value={formData.gender === '' ? '__none__' : formData.gender}
                            onValueChange={value => setFormData({ ...formData, gender: value as typeof formData.gender })}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="未设置" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none__">未设置</SelectItem>
                              <SelectItem value="male">男</SelectItem>
                              <SelectItem value="female">女</SelectItem>
                              <SelectItem value="other">其他</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            年龄
                          </label>
                          <Input
                            type="text"
                            value={formData.age}
                            onChange={e => setFormData({ ...formData, age: e.target.value })}
                            placeholder="如：25、青年等"
                            className="w-full"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          角色描述
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={e => setFormData({ ...formData, description: e.target.value })}
                          placeholder="角色的外貌、性格、背景等信息..."
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 resize-none"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={handleSubmit}
                          className="flex-1 bg-black dark:bg-zinc-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200"
                        >
                          {editingCharacter ? '保存' : '创建'}
                        </Button>
                        <Button
                          type="button"
                          onClick={resetForm}
                          className="flex-1 bg-gray-200 dark:bg-zinc-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                          取消
                        </Button>
                      </div>
                    </div>
                  )
                : (
                    /* 角色列表 */
                    <div className="space-y-2">
                      {characters.length === 0
                        ? (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                              <p className="text-sm">暂无角色</p>
                              <p className="text-xs mt-1">点击"新建角色"开始添加</p>
                            </div>
                          )
                        : (
                            characters.map(character => (
                              <div
                                key={character.id}
                                className="p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-zinc-700/50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                                        {character.name}
                                      </h4>
                                      {character.role && (
                                        <span className="px-2 py-0.5 text-[10px] bg-gray-100 dark:bg-zinc-600 text-gray-600 dark:text-gray-300 rounded">
                                          {character.role}
                                        </span>
                                      )}
                                      {character.gender && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                          {character.gender === 'male' ? '♂' : character.gender === 'female' ? '♀' : '⚥'}
                                        </span>
                                      )}
                                      {character.age && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                          {character.age}
                                        </span>
                                      )}
                                    </div>
                                    {character.description && (
                                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                        {character.description}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleEdit(character)}
                                      className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors text-gray-600 dark:text-gray-400"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDelete(character.id)}
                                      className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors text-red-600 dark:text-red-400"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))
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
        title="确认删除角色"
        description="确定要删除这个角色吗？此操作无法撤销。"
        onConfirm={handleConfirmDelete}
      />
    </Dialog.Root>
  )
}
