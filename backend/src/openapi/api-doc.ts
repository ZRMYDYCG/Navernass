import type { Type } from '@nestjs/common'
import { applyDecorators, HttpStatus } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiCookieAuth,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger'
import { ErrorResult, PageMeta, ResourceResult, SuccessResult } from './api-model.js'

interface ApiDocOptions {
  summary: string
  description?: string
  type?: Type<unknown>
  array?: boolean
  paged?: boolean
  public?: boolean
  status?: number
}

/**
 * 统一接口文档装饰器。
 * 自动补充成功响应外壳、分页结构、Cookie 认证及常见错误响应，避免各模块口径漂移。
 */
export function ApiDoc(options: ApiDocOptions) {
  const model = options.type ?? ResourceResult
  const dataSchema = options.array
    ? { type: 'array', items: { $ref: getSchemaPath(model) } }
    : { $ref: getSchemaPath(model) }
  const successSchema = {
    allOf: [
      { $ref: getSchemaPath(SuccessResult) },
      {
        type: 'object',
        properties: {
          data: dataSchema,
          ...(options.paged ? { meta: { $ref: getSchemaPath(PageMeta) } } : {}),
        },
      },
    ],
  }
  const decorators: MethodDecorator[] = [
    ApiOperation({ summary: options.summary, description: options.description }),
    ApiExtraModels(SuccessResult, ErrorResult, PageMeta, model),
    ApiResponse({ status: options.status ?? HttpStatus.OK, description: '请求成功', schema: successSchema }),
    ApiResponse({ status: 400, description: '请求参数或请求体校验失败', type: ErrorResult }),
    ApiResponse({ status: 404, description: '目标资源不存在', type: ErrorResult }),
    ApiResponse({ status: 409, description: '资源状态冲突', type: ErrorResult }),
    ApiResponse({ status: 429, description: '请求过于频繁', type: ErrorResult }),
    ApiResponse({ status: 500, description: '服务器内部错误', type: ErrorResult }),
  ]
  if (!options.public) {
    decorators.push(
      ApiCookieAuth('better-auth'),
      ApiBearerAuth('agent-bearer'),
      ApiResponse({ status: 401, description: '未登录或会话已失效', type: ErrorResult }),
      ApiResponse({ status: 403, description: '当前账号无权执行此操作', type: ErrorResult }),
    )
  }
  return applyDecorators(...decorators)
}

/** 记录 UUID 路径参数，默认参数名为 id。 */
export function ApiUuidParam(name = 'id', description = '资源 UUID') {
  return ApiParam({
    name,
    description,
    required: true,
    schema: { type: 'string', format: 'uuid' },
  })
}

/** 记录由 Zod DTO 描述的 JSON 请求体。 */
export const ApiZodBody = (type: Type<unknown>, description?: string) => ApiBody({ type, description })

/** 标准分页查询参数。 */
export function ApiPageQuery() {
  return applyDecorators(
    ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: '页码，默认 1' }),
    ApiQuery({ name: 'pageSize', required: false, type: Number, example: 20, description: '每页数量，最大 100' }),
  )
}

/** SSE 长连接文档，不套用 JSON 成功响应外壳。 */
export function ApiStreamDoc(summary: string, description?: string) {
  return applyDecorators(
    ApiOperation({ summary, description }),
    ApiCookieAuth('better-auth'),
    ApiBearerAuth('agent-bearer'),
    ApiExtraModels(ErrorResult),
    ApiResponse({
      status: 200,
      description: [
        'Vercel AI SDK UI Message Stream v1。',
        '响应包含 `x-vercel-ai-ui-message-stream: v1`，数据帧使用官方 `UIMessageChunk`，并以 `data: [DONE]` 结束。',
        '工具生命周期依次为 `tool-input-start`、`tool-input-delta`、`tool-input-available`、',
        '`tool-output-available` 或 `tool-output-error`。',
      ].join(' '),
      headers: {
        'x-vercel-ai-ui-message-stream': {
          description: 'Vercel AI SDK UI 流协议版本',
          schema: { type: 'string', example: 'v1' },
        },
      },
      content: {
        'text/event-stream': {
          schema: {
            type: 'string',
            example: [
              'data: {"type":"tool-input-start","toolCallId":"call_1","toolName":"searchMemory"}',
              'data: {"type":"tool-input-delta","toolCallId":"call_1","inputTextDelta":"{\\"query\\":\\"人物关系\\"}"}',
              'data: {"type":"tool-input-available","toolCallId":"call_1","toolName":"searchMemory","input":{"query":"人物关系"}}',
              'data: {"type":"tool-output-available","toolCallId":"call_1","output":[]}',
              'data: [DONE]',
            ].join('\n'),
          },
        },
      },
    }),
    ApiResponse({ status: 400, description: '请求参数校验失败', type: ErrorResult }),
    ApiResponse({ status: 401, description: '未登录或会话已失效', type: ErrorResult }),
    ApiResponse({ status: 500, description: 'Agent 执行失败', type: ErrorResult }),
  )
}
