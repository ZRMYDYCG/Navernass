import { createZodDto } from "nestjs-zod";
import * as schema from "./editor.schema.js";

export class ApplyEditDto extends createZodDto(schema.applyEdit) {}
export class RejectEditDto extends createZodDto(schema.rejectEdit) {}
