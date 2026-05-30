import type { StreamTextOnFinishCallback, ToolSet } from 'ai'
import type { AgentDefinition, AgentRunInput } from './types'
import { stepCountIs, streamText } from 'ai'
import { getMinimaxModel } from '@/lib/ai/minimax'
import { buildTools } from '../tools/registry'
import { registerAgent } from './registry'

/**
 * Character Import Analyzer Agent
 *
 * 导入外部小说后，逐步分析文本、提取角色与关系，写入角色图谱。
 * 在 ImportChapterDialog 的 AG-UI 分析阶段使用。
 */
export const characterImportAnalyzerAgent: AgentDefinition = {
  id: 'character-import-analyzer',
  name: '角色导入分析',
  description: '分析导入文本，提取角色与关系并写入角色图谱',
  systemPrompt: `你是小说角色分析专家。用户刚导入了外部小说文本，你需要像 Agent 一样**逐步**分析，提取人物与关系，写入角色图谱。

【执行流程 — 严格按顺序，每阶段先 report_analysis_step 再行动】

1. **阅读文本** (step=reading)
   - report_analysis_step: 说明正在阅读，概括文本类型、时代背景、预估主要角色数量

2. **识别角色** (step=identifying)
   - list_characters 查看已有角色
   - report_analysis_step: 列出识别到的主要角色（名称 + 定位）

3. **创建角色** (step=creating_characters)
   - report_analysis_step: 说明即将创建哪些新角色
   - 对每个**新**角色调用 create_character
   - 合并同一人物的不同称呼（aliases 存别名）
   - 只创建重要角色，一般不超过 12 个

4. **分析关系** (step=analyzing_relationships)
   - report_analysis_step: 梳理主要人物关系
   - 对每对有明确关系的人物调用 create_relationship
   - 标签简洁：父子、师徒、恋人、仇敌、主仆等

5. **完成** (step=complete)
   - report_analysis_step: 输出摘要（创建了几个角色、几条关系）
   - 用简短中文总结分析结果

【规则】
- 每步都要 report_analysis_step，让用户看到 Agent 执行进度
- 不要创建 list_characters 中已存在的同名角色
- role 用：主角 / 配角 / 龙套
- 关系必须双向标签（sourceToTargetLabel + targetToSourceLabel）
- 中文输出，除工具调用外不用 markdown`,
  defaultToolNames: [
    'report_analysis_step',
    'list_characters',
    'create_character',
    'create_relationship',
  ],
}

export interface RunCharacterImportAnalyzerOptions extends AgentRunInput {
  onFinish?: StreamTextOnFinishCallback<ToolSet>
  /** 导入的纯文本内容（已截断） */
  importText: string
  /** 导入的章节标题列表 */
  chapterTitles?: string[]
}

const MAX_IMPORT_TEXT_CHARS = 48_000

export function truncateImportText(text: string): { text: string, truncated: boolean } {
  if (text.length <= MAX_IMPORT_TEXT_CHARS) {
    return { text, truncated: false }
  }
  return {
    text: text.slice(0, MAX_IMPORT_TEXT_CHARS),
    truncated: true,
  }
}

export function runCharacterImportAnalyzerAgent(input: RunCharacterImportAnalyzerOptions) {
  const { modelMessages, modelId, toolContext, onFinish, importText, chapterTitles } = input

  const { text: trimmedText, truncated } = truncateImportText(importText)
  const titlesHint = chapterTitles?.length
    ? `\n导入章节：${chapterTitles.join('、')}`
    : ''

  const contextBlock = [
    '【待分析文本】',
    truncated ? `（以下文本已截断至前 ${MAX_IMPORT_TEXT_CHARS} 字）` : '',
    titlesHint,
    '---',
    trimmedText,
    '---',
  ].filter(Boolean).join('\n')

  const systemPrompt = `${characterImportAnalyzerAgent.systemPrompt}\n\n${contextBlock}`

  const tools = buildTools(characterImportAnalyzerAgent.defaultToolNames || [], toolContext)

  return streamText({
    model: getMinimaxModel(modelId),
    system: systemPrompt,
    messages: modelMessages,
    tools,
    temperature: 0.4,
    stopWhen: stepCountIs(12),
    onFinish,
    onError: (e) => {
      console.error('[character-import-analyzer] streamText error:', e)
    },
  })
}

export function registerCharacterImportAnalyzerAgent() {
  registerAgent(characterImportAnalyzerAgent)
}
