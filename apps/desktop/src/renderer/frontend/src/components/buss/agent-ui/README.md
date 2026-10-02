# Agent UI 物料库

基于低代码物料库思想实现的 Agent 工具渲染层：**前端物料与后端工具一一匹配**，
匹配机制由三部分组成，全部扁平地放在本目录：

| 文件                                                                  | 职责                                                                                                                         |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `protocol.tsx`                                                        | 物料协议：工具调用状态机、`defineMaterial` 描述符、协议渲染原子（`ToolField` / `ToolExcerpt` / `ToolMeta` / `ToolMarkdown`） |
| `registry.ts`                                                         | 注册中心：机械展开物料模块，按 `tool` 键建索引，对外只暴露 `resolveTool`                                                     |
| `fallback.tsx`                                                        | 兜底物料：未登记的工具按原始 JSON 展示，后端新增工具时前端不丢信息                                                           |
| `message.tsx`                                                         | 渲染引擎：parts 切片、文本/推理/工具行/来源/占位，消费注册中心                                                               |
| `tool-row.tsx` / `reasoning.tsx` / `duration.tsx` / `stream-text.tsx` | 引擎部件                                                                                                                     |
| `materials/`                                                          | 物料区：一域一档，每个模块默认导出 `defineMaterial` 物料数组                                                                 |

## 物料协议

一个物料 = 一份与后端工具的匹配声明，所有物料同构（`protocol.tsx` 为唯一事实来源）：

```tsx
const searchArticle = defineMaterial({
  tool: "searchArticle",            // 匹配键：与后端 ToolService.build 的工具名一一对应
  icon: TextSearchIcon,
  input: searchArticleInputSchema,  // 数据契约（zod = JSON-Schema）：校验边界数据、推导视图类型
  output: searchArticleOutputSchema,
  title: /* 缺省 agui.tools.<tool>.running|done */,
  summary: (t, { input, output }) => ...,
  detail: SearchArticleDetail,      // 折叠详情，用协议渲染原子拼装
  card: /* 交互卡片，固定展示在行下方（如修改提案） */,
});
```

- 契约先行：`input` / `output` schema 即前后端共享的字段契约，只声明渲染需要的字段。
- 数据由引擎统一按 schema 校验后注入视图；校验失败按缺失处理，不渲染半截视图。
- 同协议换匹配键即得别名物料：`{ ...searchArticle, tool: "grepArticle" }`。

## 新增一个工具的标准流程

1. 在 `materials/` 对应域文件（或新建 `<域>.tsx`）里写一个 `defineMaterial({...})`；
2. 把它加进该文件 `export default` 的物料数组（新建文件时在 `registry.ts` 的
   `modules` 清单加一行 import）；
3. 在 `messages/zh-CN.json` 与 `en-US.json` 的 `agui.tools.<tool>` 下补 `running` / `done` 文案。

未登记的工具自动落兜底物料，注册逻辑零改动。

## 引擎行为备忘

工具行在结果到达后保持同一行身份；交互卡片渲染在行下方而非替换段。
生成期间打开的推理在完成后保持展开，历史推理默认收起，可键盘展开/收起；
内部推理仅在阅读者停留在底部时跟随输出滚动。

`metadata.toolTimings[toolCallId]` 携带后端开始时间与最终耗时（毫秒）。耗时含重试、
不含 trace 持久化；最终值随助手消息保存；运行中的值为显式近似值；无 timings 的旧
历史不虚构耗时。同类工具的时钟相互独立。后端也保留失败耗时；仅成功持久化的助手
消息可通过历史恢复 timing 元数据。
