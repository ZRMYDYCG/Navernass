import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'

export const GET = withErrorHandler(async () => {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

  const { data: chapters, error } = await supabase
    .from('chapters')
    .select('updated_at, word_count')
    .eq('user_id', user.id)
    .gte('updated_at', oneYearAgo.toISOString())

  if (error) throw error

  const activityMap: Record<string, number> = {}
  chapters?.forEach(c => {
    const date = c.updated_at.split('T')[0]
    activityMap[date] = (activityMap[date] || 0) + 1
  })

  const activities = Object.entries(activityMap).map(([date, count]) => ({
    date,
    count,
    level: count > 5 ? 4 : count > 3 ? 3 : count > 1 ? 2 : 1
  }))

  return ApiResponseBuilder.success(activities)
})
