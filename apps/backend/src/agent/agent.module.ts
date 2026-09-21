import { Module } from "@nestjs/common";
import { SkillModule } from "../skill/skill.module.js";
import { EditorModule } from "../editor/editor.module.js";
import { AgentController } from "./agent.controller.js";
import { ChatService } from "./chat.service.js";
import { ContextService } from "./context.service.js";
import { AgentErrorService } from "./error.service.js";
import { MemoryService } from "./memory.service.js";
import { ModelService } from "./model.service.js";
import { ProviderService } from "./provider.service.js";
import { QuestionService } from "./question.service.js";
import { RuntimeService } from "./runtime.service.js";
import { RetryService } from "./retry.service.js";
import { SecretService } from "./secret.service.js";
import { StreamService } from "./stream.service.js";
import { ToolService } from "./tool.service.js";
import { TraceService } from "./trace.service.js";
import { VectorService } from "./vector.service.js";

@Module({
  imports: [SkillModule, EditorModule],
  controllers: [AgentController],
  providers: [
    SecretService,
    StreamService,
    ProviderService,
    QuestionService,
    ModelService,
    VectorService,
    MemoryService,
    ContextService,
    AgentErrorService,
    RetryService,
    ChatService,
    TraceService,
    ToolService,
    RuntimeService,
  ],
  exports: [RuntimeService, MemoryService, ProviderService, QuestionService],
})
export class AgentModule {}
