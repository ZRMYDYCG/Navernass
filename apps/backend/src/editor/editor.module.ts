import { Module } from "@nestjs/common";
import { EditorController } from "./editor.controller.js";
import { EditorService } from "./editor.service.js";

@Module({
  controllers: [EditorController],
  providers: [EditorService],
  exports: [EditorService],
})
export class EditorModule {}
