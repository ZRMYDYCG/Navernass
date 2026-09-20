import type { Prisma } from '../generated/prisma/client.js'
import { Inject, Injectable } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service.js'

@Injectable()
export class TraceService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  createRun(data: Prisma.AgentRunUncheckedCreateInput) {
    return this.prisma.agentRun.create({ data })
  }

  startRun(id: string) {
    return this.prisma.agentRun.update({ where: { id }, data: { status: 'running', started_at: new Date() } })
  }

  finishRun(id: string, data: { output: string, inputTokens: number, outputTokens: number, totalTokens: number, finishReason?: string, latencyMs: number }) {
    return this.prisma.agentRun.update({
      where: { id },
      data: {
        status: 'completed',
        output: data.output,
        input_tokens: { increment: data.inputTokens },
        output_tokens: { increment: data.outputTokens },
        total_tokens: { increment: data.totalTokens },
        finish_reason: data.finishReason,
        latency_ms: data.latencyMs,
        completed_at: new Date(),
      },
    })
  }

  addUsage(runId: string, usage: { inputTokens?: number, outputTokens?: number, totalTokens?: number }) {
    return this.prisma.agentRun.update({
      where: { id: runId },
      data: {
        input_tokens: { increment: usage.inputTokens ?? 0 },
        output_tokens: { increment: usage.outputTokens ?? 0 },
        total_tokens: { increment: usage.totalTokens ?? 0 },
      },
    })
  }

  failRun(id: string, error: unknown, latencyMs: number) {
    const value = error instanceof Error ? error : new Error(String(error))
    return this.prisma.agentRun.update({
      where: { id },
      data: {
        status: 'failed',
        error_code: value.name,
        error_message: value.message.slice(0, 10_000),
        latency_ms: latencyMs,
        completed_at: new Date(),
      },
    })
  }

  cancelRun(id: string, latencyMs: number) {
    return this.prisma.agentRun.update({
      where: { id },
      data: { status: 'cancelled', latency_ms: latencyMs, completed_at: new Date() },
    })
  }

  saveStep(runId: string, index: number, event: {
    finishReason?: string
    usage?: { inputTokens?: number, outputTokens?: number }
    toolCalls?: readonly unknown[]
    providerMetadata?: unknown
  }) {
    return this.prisma.agentStep.create({
      data: {
        run_id: runId,
        step_index: index,
        role: 'main',
        finish_reason: event.finishReason,
        input_tokens: event.usage?.inputTokens ?? 0,
        output_tokens: event.usage?.outputTokens ?? 0,
        tool_call_count: event.toolCalls?.length ?? 0,
        metadata: (event.providerMetadata ?? {}) as Prisma.InputJsonValue,
      },
    })
  }

  saveTool(runId: string, data: { id: string, name: string, input: unknown, output?: unknown, status: string, durationMs: number, error?: string }) {
    return this.prisma.agentToolCall.upsert({
      where: { run_id_tool_call_id: { run_id: runId, tool_call_id: data.id } },
      create: {
        run_id: runId,
        tool_call_id: data.id,
        tool_name: data.name,
        input: data.input as Prisma.InputJsonValue,
        output: data.output as Prisma.InputJsonValue | undefined,
        status: data.status,
        duration_ms: data.durationMs,
        error_message: data.error,
      },
      update: {
        output: data.output as Prisma.InputJsonValue | undefined,
        status: data.status,
        duration_ms: data.durationMs,
        error_message: data.error,
      },
    })
  }

  async listRuns(userId: string, query: { page: number, pageSize: number, novelId?: string, status?: string }) {
    const where = {
      user_id: userId,
      ...(query.novelId && { novel_id: query.novelId }),
      ...(query.status && { status: query.status as Prisma.EnumAgentRunStatusFilter['equals'] }),
    }
    const [data, total] = await this.prisma.$transaction([
      this.prisma.agentRun.findMany({ where, orderBy: { created_at: 'desc' }, skip: (query.page - 1) * query.pageSize, take: query.pageSize }),
      this.prisma.agentRun.count({ where }),
    ])
    return { data, total }
  }

  getRun(userId: string, id: string) {
    return this.prisma.agentRun.findFirst({
      where: { id, user_id: userId },
      include: { steps: { orderBy: { step_index: 'asc' } }, tool_calls: { orderBy: { created_at: 'asc' } } },
    })
  }
}
