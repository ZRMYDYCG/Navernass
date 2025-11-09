/**
 * Marketing 页面的类型定义
 */

import type { LucideIcon } from 'lucide-react'

// 导航链接类型
export interface NavLink {
  name: string
  href: string
  target?: '_blank'
}

// 功能特性类型
export interface Feature {
  icon: LucideIcon
  title: string
  description: string
  color: string
  bgColor: string
}

// Hero 区域配置类型
export interface HeroConfig {
  title: {
    primary: string
    secondary: string
  }
  subtitle: string
  ctaButtons: {
    primary: {
      text: string
      href: string
      icon: LucideIcon
    }
    secondary: {
      text: string
      href: string
      icon: LucideIcon
      githubRepo: string
    }
  }
  images: {
    light: string
    dark: string
    labels: {
      light: string
      dark: string
    }
  }
}

// Navbar 配置类型
export interface NavbarConfig {
  logo: {
    src: string
    alt: string
    width: number
    height: number
  }
  navLinks: NavLink[]
  ctaText: string
  themeToggleLabel: string
  mobileMenuLabel: string
}

// Footer 配置类型
export interface FooterConfig {
  copyright: string
  links: NavLink[]
}

// CTA 配置类型
export interface CTAConfig {
  title: string
  subtitle: string
  ctaText: string
  href: string
}
