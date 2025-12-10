'use client'

import { Loader2, RotateCw, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface ChapterSummaryProps {
  chapterId: string
}

export function ChapterSummary({ chapterId }: ChapterSummaryProps) {
  const [summary, setSummary] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateSummary = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch(`/api/chapters/${chapterId}/summary`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('生成摘要失败')
      }

      const result = await response.json()
      setSummary(result.data.summary)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '生成摘要失败')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="mb-8">
      <button
        onClick={summary ? undefined : handleGenerateSummary}
        disabled={isGenerating}
        className={`w-full relative border-l-2 border-primary/40 bg-gradient-to-r from-muted/30 to-transparent rounded-r-lg p-4 text-left transition-colors ${
          !summary && !isGenerating ? 'hover:from-muted/40 cursor-pointer' : 'cursor-default'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                AI 章节摘要
              </span>
            </div>

            {isGenerating
              ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>正在生成新的摘要...</span>
                  </div>
                )
              : summary
                ? (
                    <p className="text-sm leading-relaxed text-foreground/90">
                      {summary}
                    </p>
                  )
                : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Sparkles className="h-4 w-4" />
                      <span>点击生成章节摘要</span>
                    </div>
                  )}
          </div>

          {!isGenerating && summary && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGenerateSummary}
              className="group flex-shrink-0 h-8 w-8 p-0"
              title="重新生成"
            >
              <RotateCw className="h-3.5 w-3.5 transition-transform group-hover:rotate-180 duration-300" />
            </Button>
          )}
        </div>
      </button>
    </div>
  )
}
