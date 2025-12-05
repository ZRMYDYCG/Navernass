/**
 * 提示词配置统一导出
 * 
 * 这个文件夹集中管理项目中所有的AI提示词配置
 * 
 * 目录结构：
 * - editor.ts: 编辑器AI提示词（改进、修正、缩短、扩展、翻译、续写等）
 * - novel.ts: 小说创作相关提示词（默认、agent、plan模式）
 * - chat.ts: 聊天相关提示词和建议
 */

export * from './editor'
export * from './novel'
export * from './chat'

