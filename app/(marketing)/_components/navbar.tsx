'use client'

import { Moon, Sun } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useThemeTransition } from '@/hooks/use-theme-transition'
import { AuthButton } from './auth-button'
import { ContactDialog } from './contact-dialog'

export default function Navbar() {
  const { resolvedTheme, setTheme } = useThemeTransition()
  const [contactOpen, setContactOpen] = useState(false)

  const toggleTheme = (e: React.MouseEvent) => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark', e)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full  bg-background/80 backdrop-blur-sm transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Image
                src={resolvedTheme === 'dark' ? '/assets/svg/logo-light.svg' : '/assets/svg/logo-dark.svg'}
                width={32}
                height={32}
                alt="Narraverse"
              />
              <span className="text-xl font-bold text-foreground font-sans tracking-wide text-letterpress">
                Narraverse
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2 md:gap-3 scale-90 md:scale-100">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full text-foreground hover:bg-foreground/10"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">切换主题</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="rounded-full text-xs md:text-sm"
              onClick={() => setContactOpen(true)}
            >
              联系我们
            </Button>

            <AuthButton />
          </div>
        </div>
      </div>

      <ContactDialog open={contactOpen} onOpenChange={setContactOpen} />
    </nav>
  )
}
