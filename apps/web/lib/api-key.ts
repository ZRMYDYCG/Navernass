import { supabase } from '@/lib/supabase'

export async function getApiKey(userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('api_key')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw error
    }

    return data?.api_key || null
  } catch (error) {
    console.error('获取 API Key 失败:', error)
    return null
  }
}

export async function saveApiKey(userId: string, apiKey: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        api_key: apiKey,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      })

    if (error) throw error
  } catch (error) {
    console.error('保存 API Key 失败:', error)
    throw error
  }
}

export async function clearApiKey(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_settings')
      .update({ api_key: null, updated_at: new Date().toISOString() })
      .eq('user_id', userId)

    if (error) throw error
  } catch (error) {
    console.error('清除 API Key 失败:', error)
    throw error
  }
}
