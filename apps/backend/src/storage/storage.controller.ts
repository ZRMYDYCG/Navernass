import { Body, Controller, Delete, HttpCode, Inject, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { ZodPipe } from "../common/zod-pipe.js";
import { ApiDoc, ApiZodBody } from "../openapi/api-doc.js";
import { MutationResult, ResourceResult } from "../openapi/api-model.js";
import { ConfirmUploadDto, CreateUploadUrlDto, DeleteFileDto } from "./storage.dto.js";
import * as schema from "./storage.schema.js";
import { StorageService } from "./storage.service.js";

@ApiTags("文件上传")
@Controller("storage")
export class StorageController {
  constructor(@Inject(StorageService) private readonly storage: StorageService) {}

  @Post("upload-url")
  @HttpCode(200)
  @ApiDoc({ summary: "创建对象存储直传 Presigned URL", type: ResourceResult })
  @ApiZodBody(CreateUploadUrlDto)
  createUploadUrl(@Body(new ZodPipe(schema.createUploadUrl)) body: schema.CreateUploadUrlInput) {
    return this.storage.createPresignedUploadUrl(body);
  }

  @Post("confirm")
  @HttpCode(200)
  @ApiDoc({ summary: "确认上传完成并校验对象", type: ResourceResult })
  @ApiZodBody(ConfirmUploadDto)
  confirmUpload(@Body(new ZodPipe(schema.confirmUpload)) body: schema.ConfirmUploadInput) {
    return this.storage.confirmUpload(body);
  }

  @Delete("file")
  @ApiDoc({ summary: "删除已上传文件", type: MutationResult })
  @ApiZodBody(DeleteFileDto)
  async deleteFile(@Body(new ZodPipe(schema.deleteFile)) body: schema.DeleteFileInput) {
    await this.storage.deleteObject(body.key);
    return { deleted: true };
  }
}
