'use client'

import { motion } from 'framer-motion'

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

          <BentoCard
            colSpan="md:col-span-2 lg:col-span-2"
            title="沉浸写作编辑器"
            description="极简界面，自动隐藏干扰元素，让每一个字符的敲击都充满仪式感。"
            preview={<EditorPreview />}
            theme="blue"
          />

          <BentoCard
            colSpan="md:col-span-1 lg:col-span-1"
            title="Narraverse AI"
            description="你的第二大脑，随时准备打破创作瓶颈。"
            preview={<AIPreview />}
            theme="indigo"
          />

          <BentoCard
            colSpan="md:col-span-1 lg:col-span-1"
            title="灵动大纲"
            description="拖拽式章节管理，如拼图般构建故事骨架。"
            preview={<StructurePreview />}
            theme="amber"
          />

          <BentoCard
            colSpan="md:col-span-1 lg:col-span-1"
            title="世界观笔记"
            description="自动关联人物关系，编织错综复杂的命运网络。"
            preview={<CharacterPreview />}
            theme="stone"
          />

          <BentoCard
            colSpan="md:col-span-3 lg:col-span-3"
            title="多格式导出"
            description="一键生成排版精美的 PDF 或 Word，从草稿到成书，只差一个按钮。"
            preview={<ExportPreview />}
            theme="green"
            contentRight
          />

        </motion.div>
      </div>
    </section>
  )
}
