'use client'

import { CheckCircle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'

type VerifyStatus = 'verifying' | 'success' | 'failed'

export default function VerifySuccessPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  const params = useMemo(() => {
    if (typeof window === 'undefined') return null
    return new URLSearchParams(window.location.search)
  }, [])

  const errorParam = params?.get('error') ?? null
  const successParam = params?.get('status') ?? null
  const redirectTo = params?.get('redirectTo') || '/'

  const errorMessage = errorParam ? decodeURIComponent(errorParam) : ''

  const status = useMemo<VerifyStatus>(() => {
    if (errorParam) return 'failed'
    if (loading) return 'verifying'
    if (user || successParam === 'success') return 'success'
    return 'failed'
  }, [user, loading, errorParam, successParam])

  const handleEnter = () => {
    router.replace(redirectTo)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        {status === 'verifying' && (
          <>
            <Loader2 className="w-16 h-16 animate-spin mx-auto text-primary" />
            <h2 className="text-2xl font-semibold">正在验证您的账户...</h2>
            <p className="text-muted-foreground">请稍候，我们正在确认您的邮箱验证状态</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
            <h2 className="text-2xl font-semibold text-green-600">验证成功！</h2>
            <Button variant="default" size="lg" onClick={handleEnter}>进入应用</Button>
          </>
        )}
        {status === 'failed' && (
          <>
            <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-3xl">✕</span>
            </div>
            <h2 className="text-2xl font-semibold text-red-600">验证失败</h2>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>验证链接无效或已过期</p>
              {errorMessage && (
                <p className="text-xs text-red-500 bg-red-50 p-2 rounded">
                  错误详情：
                  {errorMessage}
                </p>
              )}
            </div>
            <Button variant="default" size="lg" onClick={() => router.replace('/')}>返回首页</Button>
          </>
        )}
      </div>
    </div>
  )
}
