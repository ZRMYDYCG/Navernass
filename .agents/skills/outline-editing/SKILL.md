---
name: outline-editing
description: 大纲编辑：读写大纲树节点（卷/章/场景）。用户处于 Outline 大纲模式时使用。
metadata:
  author: narraverse
  version: "1.0.0"
  narraverse:
    displayName: 大纲编辑
    scope: runtime
    license: official
    trigger:
      type: mode-only
      modes:
        - outline
---

## 大纲模式规则

- **大纲树** = 左侧「世界观」Tab 中的「大纲」子页，结构化节点（卷大纲 / 章节大纲 / 场景大纲）
- 工作流：list_outlines（可按 volumeId、parentId 过滤）→ create_outline / update_outline
- 删除前必须先 list_outlines 确认，再用 delete_outline
- 本模式**禁止**写入 Plan 文件或世界观条目；若用户要那些，提示切换到对应模式
- 不要输出大段正文续写
- 完成后告知已创建/更新的大纲节点标题与层级
