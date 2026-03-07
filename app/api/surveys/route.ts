import { createClient } from '@/lib/supabase/server'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    const body = await request.json()
    const { experience, genres, pain_points, tools, ai_expectations, ai_concerns, contact } = body

    // Validation
    if (!experience || !genres || genres.length === 0) {
      return ApiResponseBuilder.badRequest('请填写必要的调研信息')
    }

    // Insert survey data
    const { data, error } = await supabase
      .from('surveys')
      .insert({
        user_id: user?.id || null,
        experience,
        genres,
        pain_points,
        tools,
        ai_expectations,
        ai_concerns,
        contact
      })
      .select()
      .single()

    if (error) {
      console.error('Error inserting survey:', error)
      return ApiResponseBuilder.error('提交失败，请稍后重试', 'DB_INSERT_ERROR', 500, error)
    }

    return ApiResponseBuilder.success(data)
  } catch (error) {
    console.error('Unexpected error:', error)
    return ApiResponseBuilder.error('服务器内部错误', 'INTERNAL_ERROR', 500, error)
  }
}
