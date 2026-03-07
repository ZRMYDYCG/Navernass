'use client'

import { LogOut, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/use-auth'
import { AuthDialog } from './auth-dialog'

export function AuthButton() {
  const { user, profile, signOut, loading } = useAuth()
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)

      const { error } = await signOut()
      if (error) {
        toast.error(error.message || '退出登录失败')
        return
      }

      toast.success('已退出登录')
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Sign out failed:', error)
      toast.error('退出登录失败')
    } finally {
      setIsSigningOut(false)
    }
  }

  if (loading && !user) {
    return (
      <Button variant="outline" disabled>
        <div className="animate-pulse">加载中...</div>
      </Button>
    )
  }

  if (!user) {
    return (
      <>
        <Button variant="outline" onClick={() => setAuthDialogOpen(true)}>
          登录 / 注册
        </Button>
        <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
      </>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url} alt={profile?.full_name || user.email || ''} />
            <AvatarFallback className={profile?.avatar_url ? 'animate-pulse bg-muted' : ''}>
              {profile?.avatar_url ? null : (profile?.full_name?.[0] || user.email?.[0]?.toUpperCase() || 'U')}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {profile?.full_name || '用户'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/workspace" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            <span>进入应用</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} disabled={isSigningOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isSigningOut ? '正在退出...' : '退出登录'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
