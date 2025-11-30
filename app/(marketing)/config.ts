/**
 * Marketing 页面的配置文件
 */

import type {
  CTAConfig,
  HeroConfig,
  NavbarConfig,
} from './types'
import {
  ArrowRight,
  Star,
} from 'lucide-react'

// ============================================================================
// Navbar 配置
// ============================================================================
export const navbarConfig: NavbarConfig = {
  logo: {
    src: '/assets/svg/logo-light.svg',
    alt: 'Narraverse',
    width: 32,
    height: 32,
  },
  navLinks: [
    { name: '功能', href: '#features' },
    { name: '文档', href: '#docs' },
    { name: '社区', href: '#community' },
    { name: 'GitHub', href: 'https://github.com/narraverse/narraverse-next-mvp', target: '_blank' },
  ],
  ctaText: '进入应用',
  themeToggleLabel: '切换主题',
  mobileMenuLabel: '切换菜单',
}

// ============================================================================
// Hero 区域配置
// ============================================================================
export const heroConfig: HeroConfig = {
  title: {
    primary: '为创作者打造',
    secondary: '舒适的创作环境',
  },
  subtitle:
    '我们专注为才华横溢的创作者打造舒适的创作环境，降低优质内容被看见、被分享、被发掘的门槛。同时也为新手提供AI辅助，降低直面感受创作、学习创作、走进创作的门槛。',
  ctaButtons: {
    primary: {
      text: '开始创作',
      href: '/novels',
      icon: ArrowRight,
    },
    secondary: {
      text: 'Star on GitHub',
      href: 'https://github.com/narraverse/narraverse-next-mvp',
      icon: Star,
      githubRepo: 'narraverse/narraverse-next-mvp',
    },
  },
  images: {
    light: '/assets/svg/logo-light.svg',
    dark: '/assets/svg/logo-dark.svg',
    labels: {
      light: '亮色主题',
      dark: '暗色主题',
    },
  },
  stickyNote: {
    timePeriods: {
      morning: '上午',
      afternoon: '下午',
      evening: '晚上',
      night: '深夜',
    },
    content: {
      p1: '阳光透过窗棂洒在木质桌面上，尘埃在光束中缓慢飞舞。',
      p2: '他拿起那支旧钢笔，迟疑了片刻，终于在纸上写下：',
      p3: '“所有的故事，都始于一个安静的瞬间，',
    },
    prompt: '邀请你继续把故事写下去...',
  },
}

// ============================================================================
// CTA 配置
// ============================================================================
export const ctaConfig: CTAConfig = {
  title: '加入我们，一群热爱开源的人',
  subtitle:
    '这个项目是我一个人从 0 到 1 创造的。一个人的精力有限，项目可能会存在一些隐藏的 BUG。希望大家能够及时在 GitHub 向我反馈，这样也好加以改正，不断改善，成为最佳！当然我更希望大家能够提交 PR 成为 Narraverse 的贡献者。大家一起参与进来，构建一个强大的小说创作平台！',
  ctaText: '立即加入',
  href: 'https://github.com/narraverse/narraverse-next-mvp',
}
