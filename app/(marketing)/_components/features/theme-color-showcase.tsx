'use client'

import { Moon, Sun } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Highlighter } from '@/components/ui/highlighter'
import { Input } from '@/components/ui/input'
import { PaperCard } from '@/components/ui/paper-card'
import { SegmentedControl, SegmentedControlItem } from '@/components/ui/segmented-control'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useColorTheme } from '@/hooks/use-color-theme'
import { useThemeTransition } from '@/hooks/use-theme-transition'

const colorThemes = [
  { name: 'default', label: '默认' },
  { name: 'red', label: '红色' },
  { name: 'rose', label: '玫瑰' },
  { name: 'orange', label: '橙色' },
  { name: 'green', label: '绿色' },
  { name: 'blue', label: '蓝色' },
  { name: 'yellow', label: '黄色' },
  { name: 'violet', label: '紫罗兰' },
] as const

export function ThemeColorShowcase() {
  const { colorTheme, setColorTheme } = useColorTheme()
  const { resolvedTheme, setTheme } = useThemeTransition()
  const mode: 'light' | 'dark' = resolvedTheme === 'dark' ? 'dark' : 'light'

  return (
    <div className="w-full h-full p-4 bg-background rounded-lg flex flex-col items-center text-center">
      <div className="flex flex-col items-center justify-center mb-6">
        <h3 className="text-lg text-foreground mb-2">
          <Highlighter action="underline" color="var(--primary)">主题定制</Highlighter>
        </h3>
        <p className="text-sm text-muted-foreground">
          内置多套精心设计的主题色，支持一键切换，让你的创作空间更具个性。
        </p>
      </div>

      <div className="w-full max-w-4xl space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <div className="flex flex-col items-center gap-2 w-full">
            <div className="w-full overflow-x-auto">
              <SegmentedControl
                value={colorTheme}
                onValueChange={setColorTheme}
                size="sm"
                className="min-w-max"
              >
                {colorThemes.map(theme => (
                  <SegmentedControlItem key={theme.name} value={theme.name} size="sm">
                    {theme.label}
                  </SegmentedControlItem>
                ))}
              </SegmentedControl>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border bg-card p-1 shadow-sm">
            <Button
              variant={mode === 'light' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 rounded-full px-3"
              onClick={e => setTheme('light', e)}
            >
              <Sun className="mr-1 h-3.5 w-3.5" />
              浅色
            </Button>
            <Button
              variant={mode === 'dark' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 rounded-full px-3"
              onClick={e => setTheme('dark', e)}
            >
              <Moon className="mr-1 h-3.5 w-3.5" />
              深色
            </Button>
          </div>
        </div>

        <PaperCard variant="stack" className="text-left">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 bg-card">
            <div className="flex items-center gap-2 shrink-0">
              <Button size="sm" className="h-8 px-3">
                新建章节
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">W</AvatarFallback>
              </Avatar>
            </div>
          </div>

          <div className="grid md:grid-cols-[260px_1fr]">
            <div className="border-b md:border-b-0 md:border-r border-border bg-muted/30 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-foreground">章节</div>
                <Badge variant="outline" className="h-5 px-2 text-[10px]">
                  12
                </Badge>
              </div>

              <div className="mt-3">
                <Input placeholder="搜索章节..." className="h-8 text-xs" />
              </div>

              <div className="mt-3 space-y-1">
                <button
                  type="button"
                  className="w-full flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors hover:bg-accent"
                >
                  <span className="truncate">第三章：意外发现</span>
                  <span className="h-2 w-2 rounded-full bg-primary" />
                </button>
                <button
                  type="button"
                  className="w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <span className="truncate">第二章：雨夜来客</span>
                  <Badge variant="secondary" className="h-5 px-2 text-[10px]">
                    草稿
                  </Badge>
                </button>
                <button
                  type="button"
                  className="w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <span className="truncate">第一章：开场白</span>
                  <span className="text-xs">1,204</span>
                </button>
              </div>
            </div>

            <div className="p-4 md:p-6 bg-background">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">正在编辑</div>
                  <div className="truncate text-lg font-semibold text-foreground">
                    第三章：意外发现
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="outline" size="sm" className="h-8 px-3">
                    预览
                  </Button>
                  <Button size="sm" className="h-8 px-3">
                    保存
                  </Button>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="secondary" className="h-5 px-2 text-[10px]">
                    专注模式
                  </Badge>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-primary/60" />
                    已同步
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <Skeleton className="h-6 w-3/5" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[92%]" />
                  <Skeleton className="h-4 w-[85%]" />
                  <Skeleton className="h-4 w-[78%]" />
                </div>

                <div className="mt-4">
                  <Tabs defaultValue="outline">
                    <TabsList className="w-full justify-start">
                      <TabsTrigger value="outline" className="flex-none">
                        大纲
                      </TabsTrigger>
                      <TabsTrigger value="notes" className="flex-none">
                        便签
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="outline" className="mt-3">
                      <div className="grid gap-2 md:grid-cols-2">
                        <div className="rounded-lg border border-border bg-background p-3">
                          <div className="text-xs font-medium text-foreground">
                            关键转折
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            主角在旧箱子里找到线索
                          </div>
                        </div>
                        <div className="rounded-lg border border-border bg-background p-3">
                          <div className="text-xs font-medium text-foreground">
                            伏笔回收
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            第一章的信件出现新解读
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="notes" className="mt-3">
                      <div className="rounded-lg border border-border bg-background p-3 text-xs text-muted-foreground">
                        随手记录灵感、台词与设定…
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          </div>
        </PaperCard>
      </div>
    </div>
  )
}
