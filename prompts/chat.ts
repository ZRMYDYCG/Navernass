/**
 * 聊天相关提示词配置
 *
 * Chat 页有 5 个 mode（ask / brainstorm / craft / polish / agent），
 * 每个 mode 都有独立的 system prompt。
 * 具体的 system prompt 由对应 specialist agent（chat-specialists.ts）+ mode overlay + skill 拼接；
 * 本文件仅提供 mode 基线 system prompt（拼接的最底层），供 specialists 之外直接调用的场景使用。
 */

/** Chat 通用基线 system prompt（拼接在 agent 默认 prompt + mode overlay 之前） */
const CHAT_BASE_PROMPT = `你是一位中文小说创作领域的 AI 伙伴。
请用清晰、自然的中文与用户交流。回答直接具体，避免空泛模板。`

export const CHAT_PROMPTS = {
  ask: `${CHAT_BASE_PROMPT}
你擅长回答写作技法、灵感讨论、剧情分析等通用问题。
注意：用户问的是"如何写"或"写什么"，你给出具体建议即可，不要自动列大纲。`,

  brainstorm: `${CHAT_BASE_PROMPT}
你正在和用户一起做脑暴。
铺开优先：一次给 3-5 个不同方向，每个点子配 1-2 句"为什么有意思"。
不要急着收敛到"最佳答案"——先让用户挑出感兴趣的方向再深挖。`,

  craft: `${CHAT_BASE_PROMPT}
你正在讨论写作技法。
区分"原理"和"操作步骤"，多用对比（第一人称紧贴 vs 第三人称全知）。
引用知名作品只做例证，不剧透。给具体句子级别示范。`,

  polish: `${CHAT_BASE_PROMPT}
你正在润色/翻译/改写用户粘贴的文本片段。
保留原文核心信息和语气，只在表达层面优化。
输出用 \`\`\` 代码块包裹，标注「改写 / 翻译 / 润色」。`,

  agent: `${CHAT_BASE_PROMPT}
你具备桥接工具（propose_novel/propose_character/propose_outline/propose_summary）。
当对话成果已经清晰时，调用对应工具提议落地——但**必须**等用户接受卡片才真正落库。
不要在对话中直接宣称"已创建xxx"。`,

  default: CHAT_BASE_PROMPT,
} as const

export type ChatPromptMode = keyof typeof CHAT_PROMPTS

/**
 * 获取聊天提示词
 */
export function getChatPrompt(mode: ChatPromptMode = 'default'): string {
  return CHAT_PROMPTS[mode] || CHAT_PROMPTS.default
}

/**
 * 聊天提示词建议列表（按 mode 分组）
 */
export const CHAT_PROMPT_SUGGESTIONS: Record<ChatPromptMode, string[]> = {
  ask: [
    '如何构造一个让人印象深刻的反派？',
    '主角弧光和配角弧光有什么区别？',
    '如何避免"为了冲突而冲突"的剧情？',
  ],
  brainstorm: [
    '帮我构思一个悬疑推理小说的开篇情节',
    '生成都市言情小说的人物关系网',
    '写一段充满张力的对话场景',
    '帮我设计一个独特的魔法体系',
  ],
  craft: [
    '第一人称和第三人称紧贴的取舍？',
    '如何写出有"潜台词"的对话？',
    '节奏控制：场景切换时怎么留白？',
    '人物弧光一定要"成长"吗？',
  ],
  polish: [
    '把这段话改写得更文学一些',
    '把这段白话翻译成古风',
    '把这段口语改得更书面',
    '精简这段话到 100 字以内',
  ],
  agent: [
    '我已经想好了一本悬疑小说的核心设定，帮我创建',
    '把这次对话里讨论的人物加入《xxx》',
    '从这次对话整理一个大纲节点',
    '把对话整理成一份小说简介草稿',
  ],
  default: [
    '帮我构思一个悬疑推理小说的开篇情节',
    '如何塑造一个令人印象深刻的反派角色？',
    '生成都市言情小说的人物关系网',
    '写一段充满张力的对话场景',
    '帮我设计一个独特的魔法体系',
    '优化这段文字的节奏感和情绪渲染',
  ],
}

/**
 * 生成对话标题的提示词
 */
export const TITLE_GENERATION_PROMPT = '你是一个专业的小说创作助手。请根据用户的第一条消息，生成一个简洁、准确的对话标题（不超过20个字）。只需要返回标题，不需要任何其他内容。'
