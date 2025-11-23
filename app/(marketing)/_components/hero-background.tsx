export default function HeroBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* 纸张纹理背景 - 全局覆盖 */}
      <div className="absolute inset-0 bg-paper-texture opacity-60" />
      
      {/* 柔和的光晕 - 模拟午后阳光 */}
      <div className="absolute -top-[20%] left-[20%] w-[60%] h-[60%] bg-yellow-100/10 dark:bg-yellow-900/5 blur-[120px] rounded-full pointer-events-none" />
      
      {/* 装饰性虚线 - 模拟笔记本边缘或辅助线 */}
      <div className="absolute top-0 left-8 bottom-0 w-px border-l border-dashed border-foreground/5 hidden lg:block" />
      <div className="absolute top-0 right-8 bottom-0 w-px border-l border-dashed border-foreground/5 hidden lg:block" />
    </div>
  )
}
