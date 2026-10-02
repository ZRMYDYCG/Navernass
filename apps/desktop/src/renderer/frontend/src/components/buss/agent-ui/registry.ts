import askUser from "./materials/ask-user";
import article from "./materials/article";
import editProposal from "./materials/edit-proposal";
import memory from "./materials/memory";
import novel from "./materials/novel";
import skill from "./materials/skill";
import subagent from "./materials/subagent";
import fallback from "./fallback";
import type { MaterialEntry, ToolCall, Translate } from "./protocol";

/**
 * 注册中心：每个物料模块默认导出一份物料数组，此处机械展开成以 tool 为键的索引表。
 * 注册表不感知任何具体工具；新增工具只需在 materials/ 定义物料，无需改这里的逻辑。
 */
const modules: MaterialEntry[][] = [novel, article, editProposal, memory, skill, subagent, askUser];

const table = (() => {
  const index = new Map<string, MaterialEntry>();
  for (const entry of modules.flat()) {
    if (process.env.NODE_ENV !== "production" && index.has(entry.tool))
      throw new Error(`[agent-ui] 工具物料重复注册：${entry.tool}`);
    index.set(entry.tool, entry);
  }
  return index;
})();

/** 后端工具名 → 物料视图；未登记的工具走兜底物料，保证信息不丢失。 */
export function resolveTool(call: ToolCall, t: Translate) {
  return (table.get(call.tool) ?? fallback).resolve(call, t);
}
