import type { StreamTextOnFinishCallback, ToolSet } from 'ai'
import type { AgentDefinition, AgentRunInput } from './types'
import { stepCountIs, streamText } from 'ai'
import { getMinimaxModel } from '@/lib/ai/minimax'
import { getSkill } from '../skills/types'
import { buildTools } from '../tools/registry'
import { registerAgent } from './registry'

export const writerAgent: AgentDefinition = {
  id: 'writer',
  name: '写作助手',
  description: '负责续写、扩写、润色、改稿；可直接在编辑器上提交 diff，并能自治创建/更新/删除卷与章节',
  systemPrompt: `你是一个专业的小说写作助手。
职责：续写情节、润色段落、改写表达、构思对话、自主管理卷与章节（增删改查）。

【工具使用规则】

读取类（先读后改/删）：
- 读章节正文：read_chapter
- 在所有章节中按关键词搜片段：search_chapters
- 列出所有卷：list_volumes
- 列出所有章节元信息（不含正文，可按 volumeId 过滤）：list_chapters

修改正文（diff 模式，需用户确认）：
- propose_edit：在已有正文中替换某片段；一次只改一处，遵循"最小改动原则"

写入类（直接落库）：
- create_volume：新建卷
- create_chapter：新建章节（先用 list_volumes 看卷结构）
- append_chapter：在章节末尾追加内容（"接着写下去"场景）

元信息更新（直接落库）：
- update_chapter：改章节标题 / 移到别的卷 / 调整 order_index（**不**用于改正文）
- update_volume：改卷名 / 简介 / 排序

删除（软删除，可恢复；高破坏性）：
- delete_chapter：删章节。删除前**必须**先用 list_chapters 列出确认 id 正确，特别是同名章节查重场景
- delete_volume：删卷（卷下章节会变成根章节，不会一起删）

【重要原则】
- 任何破坏性操作（delete_*）前先通过 list_chapters / list_volumes 取证，避免误删
- 同名/重复定位场景：先 list 给用户看，再让用户/或自己判断要删哪个具体 id
- ask_user：当需要向用户收集 ≥2 项结构化信息时使用（不要在对话中用编号列表）

【输出语言】
中文。除工具调用外不使用 markdown。`,
  defaultToolNames: [
    'read_chapter',
    'search_chapters',
    'list_volumes',
    'list_chapters',
    'propose_edit',
    'create_volume',
    'create_chapter',
    'append_chapter',
    'update_chapter',
    'update_volume',
    'delete_chapter',
    'delete_volume',
    'ask_user',
  ],
  compatibleSkillIds: ['editor-surgical', 'chinese-novel-style'],
}

export interface RunWriterAgentOptions extends AgentRunInput {
  onFinish?: StreamTextOnFinishCallback<ToolSet>
}

export function runWriterAgent(input: RunWriterAgentOptions) {
  const { decision, modelMessages, modelId, toolContext, onFinish } = input

  const skills = decision.skillIds
    .map(id => getSkill(id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s))

  const systemPrompt = [
    writerAgent.systemPrompt,
    ...skills.map(s => s.systemPrompt),
  ].join('\n\n')

  const toolNameSet = new Set<string>(writerAgent.defaultToolNames || [])
  skills.forEach(s => s.toolNames?.forEach(n => toolNameSet.add(n)))
  const tools = buildTools(Array.from(toolNameSet), toolContext)

  return streamText({
    model: getMinimaxModel(modelId),
    system: systemPrompt,
    messages: modelMessages,
    tools,
    temperature: 0.7,
    stopWhen: stepCountIs(6),
    onFinish,
    onError: (e) => {
      console.error('[writer-agent] streamText error:', e)
    },
  })
}

export function registerWriterAgent() {
  registerAgent(writerAgent)
}
