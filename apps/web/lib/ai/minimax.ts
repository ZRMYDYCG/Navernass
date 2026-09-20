import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { extractReasoningMiddleware, wrapLanguageModel } from 'ai'

/**
 * LLM provider（OpenAI 兼容）
 *
 * 当前 provider：MiniMax（M2 / M3 系列模型走 OpenAI 兼容协议）。
 * 文档：https://platform.minimaxi.com/document/Models
 *
 * 通过 LLM_* 环境变量配置，便于切换其他 OpenAI 兼容厂商：
 * - LLM_API_KEY
 * - LLM_BASE_URL
 * - LLM_MODEL
 * - LLM_PROVIDER
 *
 * 关于思考输出：
 * MiniMax 不通过 OpenAI 兼容协议的 reasoning_content 字段返回思考，
 * 思考内容直接以 <think>…</think> 形式内联在 content 中。
 * 因此需要 `extractReasoningMiddleware` 把内联 think 标签拆出为 reasoning part。
 *
 * 不同版本的标签策略不同：
 * - 老 M2：开头无前置 <think>，只发 </think> 切换 → 需 startWithReasoning: true
 * - M2.5 / M2.7 / M3：开头与结尾都发完整 <think>…</think> 标签 → startWithReasoning: false
 */

const baseURL = process.env.LLM_BASE_URL || 'https://api.minimaxi.com/v1'
const apiKey = process.env.LLM_API_KEY || ''
const providerName = process.env.LLM_PROVIDER || 'minimax'

export const DEFAULT_LLM_MODEL = process.env.LLM_MODEL || 'MiniMax-M3'

export const llmProvider = createOpenAICompatible({
  name: providerName,
  baseURL,
  apiKey,
})

/** 模型 id 是否属于 MiniMax M2 / M3 系列（需要 think 标签提取） */
function isReasoningSeries(modelId: string): boolean {
  return /^MiniMax-M[23](\.|$)/i.test(modelId)
}

/**
 * 流的起始是否处于 reasoning 中（无前置 <think>）。
 * 仅老 M2 是这种模式；M2.5/M2.7/M3 都会显式发 <think>。
 */
function startsWithReasoning(modelId: string): boolean {
  // 严格只匹配 "MiniMax-M2" 而非 M2.x
  return /^MiniMax-M2$/i.test(modelId)
}

/**
 * 获取语言模型实例。
 * 对 M2 / M3 系列自动包裹 reasoning 抽取中间件。
 */
export function getMinimaxModel(modelId?: string) {
  const id = modelId || DEFAULT_LLM_MODEL
  const base = llmProvider.chatModel(id)
  if (isReasoningSeries(id)) {
    return wrapLanguageModel({
      model: base,
      middleware: extractReasoningMiddleware({
        tagName: 'think',
        startWithReasoning: startsWithReasoning(id),
      }),
    })
  }
  return base
}

export function hasMinimaxApiKey(): boolean {
  return Boolean(apiKey)
}
