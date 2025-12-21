'use client'

import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'
import { Camera } from 'lucide-react'

interface ProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { user, profile, refreshProfile } = useAuth()
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    full_name: profile?.full_name || '',
    website: profile?.website || '',
  })
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open && profile) {
      setFormData({
        username: profile.username || '',
        full_name: profile.full_name || '',
        website: profile.website || '',
      })
      setAvatarUrl(profile.avatar_url || '')
      setAvatarFile(null)
    }
  }, [open, profile])

  useEffect(() => {
    return () => {
      if (avatarUrl && avatarUrl.startsWith('blob:')) {
        URL.revokeObjectURL(avatarUrl)
      }
    }
  }, [avatarUrl])

  useEffect(() => {
    if (!open && avatarUrl && avatarUrl.startsWith('blob:')) {
      URL.revokeObjectURL(avatarUrl)
    }
  }, [open, avatarUrl])

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('头像大小不能超过 5MB')
      return
    }

    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件')
      return
    }

    setAvatarFile(file)
    const url = URL.createObjectURL(file)
    setAvatarUrl(url)
  }

  const handleSave = async () => {
    if (!user) return

    try {
      setIsSaving(true)
      let finalAvatarUrl = avatarUrl

      if (avatarFile) {
        setIsUploading(true)
        const formData = new FormData()
        formData.append('file', avatarFile)
        formData.append('type', 'avatar')

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!uploadResponse.ok) {
          const error = await uploadResponse.json()
          throw new Error(error.error?.message || '头像上传失败')
        }

        const uploadResult = await uploadResponse.json()
        finalAvatarUrl = uploadResult.data.url
      }

      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          avatar_url: finalAvatarUrl,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error?.message || '更新失败')
        return
      }

      await refreshProfile()
      toast.success('个人资料更新成功')
      onOpenChange(false)
    } catch (error) {
      console.error('更新失败:', error)
      toast.error(error instanceof Error ? error.message : '更新失败，请重试')
    } finally {
      setIsSaving(false)
      setIsUploading(false)
    }
  }

  const displayName = formData.full_name || formData.username || user?.email?.split('@')[0] || '用户'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-popover border border-border">
        <DialogHeader>
          <DialogTitle>编辑个人资料</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="w-24 h-24 ring-4 ring-border">
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback className="text-2xl">
                  {displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full shadow-lg"
                onClick={handleAvatarClick}
                disabled={isSaving}
              >
                <Camera className="w-4 h-4" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              点击相机图标上传头像
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="输入用户名"
                className="bg-card"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">姓名</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="输入姓名"
                className="bg-card"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">网站</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://example.com"
                className="bg-card"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSaving || isUploading}
            className="flex-1"
          >
            取消
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || isUploading}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isUploading ? '上传中...' : isSaving ? '保存中...' : '保存'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
