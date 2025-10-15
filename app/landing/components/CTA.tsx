"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
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
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
              </div>

              {/* 标题 */}
              <h2 className="text-3xl md:text-4xl font-bold mb-4">准备好开始你的创作之旅了吗？</h2>

              {/* 描述 */}
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                加入数千位作家的行列，使用 AI 驱动的创作工具，让你的故事更加精彩
              </p>

              {/* 按钮组 */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button size="lg" asChild className="min-w-[200px] shadow-lg shadow-primary/25">
                  <Link href="/auth/register">
                    免费开始
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="min-w-[200px]">
                  <Link href="/home">体验 Demo</Link>
                </Button>
              </div>

              {/* 提示文字 */}
              <p className="mt-6 text-sm text-muted-foreground">无需信用卡 · 免费试用所有功能</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
