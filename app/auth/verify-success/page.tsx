'use client'

import { CheckCircle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'

export default function VerifySuccessPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying')
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const error = searchParams.get('error')
    const success = searchParams.get('status')
    const timestamp = searchParams.get('timestamp')

    if (error) {
      setErrorMessage(decodeURIComponent(error))
    }

    if (!loading) {
      if (user && status !== 'success') {
        setStatus('success')
        setTimeout(() => {
          router.push('/chat')
        }, 1500)
      } else if (success) {
        setStatus('success')
        setTimeout(() => {
          router.push('/chat')
        }, 1500)
      } else {
        setStatus('failed')
        setTimeout(() => {
          router.push('/')
        }, 3000)
      }
    }
  }, [user, loading, router])

  useEffect(() => {
    const handleAuthStateChange = () => {
      if (user && status !== 'success') {
        setStatus('success')
        setTimeout(() => {
          router.push('/chat')
        }, 1000)
      }
    }

    handleAuthStateChange()
  }, [user, router, status])

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
            <p className="text-muted-foreground">正在跳转到聊天页面...</p>
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
            <p className="text-muted-foreground">正在跳转到首页...</p>
          </>
        )}
      </div>
    </div>
  )
}
