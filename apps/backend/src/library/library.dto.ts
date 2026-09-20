import { createZodDto } from "nestjs-zod";
import * as schema from "./library.schema.js";

export class LibraryPageDto extends createZodDto(schema.pageQuery) {}
export class CreateNovelDto extends createZodDto(schema.createNovel) {}
export class UpdateNovelDto extends createZodDto(schema.updateNovel) {}
export class OrderItemsDto extends createZodDto(schema.orderItems) {}
export class CreateVolumeDto extends createZodDto(schema.createVolume) {}
export class UpdateVolumeDto extends createZodDto(schema.updateVolume) {}
export class CreateChapterDto extends createZodDto(schema.createChapter) {}
export class UpdateChapterDto extends createZodDto(schema.updateChapter) {}
export class ChapterSearchDto extends createZodDto(schema.chapterSearch) {}
export class CreateCharacterDto extends createZodDto(schema.createCharacter) {}
export class UpdateCharacterDto extends createZodDto(schema.updateCharacter) {}
export class CreateRelationshipDto extends createZodDto(schema.createRelationship) {}
export class UpdateRelationshipDto extends createZodDto(schema.updateRelationship) {}
