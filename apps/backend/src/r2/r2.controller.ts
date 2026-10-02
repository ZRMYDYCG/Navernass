import { Body, Controller, Delete, HttpCode, Inject, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { ZodPipe } from "../common/zod-pipe.js";
import { ApiDoc, ApiZodBody } from "../openapi/api-doc.js";
import { MutationResult, ResourceResult } from "../openapi/api-model.js";
import { ConfirmUploadDto, CreateUploadUrlDto, DeleteFileDto } from "./r2.dto.js";
import * as schema from "./r2.schema.js";
import { R2Service } from "./r2.service.js";

@ApiTags("文件上传")
@Controller("r2")
export class R2Controller {
  constructor(@Inject(R2Service) private readonly r2: R2Service) {}

  @Post("upload-url")
  @HttpCode(200)
  @ApiDoc({ summary: "创建 R2 直传 Presigned URL", type: ResourceResult })
  @ApiZodBody(CreateUploadUrlDto)
  createUploadUrl(@Body(new ZodPipe(schema.createUploadUrl)) body: schema.CreateUploadUrlInput) {
    return this.r2.createPresignedUploadUrl(body);
  }

  @Post("confirm")
  @HttpCode(200)
  @ApiDoc({ summary: "确认上传完成并校验对象", type: ResourceResult })
  @ApiZodBody(ConfirmUploadDto)
  confirmUpload(@Body(new ZodPipe(schema.confirmUpload)) body: schema.ConfirmUploadInput) {
    return this.r2.confirmUpload(body);
  }

  @Delete("file")
  @ApiDoc({ summary: "删除已上传文件", type: MutationResult })
  @ApiZodBody(DeleteFileDto)
  async deleteFile(@Body(new ZodPipe(schema.deleteFile)) body: schema.DeleteFileInput) {
    await this.r2.deleteObject(body.key);
    return { deleted: true };
  }
}
