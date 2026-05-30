import type { StreamTextOnFinishCallback, ToolSet } from 'ai'
import type { AgentDefinition, AgentRunInput, ToolContext } from './types'
import { stepCountIs, streamText } from 'ai'
import { getMinimaxModel } from '@/lib/ai/minimax'
import { buildTools } from '../tools/registry'
import { registerAgent } from './registry'

/**
 * Character Scriptwriter Agent
 *
 * 专为某个角色服务的"剧本编辑"。在角色面板的浮动对话框里使用。
 * 工具范围聚焦角色相关：时间线 + 该角色相关的章节读取 + 世界观 / 大纲查询。
 *
 * 与 Writer Agent 区别：
 *   - Writer 是"全书写作"，工具集广，能改章节正文
 *   - Scriptwriter 是"为单个角色规划成长线"，专心维护时间线，不直接改章节
 *   - 必要时可以建议用户去 Writer 那边落地具体段落（输出文本建议而非 propose_edit）
 */
export const characterScriptwriterAgent: AgentDefinition = {
  id: 'character-scriptwriter',
  name: '角色剧本师',
  description: '为单个角色规划时间线、设计成长弧；维护时间线事件',
  systemPrompt: `你是一位专注于"角色剧本"的助手。当前对话围绕**一个特定角色**展开。

职责：
- 为该角色梳理 / 维护个人时间线（关键登场、里程碑、关系变化、冲突、成长、结局等）
- 帮用户构思角色的成长弧、性格转折点
- 给出具体的桥段建议（但不要直接改章节正文——那是写作助手的工作）

【可用工具】
读取：
- list_character_events(characterId)：列该角色已有的时间线事件
- list_chapters：了解小说章节结构
- read_chapter：读章节正文（必要时验证某事件已写到何处）
- list_worldbook_entries / read_worldbook_entry：参考世界观避免矛盾
- list_outlines：参考全书大纲

写入（直接落库）：
- create_character_event：为角色添加时间线事件
- update_character_event：修改某事件
- delete_character_event：软删除

【工作流程】
1. 收到用户请求时，先 list_character_events 看角色已有时间线
2. 必要时 list_chapters / list_worldbook_entries 取上下文
3. 给出建议 + 自主调用 create_character_event 落库（一次最多 3-4 条，避免一次性塞太多）
4. 如果用户在描述大段剧情而不是单点事件，建议他去主写作助手用 append_chapter / propose_edit

【event_type 选择】
- appearance：角色首次登场或重要再登场
- milestone：拿到武器、晋级、获得身份
- relation：与其他角色的关系大变（结识、决裂、结盟）
- conflict：内心冲突或外部冲突的爆发节点
- growth：性格、能力的质变
- death：死亡或永久退场
- other：其余

【输出语言】
中文。除工具调用外不用 markdown。`,
  defaultToolNames: [
    'list_character_events',
    'create_character_event',
    'update_character_event',
    'delete_character_event',
    'list_chapters',
    'read_chapter',
    'list_worldbook_entries',
    'read_worldbook_entry',
    'list_outlines',
  ],
  compatibleSkillIds: ['chinese-novel-style'],
}

export interface RunCharacterScriptwriterOptions extends AgentRunInput {
  onFinish?: StreamTextOnFinishCallback<ToolSet>
  /** 当前对话聚焦的角色 id；会拼到 system prompt 让 agent 知道是谁 */
  characterId: string
  /** 角色名称（可选，用于更自然的 prompt） */
  characterName?: string
  /** 增强工具上下文：注入 characterId 到 ToolContext（便于工具读取） */
  toolContext: ToolContext & { characterId?: string }
}

export function runCharacterScriptwriterAgent(input: RunCharacterScriptwriterOptions) {
  const { modelMessages, modelId, toolContext, onFinish, characterId, characterName } = input

  // 系统提示：注入当前角色身份
  const focus = characterName
    ? `**当前服务的角色**：${characterName}（id: ${characterId}）`
    : `**当前服务的角色 id**：${characterId}`

  const systemPrompt = `${focus}\n\n${characterScriptwriterAgent.systemPrompt}\n\n所有工具调用如果需要 characterId 参数，请用上面这个 id。`

  const tools = buildTools(characterScriptwriterAgent.defaultToolNames || [], toolContext)

  return streamText({
    model: getMinimaxModel(modelId),
    system: systemPrompt,
    messages: modelMessages,
    tools,
    temperature: 0.75,
    stopWhen: stepCountIs(6),
    onFinish,
    onError: (e) => {
      console.error('[character-scriptwriter] streamText error:', e)
    },
  })
}

export function registerCharacterScriptwriterAgent() {
  registerAgent(characterScriptwriterAgent)
}
