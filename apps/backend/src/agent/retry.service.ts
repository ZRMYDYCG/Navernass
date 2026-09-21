import type { EnvConfig } from "../config/env-schema.js";
import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AgentErrorService } from "./error.service.js";

export interface RetryEvent {
  attempt: number;
  delayMs: number;
  code: string;
  message: string;
  occurredAt: string;
}

interface RetryOptions {
  maxRetries?: number;
  abortSignal?: AbortSignal;
  onRetry?: (event: RetryEvent) => void | Promise<void>;
}

@Injectable()
export class RetryService {
  private readonly maxRetries: number;
  private readonly baseDelayMs: number;
  private readonly maxDelayMs: number;

  constructor(
    @Inject(ConfigService) config: ConfigService<EnvConfig, true>,
    @Inject(AgentErrorService) private readonly errors: AgentErrorService,
  ) {
    this.maxRetries = config.get("AGENT_MAX_RETRIES", { infer: true });
    this.baseDelayMs = config.get("AGENT_RETRY_BASE_MS", { infer: true });
    this.maxDelayMs = config.get("AGENT_RETRY_MAX_MS", { infer: true });
  }

  async execute<T>(operation: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
    const maxRetries = options.maxRetries ?? this.maxRetries;
    let retryCount = 0;
    while (true) {
      options.abortSignal?.throwIfAborted();
      try {
        return await operation();
      } catch (error) {
        const failure = this.errors.classify(error);
        if (!failure.retryable || retryCount >= maxRetries) throw error;
        retryCount += 1;
        const delayMs = this.delay(retryCount, failure.retryAfterMs);
        await options.onRetry?.({
          attempt: retryCount + 1,
          delayMs,
          code: failure.code,
          message: failure.message,
          occurredAt: new Date().toISOString(),
        });
        await abortableDelay(delayMs, options.abortSignal);
      }
    }
  }

  private delay(retryCount: number, retryAfterMs?: number) {
    if (retryAfterMs !== undefined) return Math.min(retryAfterMs, this.maxDelayMs);
    const ceiling = Math.min(this.maxDelayMs, this.baseDelayMs * 2 ** (retryCount - 1));
    // Full jitter 防止大量请求在 Provider 恢复瞬间同时重放。
    return Math.max(1, Math.floor(Math.random() * ceiling));
  }
}

function abortableDelay(delayMs: number, signal?: AbortSignal) {
  if (!signal) return new Promise<void>((resolve) => setTimeout(resolve, delayMs));
  if (signal.aborted)
    return Promise.reject(signal.reason ?? new DOMException("Aborted", "AbortError"));
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, delayMs);
    const onAbort = () => {
      clearTimeout(timer);
      reject(signal.reason ?? new DOMException("Aborted", "AbortError"));
    };
    signal.addEventListener("abort", onAbort, { once: true });
  });
}
