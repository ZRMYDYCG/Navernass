"use client";

import { Button } from "@/components/ui/button";
import { ImageCompare } from "@/components/ui/image-compare";
import { ArrowRight, Sparkles, Star, GitFork } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-muted/20">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-800/20 [mask-image:linear-gradient(0deg,transparent,black)] pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl" />
      <div className="absolute top-20 right-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl" />

      <div className="relative container mx-auto px-4 py-24 lg:py-32">
        <div className="max-w-5xl mx-auto">
          {/* 标签 */}
          <motion.div
            className="flex justify-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">开源 AI 智能创作平台</span>
            </div>
          </motion.div>

          {/* 主标题 */}
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
              让 AI 成为你的
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 dark:from-purple-400 dark:via-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
              小说创作助手
            </span>
          </motion.h1>

          {/* 副标题 */}
          <motion.p
            className="text-lg md:text-xl text-muted-foreground text-center mb-10 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            从灵感迸发到作品完成，Narraverse
            为你提供智能写作建议、角色管理、情节规划等全方位创作支持
          </motion.p>

          {/* CTA 按钮 */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button size="lg" asChild className="min-w-[200px] shadow-lg shadow-primary/25">
              <Link href="/auth/register">
                开始创作
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="min-w-[200px] group">
              <a
                href="https://github.com/narraverse/narraverse-next-mvp"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Star className="w-4 h-4 group-hover:fill-yellow-400 group-hover:text-yellow-400 transition-colors" />
                Star on GitHub
              </a>
            </Button>
          </motion.div>

          {/* 开源统计 */}
          <motion.div
            className="flex flex-wrap justify-center gap-6 mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <a
              href="https://github.com/narraverse/narraverse-next-mvp"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">
                <span className="text-foreground">1.2k</span>
                <span className="text-muted-foreground ml-1">Stars</span>
              </span>
            </a>
            <a
              href="https://github.com/narraverse/narraverse-next-mvp/fork"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <GitFork className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">
                <span className="text-foreground">230</span>
                <span className="text-muted-foreground ml-1">Forks</span>
              </span>
            </a>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm font-medium text-muted-foreground">MIT License</span>
            </div>
          </motion.div>

          {/* 产品预览 - 明暗主题对比 */}
          <motion.div
            className="mt-16 relative"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <ImageCompare
              beforeImage="/assets/svg/logo-light.svg"
              afterImage="/assets/svg/logo-dark.svg"
              beforeLabel="亮色主题"
              afterLabel="暗色主题"
              className="max-w-4xl mx-auto"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
