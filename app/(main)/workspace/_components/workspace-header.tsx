'use client'

import type { NovelFormData } from '../../novels/types'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { novelsApi } from '@/lib/supabase/sdk'
import { NovelDialog } from '../../novels/_components/novel-dialog'

export function WorkspaceHeader() {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const handleSave = async (data: NovelFormData) => {
    try {
      const novel = await novelsApi.create({
        title: data.title,
        description: data.description,
        cover: data.cover,
      })
      toast.success('创建成功')
      setOpen(false)
      router.push(`/editor?id=${novel.id}`)
    } catch (error) {
      toast.error('创建失败')
      console.error(error)
    }
  }

  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-serif font-medium tracking-tight text-foreground">创作空间</h1>
        <p className="text-muted-foreground mt-1 font-light">捕捉灵感，编织故事。</p>
      </div>

      <div className="flex items-center gap-3">

        <Button className="gap-2" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          新建小说
        </Button>

        <NovelDialog
          open={open}
          novel={null}
          onOpenChange={setOpen}
          onSave={handleSave}
        />
      </div>
    </div>
  )
}
