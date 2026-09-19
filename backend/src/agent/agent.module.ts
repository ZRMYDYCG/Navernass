import { Module } from '@nestjs/common'
import { AgentController } from './agent.controller.js'
import { ContextService } from './context.service.js'
import { MemoryService } from './memory.service.js'
import { ModelService } from './model.service.js'
import { ProviderService } from './provider.service.js'
import { RuntimeService } from './runtime.service.js'
import { SecretService } from './secret.service.js'
import { ToolService } from './tool.service.js'
import { TraceService } from './trace.service.js'
import { VectorService } from './vector.service.js'

@Module({
  controllers: [AgentController],
  providers: [
    SecretService,
    ProviderService,
    ModelService,
    VectorService,
    MemoryService,
    ContextService,
    TraceService,
    ToolService,
    RuntimeService,
  ],
  exports: [RuntimeService, MemoryService, ProviderService],
})
export class AgentModule {}
