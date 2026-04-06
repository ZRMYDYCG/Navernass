import type { NextRequest } from 'next/server'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'

interface GeoResult {
  status: string
  city: string
  country: string
  lat: number
  lon: number
}

interface OpenMeteoResult {
  current: {
    temperature_2m: number
    weather_code: number
    wind_speed_10m: number
  }
}

export const GET = withErrorHandler(async (req: NextRequest) => {
  // 从请求头获取真实 IP
  const forwarded = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')
  const rawIp = forwarded?.split(',')[0]?.trim() || realIp || ''

  // 本地开发兜底：使用公共 IP 查询接口获取自身 IP
  const isLocal = rawIp === '127.0.0.1' || rawIp === '::1' || rawIp === ''

  let geoData: GeoResult

  if (isLocal) {
    // 本地开发：直接用 ip-api 不带参数，返回请求者自身位置
    const geoRes = await fetch('http://ip-api.com/json/?fields=status,city,country,lat,lon', {
      next: { revalidate: 3600 },
    })
    geoData = await geoRes.json() as GeoResult
  } else {
    const geoRes = await fetch(
      `http://ip-api.com/json/${rawIp}?fields=status,city,country,lat,lon`,
      { next: { revalidate: 3600 } },
    )
    geoData = await geoRes.json() as GeoResult
  }

  if (geoData.status !== 'success') {
    return ApiResponseBuilder.success({ available: false })
  }

  const { lat, lon, city, country } = geoData

  // Open-Meteo 免费天气 API，无需 key
  const weatherRes = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m&wind_speed_unit=ms`,
    { next: { revalidate: 1800 } },
  )
  const weatherData: OpenMeteoResult = await weatherRes.json()

  return ApiResponseBuilder.success({
    available: true,
    city,
    country,
    temperature: Math.round(weatherData.current.temperature_2m),
    weatherCode: weatherData.current.weather_code,
    windSpeed: Math.round(weatherData.current.wind_speed_10m),
  })
})
