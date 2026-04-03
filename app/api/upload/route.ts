import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const POST = async (req: NextRequest) => {
  try {
    const supabase = await createClient(req)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: { message: '请先登录后再上传文件' } }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string

    if (!file) {
      return new Response(
        JSON.stringify({ error: { message: '请选择要上传的文件' } }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const ext = file.name.split('.').pop() || 'jpg'
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    let path = ''
    if (type === 'cover') {
      path = `covers/${fileName}`
    } else if (type === 'illustration') {
      path = `illustrations/${fileName}`
    } else if (type === 'avatar') {
      path = `avatars/${fileName}`
    } else {
      return new Response(
        JSON.stringify({ error: { message: '无效的文件类型' } }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const { data, error } = await supabase.storage.from('narraverse').upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })

    if (error) {
      return new Response(
        JSON.stringify({ error: { message: error.message } }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 返回一个签名 URL（在私有 bucket 场景下可以访问）
    const expiresIn = 60 * 60 * 24 * 365 // 1 year
    const { data: signedData, error: signedError } = await supabase
      .storage
      .from('narraverse')
      .createSignedUrl(data.path, expiresIn)

    if (signedError || !signedData) {
      return new Response(
        JSON.stringify({ error: { message: signedError?.message || 'Failed to create signed url' } }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ data: { url: signedData.signedUrl } }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('文件上传失败:', error)
    return new Response(
      JSON.stringify({ error: { message: '文件上传失败' } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
