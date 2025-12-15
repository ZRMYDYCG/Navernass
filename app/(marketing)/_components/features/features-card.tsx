'use client'

import { motion } from 'framer-motion'
import { BookText, FileOutput, Lightbulb, Sparkles, Users } from 'lucide-react'

import AIPreview from './ai-preview'
import BentoCard from './bento-card'
import CharacterPreview from './character-preview'
import EditorPreview from './editor-preview'
import ExportPreview from './export-preview'
import StructurePreview from './structure-preview'

export default function FeaturesCard() {
  return (
    <section id="features" className="relative py-16">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">

        {/* 网格布局 + Masonry 风格 + staggered 动画 */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-min grid-flow-row-dense"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15 } },
          }}
        >

          {/* 卡片1: 沉浸写作编辑器 */}
          <BentoCard
            colSpan="md:col-span-2 lg:col-span-2"
            title="沉浸写作编辑器"
            subtitle="Focus Mode"
            description="极简界面，自动隐藏干扰元素，让每一个字符的敲击都充满仪式感。"
            icon={BookText}
            preview={<EditorPreview />}
            theme="blue"
          />

          {/* 卡片2: Narraverse AI */}
          <BentoCard
            colSpan="md:col-span-1 lg:col-span-1"
            title="Narraverse AI"
            subtitle="Co-pilot"
            description="你的第二大脑，随时准备打破创作瓶颈。"
            icon={Sparkles}
            preview={<AIPreview />}
            theme="indigo"
          />

          {/* 卡片3: 灵动大纲 */}
          <BentoCard
            colSpan="md:col-span-1 lg:col-span-1"
            title="灵动大纲"
            subtitle="Structure"
            description="拖拽式章节管理，如拼图般构建故事骨架。"
            icon={Lightbulb}
            preview={<StructurePreview />}
            theme="amber"
          />

          {/* 卡片4: 角色与世界观笔记 */}
          <BentoCard
            colSpan="md:col-span-1 lg:col-span-1"
            title="世界观笔记"
            subtitle="Wiki"
            description="自动关联人物关系，编织错综复杂的命运网络。"
            icon={Users}
            preview={<CharacterPreview />}
            theme="stone"
          />

          {/* 卡片5: 多格式导出 */}
          <BentoCard
            colSpan="md:col-span-3 lg:col-span-3"
            title="多格式导出"
            subtitle="Publishing"
            description="一键生成排版精美的 PDF 或 Word，从草稿到成书，只差一个按钮。"
            icon={FileOutput}
            preview={<ExportPreview />}
            theme="green"
            contentRight
          />

        </motion.div>
      </div>
    </section>
  )
}
