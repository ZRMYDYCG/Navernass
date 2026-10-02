import { Injectable } from "@nestjs/common";
import { parse as parseYaml } from "yaml";
import { AppError } from "../common/app-error.js";

export interface SkillFrontmatter {
  name: string;
  description: string;
  license?: string;
  compatibility?: string;
  "allowed-tools"?: string | string[];
  "argument-hint"?: string;
  "user-invocable"?: boolean;
  "disable-model-invocation"?: boolean;
  model?: string;
  metadata?: SkillMetadata;
}

export interface SkillMetadata {
  version?: string;
  category?: string;
  modes?: string[];
  resources?: string[];
  related?: string[];
  [key: string]: unknown;
}

export interface ParsedSkill {
  frontmatter: SkillFrontmatter;
  body: string;
}

export interface RuntimeSkill {
  id: string;
  systemPrompt: string;
  toolNames?: string[];
}

const frontmatterPattern = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
const namePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const metadataTextPattern = /^[a-z0-9]+(?:[-_/][a-z0-9]+)*$/;
const versionPattern = /^[a-zA-Z0-9]+(?:[._-][a-zA-Z0-9]+)*$/;
const resourcePathPattern = /^[a-zA-Z0-9][a-zA-Z0-9._/-]*$/;
const skillModes = new Set(["ask", "plan", "outline", "worldbook", "agent"]);

@Injectable()
export class SkillParser {
  parse(skillMd: string): ParsedSkill {
    try {
      const match = skillMd.match(frontmatterPattern);
      if (!match?.[1] || match[2] === undefined)
        throw new Error("文件必须以 --- 包裹的 YAML frontmatter 开头");
      const frontmatter = parseYaml(match[1]) as SkillFrontmatter | null;
      const body = match[2].trim();
      if (
        !frontmatter?.name ||
        !namePattern.test(frontmatter.name) ||
        frontmatter.name.length > 64
      ) {
        throw new Error("name 必须是最长 64 位的小写 kebab-case");
      }
      if (!frontmatter.description?.trim()) throw new Error("description 不能为空");
      if (frontmatter.description.length > 1024) throw new Error("description 不能超过 1024 字符");
      if (!body) throw new Error("Skill 正文不能为空");
      return {
        frontmatter: {
          ...frontmatter,
          description: frontmatter.description.trim(),
          metadata: this.metadata(frontmatter.metadata),
        },
        body,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        "SKILL_INVALID",
        `SKILL.md 校验失败：${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  runtime(skillMd: string, id: string): RuntimeSkill {
    const parsed = this.parse(skillMd);
    const allowedTools = parsed.frontmatter["allowed-tools"];
    return {
      id,
      systemPrompt: parsed.body,
      toolNames: Array.isArray(allowedTools)
        ? allowedTools
        : allowedTools?.split(/\s+/).filter(Boolean),
    };
  }

  private metadata(metadata: unknown): SkillMetadata | undefined {
    if (metadata === undefined) return undefined;
    if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
      throw new Error("metadata 必须是对象");
    }
    const value = metadata as Record<string, unknown>;
    const version = this.optionalText(value.version, "metadata.version", 32, versionPattern);
    const category = this.optionalText(value.category, "metadata.category", 64);
    return {
      ...value,
      ...(version !== undefined && { version }),
      ...(category !== undefined && { category }),
      ...(value.modes !== undefined && { modes: this.modes(value.modes) }),
      ...(value.resources !== undefined && {
        resources: this.paths(value.resources, "metadata.resources"),
      }),
      ...(value.related !== undefined && { related: this.skillIds(value.related) }),
    };
  }

  private optionalText(
    value: unknown,
    label: string,
    maxLength: number,
    pattern = metadataTextPattern,
  ) {
    if (value === undefined) return undefined;
    if (typeof value !== "string" || !value.trim() || value.length > maxLength) {
      throw new Error(`${label} 必须是 1-${maxLength} 字符的字符串`);
    }
    if (!pattern.test(value)) {
      throw new Error(`${label} 只能包含字母、数字、-、_ 或 /`);
    }
    return value;
  }

  private modes(value: unknown) {
    const modes = this.uniqueStrings(value, "metadata.modes", 10);
    for (const mode of modes) {
      if (!skillModes.has(mode)) throw new Error(`metadata.modes 包含未知模式：${mode}`);
    }
    return modes;
  }

  private skillIds(value: unknown) {
    const ids = this.uniqueStrings(value, "metadata.related", 20);
    for (const id of ids) {
      if (!namePattern.test(id)) throw new Error(`metadata.related 包含无效 Skill 名称：${id}`);
    }
    return ids;
  }

  private paths(value: unknown, label: string) {
    const paths = this.uniqueStrings(value, label, 100);
    for (const path of paths) {
      if (
        path.includes("..") ||
        path.startsWith("/") ||
        path.endsWith("/") ||
        !resourcePathPattern.test(path)
      ) {
        throw new Error(`${label} 包含无效资源路径：${path}`);
      }
    }
    return paths;
  }

  private uniqueStrings(value: unknown, label: string, maxItems: number) {
    if (!Array.isArray(value)) throw new Error(`${label} 必须是字符串数组`);
    if (value.length > maxItems) throw new Error(`${label} 不能超过 ${maxItems} 项`);
    const strings = value.map((item) => {
      if (typeof item !== "string" || !item.trim()) throw new Error(`${label} 必须是字符串数组`);
      return item.trim();
    });
    if (new Set(strings).size !== strings.length) throw new Error(`${label} 不能重复`);
    return strings;
  }
}
