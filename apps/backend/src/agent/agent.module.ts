import { Module } from "@nestjs/common";
import { SkillModule } from "../skill/skill.module.js";
import { EditorModule } from "../editor/editor.module.js";
import { LibraryModule } from "../library/library.module.js";
import { HookModule } from "../hook/hook.module.js";
import { AgentController } from "./agent.controller.js";
import { CatalogService } from "./catalog.service.js";
import { ChatService } from "./chat.service.js";
import { ContextService } from "./context.service.js";
import { AgentErrorService } from "./error.service.js";
import { HarnessService } from "./harness.service.js";
import { MemoryService } from "./memory.service.js";
import { ModelService } from "./model.service.js";
import { ProviderService } from "./provider.service.js";
import { RuntimeService } from "./runtime.service.js";
import { RetryService } from "./retry.service.js";
import { SecretService } from "./secret.service.js";
import { StreamService } from "./stream.service.js";
import { SubagentService } from "./subagent.service.js";
import { ToolService } from "./tool.service.js";
import { TraceService } from "./trace.service.js";
import { VectorService } from "./vector.service.js";

@Module({
  imports: [SkillModule, EditorModule, LibraryModule, HookModule],
  controllers: [AgentController],
  providers: [
    SecretService,
    StreamService,
    CatalogService,
    ProviderService,
    ModelService,
    VectorService,
    MemoryService,
    ContextService,
    AgentErrorService,
    RetryService,
    ChatService,
    TraceService,
    SubagentService,
    ToolService,
    HarnessService,
    RuntimeService,
  ],
  exports: [RuntimeService, MemoryService, ProviderService],
})
export class AgentModule {}
