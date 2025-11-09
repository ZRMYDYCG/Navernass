/**
 * Marketing 页面的配置文件
 */

import type {
  CTAConfig,
  Feature,
  FooterConfig,
  HeroConfig,
  NavbarConfig,
} from './types'
import {
  ArrowRight,
  BookOpen,
  Brain,
  Database,
  FileText,
  MessageSquare,
  Star,
  Zap,
} from 'lucide-react'

// ============================================================================
// Navbar 配置
// ============================================================================
export const navbarConfig: NavbarConfig = {
  logo: {
    src: '/assets/svg/logo-eye.svg',
    alt: 'Narraverse',
    width: 15,
    height: 15,
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
// Features 配置
// ============================================================================
export const featuresConfig: Feature[] = [
  {
    icon: Brain,
    title: 'AI 智能写作',
    description: '智能续写、情节建议、角色对话生成，让创作更加流畅自然',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
  },
  {
    icon: BookOpen,
    title: '章节管理',
    description: '清晰的章节结构、便捷的编辑器、实时保存，专注于创作本身',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
  },
  {
    icon: Database,
    title: '知识库系统',
    description: '构建你的世界观、角色档案、设定资料，随时调用灵感素材',
    color: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-50 dark:bg-cyan-950/30',
  },
  {
    icon: MessageSquare,
    title: 'AI 对话助手',
    description: '随时与 AI 讨论情节、咨询建议，获得创作灵感和写作指导',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
  },
  {
    icon: FileText,
    title: '富文本编辑',
    description: '强大的编辑器支持格式化、快捷键、字数统计，提升写作效率',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
  },
  {
    icon: Zap,
    title: '云端同步',
    description: '多设备无缝同步，随时随地继续创作，永不丢失你的灵感',
    color: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-50 dark:bg-pink-950/30',
  },
]

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

// ============================================================================
// Footer 配置
// ============================================================================
export const footerConfig: FooterConfig = {
  copyright: `© ${new Date().getFullYear()} Narraverse. Open source under MIT License.`,
  links: [
    { name: '功能特性', href: '#features' },
    { name: '更新日志', href: 'https://github.com/narraverse/narraverse-next-mvp/releases', target: '_blank' },
    { name: '路线图', href: 'https://github.com/narraverse/narraverse-next-mvp/projects', target: '_blank' },
    { name: '问题反馈', href: 'https://github.com/narraverse/narraverse-next-mvp/issues', target: '_blank' },
    { name: 'GitHub', href: 'https://github.com/narraverse/narraverse-next-mvp', target: '_blank' },
    { name: '贡献指南', href: 'https://github.com/narraverse/narraverse-next-mvp/blob/main/CONTRIBUTING.md', target: '_blank' },
    { name: '行为准则', href: 'https://github.com/narraverse/narraverse-next-mvp/blob/main/CODE_OF_CONDUCT.md', target: '_blank' },
    { name: '讨论区', href: 'https://github.com/narraverse/narraverse-next-mvp/discussions', target: '_blank' },
    { name: '文档', href: '#docs' },
    { name: 'API 文档', href: '#api' },
    { name: '开发指南', href: '#dev-guide' },
    { name: '常见问题', href: '#faq' },
    { name: 'MIT 许可证', href: 'https://github.com/narraverse/narraverse-next-mvp/blob/main/LICENSE', target: '_blank' },
    { name: '隐私政策', href: '#privacy' },
    { name: '服务条款', href: '#terms' },
  ],
}
