import type { NextRequest } from 'next/server'
import { getApiKey } from '@/lib/api-key'
import { createClient } from '@/lib/supabase/server'

interface ImageGenerationRequest {
  type: 'text-to-image' | 'image-to-image'
  prompt: string
  negative_prompt?: string
  size?: '256x256' | '512x512' | '1024x1024' | '1024x768' | '768x1024'
  num_images?: number
  image_url?: string
  strength?: number
  steps?: number
  guidance_scale?: number
}

export async function POST(req: NextRequest) {
  try {
    const body: ImageGenerationRequest = await req.json()
    const { type, prompt, negative_prompt, size = '1024x1024', num_images = 1, image_url, strength = 0.75, steps = 20, guidance_scale = 7.5 } = body

    if (!prompt || prompt.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), { status: 400 })
    }

    const userApiKey = await getApiKey('default-user')
    if (!userApiKey && !process.env.SILICON_FLOW_API_KEY) {
      return new Response(JSON.stringify({ error: 'API Key not configured' }), { status: 400 })
    }

    const apiKey = userApiKey || process.env.SILICON_FLOW_API_KEY || ''
    const baseUrl = process.env.SILICON_FLOW_BASE_URL || 'https://api.siliconflow.cn/v1'
    const model = 'Kwai-Kolors/Kolors'

    const requestBody: any = {
      model,
      prompt,
      size,
      num_images,
      steps,
      guidance_scale,
    }

    if (negative_prompt) {
      requestBody.negative_prompt = negative_prompt
    }

    if (type === 'image-to-image') {
      if (!image_url) {
        return new Response(JSON.stringify({ error: 'image_url is required for image-to-image' }), { status: 400 })
      }
      requestBody.image_url = image_url
      requestBody.strength = strength
    }

    const response = await fetch(`${baseUrl}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const error = await response.json()
      return new Response(JSON.stringify({
        error: 'Image generation failed',
        details: error.error?.message || response.statusText
      }), { status: 500 })
    }

    const data = await response.json()

    return new Response(JSON.stringify({
      success: true,
      images: data.data || [],
      model: model,
      size: size,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error: any) {
    console.error('Image generation error:', error)
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message
    }), { status: 500 })
  }
}
