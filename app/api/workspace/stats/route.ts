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

  // 1. Novels count (active)
  const { count: novelCount, error: novelError } = await supabase
    .from('novels')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .neq('status', 'archived')

  if (novelError) throw novelError

  // 2. Chapters count & Word count
  const { data: chapters, error: chapterError } = await supabase
    .from('chapters')
    .select('word_count, updated_at')
    .eq('user_id', user.id)

  if (chapterError) throw chapterError

  const totalWordCount = chapters?.reduce((acc, curr) => acc + (curr.word_count || 0), 0) || 0
  const finishedChapterCount = chapters?.length || 0

  // 3. Characters count
  const { data: novels, error: novelsError } = await supabase
    .from('novels')
    .select('characters')
    .eq('user_id', user.id)

  if (novelsError) throw novelsError

  let characterCount = 0
  novels?.forEach((novel: any) => {
    if (Array.isArray(novel.characters)) {
      characterCount += novel.characters.length
    }
  })
  
  // 4. Streak calculation
  const dates = chapters?.map(c => c.updated_at.split('T')[0]).sort().reverse() || []
  const uniqueDates = [...new Set(dates)]
  
  let streak = 0
  if (uniqueDates.length > 0) {
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    
    if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
      streak = 1
      let currentDateStr = uniqueDates[0]
      
      for (let i = 1; i < uniqueDates.length; i++) {
        const currentDate = new Date(currentDateStr)
        const prevDate = new Date(currentDate)
        prevDate.setDate(prevDate.getDate() - 1)
        const expectedDate = prevDate.toISOString().split('T')[0]
        
        if (uniqueDates[i] === expectedDate) {
          streak++
          currentDateStr = expectedDate
        } else {
          break
        }
      }
    }
  }

  return ApiResponseBuilder.success({
    novelCount: novelCount || 0,
    totalWordCount,
    finishedChapterCount,
    characterCount: characterCount || 0,
    streak
  })
})
