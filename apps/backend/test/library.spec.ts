import type { PrismaService } from "../src/database/prisma.service.js";
import { describe, expect, it, vi } from "vitest";
import { updateCharacter } from "../src/library/library.schema.js";
import { LibraryService } from "../src/library/library.service.js";

describe("小说资料", () => {
  it("角色补丁不会用默认值覆盖未传字段", () => {
    expect(updateCharacter.parse({ description: "新描述" })).toEqual({ description: "新描述" });
  });

  it("并发创建和更新角色时不会互相覆盖", async () => {
    let characters: unknown[] = [
      {
        id: "character-existing",
        name: "已有角色",
        role: "",
        avatar: "",
        description: "旧描述",
        traits: [],
        keywords: [],
        first_appearance: "",
        note: "",
        custom_fields: [],
        order_index: 0,
      },
    ];
    const prisma = {
      novel: {
        findFirst: vi.fn(async () => ({
          id: "novel-1",
          user_id: "user-1",
          characters: structuredClone(characters),
        })),
        findMany: vi.fn(async () => [
          {
            id: "novel-1",
            characters: structuredClone(characters),
            relationships: [],
          },
        ]),
        updateMany: vi.fn(
          async ({
            where,
            data,
          }: {
            where: { characters: { equals: unknown } };
            data: { characters: unknown[] };
          }) => {
            if (JSON.stringify(where.characters.equals) !== JSON.stringify(characters))
              return { count: 0 };
            characters = structuredClone(data.characters);
            return { count: 1 };
          },
        ),
      },
    } as unknown as PrismaService;
    const service = new LibraryService(prisma);

    const [updated, ...created] = await Promise.all([
      service.updateCharacter("user-1", "character-existing", { description: "新描述" }),
      ...Array.from({ length: 8 }, (_, index) =>
        service.createCharacter("user-1", {
          novel_id: "novel-1",
          name: `角色 ${index + 1}`,
          role: "",
          avatar: "",
          description: "",
          traits: [],
          keywords: [],
          first_appearance: "",
          note: "",
          custom_fields: [],
        }),
      ),
    ]);

    expect(characters).toHaveLength(9);
    expect(updated.description).toBe("新描述");
    expect(new Set(created.map((character) => character.id)).size).toBe(8);
    expect(
      new Set((characters as Array<{ name: string }>).map((character) => character.name)).size,
    ).toBe(9);
    expect(
      (characters as Array<{ id: string; description: string }>).find(
        (character) => character.id === "character-existing",
      )?.description,
    ).toBe("新描述");
  });
});
