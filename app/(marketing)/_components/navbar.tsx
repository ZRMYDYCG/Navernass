'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Menu, Moon, Sun, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useThemeTransition } from '@/hooks/use-theme-transition'
import { navbarConfig } from '../config'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { resolvedTheme, setTheme } = useThemeTransition()

  const toggleTheme = (e: React.MouseEvent) => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark', e)
  }

  return (
    <motion.nav className="fixed top-0 left-0 right-0 z-50 w-full bg-background/80 backdrop-blur-sm border-b-2 border-dashed border-foreground/10 transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Link href="/" className="flex items-center gap-2">
              <Image
                src={navbarConfig.logo.src}
                width={navbarConfig.logo.width}
                height={navbarConfig.logo.height}
                alt={navbarConfig.logo.alt}
              />
              <span className="text-xl font-bold text-foreground font-sans tracking-wide text-letterpress">
                {navbarConfig.logo.alt}
              </span>
            </Link>
          </motion.div>

          <motion.div
            className="hidden md:flex items-center gap-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {navbarConfig.navLinks.map((link, index) => {
              const isExternal = link.target === '_blank'
              if (isExternal) {
                return (
                  <motion.a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                    whileHover={{ y: -2 }}
                  >
                    {link.name}
                  </motion.a>
                )
              }
              return (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                  whileHover={{ y: -2 }}
                >
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>

          <motion.div
            className="hidden md:flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full text-foreground hover:bg-foreground/10"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">{navbarConfig.themeToggleLabel}</span>
            </Button>
            <Button
              asChild
              variant="outline"
            >
              <Link href="/novels">{navbarConfig.ctaText}</Link>
            </Button>
          </motion.div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md transition-colors text-foreground hover:bg-foreground/10"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden pointer-events-auto bg-background/95 backdrop-blur-md border-b border-border absolute top-16 left-0 right-0 shadow-paper-sm"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container mx-auto px-4 py-4">
              <div className="flex flex-col gap-4">
                {navbarConfig.navLinks.map((link) => {
                  const isExternal = link.target === '_blank'
                  if (isExternal) {
                    return (
                      <a
                        key={link.name}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {link.name}
                      </a>
                    )
                  }
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  )
                })}
                <div className="flex flex-col gap-2 pt-4">
                  <Button
                    variant="ghost"
                    onClick={toggleTheme}
                    className="w-full justify-start text-foreground"
                  >
                    <div className="relative h-5 w-5 mr-2">
                      <Sun className="absolute h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    </div>
                    <span>{navbarConfig.themeToggleLabel}</span>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full"
                  >
                    <Link href="/novels">{navbarConfig.ctaText}</Link>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
