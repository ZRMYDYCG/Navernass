import { Module } from "@nestjs/common";
import { AgentModule } from "../agent/agent.module.js";
import { A2aExecutor } from "./a2a.executor.js";
import { A2aGateway } from "./a2a.gateway.js";
import { A2aTaskStore } from "./task.store.js";

@Module({
  imports: [AgentModule],
  providers: [A2aTaskStore, A2aExecutor, A2aGateway],
  exports: [A2aGateway],
})
export class A2aModule {}
