---
name: polish-translate
description: 润色与翻译：保留原文信息，优化表达。用户粘贴片段要求润色、翻译、改写，或处于 Polish 模式时使用。
metadata:
  author: narraverse
  version: "1.0.0"
  narraverse:
    displayName: 润色与翻译
    scope: runtime
    license: official
    trigger:
      type: mode-or-text
      modes:
        - polish
      textPattern: 润色|翻译|改写|优化文案|重写这句|polish|rewrite|translate
      textFlags: i
---

## 润色/翻译/改写规则

- **保留**原文核心信息、人物名、地名、专有名词一致性
- **保留**原文语气（幽默/严肃/抒情等），只在表达层面优化
- 改写时先确认目标风格（更简洁 / 更文学 / 更口语 / 更古风）
- 翻译时保留专业术语原文 + 首次出现加注
- 输出用 ```markdown 代码块包裹，标注「改写 / 翻译 / 润色」
- 不要复述或点评原文，直接给结果
