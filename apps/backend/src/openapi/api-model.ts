import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

/** 分页信息。字段与全局响应拦截器保持一致。 */
export class PageMeta {
  @ApiProperty({ example: 1, description: "当前页码" })
  page!: number;

  @ApiProperty({ example: 20, description: "每页数量" })
  pageSize!: number;

  @ApiProperty({ example: 128, description: "记录总数" })
  total!: number;

  @ApiProperty({ example: 7, description: "总页数" })
  totalPages!: number;
}

/** 统一成功响应外壳。data 的具体类型由接口装饰器补充。 */
export class SuccessResult {
  @ApiProperty({ example: true })
  success!: true;

  @ApiProperty({ description: "业务数据", type: "object", additionalProperties: true })
  data!: unknown;

  @ApiPropertyOptional({ type: PageMeta })
  meta?: PageMeta;

  @ApiProperty({ example: "f7b88328-2714-44f8-8513-c2ad6c55e418" })
  requestId!: string;

  @ApiProperty({ example: "2026-09-18T08:00:00.000Z" })
  timestamp!: string;
}

export class ErrorBody {
  @ApiProperty({ example: "NOVEL_NOT_FOUND", description: "稳定的机器可读错误码" })
  code!: string;

  @ApiProperty({ example: "小说不存在", description: "可直接展示的中文错误消息" })
  message!: string;

  @ApiPropertyOptional({
    description: "校验字段或业务上下文",
    type: "object",
    additionalProperties: true,
  })
  details?: unknown;
}

/** 全局异常过滤器输出的统一错误结构。 */
export class ErrorResult {
  @ApiProperty({ example: false })
  success!: false;

  @ApiProperty({ type: ErrorBody })
  error!: ErrorBody;

  @ApiProperty({ example: "f7b88328-2714-44f8-8513-c2ad6c55e418" })
  requestId!: string;

  @ApiProperty({ example: "2026-09-18T08:00:00.000Z" })
  timestamp!: string;

  @ApiProperty({ example: "/api/v1/novels" })
  path!: string;
}

export class MutationResult {
  @ApiPropertyOptional({ example: true })
  deleted?: boolean;

  @ApiPropertyOptional({ example: true })
  updated?: boolean;
}

export class HealthResult {
  @ApiProperty({ example: "ok" })
  status!: string;

  @ApiProperty({ example: "up" })
  database!: string;

  @ApiProperty({ example: 3600, description: "进程运行秒数" })
  uptime!: number;
}

/** 数据库资源的通用文档模型，保留扩展字段以忠实表达 Prisma 返回值。 */
export class ResourceResult {
  @ApiProperty({ format: "uuid", example: "bf263965-d407-4c92-a8d6-13bf7ddaf3dd" })
  id!: string;

  @ApiPropertyOptional({ example: "示例标题" })
  title?: string;

  @ApiPropertyOptional({ example: "2026-09-18T08:00:00.000Z" })
  created_at?: string;
}
