import { HttpStatus, Injectable } from "@nestjs/common";
import { z } from "zod";
import { AppError } from "../common/app-error.js";

const githubCommitsUrl = "https://api.github.com/repos/ZRMYDYCG/Navernass/commits";
const ttl = 10 * 60 * 1000;
const retryAfter = 60 * 1000;

const githubCommit = z.object({
  sha: z.string(),
  commit: z.object({
    message: z.string(),
    author: z.object({ name: z.string(), date: z.string() }),
  }),
});

export interface ChangelogEntry {
  sha: string;
  subject: string;
  author: string;
  date: string;
}

interface CachedPage {
  entries: ChangelogEntry[];
  total: number;
  fetchedAt: number;
}

const cacheKey = (page: number, pageSize: number) => `${page}:${pageSize}`;

/** GitHub 用 Link 响应头表达分页，取 rel="last" 推算总数（末页不足按整页估算）。 */
function totalFromLink(link: string | null, page: number, pageSize: number, count: number) {
  const last = link?.match(/[?&]page=(\d+)[^>]*>;\s*rel="last"/)?.[1];
  return last ? Number(last) * pageSize : (page - 1) * pageSize + count;
}

@Injectable()
export class ChangelogService {
  private readonly pages = new Map<string, CachedPage>();
  private readonly loading = new Map<string, Promise<void>>();
  private failedAt = 0;

  async page(page: number, pageSize: number): Promise<{ data: ChangelogEntry[]; total: number }> {
    await this.refresh(page, pageSize);
    const cached = this.pages.get(cacheKey(page, pageSize));
    if (!cached) {
      throw new AppError(
        "CHANGELOG_UNAVAILABLE",
        "更新日志暂时无法加载，请稍后重试",
        HttpStatus.BAD_GATEWAY,
      );
    }
    return { data: cached.entries, total: cached.total };
  }

  private refresh(page: number, pageSize: number): Promise<void> {
    const key = cacheKey(page, pageSize);
    const cached = this.pages.get(key);
    const now = Date.now();
    if ((cached && now - cached.fetchedAt < ttl) || now - this.failedAt < retryAfter) {
      return Promise.resolve();
    }
    let pending = this.loading.get(key);
    if (!pending) {
      pending = this.load(page, pageSize, key).finally(() => {
        this.loading.delete(key);
      });
      this.loading.set(key, pending);
    }
    return pending;
  }

  private async load(page: number, pageSize: number, key: string) {
    try {
      const response = await fetch(`${githubCommitsUrl}?page=${page}&per_page=${pageSize}`, {
        headers: { Accept: "application/vnd.github+json" },
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const commits = z.array(githubCommit).parse(await response.json());
      const entries: ChangelogEntry[] = commits.map((commit) => ({
        sha: commit.sha,
        subject: commit.commit.message.split("\n")[0] ?? commit.commit.message,
        author: commit.commit.author.name,
        date: commit.commit.author.date,
      }));
      this.pages.set(key, {
        entries,
        total: totalFromLink(response.headers.get("link"), page, pageSize, entries.length),
        fetchedAt: Date.now(),
      });
      this.failedAt = 0;
    } catch {
      this.failedAt = Date.now();
    }
  }
}
