import type { ToolCall, Translate } from "../types";
import { getChapter, getNovelSnapshot, readArticle, searchArticle } from "./article";
import { askUser } from "./ask-user";
import type { ResolvedTool, ToolResolver } from "./define";
import { proposeArticleEdit } from "./edit-proposal";
import { fallback } from "./fallback";
import { saveMemory, searchMemory } from "./memory";
import { loadSkill, readSkillResource } from "./skill";
import { delegateSubagent, validateContinuity } from "./subagent";

/** 与后端 ToolService.build 暴露的工具一一对应。 */
const tools: Record<string, ToolResolver> = {
  loadSkill,
  readSkillResource,
  getNovelSnapshot,
  getChapter,
  readArticle,
  searchArticle,
  proposeArticleEdit,
  searchMemory,
  saveMemory,
  validateContinuity,
  delegateSubagent,
  askUser,
};

export function resolveTool(call: ToolCall, t: Translate): ResolvedTool {
  return (tools[call.name] ?? fallback)(call, t);
}
