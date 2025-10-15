"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Github, Heart } from "lucide-react";
import Link from "next/link";

export function CTA() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* 背景渐变 */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-cyan-500/10 dark:from-purple-500/5 dark:via-blue-500/5 dark:to-cyan-500/5" />
      <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-800/20 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] pointer-events-none" />

      <div className="relative container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* 卡片容器 */}
          <div className="relative rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-8 md:p-12 shadow-xl">
            {/* 装饰性光效 */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/20 dark:bg-purple-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-3xl" />

            <div className="relative z-10 text-center">
              {/* 图标 */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
              </div>

              {/* 标题 */}
              <h2 className="text-3xl md:text-4xl font-bold mb-4">加入开源社区，共同打造未来</h2>

              {/* 描述 */}
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Narraverse
                是一个完全开源的项目，我们欢迎所有开发者和创作者加入，一起创造更好的创作工具
              </p>

              {/* 按钮组 */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
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
              </div>

              {/* 提示文字 */}
              <p className="mt-6 text-sm text-muted-foreground">
                MIT 开源协议 · 永久免费 · 社区驱动
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
