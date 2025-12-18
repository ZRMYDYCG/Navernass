'use client'

import { ChevronUp, LogOut, Settings, User } from 'lucide-react'
import { useState } from 'react'
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
import { ProfileDialog } from './profile-dialog'

interface UserProfileProps {
  isCollapsed?: boolean
  isMobileOpen?: boolean
  onSettingsClick?: () => void
}

export function UserProfile({ isCollapsed = false, isMobileOpen = false, onSettingsClick }: UserProfileProps) {
  const { user, profile, signOut } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      await signOut()
    } finally {
      setIsSigningOut(false)
    }
  }

  if (!user) {
    return (
      <div className="mt-auto px-3 py-2 border-t border-gray-200 dark:border-gray-800">
        <Button
          variant="ghost"
          className="w-full h-auto p-2"
          onClick={onSettingsClick}
        >
          <User className="w-5 h-5" />
        </Button>
      </div>
    )
  }

  const displayName = profile?.full_name || profile?.username || user.email?.split('@')[0] || '用户'
  const avatarUrl = profile?.avatar_url

  return (
    <>
      <div className="mt-auto px-3 py-2 border-t border-gray-200 dark:border-gray-800">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={`w-full h-auto p-2 group relative ${
                isCollapsed && !isMobileOpen ? 'hover:bg-transparent' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <div className={`flex items-center w-full ${(!isCollapsed || isMobileOpen) ? 'gap-3' : 'justify-center'}`}>
                <div className="relative flex-shrink-0">
                  <Avatar className="w-9 h-9 ring-2 ring-gray-300 dark:ring-gray-700">
                    <AvatarImage src={avatarUrl} alt={displayName} />
                    <AvatarFallback>
                      {displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {(!isCollapsed || isMobileOpen)
                  ? (
                      <>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {displayName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>

                        <ChevronUp className="w-4 h-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                      </>
                    )
                  : null}
              </div>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" side="right" sideOffset={8} className="w-64">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{displayName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="cursor-pointer" onClick={() => setShowProfile(true)}>
              <User className="mr-2 h-4 w-4" />
              <span>个人资料</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              className="cursor-pointer"
              onClick={onSettingsClick}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>设置</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="cursor-pointer text-red-600 focus:text-red-600"
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>{isSigningOut ? '退出中...' : '退出登录'}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ProfileDialog open={showProfile} onOpenChange={setShowProfile} />
    </>
  )
}
