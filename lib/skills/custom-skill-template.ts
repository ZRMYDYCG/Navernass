export const CUSTOM_SKILL_TEMPLATE = `---
name: my-writing-style
description: 我的个人写作风格规范。续写、润色时使用。
metadata:
  author: you
  version: "1.0.0"
  narraverse:
    displayName: 我的写作风格
    scope: runtime
    license: user
    compatibleModes:
      - ask
      - agent
      - brainstorm
      - craft
      - polish
      - plan
      - outline
      - worldbook
    trigger:
      type: always
---

## 我的写作偏好

- 在此描述你的文风、禁忌、常用句式
`
