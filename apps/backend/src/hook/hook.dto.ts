import { createZodDto } from "nestjs-zod";
import { createHook, dispatchQuery, hookQuery, updateHook } from "./hook.schema.js";

export class CreateHookDto extends createZodDto(createHook) {}
export class UpdateHookDto extends createZodDto(updateHook) {}
export class HookQueryDto extends createZodDto(hookQuery) {}
export class DispatchQueryDto extends createZodDto(dispatchQuery) {}
