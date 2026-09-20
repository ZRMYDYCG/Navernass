import { createZodDto } from 'nestjs-zod'
import {
  createProvider,
  messageQuery,
  runAgent,
  runQuery,
  saveMemory,
  searchMemory,
  sessionQuery,
  structuredAgent,
  syncMemory,
  updateProvider,
  updateSession,
} from './agent.schema.js'

export class CreateProviderDto extends createZodDto(createProvider) {}
export class UpdateProviderDto extends createZodDto(updateProvider) {}
export class RunAgentDto extends createZodDto(runAgent) {}
export class StructuredAgentDto extends createZodDto(structuredAgent) {}
export class RunQueryDto extends createZodDto(runQuery) {}
export class SessionQueryDto extends createZodDto(sessionQuery) {}
export class MessageQueryDto extends createZodDto(messageQuery) {}
export class UpdateSessionDto extends createZodDto(updateSession) {}
export class SaveMemoryDto extends createZodDto(saveMemory) {}
export class SearchMemoryDto extends createZodDto(searchMemory) {}
export class SyncMemoryDto extends createZodDto(syncMemory) {}
