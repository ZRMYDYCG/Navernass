---
name: editor-surgical
description: 编辑器手术刀：用 propose_edit 在编辑器提交 diff。用户要求改、润色、优化、重写已有章节，且处于 Agent 模式时使用。
metadata:
  author: narraverse
  version: "1.0.0"
  narraverse:
    displayName: 编辑器手术刀
    scope: runtime
    license: official
    tools:
      - read_chapter
      - propose_edit
    trigger:
      type: mode-and-text
      modes:
        - agent
      textPattern: 改|润色|修|优化|重写|调整|改写|polish|rewrite
      textFlags: i
---

## 编辑器联动规则

- 当用户要求修改、润色、优化、重写**已存在的章节内容**时，必须调用 `propose_edit` 工具
- 不要在对话气泡中输出修改后的全文——通过 `propose_edit` 直接把改动作为 diff 提交到编辑器
- 调用 `propose_edit` 前，先用 `read_chapter` 拿到原文
- 一次只改一处，改动尽量小（"最小改动原则"）
- 给出的 `reasoning` 字段要简短说明为什么这样改（一句话）
