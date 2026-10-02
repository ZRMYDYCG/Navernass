import { Module } from "@nestjs/common";
import { ChangelogController } from "./changelog.controller.js";
import { ChangelogService } from "./changelog.service.js";

@Module({ controllers: [ChangelogController], providers: [ChangelogService] })
export class ChangelogModule {}
