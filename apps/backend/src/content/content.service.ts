import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service.js";
import { AppError } from "../common/app-error.js";
import type {
  CreateNews,
  CreateSurvey,
  CreateTodo,
  CreateWall,
  UpdateNews,
  UpdateTodo,
} from "./content.schema.js";

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  async listNews(
    query: {
      page: number;
      pageSize: number;
      type?: CreateNews["type"];
      status?: "draft" | "published" | "archived";
    },
    isAdmin = false,
  ) {
    const where = {
      ...(query.type && { type: query.type }),
      status: isAdmin ? query.status : ("published" as const),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.news.findMany({
        where,
        orderBy: [{ priority: "desc" }, { created_at: "desc" }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.news.count({ where }),
    ]);
    return { data, total };
  }

  async getNews(id: string, isAdmin = false) {
    const news = await this.prisma.news.findFirst({
      where: { id, ...(!isAdmin && { status: "published" }) },
    });
    if (!news) throw AppError.notFound("NOT_FOUND", "动态");
    if (!isAdmin)
      await this.prisma.news.update({ where: { id }, data: { read_count: { increment: 1 } } });
    return news;
  }

  createNews(data: CreateNews) {
    return this.prisma.news.create({ data });
  }

  async updateNews(id: string, data: UpdateNews) {
    await this.getNews(id, true);
    return this.prisma.news.update({ where: { id }, data });
  }

  async deleteNews(id: string) {
    await this.getNews(id, true);
    await this.prisma.news.delete({ where: { id } });
  }

  createSurvey(userId: string | null, data: CreateSurvey) {
    return this.prisma.survey.create({
      data: {
        ...data,
        user_id: userId,
        genres: data.genres,
        pain_points: data.pain_points,
        tools: data.tools,
        ai_expectations: data.ai_expectations,
      },
    });
  }

  listTodos(userId: string) {
    return this.prisma.writerTodo.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
    });
  }

  createTodo(userId: string, data: CreateTodo) {
    return this.prisma.writerTodo.create({ data: { ...data, user_id: userId } });
  }

  async updateTodo(userId: string, data: UpdateTodo) {
    const existing = await this.prisma.writerTodo.findFirst({
      where: { id: data.id, user_id: userId },
    });
    if (!existing) throw AppError.notFound("NOT_FOUND", "待办");
    const { id, ...updates } = data;
    return this.prisma.writerTodo.update({ where: { id }, data: updates });
  }

  async deleteTodo(userId: string, id: string) {
    const result = await this.prisma.writerTodo.deleteMany({ where: { id, user_id: userId } });
    if (!result.count) throw AppError.notFound("NOT_FOUND", "待办");
  }

  listWall(page: number, pageSize: number) {
    return this.prisma.messageWallEntry.findMany({
      orderBy: { created_at: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }

  createWall(data: CreateWall) {
    return this.prisma.messageWallEntry.create({ data });
  }
}
