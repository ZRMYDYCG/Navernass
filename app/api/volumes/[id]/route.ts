import type { NextRequest } from 'next/server'
import type { UpdateVolumeDto } from '@/lib/supabase/sdk/types'
import { VolumesService } from '@/lib/supabase/sdk/services/volumes.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'
import { createClient } from '@/lib/supabase/server'

export const GET = withErrorHandler(
  async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const supabase = await createClient()
    const volumesService = new VolumesService(supabase)
    const { id } = await params
    const volume = await volumesService.getById(id)
    return ApiResponseBuilder.success(volume)
  },
)

export const PUT = withErrorHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const supabase = await createClient()
    const volumesService = new VolumesService(supabase)
    const { id } = await params
    const body: Partial<UpdateVolumeDto> = await req.json()
    const volume = await volumesService.update(id, body)
    return ApiResponseBuilder.success(volume)
  },
)

export const DELETE = withErrorHandler(
  async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const supabase = await createClient()
    const volumesService = new VolumesService(supabase)
    const { id } = await params
    await volumesService.delete(id)
    return ApiResponseBuilder.success({ message: 'Volume deleted successfully' })
  },
)
