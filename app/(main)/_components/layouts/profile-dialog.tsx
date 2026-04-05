'use client'

import { Camera } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { useI18n } from '@/hooks/use-i18n'

interface ProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { user, profile, setProfile } = useAuth()
  const { t } = useI18n()
  const [username, setUsername] = useState('')
  const [website, setWebsite] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (!open) {
      initializedRef.current = false
      return
    }

    if (initializedRef.current) return

    initializedRef.current = true
    setUsername(profile?.username || '')
    setWebsite(profile?.website || '')
    setAvatarUrl(profile?.avatar_url || '')
    setAvatarFile(null)
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
      toast.error(t('main.profile.messages.avatarTooLarge'))
      return
    }

    if (!file.type.startsWith('image/')) {
      toast.error(t('main.profile.messages.avatarNotImage'))
      return
    }

    if (avatarUrl && avatarUrl.startsWith('blob:')) {
      URL.revokeObjectURL(avatarUrl)
    }

    setAvatarFile(file)
    const url = URL.createObjectURL(file)
    setAvatarUrl(url)
  }

  const normalizeNullableText = (value: string) => {
    const normalized = value.trim()
    return normalized.length > 0 ? normalized : null
  }

  const handleSave = async () => {
    if (!user) return

    try {
      setIsSaving(true)
      let finalAvatarUrl = avatarUrl

      if (avatarFile) {
        setIsUploading(true)
        const uploadFormData = new FormData()
        uploadFormData.append('file', avatarFile)
        uploadFormData.append('type', 'avatar')

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        })

        if (!uploadResponse.ok) {
          const error = await uploadResponse.json()
          throw new Error(error.error?.message || t('main.profile.messages.avatarUploadFailed'))
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
          username: normalizeNullableText(username),
          website: normalizeNullableText(website),
          avatar_url: normalizeNullableText(finalAvatarUrl),
        }),
      })

      if (!response.ok) {
        let errorMessage = t('main.profile.messages.updateFailed')
        try {
          const error = await response.json()
          errorMessage = error?.error?.message || error?.error || error?.message || errorMessage
        } catch {
          // Ignore non-JSON response body
        }
        toast.error(errorMessage)
        return
      }

      const updatedProfile = await response.json()
      setProfile(updatedProfile)

      toast.success(t('main.profile.messages.updated'))
      onOpenChange(false)
    } catch (error) {
      console.error('更新失败:', error)
      toast.error(error instanceof Error ? error.message : t('main.profile.messages.updateFailedRetry'))
    } finally {
      setIsSaving(false)
      setIsUploading(false)
    }
  }

  const displayName = username || user?.email?.split('@')[0] || t('common.user')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-popover border border-border">
        <DialogHeader>
          <DialogTitle>{t('main.profile.title')}</DialogTitle>
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
              {t('main.profile.uploadHint')}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">{t('main.profile.fields.penName')}</Label>
            <Input
              id="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder={t('main.profile.placeholders.penName')}
              className="bg-card"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">{t('main.profile.fields.website')}</Label>
            <Input
              id="website"
              value={website}
              onChange={e => setWebsite(e.target.value)}
              placeholder="https://example.com"
              className="bg-card"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSaving || isUploading}
            className="flex-1"
          >
            {t('main.profile.actions.cancel')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || isUploading}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isUploading ? t('main.profile.actions.uploading') : isSaving ? t('main.profile.actions.saving') : t('main.profile.actions.save')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

