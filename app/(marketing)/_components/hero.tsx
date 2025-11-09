'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Menu, Moon, Sun, X } from 'lucide-react'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { heroConfig, navbarConfig } from '../config'

export default function Hero() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Navbar - 融合到 Hero 中 */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 w-full pointer-events-none"
      >
        <div className="container mx-auto px-4 pointer-events-auto">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
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
                  className="dark:invert"
                />
                <span className="text-xl font-bold">{navbarConfig.logo.alt}</span>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
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
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
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
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                )
              })}
            </motion.div>

            {/* Desktop Actions */}
            <motion.div
              className="hidden md:flex items-center gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full bg-transparent hover:bg-transparent">
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">{navbarConfig.themeToggleLabel}</span>
              </Button>
              <Button asChild variant="outline" className="bg-transparent border-transparent hover:bg-transparent">
                <Link href="/novels">{navbarConfig.ctaText}</Link>
              </Button>
            </motion.div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="md:hidden pointer-events-auto"
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
                          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
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
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {link.name}
                      </Link>
                    )
                  })}
                  <div className="flex flex-col gap-2 pt-4">
                    <Button variant="ghost" onClick={toggleTheme} className="w-full justify-start relative bg-transparent hover:bg-transparent">
                      <div className="relative h-5 w-5 mr-2">
                        <Sun className="absolute h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                      </div>
                      <span>{navbarConfig.themeToggleLabel}</span>
                    </Button>
                    <Button asChild variant="outline" className="w-full bg-transparent border-transparent hover:bg-transparent">
                      <Link href="/novels">{navbarConfig.ctaText}</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* 圆环半弧光晕背景 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* 顶部半圆弧光晕 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px]">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/20 via-blue-500/10 to-transparent dark:from-purple-400/15 dark:via-blue-400/8 dark:to-transparent rounded-full blur-3xl" />
          <svg
            className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full"
            viewBox="0 0 800 400"
            fill="none"
          >
            <path
              d="M 0 200 Q 200 0, 400 200 T 800 200"
              stroke="url(#topArc)"
              strokeWidth="1.5"
              fill="none"
              className="opacity-60 dark:opacity-40"
            />
            <defs>
              <linearGradient id="topArc" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity="0.6" />
                <stop offset="50%" stopColor="rgb(59, 130, 246)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="rgb(6, 182, 212)" stopOpacity="0.6" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* 左侧半圆弧光晕 */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[300px] h-full">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/15 to-transparent dark:from-purple-400/10 dark:to-transparent rounded-full blur-3xl" />
          <svg
            className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-full"
            viewBox="0 0 300 1200"
            fill="none"
          >
            <path
              d="M 150 0 Q 0 300, 150 600 T 150 1200"
              stroke="rgb(139, 92, 246)"
              strokeWidth="1.5"
              fill="none"
              className="opacity-40 dark:opacity-25"
            />
          </svg>
        </div>

        {/* 右侧半圆弧光晕 */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[300px] h-full">
          <div className="absolute inset-0 bg-gradient-to-l from-cyan-500/15 to-transparent dark:from-cyan-400/10 dark:to-transparent rounded-full blur-3xl" />
          <svg
            className="absolute right-0 top-1/2 -translate-y-1/2 w-full h-full"
            viewBox="0 0 300 1200"
            fill="none"
          >
            <path
              d="M 150 0 Q 300 300, 150 600 T 150 1200"
              stroke="rgb(6, 182, 212)"
              strokeWidth="1.5"
              fill="none"
              className="opacity-40 dark:opacity-25"
            />
          </svg>
        </div>

        {/* 底部半圆弧光晕 */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px]">
          <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 via-cyan-500/10 to-transparent dark:from-blue-400/15 dark:via-cyan-400/8 dark:to-transparent rounded-full blur-3xl" />
          <svg
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-full"
            viewBox="0 0 800 400"
            fill="none"
          >
            <path
              d="M 0 200 Q 200 400, 400 200 T 800 200"
              stroke="url(#bottomArc)"
              strokeWidth="1.5"
              fill="none"
              className="opacity-60 dark:opacity-40"
            />
            <defs>
              <linearGradient id="bottomArc" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.6" />
                <stop offset="50%" stopColor="rgb(6, 182, 212)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity="0.6" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="relative z-40 container mx-auto px-4 py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* 主标题 */}
          <motion.h1
            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="block text-foreground">{heroConfig.title.primary}</span>
            <span className="block bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 dark:from-purple-400 dark:via-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
              {heroConfig.title.secondary}
            </span>
          </motion.h1>

          {/* 副标题 */}
          <motion.p
            className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {heroConfig.subtitle}
          </motion.p>

          {/* CTA 按钮 */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button size="lg" asChild className="min-w-[200px]">
              <Link href={heroConfig.ctaButtons.primary.href}>
                {heroConfig.ctaButtons.primary.text}
                <heroConfig.ctaButtons.primary.icon className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="min-w-[200px]">
              <a
                href={heroConfig.ctaButtons.secondary.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <heroConfig.ctaButtons.secondary.icon className="w-4 h-4 mr-2" />
                {heroConfig.ctaButtons.secondary.text}
              </a>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
