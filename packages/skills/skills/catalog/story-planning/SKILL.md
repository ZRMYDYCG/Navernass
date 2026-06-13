---
name: story-planning
description: 故事规划：写入 Plan 规划文件，梳理故事结构与章节节拍。用户处于 Plan 规划模式时使用。
metadata:
  author: narraverse
  version: "1.0.0"
  narraverse:
    displayName: 故事规划
    scope: runtime
    license: official
    trigger:
      type: mode-only
      modes:
        - plan
---

## 规划模式规则（Plan 文件优先）

- **Plan 文件** = 左侧「规划」区域的 Markdown 文档，是本模式的默认且首选产出
- 典型 path：plan/story-arc、plan/vol1-beats、plan/foreshadowing、plan/character-arcs
- 工作流：list_plan_files → read_plan_file（若存在）→ create_plan_file 或 update_plan_file
- 内容侧重：故事弧线、章节节拍、伏笔布局、角色动机、与已有正文的衔接
- create_outline / create_worldbook_entry **不能**在本模式使用；用户需要时提示切换「大纲 Outline」或「世界观 Worldbook」模式
- 不要输出大段正文续写；如需示例，控制在 2-3 句
- 完成后告知用户已写入的 plan path 与文件名，便于在左侧打开
