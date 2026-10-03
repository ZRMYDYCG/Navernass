import type { SubagentDef } from "../generated/prisma/client.js";
import type { CreateSubagent, UpdateSubagent } from "./agent.schema.js";
import { Inject, Injectable } from "@nestjs/common";
import { AppError } from "../common/app-error.js";
import { PrismaService } from "../database/prisma.service.js";

/** 主 Agent 可委派的 Subagent；providerId 为空时沿用主 Agent 的模型。 */
export interface SubagentDefinition {
  name: string;
  description: string;
  instructions: string;
  providerId: string | null;
}

export const builtinSubagents = [
  {
    name: "character",
    description: "人物动机、弧光、行为一致性与关系张力的分析和建议。",
    instructions: "你是角色塑造 Subagent，专注人物动机、弧光、行为一致性和关系张力。",
  },
  {
    name: "plot",
    description: "因果链、冲突升级、伏笔回收与章节节奏的设计和梳理。",
    instructions: "你是剧情创作 Subagent，专注因果链、冲突升级、伏笔回收和章节节奏。",
  },
  {
    name: "world",
    description: "世界规则、势力、地点、物件与历史设定的自洽性。",
    instructions: "你是世界观 Subagent，专注规则自洽、势力、地点、物件与历史设定。",
  },
  {
    name: "style",
    description: "叙事视角、语言质感、节奏与可读性的润色。",
    instructions: "你是文风润色 Subagent，专注叙事视角、语言质感、节奏与可读性。",
  },
  {
    name: "reviewer",
    description: "逻辑、事实、时间线、人物和设定一致性的校验审核。",
    instructions: "你是校验审核 Subagent，专注逻辑、事实、时间线、人物和设定一致性。",
  },
] as const satisfies readonly Omit<SubagentDefinition, "providerId">[];

@Injectable()
export class SubagentService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async list(userId: string) {
    const custom = await this.prisma.subagentDef.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "asc" },
    });
    return { builtin: builtinSubagents, custom: custom.map(toItem) };
  }

  /** 一次运行可委派的全部 Subagent：内置 + 已启用的自定义。 */
  async forRun(userId: string): Promise<SubagentDefinition[]> {
    const custom = await this.prisma.subagentDef.findMany({
      where: { user_id: userId, enabled: true },
      orderBy: { created_at: "asc" },
    });
    return [
      ...builtinSubagents.map((subagent) => ({ ...subagent, providerId: null })),
      ...custom.map(({ name, description, instructions, provider_id }) => ({
        name,
        description,
        instructions,
        providerId: provider_id,
      })),
    ];
  }

  async create(userId: string, input: CreateSubagent) {
    await this.assertProvider(userId, input.providerId);
    try {
      const created = await this.prisma.subagentDef.create({
        data: {
          user_id: userId,
          name: input.name,
          description: input.description,
          instructions: input.instructions,
          provider_id: input.providerId,
          enabled: input.enabled,
        },
      });
      return toItem(created);
    } catch (error) {
      throw this.conflictOr(error, input.name);
    }
  }

  async update(userId: string, id: string, input: UpdateSubagent) {
    await this.getOwned(userId, id);
    await this.assertProvider(userId, input.providerId);
    try {
      const updated = await this.prisma.subagentDef.update({
        where: { id },
        data: {
          name: input.name,
          description: input.description,
          instructions: input.instructions,
          provider_id: input.providerId,
          enabled: input.enabled,
        },
      });
      return toItem(updated);
    } catch (error) {
      throw this.conflictOr(error, input.name);
    }
  }

  async remove(userId: string, id: string) {
    await this.getOwned(userId, id);
    await this.prisma.subagentDef.delete({ where: { id } });
  }

  private async getOwned(userId: string, id: string) {
    const subagent = await this.prisma.subagentDef.findFirst({ where: { id, user_id: userId } });
    if (!subagent) throw AppError.notFound("SUBAGENT_NOT_FOUND", "Subagent");
    return subagent;
  }

  private async assertProvider(userId: string, providerId: string | null | undefined) {
    if (!providerId) return;
    const provider = await this.prisma.aiProviderConfig.findFirst({
      where: { id: providerId, user_id: userId },
      select: { id: true },
    });
    if (!provider) throw AppError.notFound("AI_PROVIDER_NOT_FOUND", "模型配置");
  }

  private conflictOr(error: unknown, name: string | undefined) {
    const unique =
      typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
    return unique ? new AppError("CONFLICT", `Subagent 名称已存在：${name}`, 409) : error;
  }
}

function toItem(subagent: SubagentDef) {
  return {
    id: subagent.id,
    name: subagent.name,
    description: subagent.description,
    instructions: subagent.instructions,
    providerId: subagent.provider_id,
    enabled: subagent.enabled,
    updatedAt: subagent.updated_at,
  };
}
