'use client'

import type { WeatherData } from '@/lib/supabase/sdk/workspace'
import { useEffect, useState } from 'react'
import { useI18n } from '@/hooks/use-i18n'
import { workspaceApi } from '@/lib/supabase/sdk/workspace'

// ── WMO 天气码 → 分类 ───────────────────────────────────────
function getWeatherType(code: number): WeatherType {
  if (code === 0) return 'sunny'
  if (code <= 2) return 'partly-cloudy'
  if (code === 3) return 'cloudy'
  if (code <= 48) return 'fog'
  if (code <= 57) return 'drizzle'
  if (code <= 67) return 'rain'
  if (code <= 77) return 'snow'
  if (code <= 82) return 'rain'
  if (code <= 86) return 'snow'
  return 'thunderstorm'
}

type WeatherType = 'sunny' | 'partly-cloudy' | 'cloudy' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'thunderstorm'

// ── SVG 图标集 ───────────────────────────────────────────────
function SunnySVG() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* 光晕 */}
      <circle cx="32" cy="32" r="14" fill="#FBBF24" />
      {/* 光芒 */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const rad = (deg * Math.PI) / 180
        const x1 = 32 + 18 * Math.cos(rad)
        const y1 = 32 + 18 * Math.sin(rad)
        const x2 = 32 + 26 * Math.cos(rad)
        const y2 = 32 + 26 * Math.sin(rad)
        return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FCD34D" strokeWidth="3" strokeLinecap="round" />
      })}
    </svg>
  )
}

function PartlyCloudySVG() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* 太阳 */}
      <circle cx="24" cy="26" r="10" fill="#FBBF24" />
      {[0, 60, 120, 180, 240, 300].map((deg) => {
        const rad = (deg * Math.PI) / 180
        const x1 = 24 + 13 * Math.cos(rad)
        const y1 = 26 + 13 * Math.sin(rad)
        const x2 = 24 + 18 * Math.cos(rad)
        const y2 = 26 + 18 * Math.sin(rad)
        return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FCD34D" strokeWidth="2.5" strokeLinecap="round" />
      })}
      {/* 云 */}
      <path d="M18 46 Q12 46 12 39 Q12 33 18 33 Q19 27 26 27 Q33 27 34 33 Q40 33 40 39 Q40 46 34 46Z" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1" />
    </svg>
  )
}

function CloudySVG() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 44 Q6 44 6 37 Q6 31 13 30 Q14 22 22 22 Q31 22 33 30 Q42 30 42 37 Q42 44 35 44Z" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1" />
      <path d="M28 50 Q22 50 22 43 Q22 37 29 37 Q30 31 38 31 Q47 31 48 37 Q55 37 55 43 Q55 50 49 50Z" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1" />
    </svg>
  )
}

function FogSVG() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* 云 */}
      <path d="M10 26 Q5 26 5 20 Q5 15 11 14 Q12 8 19 8 Q27 8 28 14 Q35 14 35 20 Q35 26 29 26Z" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1" />
      {/* 雾线 */}
      {[32, 40, 48, 56].map((y, i) => (
        <line key={y} x1={i % 2 === 0 ? 8 : 12} y1={y} x2={i % 2 === 0 ? 56 : 52} y2={y} stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="6 4" />
      ))}
    </svg>
  )
}

function DrizzleSVG() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 30 Q5 30 5 23 Q5 17 12 16 Q13 9 21 9 Q30 9 31 16 Q39 16 39 23 Q39 30 32 30Z" fill="#94A3B8" stroke="#64748B" strokeWidth="1" />
      {[[18, 36, 20, 44], [28, 34, 30, 42], [38, 36, 40, 44], [23, 44, 25, 52], [33, 42, 35, 50]].map(([x1, y1, x2, y2]) => (
        <line key={`${x1}-${y1}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
      ))}
    </svg>
  )
}

function RainSVG() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 28 Q3 28 3 21 Q3 15 10 14 Q11 7 19 7 Q28 7 29 14 Q37 14 37 21 Q37 28 30 28Z" fill="#64748B" stroke="#475569" strokeWidth="1" />
      {[[14, 33, 10, 46], [22, 33, 18, 46], [30, 33, 26, 46], [38, 33, 34, 46], [18, 46, 14, 57], [26, 46, 22, 57], [34, 46, 30, 57]].map(([x1, y1, x2, y2]) => (
        <line key={`${x1}-${y1}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />
      ))}
    </svg>
  )
}

function SnowSVG() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 26 Q3 26 3 19 Q3 13 10 12 Q11 6 19 6 Q28 6 29 12 Q37 12 37 19 Q37 26 30 26Z" fill="#94A3B8" stroke="#64748B" strokeWidth="1" />
      {/* 雪花 */}
      {[[18, 40], [30, 38], [42, 40], [24, 52], [36, 52]].map(([cx, cy]) => (
        <g key={`${cx}-${cy}`} transform={`translate(${cx},${cy})`}>
          {[0, 60, 120].map((deg) => {
            const rad = (deg * Math.PI) / 180
            return (
              <line
                key={deg}
                x1={-5 * Math.cos(rad)}
                y1={-5 * Math.sin(rad)}
                x2={5 * Math.cos(rad)}
                y2={5 * Math.sin(rad)}
                stroke="#BAE6FD"
                strokeWidth="2"
                strokeLinecap="round"
              />
            )
          })}
          <circle r="1.5" fill="#BAE6FD" />
        </g>
      ))}
    </svg>
  )
}

function ThunderstormSVG() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 26 Q1 26 1 19 Q1 13 8 12 Q9 5 18 5 Q28 5 29 12 Q38 12 38 19 Q38 26 30 26Z" fill="#475569" stroke="#334155" strokeWidth="1" />
      {/* 雨线 */}
      {[[10, 30, 7, 41], [20, 30, 17, 41], [30, 30, 27, 41]].map(([x1, y1, x2, y2]) => (
        <line key={`${x1}-${y1}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
      ))}
      {/* 闪电 */}
      <polyline points="32,28 25,42 31,42 23,58" stroke="#FDE047" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

const weatherSVGs: Record<WeatherType, () => React.ReactElement> = {
  'sunny': SunnySVG,
  'partly-cloudy': PartlyCloudySVG,
  'cloudy': CloudySVG,
  'fog': FogSVG,
  'drizzle': DrizzleSVG,
  'rain': RainSVG,
  'snow': SnowSVG,
  'thunderstorm': ThunderstormSVG,
}

// ── 组件 ─────────────────────────────────────────────────────
export function WeatherWidget() {
  const { t } = useI18n()
  const [weather, setWeather] = useState<WeatherData | null>(null)

  useEffect(() => {
    workspaceApi.getWeather().then(setWeather).catch(() => {})
  }, [])

  if (!weather || !weather.available) return null

  const getWeatherLabel = (code: number): string => {
    if (code === 0) return t('workspace.dashboard.weather.sunny')
    if (code <= 2) return t('workspace.dashboard.weather.partlyCloudy')
    if (code === 3) return t('workspace.dashboard.weather.cloudy')
    if (code <= 48) return t('workspace.dashboard.weather.fog')
    if (code <= 57) return t('workspace.dashboard.weather.drizzle')
    if (code <= 67) return t('workspace.dashboard.weather.rain')
    if (code <= 77) return t('workspace.dashboard.weather.snow')
    if (code <= 82) return t('workspace.dashboard.weather.shower')
    if (code <= 86) return t('workspace.dashboard.weather.snowShower')
    return t('workspace.dashboard.weather.thunderstorm')
  }

  const type = getWeatherType(weather.weatherCode!)
  const label = getWeatherLabel(weather.weatherCode!)
  const SVGIcon = weatherSVGs[type]

  return (
    <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-card border border-border/60 shadow-sm">
      <div className="w-9 h-9 shrink-0">
        <SVGIcon />
      </div>
      <div className="flex flex-col leading-tight">
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-semibold text-foreground">
            {weather.temperature}
            °
          </span>
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <span className="text-[11px] text-muted-foreground truncate max-w-[120px]">
          {weather.city}
          ，
          {weather.country}
        </span>
      </div>
    </div>
  )
}
