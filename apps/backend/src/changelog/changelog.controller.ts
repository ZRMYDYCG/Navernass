import type { z } from "zod";
import { Controller, Get, Inject, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";
import { ApiResult } from "../common/api-result.js";
import { ZodPipe } from "../common/zod-pipe.js";
import { ApiDoc, ApiPageQuery } from "../openapi/api-doc.js";
import { ChangelogResult } from "../openapi/api-model.js";
import { ChangelogService } from "./changelog.service.js";
import { pageQuery } from "./changelog.schema.js";

@Controller("changelog")
@ApiTags("系统状态")
export class ChangelogController {
  constructor(@Inject(ChangelogService) private readonly changelog: ChangelogService) {}

  @Get()
  @AllowAnonymous()
  @ApiDoc({
    summary: "分页获取仓库提交记录（更新日志）",
    type: ChangelogResult,
    array: true,
    paged: true,
  })
  @ApiPageQuery()
  list(@Query(new ZodPipe(pageQuery)) query: z.infer<typeof pageQuery>) {
    return this.changelog
      .page(query.page, query.pageSize)
      .then(({ data, total }) =>
        ApiResult.page(data, { page: query.page, pageSize: query.pageSize, total }),
      );
  }
}
