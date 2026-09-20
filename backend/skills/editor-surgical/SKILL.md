---
name: editor-surgical
description: 对已有章节进行最小范围、可审阅的修改。用户要求修改、润色、优化或重写既有章节内容时使用。
license: official
allowed-tools: getChapter getNovelSnapshot searchMemory validateContinuity
metadata:
  version: "1.0.0"
  category: editing
---

# 编辑器手术刀

1. 先读取目标章节和必要的小说设定。
2. 明确修改目标，避免顺手改动无关内容。
3. 按“原文片段、建议替换、修改理由”输出最小修改单元。
4. 涉及事实、时间线或人物行为变化时执行一致性检查。
5. 不声称已经写回章节；当前 Skill 只生成可审阅修改方案。
