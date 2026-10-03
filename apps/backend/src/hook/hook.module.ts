import { Module } from "@nestjs/common";
import { HookController } from "./hook.controller.js";
import { HookDispatcher } from "./hook.dispatcher.js";
import { HookHandlers } from "./hook.handlers.js";
import { HookRegistry } from "./hook.registry.js";
import { HookService } from "./hook.service.js";

@Module({
  controllers: [HookController],
  providers: [HookHandlers, HookRegistry, HookDispatcher, HookService],
  exports: [HookDispatcher],
})
export class HookModule {}
