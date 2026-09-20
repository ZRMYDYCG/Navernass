import { createZodDto } from "nestjs-zod";
import { updateProfile } from "./account.schema.js";

export class UpdateProfileDto extends createZodDto(updateProfile) {}
