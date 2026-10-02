import { Module } from "@nestjs/common";

import { R2Controller } from "./r2.controller.js";
import { R2Service } from "./r2.service.js";

@Module({
  controllers: [R2Controller],
  providers: [R2Service],
})
export class R2Module {}
