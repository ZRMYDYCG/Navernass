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
import { useI18n } from '@/hooks/use-i18n'
import { useThemeTransition } from '@/hooks/use-theme-transition'

const colorThemes = [
  { name: 'default', key: 'default' },
  { name: 'red', key: 'red' },
  { name: 'rose', key: 'rose' },
  { name: 'orange', key: 'orange' },
  { name: 'green', key: 'green' },
  { name: 'blue', key: 'blue' },
  { name: 'yellow', key: 'yellow' },
  { name: 'violet', key: 'violet' },
] as const

export function ThemeColorShowcase() {
  const { t } = useI18n()
  const { colorTheme, setColorTheme } = useColorTheme()
  const { resolvedTheme, setTheme } = useThemeTransition()
  const mode: 'light' | 'dark' = resolvedTheme === 'dark' ? 'dark' : 'light'

  return (
    <div className="w-full h-full p-4 bg-background rounded-lg flex flex-col items-center text-center">
      <div className="flex flex-col items-center justify-center mb-6">
        <h3 className="text-lg text-foreground mb-2">
          <Highlighter action="underline" color="var(--primary)">{t('marketing.themeColorShowcase.title')}</Highlighter>
        </h3>
        <p className="text-sm text-muted-foreground">
          {t('marketing.themeColorShowcase.description')}
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
                    {t(`marketing.themeColorShowcase.colorThemes.${theme.key}`)}
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
              {t('marketing.lightOrDay.lightMode')}
            </Button>
            <Button
              variant={mode === 'dark' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 rounded-full px-3"
              onClick={e => setTheme('dark', e)}
            >
              <Moon className="mr-1 h-3.5 w-3.5" />
              {t('marketing.lightOrDay.darkMode')}
            </Button>
          </div>
        </div>

        <PaperCard variant="stack" className="text-left">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 bg-card">
            <div className="flex items-center gap-2 shrink-0">
              <Button size="sm" className="h-8 px-3">
                {t('marketing.themeColorShowcase.newChapter')}
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">W</AvatarFallback>
              </Avatar>
            </div>
          </div>

          <div className="grid md:grid-cols-[260px_1fr]">
            <div className="border-b md:border-b-0 md:border-r border-border bg-muted/30 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-foreground">{t('marketing.themeColorShowcase.chapters')}</div>
                <Badge variant="outline" className="h-5 px-2 text-[10px]">
                  12
                </Badge>
              </div>

              <div className="mt-3">
                <Input placeholder={t('marketing.themeColorShowcase.searchPlaceholder')} className="h-8 text-xs" />
              </div>

              <div className="mt-3 space-y-1">
                <button
                  type="button"
                  className="w-full flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors hover:bg-accent"
                >
                  <span className="truncate">{t('marketing.themeColorShowcase.chapterThree')}</span>
                  <span className="h-2 w-2 rounded-full bg-primary" />
                </button>
                <button
                  type="button"
                  className="w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <span className="truncate">{t('marketing.themeColorShowcase.chapterTwo')}</span>
                  <Badge variant="secondary" className="h-5 px-2 text-[10px]">
                    {t('marketing.themeColorShowcase.drafts')}
                  </Badge>
                </button>
                <button
                  type="button"
                  className="w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <span className="truncate">{t('marketing.themeColorShowcase.chapterOne')}</span>
                  <span className="text-xs">1,204</span>
                </button>
              </div>
            </div>

            <div className="p-4 md:p-6 bg-background">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">{t('marketing.themeColorShowcase.editing')}</div>
                  <div className="truncate text-lg font-semibold text-foreground">
                    {t('marketing.themeColorShowcase.chapterThree')}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="outline" size="sm" className="h-8 px-3">
                    {t('marketing.themeColorShowcase.preview')}
                  </Button>
                  <Button size="sm" className="h-8 px-3">
                    {t('marketing.themeColorShowcase.save')}
                  </Button>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="secondary" className="h-5 px-2 text-[10px]">
                    {t('marketing.themeColorShowcase.focusMode')}
                  </Badge>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-primary/60" />
                    {t('marketing.themeColorShowcase.synced')}
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
                        {t('marketing.themeColorShowcase.outline')}
                      </TabsTrigger>
                      <TabsTrigger value="notes" className="flex-none">
                        {t('marketing.themeColorShowcase.notes')}
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="outline" className="mt-3">
                      <div className="grid gap-2 md:grid-cols-2">
                        <div className="rounded-lg border border-border bg-background p-3">
                          <div className="text-xs font-medium text-foreground">
                            {t('marketing.themeColorShowcase.plotTwist')}
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {t('marketing.themeColorShowcase.plotTwistDescription')}
                          </div>
                        </div>
                        <div className="rounded-lg border border-border bg-background p-3">
                          <div className="text-xs font-medium text-foreground">
                            {t('marketing.themeColorShowcase.foreshadowing')}
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {t('marketing.themeColorShowcase.foreshadowingDescription')}
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="notes" className="mt-3">
                      <div className="rounded-lg border border-border bg-background p-3 text-xs text-muted-foreground">
                        {t('marketing.themeColorShowcase.notesPlaceholder')}
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
