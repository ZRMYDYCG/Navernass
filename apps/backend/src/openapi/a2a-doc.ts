import type { OpenAPIObject, ParameterObject, PathItemObject } from "@nestjs/swagger";

/** A2A 路由由官方 Express 适配器挂载，因此在这里补充到 Scalar/OpenAPI。 */
export function appendA2aDocs(document: OpenAPIObject) {
  const tag = ["A2A Agent2Agent"];
  const security = [{ "agent-bearer": [] }];
  const versionHeader: ParameterObject = {
    name: "A2A-Version",
    in: "header",
    required: true,
    schema: { type: "string", enum: ["1.0"], default: "1.0" },
    description: "A2A 协议版本。当前严格使用 v1.0。",
  };
  const taskId: ParameterObject = {
    name: "taskId",
    in: "path",
    required: true,
    schema: { type: "string" },
    description: "A2A Task ID",
  };
  const a2aResponse = (description: string) => ({
    description,
    content: { "application/a2a+json": { schema: { type: "object", additionalProperties: true } } },
  });
  const messageBody = {
    required: true,
    content: {
      "application/a2a+json": {
        schema: {
          type: "object",
          required: ["message"],
          properties: {
            message: {
              type: "object",
              required: ["messageId", "role", "parts"],
              properties: {
                messageId: { type: "string" },
                role: { type: "string", enum: ["ROLE_USER"] },
                contextId: { type: "string" },
                parts: { type: "array", items: { type: "object", additionalProperties: true } },
                metadata: {
                  type: "object",
                  description:
                    "传入 novelId、chapterId、sessionId、providerId、role 等小说上下文。",
                  additionalProperties: true,
                },
              },
            },
            configuration: { type: "object", additionalProperties: true },
          },
        },
      },
    },
  };
  const paths: Record<string, PathItemObject> = {
    "/.well-known/agent-card.json": {
      get: {
        tags: tag,
        summary: "发现 Narraverse Agent Card",
        operationId: "a2aAgentCard",
        responses: { 200: { description: "A2A v1 Agent Card" } },
      },
    },
    "/api/v1/a2a/v1/message:send": {
      post: {
        tags: tag,
        summary: "同步发送 A2A 消息",
        operationId: "a2aSendMessage",
        security,
        parameters: [versionHeader],
        requestBody: messageBody,
        responses: {
          201: a2aResponse("返回 Message 或 Task"),
          401: a2aResponse("Bearer Token 无效"),
        },
      },
    },
    "/api/v1/a2a/v1/message:stream": {
      post: {
        tags: tag,
        summary: "流式发送 A2A 消息",
        description: "返回官方 A2A SSE 事件，包括 Task、状态更新和 Artifact 增量。",
        operationId: "a2aStreamMessage",
        security,
        parameters: [versionHeader],
        requestBody: messageBody,
        responses: {
          200: {
            description: "A2A SSE 事件流",
            content: { "text/event-stream": { schema: { type: "string" } } },
          },
          401: a2aResponse("Bearer Token 无效"),
        },
      },
    },
    "/api/v1/a2a/v1/tasks/{taskId}": {
      get: {
        tags: tag,
        summary: "查询 A2A Task",
        operationId: "a2aGetTask",
        security,
        parameters: [versionHeader, taskId],
        responses: {
          200: a2aResponse("Task 当前状态、历史和产物"),
          404: a2aResponse("Task 不存在"),
        },
      },
    },
    "/api/v1/a2a/v1/tasks/{taskId}:cancel": {
      post: {
        tags: tag,
        summary: "取消 A2A Task",
        operationId: "a2aCancelTask",
        security,
        parameters: [versionHeader, taskId],
        responses: { 200: a2aResponse("取消后的 Task") },
      },
    },
    "/api/v1/a2a/v1/tasks/{taskId}:subscribe": {
      get: {
        tags: tag,
        summary: "重新订阅 A2A Task 事件",
        operationId: "a2aSubscribeTask",
        security,
        parameters: [versionHeader, taskId],
        responses: {
          200: {
            description: "A2A SSE 事件流",
            content: { "text/event-stream": { schema: { type: "string" } } },
          },
        },
      },
    },
  };
  Object.assign(document.paths, paths);
  return document;
}
