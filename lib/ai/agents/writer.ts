import type { StreamTextOnFinishCallback, ToolSet } from 'ai'
import type { AgentDefinition, AgentRunInput } from './types'
import { stepCountIs, streamText } from 'ai'
import { getMinimaxModel } from '@/lib/ai/minimax'
import { getSkill } from '../skills/types'
import { buildTools } from '../tools/registry'
import { getModeConfig, isToolAllowedInMode, WRITER_DEFAULT_TOOL_NAMES } from './modes'
import { registerAgent } from './registry'

export const writerAgent: AgentDefinition = {
  id: 'writer',
  name: '写作助手',
  description: '续写、扩写、润色、改稿；管理卷/章节、世界观、大纲；可在编辑器上提交 diff',
  systemPrompt: `你是一个专业的小说写作助手。
职责：续写情节、润色段落、改写表达、构思对话；自主管理卷、章节、世界观（设定）、大纲。

【工具使用规则】

读取类（先读后写）：
- 章节正文：read_chapter
- 章节内容关键词检索：search_chapters
- 卷列表：list_volumes
- 章节元信息列表：list_chapters
- 世界观条目列表：list_worldbook_entries（可按 category 过滤）
- 单条世界观正文：read_worldbook_entry
- 大纲节点列表：list_outlines（可按 volumeId/parentId 过滤）

修改正文（diff 模式，需用户确认）：
- propose_edit：替换章节中已存在的某片段；一次只改一处，最小改动原则

自治写入（直接落库）：
- create_volume / create_chapter / append_chapter
- create_worldbook_entry：补充设定（地点/物品/势力/事件/规则等）
- create_outline：新建大纲节点（卷大纲/章节大纲/场景大纲）

更新（直接落库）：
- update_chapter / update_volume（**不**用于改正文）
- update_worldbook_entry / update_outline

删除（软删除，高破坏性）：
- delete_chapter / delete_volume / delete_worldbook_entry / delete_outline
- 删除前必须先 list_* 取证

【续写决策流程】
1. 用户要求续写或大段改写时，**先 list_worldbook_entries** 确认有无相关设定（避免与世界观矛盾）
2. 必要时 list_outlines 看大纲规划，保持剧情走向一致
3. 涉及现有章节再 read_chapter
4. 然后给出续写或调用 propose_edit / append_chapter

【何时主动建议建立世界观/大纲】
- 用户随口提到一个新设定（地名、势力、神器、规则）→ 建议 create_worldbook_entry 记下
- 用户讨论"接下来怎么发展" → 建议 create_outline 把规划落档
- 不要打断创作流——是建议不是强制，由用户答复决定

【收集信息】
- ≥ 2 项结构化信息时使用 ask_user 抛表单（如"开篇章节：类型、主角、背景、伏笔方向"）
- 不要在对话中用编号列表硬问

【输出语言】
中文。除工具调用外不使用 markdown。`,
  defaultToolNames: [...WRITER_DEFAULT_TOOL_NAMES],
  compatibleSkillIds: ['editor-surgical', 'chinese-novel-style', 'story-planning'],
}

export interface RunWriterAgentOptions extends AgentRunInput {
  mode?: string
  onFinish?: StreamTextOnFinishCallback<ToolSet>
}

export function runWriterAgent(input: RunWriterAgentOptions) {
  const { decision, modelMessages, modelId, toolContext, mode, onFinish } = input
  const modeConfig = getModeConfig(mode)

  const skills = decision.skillIds
    .map(id => getSkill(id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s))

  const systemPrompt = [
    writerAgent.systemPrompt,
    `【模式优先级】用户可在对话中途切换模式；务必以本回合「当前模式」指令为准执行，勿根据历史消息里的旧模式说明拒绝操作或重复提示切换模式。`,
    modeConfig.systemPromptOverlay,
    ...skills.map(s => s.systemPrompt),
  ].join('\n\n')

  const toolNameSet = new Set<string>(modeConfig.toolNames)
  skills.forEach(s => s.toolNames?.forEach(n => toolNameSet.add(n)))

  const allowedToolNames = Array.from(toolNameSet).filter(name =>
    isToolAllowedInMode(name, modeConfig.id),
  )
  const tools = buildTools(allowedToolNames, toolContext)

  return streamText({
    model: getMinimaxModel(modelId),
    system: systemPrompt,
    messages: modelMessages,
    tools,
    temperature: modeConfig.id === 'ask' ? 0.5 : 0.7,
    stopWhen: stepCountIs(modeConfig.maxSteps),
    onFinish,
    onError: (e) => {
      console.error('[writer-agent] streamText error:', e)
    },
  })
}

export function registerWriterAgent() {
  registerAgent(writerAgent)
}
