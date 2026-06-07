/**
 * Chat 页 parts 渲染器（与编辑器复用）
 *
 * 编辑器右侧聊天的 part 渲染器已经实现得很完整；
 * Chat 页 parts 通过 re-export 直接复用，未来如需差异化只需在这里覆盖。
 */

// 文本
export { TextPart } from '@/app/(writing)/editor/_components/right-panel/parts/text-part'
export { StreamingMarkdown } from '@/app/(writing)/editor/_components/right-panel/parts/streaming-markdown'
export { StreamingPlainText } from '@/app/(writing)/editor/_components/right-panel/parts/streaming-plain-text'

// 推理
export { ReasoningPart } from '@/app/(writing)/editor/_components/right-panel/parts/reasoning-part'

// 流式动画
export { StreamLoading } from '@/app/(writing)/editor/_components/right-panel/parts/stream-loading'
export { getMessageStreamFingerprint, shouldShowStreamTailActivity } from '@/app/(writing)/editor/_components/right-panel/parts/stream-activity'
export { useStreamStale } from '@/app/(writing)/editor/_components/right-panel/parts/use-stream-stale'
export { AguiExpandableContent, AguiExpandChevron } from '@/app/(writing)/editor/_components/right-panel/parts/agui-expandable'

// 工具类
export { ChatActionsProvider, useChatActions } from '@/app/(writing)/editor/_components/right-panel/parts/chat-actions-context'
export type { FormSubmitPayload } from '@/app/(writing)/editor/_components/right-panel/parts/chat-actions-context'

// ask_user（编辑器版可直接复用，不依赖 novelId）
export { AskUserPart } from '@/app/(writing)/editor/_components/right-panel/parts/ask-user-part'
export type { AskUserField, AskUserOutput } from '@/app/(writing)/editor/_components/right-panel/parts/types'
