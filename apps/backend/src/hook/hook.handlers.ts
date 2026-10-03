import { Injectable } from "@nestjs/common";
import type { HookEffect, HookEventName } from "./hook.schema.js";
import type { HookHandler } from "./hook.types.js";

interface RegisteredHandler {
  effect: HookEffect;
  events: readonly HookEventName[];
  execute: HookHandler;
}

@Injectable()
export class HookHandlers {
  private readonly handlers: Record<string, RegisteredHandler> = {
    "audit.session": {
      effect: "observe",
      events: ["session.start", "session.end"],
      execute: async () => ({ effect: "observe" }),
    },
  };

  get(key: string) {
    return this.handlers[key];
  }

  catalog() {
    return Object.entries(this.handlers).map(([key, handler]) => ({
      key,
      effect: handler.effect,
      events: handler.events,
    }));
  }
}
