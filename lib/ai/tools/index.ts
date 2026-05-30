import { registerTool } from './registry'
import { appendChapterTool } from './append-chapter'
import { askUserTool } from './ask-user'
import { createChapterTool } from './create-chapter'
import { createVolumeTool } from './create-volume'
import { deleteChapterTool } from './delete-chapter'
import { deleteVolumeTool } from './delete-volume'
import { listChaptersTool } from './list-chapters'
import { listVolumesTool } from './list-volumes'
import { proposeEditTool } from './propose-edit'
import { readChapterTool } from './read-chapter'
import { searchChaptersTool } from './search-chapters'
import { updateChapterTool } from './update-chapter'
import { updateVolumeTool } from './update-volume'

export * from './registry'

let registered = false
export function registerBuiltinTools() {
  if (registered) return
  registered = true
  // 读取
  registerTool('read_chapter', readChapterTool)
  registerTool('search_chapters', searchChaptersTool)
  registerTool('list_volumes', listVolumesTool)
  registerTool('list_chapters', listChaptersTool)
  // diff 修改
  registerTool('propose_edit', proposeEditTool)
  // 自治写入
  registerTool('create_volume', createVolumeTool)
  registerTool('create_chapter', createChapterTool)
  registerTool('append_chapter', appendChapterTool)
  // 元信息更新
  registerTool('update_chapter', updateChapterTool)
  registerTool('update_volume', updateVolumeTool)
  // 删除（软删除）
  registerTool('delete_chapter', deleteChapterTool)
  registerTool('delete_volume', deleteVolumeTool)
  // 交互
  registerTool('ask_user', askUserTool)
}
