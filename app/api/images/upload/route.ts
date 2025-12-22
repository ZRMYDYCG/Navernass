import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const conversationId = formData.get('conversationId') as string

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400 })
    }

    if (!conversationId) {
      return new Response(JSON.stringify({ error: 'No conversationId provided' }), { status: 400 })
    }

    const supabase = await createClient()

    const fileExt = file.name.split('.').pop()
    const fileName = `${conversationId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('chat-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      throw uploadError
    }

    const { data: { publicUrl } } = supabase.storage
      .from('chat-images')
      .getPublicUrl(fileName)

    return new Response(JSON.stringify({
      success: true,
      url: publicUrl,
      path: fileName,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error: any) {
    console.error('Image upload error:', error)
    return new Response(JSON.stringify({
      error: 'Upload failed',
      message: error.message
    }), { status: 500 })
  }
}
