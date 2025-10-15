import { BookOpen, Brain, Database, FileText, MessageSquare, Zap } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI 智能写作",
    description: "智能续写、情节建议、角色对话生成，让创作更加流畅自然",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
  },
  {
    icon: BookOpen,
    title: "章节管理",
    description: "清晰的章节结构、便捷的编辑器、实时保存，专注于创作本身",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    icon: Database,
    title: "知识库系统",
    description: "构建你的世界观、角色档案、设定资料，随时调用灵感素材",
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-50 dark:bg-cyan-950/30",
  },
  {
    icon: MessageSquare,
    title: "AI 对话助手",
    description: "随时与 AI 讨论情节、咨询建议，获得创作灵感和写作指导",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/30",
  },
  {
    icon: FileText,
    title: "富文本编辑",
    description: "强大的编辑器支持格式化、快捷键、字数统计，提升写作效率",
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
  },
  {
    icon: Zap,
    title: "云端同步",
    description: "多设备无缝同步，随时随地继续创作，永不丢失你的灵感",
    color: "text-pink-600 dark:text-pink-400",
    bgColor: "bg-pink-50 dark:bg-pink-950/30",
  },
];

export function Features() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">强大的创作功能</h2>
          <p className="text-lg text-muted-foreground">
            为小说创作者打造的专业工具集，让每一个想法都能完美呈现
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group relative p-6 rounded-xl border border-border bg-card hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
              >
                {/* 图标 */}
                <div
                  className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <Icon className={`w-6 h-6 ${feature.color}`} />
                </div>

                {/* 标题 */}
                <h3 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>

                {/* 描述 */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>

                {/* 悬停效果 */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
