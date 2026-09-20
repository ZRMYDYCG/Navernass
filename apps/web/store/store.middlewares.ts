/**
 * 各独立 store 的 devtools 命名约定。
 *
 * middleware 在 createBoundStore 中统一组合（devtools 外层 + immer 内层）。
 * 禁止在单个 store 模块内再包一层 middleware。
 */

export const CHAPTERS_STORE_DEVTOOLS_NAME = 'chapters-store'
export const CHARACTER_GRAPH_STORE_DEVTOOLS_NAME = 'character-graph-store'
export const CHARACTER_MATERIAL_STORE_DEVTOOLS_NAME = 'character-material-store'
export const AI_EDITS_STORE_DEVTOOLS_NAME = 'ai-edits-store'
export const PLAN_STORE_DEVTOOLS_NAME = 'plan-store'
export const WORLDVIEW_STORE_DEVTOOLS_NAME = 'worldview-store'
export const TIMELINE_STORE_DEVTOOLS_NAME = 'timeline-store'
export const NOVEL_CHAT_STORE_DEVTOOLS_NAME = 'novel-chat-store'
export const CHAT_STORE_DEVTOOLS_NAME = 'chat-store'
