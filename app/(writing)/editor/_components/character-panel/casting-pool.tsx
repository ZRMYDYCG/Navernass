'use client'

import type { Character, Relationship } from './types'
import { Download } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getCharacterColor } from '@/store/characterGraphStore'

function downloadJson(filename: string, data: unknown) {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noreferrer'
  document.body.appendChild(a)
  a.click()
  a.remove()

  URL.revokeObjectURL(url)
}

function safeFilename(name: string) {
  return name.replace(/[\\/:*?"<>|]/g, '_').trim() || 'novel'
}

export function CastingPool({
  novelId,
  novelTitle,
  characters,
  relationships,
}: {
  novelId: string
  novelTitle?: string
  characters: Character[]
  relationships: Relationship[]
}) {
  const handleExport = () => {
    downloadJson(`${safeFilename(novelTitle ?? novelId)}-characters.json`, {
      novelId,
      novelTitle: novelTitle ?? null,
      exportedAt: new Date().toISOString(),
      characters,
      relationships,
    })
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex items-center justify-between px-2 pb-3">
        <div className="flex items-baseline gap-3">
          <div className="text-sm font-semibold text-foreground">角色选角表</div>
          <div className="text-xs text-muted-foreground">
            共
            {characters.length}
            {' '}
            个角色
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4" />
          导出
        </Button>
      </div>

      <div className="flex-1 min-h-0 overflow-auto rounded-xl border border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[84px]">头像</TableHead>
              <TableHead>角色名称</TableHead>
              <TableHead className="w-[80px]">颜色</TableHead>
              <TableHead className="w-[160px]">职业/身份</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {characters.map(c => (
              <TableRow key={c.id}>
                <TableCell>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={c.avatar ?? undefined} alt={c.name} />
                    <AvatarFallback className="text-xs">{c.name?.charAt(0)?.toUpperCase?.() ?? 'C'}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>
                  <div
                    className="h-5 w-5 rounded-full border border-border"
                    style={{ backgroundColor: c.color ?? getCharacterColor(c) }}
                    title={c.color ?? undefined}
                  />
                </TableCell>
                <TableCell className="text-muted-foreground">{c.role ?? '-'}</TableCell>
              </TableRow>
            ))}

            {characters.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                  暂无角色
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
