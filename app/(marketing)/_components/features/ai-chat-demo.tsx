'use client'

export function AiChatDemo() {
  return (
    <div className="w-full h-full p-4 bg-card border border-border rounded-lg flex flex-col">
      <h3 className="text-lg font-semibold mb-3 text-foreground">创作助手</h3>
      <p className="text-sm text-muted-foreground mb-4">
        与AI助手实时交流，获取创作灵感、优化建议和故事发展思路
      </p>

      <div className="relative w-full h-[300px] rounded-lg overflow-hidden border border-border bg-muted">
        <video
          src="/ai-day.mp4"
          className="w-full h-full object-cover dark:hidden"
          autoPlay
          loop
          muted
          playsInline
        />
        <video
          src="/ai-night.mp4"
          className="w-full h-full object-cover hidden dark:block"
          autoPlay
          loop
          muted
          playsInline
        />
      </div>
    </div>
  )
}
