# AI Agents 配置文档

## 概述

Narraverse 使用 AI 智能助手帮助用户进行小说创作，包括对话咨询、情节建议、文本续写、内容润色等功能。

## AI 服务提供商

### 硅基流动 (Silicon Flow)

项目使用硅基流动作为 AI 服务提供商，支持多种主流大语言模型。

**环境变量配置：**

```bash
# 硅基流动 AI 配置
SILICON_FLOW_API_KEY=your_api_key
SILICON_FLOW_BASE_URL=https://api.siliconflow.cn/v1
SILICON_FLOW_MODEL=deepseek-chat
```

**服务实现：**

- 服务类：`lib/supabase/sdk/services/silicon-flow.service.ts`
- API 路由：`app/api/chat/send/route.ts` (非流式)
- API 路由：`app/api/chat/stream/route.ts` (流式)

## AI 模式

### 1. 询问模式 (Ask)

**用途：** 与 AI 进行对话咨询，获取创作建议、情节构思、角色塑造等方面的帮助。

**使用场景：**

- 讨论故事情节发展
- 咨询角色设定建议
- 获取创作灵感
- 学习写作技巧

### 2. 智能体模式 (Agent)

**用途：** 使用 AI 智能体进行更复杂的创作任务。

**使用场景：**

- 多步骤创作任务
- 需要上下文理解的任务
- 复杂的创作协作

### 3. 续写模式 (Continue)

**用途：** 根据已有的文本内容，让 AI 智能续写后续情节。

**使用场景：**

- 续写章节内容
- 扩展故事情节
- 补充场景描述

### 4. 润色模式 (Polish)

**用途：** 对已有文本进行优化和润色，提升文字表达质量。

**使用场景：**

- 优化文字表达
- 提升文笔水平
- 改进对话描写
- 增强场景渲染

## 支持的模型

通过硅基流动平台，可以使用以下模型（具体以平台支持为准）：

- **Claude 3.5 Sonnet** - Anthropic 的 Claude 系列
- **GPT-4** - OpenAI 的 GPT-4
- **GPT-3.5 Turbo** - OpenAI 的 GPT-3.5
- **DeepSeek Chat** - DeepSeek 的聊天模型（默认）

## 系统提示词

当前系统提示词配置在 `SiliconFlowService` 中：

```
你是一个专业的小说创作助手，擅长帮助用户构思情节、塑造角色、续写故事。请用温暖、鼓励的语气与用户交流，提供有创意的建议。
```

### 提示词特点

- **专业性：** 专注于小说创作领域
- **友好性：** 使用温暖、鼓励的语气
- **创意性：** 提供有创意的建议和想法
- **针对性：** 擅长情节构思、角色塑造、故事续写

## API 接口

### 发送消息（非流式）

**端点：** `POST /api/chat/send`

**请求体：**

```json
{
  "conversationId": "uuid (可选)",
  "message": "用户消息内容"
}
```

**响应：**

```json
{
  "success": true,
  "data": {
    "conversationId": "uuid",
    "userMessage": "Message对象",
    "assistantMessage": "Message对象"
  }
}
```

### 发送消息（流式）

**端点：** `POST /api/chat/stream`

**请求体：**

```json
{
  "conversationId": "uuid (可选)",
  "message": "用户消息内容"
}
```

**响应格式（SSE）：**

```text
对话ID
data: {"type": "conversation_id", "data": "uuid"}

用户消息ID
data: {"type": "user_message_id", "data": "uuid"}

流式内容
data: {"type": "content", "data": "chunk text"}

完成
data: {"type": "done", "data": {"messageId": "uuid", "tokens": 100, "model": "deepseek-chat"}}

错误
data: {"type": "error", "data": "error message"}
```

## 对话管理

### 对话历史

- 每个对话最多保留最近 20 条消息作为上下文
- 对话标题由 AI 根据第一条消息自动生成
- 支持创建新对话和继续已有对话

### 对话存储

- 对话数据存储在 Supabase 数据库中
- 消息包含角色（user/assistant）、内容、模型、token 使用量等信息
- 支持对话的查询、创建、删除等操作

## 配置参数

### 默认参数

- **Temperature:** 0.7（平衡创意和准确性）
- **Max Tokens:** 2000（单次回复最大长度）
- **Stream:** true/false（是否使用流式输出）

### 标题生成参数

- **Temperature:** 0.5（更保守，确保标题准确性）
- **Max Tokens:** 50（标题较短）
- **系统提示：** 根据用户第一条消息生成简洁、准确的对话标题（不超过 20 个字）

## 使用示例

### 在编辑器中使用

编辑器的右侧面板集成了 AI 助手，支持：

1. **选择模式：** 在 Ask、Agent、Continue、Polish 之间切换
2. **选择模型：** 选择使用的 AI 模型
3. **输入消息：** 在输入框中输入问题或指令
4. **引用内容：** 使用 @ 符号引用章节内容（待实现）
5. **查看历史：** 查看和管理对话历史（待实现）

### 在聊天页面使用

独立的聊天页面提供完整的对话功能：

1. **创建新对话：** 点击新建按钮
2. **查看历史：** 在侧边栏查看所有对话
3. **继续对话：** 点击已有对话继续交流
4. **管理对话：** 重命名、删除对话

## 未来规划

### 计划功能

- [ ] 知识库系统集成
- [ ] 角色档案调用
- [ ] 世界观设定引用
- [ ] 多模型对比
- [ ] 自定义提示词
- [ ] 创作模板
- [ ] 批量处理

### 优化方向

- [ ] 提升响应速度
- [ ] 优化 token 使用
- [ ] 增强上下文理解
- [ ] 改进流式输出体验
- [ ] 支持更多模型
- [ ] 个性化推荐

## 注意事项

1. **API Key 安全：** 确保 API Key 安全存储，不要提交到代码仓库
2. **Token 使用：** 注意监控 token 使用量，控制成本
3. **错误处理：** 网络错误或 API 错误时，提供友好的错误提示
4. **流式输出：** 流式输出可以提供更好的用户体验，但需要正确处理连接断开
5. **上下文限制：** 注意上下文长度限制，避免超出模型支持的最大 token 数

## 相关文档

- [API 文档](./app/api/api-doc.md)
- [提示词文档](./prompts.md)
- [README](./README.md)
