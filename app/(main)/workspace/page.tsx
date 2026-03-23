'use client'

import { ContributionGraph } from './_components/contribution-graph'
import { ProjectList } from './_components/project-list'
import { StatsCard } from './_components/stats-card'

export default function WorkspacePage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-8">
          <ProjectList />
        </div>

        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
          <StatsCard />
          <ContributionGraph />

          <div className="rounded-xl bg-muted/30 p-6 border border-dashed border-muted text-center">
            <p className="font-serif italic text-muted-foreground text-sm">
              "写作就是修补裂痕。"
            </p>
            <p className="text-xs text-muted-foreground mt-2">— 玛格丽特·阿特伍德</p>
          </div>
        </div>
      </div>
    </div>
  )
}
