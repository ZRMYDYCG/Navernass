import { createZodDto } from "nestjs-zod";

import * as schema from "./storage.schema.js";

export class CreateUploadUrlDto extends createZodDto(schema.createUploadUrl) {}
export class ConfirmUploadDto extends createZodDto(schema.confirmUpload) {}
export class DeleteFileDto extends createZodDto(schema.deleteFile) {}
