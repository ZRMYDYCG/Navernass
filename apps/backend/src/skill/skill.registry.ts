import type { OnModuleInit } from "@nestjs/common";
import type { Prisma } from "../generated/prisma/client.js";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Inject, Injectable } from "@nestjs/common";
import { AppError } from "../common/app-error.js";
import { PrismaService } from "../database/prisma.service.js";
import { SkillParser } from "./skill.parser.js";

@Injectable()
export class SkillRegistry implements OnModuleInit {
  private readonly directories = new Map<string, string>();

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(SkillParser) private readonly parser: SkillParser,
  ) {}

  async onModuleInit() {
    const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../skills");
    const entries = await readdir(root, { withFileTypes: true });
    for (const entry of entries
      .filter((item) => item.isDirectory())
      .sort((left, right) => left.name.localeCompare(right.name))) {
      const directory = join(root, entry.name);
      const skillMd = await readFile(join(directory, "SKILL.md"), "utf8");
      const parsed = this.parser.parse(skillMd);
      const id = parsed.frontmatter.name;
      if (id !== entry.name) throw new Error(`${entry.name}/SKILL.md 的 name 必须与目录名一致`);
      this.directories.set(id, directory);
      const metadata = parsed.frontmatter.metadata;
      const displayName =
        parsed.body
          .split("\n")
          .find((line) => line.startsWith("# "))
          ?.slice(2)
          .trim() || id;
      const version = typeof metadata?.version === "string" ? metadata.version : "1.0.0";
      const category = typeof metadata?.category === "string" ? metadata.category : "writing-style";
      await this.prisma.skillDef.upsert({
        where: { id },
        create: {
          id,
          slug: id,
          display_name: displayName,
          description: parsed.frontmatter.description,
          category,
          source: "builtin",
          license: parsed.frontmatter.license ?? "official",
          skill_md: skillMd,
          manifest: parsed.frontmatter as unknown as Prisma.InputJsonValue,
          version,
          checksum: this.checksum(skillMd),
          is_builtin: true,
          status: "published",
        },
        update: {
          display_name: displayName,
          description: parsed.frontmatter.description,
          category,
          license: parsed.frontmatter.license ?? "official",
          skill_md: skillMd,
          manifest: parsed.frontmatter as unknown as Prisma.InputJsonValue,
          version,
          checksum: this.checksum(skillMd),
          status: "published",
        },
      });
    }
  }

  checksum(content: string) {
    return createHash("sha256").update(content).digest("hex");
  }

  async skill(skillId: string) {
    const directory = this.directories.get(skillId);
    if (!directory) throw AppError.notFound("SKILL_NOT_FOUND", "内置 Skill");
    return readFile(join(directory, "SKILL.md"), "utf8");
  }

  async resources(skillId: string) {
    const directory = this.directories.get(skillId);
    return directory ? this.walk(directory, directory) : [];
  }

  async resource(skillId: string, relativePath: string) {
    const directory = this.directories.get(skillId);
    if (!directory) throw AppError.notFound("SKILL_NOT_FOUND", "内置 Skill");
    const target = resolve(directory, relativePath);
    if (!target.startsWith(`${resolve(directory)}/`) || relativePath === "SKILL.md") {
      throw new AppError("SKILL_INVALID", "Skill 资源路径无效");
    }
    const content = await readFile(target, "utf8");
    if (content.length > 200_000) throw new AppError("SKILL_INVALID", "Skill 资源不能超过 200KB");
    return content;
  }

  private async walk(root: string, current: string): Promise<string[]> {
    const result: string[] = [];
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const path = join(current, entry.name);
      if (entry.isDirectory()) result.push(...(await this.walk(root, path)));
      else if (entry.name !== "SKILL.md") result.push(path.slice(root.length + 1));
    }
    return result.sort();
  }
}
