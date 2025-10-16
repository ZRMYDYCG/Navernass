"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Github, Heart } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export function CTA() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* 背景渐变 */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-cyan-500/10 dark:from-purple-500/5 dark:via-blue-500/5 dark:to-cyan-500/5" />
      <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-800/20 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] pointer-events-none" />

      <div className="relative container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* 卡片容器 */}
          <motion.div
            className="relative rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-8 md:p-12 shadow-xl"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            {/* 装饰性光效 */}
            <motion.div
              className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/20 dark:bg-purple-500/10 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 4,
                delay: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <div className="relative z-10 text-center">
              {/* 图标 */}
              <motion.div
                className="flex justify-center mb-6"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <motion.div
                  className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center"
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Heart className="w-8 h-8 text-primary" />
                </motion.div>
              </motion.div>

              {/* 标题 */}
              <motion.h2
                className="text-3xl md:text-4xl font-bold mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                加入开源社区，共同打造未来
              </motion.h2>

              {/* 描述 */}
              <motion.p
                className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Narraverse
                是一个完全开源的项目，我们欢迎所有开发者和创作者加入，一起创造更好的创作工具
              </motion.p>

              {/* 按钮组 */}
              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Button size="lg" asChild className="min-w-[200px] shadow-lg shadow-primary/25">
                  <a
                    href="https://github.com/narraverse/narraverse-next-mvp"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="w-4 h-4" />
                    贡献代码
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild className="min-w-[200px]">
                  <Link href="/auth/register">
                    免费使用
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </motion.div>

              {/* 提示文字 */}
              <motion.p
                className="mt-6 text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                MIT 开源协议 · 永久免费 · 社区驱动
              </motion.p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
