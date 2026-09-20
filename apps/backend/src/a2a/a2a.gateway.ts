import type { AgentCard } from '@a2a-js/sdk'
import type { RequestHandler } from 'express'
import type { AppAuth } from '../auth/auth.config.js'
import type { EnvConfig } from '../config/env-schema.js'
import { RestRequestMalformedError } from '@a2a-js/sdk/errors'
import { DefaultRequestHandler } from '@a2a-js/sdk/server'
import { agentCardHandler, restHandler } from '@a2a-js/sdk/server/express'
import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthService } from '@thallesp/nestjs-better-auth'
import { A2aExecutor } from './a2a.executor.js'
import { A2aTaskStore } from './task.store.js'

/** 组装官方 A2A v1 SDK 的 Agent Card、认证和 HTTP+JSON 传输适配器。 */
@Injectable()
export class A2aGateway {
  readonly cardMiddleware: RequestHandler
  readonly restMiddleware: RequestHandler

  constructor(
    @Inject(ConfigService) config: ConfigService<EnvConfig, true>,
    @Inject(AuthService) auth: AuthService<AppAuth>,
    @Inject(A2aTaskStore) taskStore: A2aTaskStore,
    @Inject(A2aExecutor) executor: A2aExecutor,
  ) {
    const origin = config.get('BETTER_AUTH_URL', { infer: true }).replace(/\/$/, '')
    const apiPrefix = config.get('API_PREFIX', { infer: true })
    const baseUrl = `${origin}/${apiPrefix}/a2a`
    const card = this.agentCard(baseUrl, `${origin}/${apiPrefix}/docs`)
    const handler = new DefaultRequestHandler(card, taskStore, executor)
    const userBuilder = async (request: Parameters<Parameters<typeof restHandler>[0]['userBuilder']>[0]) => {
      const headers = new Headers()
      for (const [name, value] of Object.entries(request.headers)) {
        if (Array.isArray(value)) value.forEach(item => headers.append(name, item))
        else if (value !== undefined) headers.set(name, value)
      }
      const session = await auth.instance.api.getSession({ headers })
      if (!session?.user.id) {
        throw new RestRequestMalformedError({
          message: 'A2A 请求需要有效的 Better Auth Bearer Token。',
          statusCode: 401,
        })
      }
      return {
        get isAuthenticated() {
          return true
        },
        get userName() {
          return session.user.id
        },
      }
    }
    this.cardMiddleware = agentCardHandler({ agentCardProvider: handler, cache: { maxAge: 300 } })
    this.restMiddleware = restHandler({ requestHandler: handler, userBuilder })
  }

  private agentCard(baseUrl: string, documentationUrl: string): AgentCard {
    const securityRequirements = [{ schemes: { bearerAuth: { list: [] } } }]
    return {
      name: 'Narraverse Novel Creation Agent',
      description: '具备结构化小说记忆、语义召回、工具循环和专业 Subagent 协作能力的小说创作 Agent。',
      supportedInterfaces: [{ url: baseUrl, protocolBinding: 'HTTP+JSON', protocolVersion: '1.0', tenant: '' }],
      provider: { organization: 'Narraverse', url: baseUrl },
      version: '1.0.0',
      documentationUrl,
      capabilities: { streaming: true, pushNotifications: false, extendedAgentCard: false, extensions: [] },
      securitySchemes: {
        bearerAuth: {
          scheme: {
            $case: 'httpAuthSecurityScheme',
            value: {
              scheme: 'Bearer',
              bearerFormat: 'Better Auth session token',
              description: '通过 Better Auth 登录响应的 set-auth-token 获取。',
            },
          },
        },
      },
      securityRequirements,
      defaultInputModes: ['text/plain', 'application/json'],
      defaultOutputModes: ['text/plain', 'application/json'],
      skills: [
        this.skill('novel-creation', '小说协同创作', '统筹上下文、记忆、工具与 Subagent 完成小说创作任务。', ['小说', '创作', 'agent'], securityRequirements),
        this.skill('character-design', '角色塑造', '设计人物动机、弧光、关系张力与语言风格。', ['角色', '人物弧光'], securityRequirements),
        this.skill('plot-planning', '剧情规划', '规划因果链、冲突、伏笔、章节节拍与长期剧情。', ['剧情', '大纲', '伏笔'], securityRequirements),
        this.skill('world-building', '世界观构建', '构建设定、规则、地点、势力、物件与历史。', ['世界观', '设定'], securityRequirements),
        this.skill('style-writing', '文风创作', '按照指定视角和语言风格生成或润色正文。', ['文风', '正文', '润色'], securityRequirements),
        this.skill('continuity-review', '一致性审核', '结合结构化资料与语义记忆检查逻辑和事实矛盾。', ['校验', '一致性', 'RAG'], securityRequirements),
      ],
      signatures: [],
    }
  }

  private skill(id: string, name: string, description: string, tags: string[], securityRequirements: AgentCard['securityRequirements']) {
    return {
      id,
      name,
      description,
      tags,
      examples: [`请使用 ${name} 能力处理当前小说任务。`],
      inputModes: ['text/plain', 'application/json'],
      outputModes: ['text/plain', 'application/json'],
      securityRequirements,
    }
  }
}
