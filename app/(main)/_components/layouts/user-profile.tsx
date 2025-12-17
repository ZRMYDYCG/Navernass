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

interface UserProfileProps {
  isCollapsed?: boolean
  isMobileOpen?: boolean
  onSettingsClick?: () => void
}

export function UserProfile({ isCollapsed = false, isMobileOpen = false, onSettingsClick }: UserProfileProps) {
  const [user] = useState({
    name: '张三',
    email: 'zhangsan@example.com',
    avatar: '',
    role: '创作者',
    isOnline: true,
  })

  return (
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
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {(!isCollapsed || isMobileOpen)
                ? (
                    <>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.role}
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
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem className="cursor-pointer">
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

          <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>退出登录</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
