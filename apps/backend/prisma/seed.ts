import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client.js";

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb({
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT ?? 3306),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    connectionLimit: 2,
  }),
});

// 可选演示小说：仅在手动执行 seed 且设置 NARRAVERSE_SEED_USER_ID 时写入。
const WORKSPACE_NOVEL_ID = "fdef7201-aa78-4458-9e8e-0d4f26bae89c";
const WORKSPACE_COVER =
  "https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=320&h=448&fit=crop";

const WORKSPACE_VOLUMES = [
  { title: "第一卷 潮汐之城", chapterCount: 12 },
  { title: "第二卷 破雾之人", chapterCount: 12 },
  { title: "第三卷 暗湖与灯火", chapterCount: 14 },
  { title: "第四卷 世界尽头", chapterCount: 9 },
];

const WORKSPACE_CHAPTER_TITLES = [
  "潮汐来客",
  "雾巷深处的灯",
  "旧码头档案",
  "海图残页",
  "半夜的汽笛",
  "沉船名单",
  "咸雾旅馆",
  "守灯人失踪",
  "低潮线",
  "破碎的罗盘",
  "雨夜访客",
  "无灯塔",
  "归航者",
  "潮声之下",
  "雾中口供",
  "空白的航海日志",
  "双生信号",
  "淹没的门牌",
  "迷航之夜",
  "盐渍的信",
  "退潮之后",
  "灯油与灰烬",
  "第三次涨潮",
  "无名锚地",
  "暗湖",
  "湖心倒影",
  "沉默的摆渡人",
  "水下灯火",
  "逆流者",
  "雾散之前",
  "旧梦捕捞",
  "铁锚与戒指",
  "半张船票",
  "暗涌",
  "灯语",
  "湖畔协议",
  "静水深流",
  "溯源",
  "世界尽头的车站",
  "最后的守灯人",
  "长夜航线",
  "灯塔手册第一页",
  "空港",
  "无风带",
  "终点港",
  "灯火重燃",
  "归来",
];

// 与设计稿一致的展示字数；0 表示尚未动笔
const WORKSPACE_CHAPTER_WORDS = [
  6210, 5480, 7102, 4876, 6633, 5921, 7045, 6288, 5310, 7845, 8432, 6215, 4998, 0, 5764, 6890, 6120,
  4570, 7233, 5645, 6801, 4988, 7320, 6054, 6877, 5420, 7155, 6302, 5880, 7460, 5290, 6644, 5930,
  7018, 5544, 6320, 6870, 4975, 7280, 6160, 5842, 6955, 5310, 0, 0, 0, 0,
];

interface DebugNovelSeed {
  id: string;
  title: string;
  description: string;
  cover: string;
  status: "draft" | "published";
  volumes: Array<{
    title: string;
    chapters: Array<[title: string, content: string]>;
  }>;
}

const DEBUG_NOVELS: DebugNovelSeed[] = [
  {
    id: "6d1ae966-1dc4-4f49-9adc-e465eff35706",
    title: "月面邮差",
    description: "在月球背面，替无法返航的人送出最后一封信。",
    cover: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=320&h=448&fit=crop",
    status: "draft",
    volumes: [
      {
        title: "第一卷 静海来信",
        chapters: [
          [
            "第1章 第七码头",
            "月尘贴着舷窗缓慢滑落。林默抱紧那只没有寄件人的银色邮袋，走进第七码头。",
          ],
          [
            "第2章 地球升起时",
            "地球从环形山后升起，蓝得像一封尚未拆开的信。通信塔却在同一刻失去了信号。",
          ],
          [
            "第3章 无人签收",
            "收件地址指向废弃三年的科研站。门禁记录显示，昨夜仍有人从里面打开过门。",
          ],
        ],
      },
      {
        title: "第二卷 背面航线",
        chapters: [
          [
            "第4章 黑暗中的灯",
            "巡视车驶入月球背面，最后一点地球光消失后，远处亮起一盏不在地图上的灯。",
          ],
          [
            "第5章 延迟四秒",
            "每一句呼叫都会在四秒后收到自己的回答，直到回声说出了一句林默从未讲过的话。",
          ],
          ["第6章 回邮地址", "银色邮袋终于弹开，信封背面只有一行字：寄往二十年前的今天。"],
        ],
      },
    ],
  },
  {
    id: "8b2cf077-0fc2-4e43-8db0-c95e2ec12e61",
    title: "长安异闻录",
    description: "一名小吏记录盛世之下无人敢言的怪事。",
    cover: "https://images.unsplash.com/photo-1518709594023-6eab9bab7b23?w=320&h=448&fit=crop",
    status: "published",
    volumes: [
      {
        title: "上卷 夜行长安",
        chapters: [
          [
            "第1章 宵禁之后",
            "鼓声落尽，坊门紧闭。裴度却在朱雀大街中央看见一个提灯的孩子，影子朝着月亮伸去。",
          ],
          ["第2章 纸人问路", "纸扎铺门前站着七个淋雨的纸人。它们齐齐转头，问他大理寺该往何处走。"],
          ["第3章 曲江无月", "满城都看见了月亮，唯独曲江池中漆黑一片，像有人从水里将月影捞走。"],
        ],
      },
      {
        title: "下卷 金吾旧案",
        chapters: [
          ["第4章 铜镜证词", "旧案库里的铜镜开口作证，却只肯说死者生前不曾听见的声音。"],
          [
            "第5章 城门上的名字",
            "清晨开门时，守军发现城砖上多了三百个姓名，其中最后一个属于裴度。",
          ],
          ["第6章 万灯如昼", "上元夜万灯齐明，所有人的影子却同时离开主人，向皇城方向跪了下去。"],
        ],
      },
    ],
  },
  {
    id: "3f7a2b91-5c4d-4e8f-9a1b-2d6c8e0f4a17",
    title: "深海图书馆",
    description: "海底有一座图书馆，收藏着人类所有被遗忘的记忆。",
    cover: "https://images.unsplash.com/photo-1439405326854-014607f694d7?w=320&h=448&fit=crop",
    status: "draft",
    volumes: [
      {
        title: "第一卷 入馆须知",
        chapters: [
          [
            "第1章 退潮时的门",
            "只有在最大退潮的十分钟里，礁石间的青铜门才会露出水面。门上的铭文写着：请勿带走你自己的名字。",
          ],
          [
            "第2章 编目员",
            "图书馆的管理员是一群发光的水母，它们用触须翻动书页，把新到的记忆按悲伤程度分类上架。",
          ],
          [
            "第3章 借阅记录",
            "苏晚在借阅簿上发现了母亲的名字，借走的那本书名叫《决定留在岸上的那天》，归还日期是空白。",
          ],
        ],
      },
      {
        title: "第二卷 无人的书架",
        chapters: [
          [
            "第4章 禁书区",
            "最深处的书架上锁着无人认领的童年。苏晚打开其中一本，听见了自己三岁时没哭出来的那声哭喊。",
          ],
          [
            "第5章 复本",
            "每份记忆都有两本复本，一本留在海底，一本沉在人心。当两本书的内容开始不一致，遗忘就开始了。",
          ],
          [
            "第6章 归还日",
            "苏晚把母亲的书放回原位，书页间掉出一张字条：别找了，我很好，潮水替我拥抱你。",
          ],
        ],
      },
    ],
  },
  {
    id: "a91d4c62-8e3f-4b7a-9d25-c6f0e1b8a349",
    title: "量子猫便利店",
    description: "这家便利店二十四小时营业，但只对需要它的人出现。",
    cover: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=320&h=448&fit=crop",
    status: "published",
    volumes: [
      {
        title: "上卷 深夜价目表",
        chapters: [
          [
            "第1章 凌晨三点的客人",
            "便利店的自动门在凌晨三点准时打开，走进来一只橘猫，用两条后腿走路，点了关东煮，还要加汤。",
          ],
          [
            "第2章 即将过期的勇气",
            "货架上有一排标注「勇气（临期）」的罐头，打折出售。店员说，勇气放久了会发酵成遗憾，得趁新鲜用掉。",
          ],
          [
            "第3章 找零",
            "橘猫付账时留下了一枚不存在的硬币。店长把它收进收银机，第二天抽屉里多了一张写着「谢谢款待」的小票。",
          ],
        ],
      },
      {
        title: "下卷 观测者之夜",
        chapters: [
          [
            "第4章 同时打折与不打折",
            "一场台风夜，半价标签处于打折与不打折的叠加态，直到第一位顾客推门进来，价格才坍缩。",
          ],
          [
            "第5章 店长的秘密",
            "店长从不摘下围裙。橘猫说，围裙下面锁着这家店的开店初衷，摘下来店就会消失。",
          ],
          [
            "第6章 打烊方式",
            "这家店从不打烊。它只是换一条街，换一个需要热关东煮的人，继续亮着灯。",
          ],
        ],
      },
    ],
  },
  {
    id: "c58e1f07-9b2a-4d63-8e74-f0a3b5c9d216",
    title: "云上修琴师",
    description: "他修复的从来不是琴，是琴声里困住的人。",
    cover: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=320&h=448&fit=crop",
    status: "draft",
    volumes: [
      {
        title: "第一卷 山道来客",
        chapters: [
          [
            "第1章 断弦",
            "小提琴在第十七个音上断了弦。乐手沿着琴声的余韵上山，找到一间挂着「修理时间，兼修乐器」木牌的作坊。",
          ],
          [
            "第2章 共鸣箱里的回声",
            "修琴师打开共鸣箱，倒出一小把雪。他说这是十年前某场没听完的演奏会，卡在里面了。",
          ],
          [
            "第3章 调音",
            "调音不靠耳朵，靠回忆。修琴师让乐手描述第一次登台那天的天气，琴弦自己绷紧了。",
          ],
        ],
      },
      {
        title: "第二卷 无声之琴",
        chapters: [
          [
            "第4章 不想响的琴",
            "有一把琴送来时拒绝发声。修琴师不修它，只是每天陪它坐着，等它想清楚要为谁响。",
          ],
          [
            "第5章 最后一位客人",
            "作坊的账本上，最后一位客人签的名字是修琴师自己。那笔生意的内容只有四个字：修好离别。",
          ],
          ["第6章 下山", "乐手下山时琴已经修好。他后来才明白，被修好的那部分从来不在琴上。"],
        ],
      },
    ],
  },
];

async function seedNews() {
  const exists = await prisma.news.count();
  if (exists) return;
  await prisma.news.create({
    data: {
      type: "announcement",
      title: "Narraverse 后端已就绪",
      content: "NestJS、Better Auth、Prisma 与 MySQL 基础设施已完成初始化。",
      author: "Narraverse",
      status: "published",
      priority: 100,
    },
  });
}

/** 给演示小说灌入分卷与章节目录，方便本地查看侧边栏/编辑器效果。 */
async function seedWorkspaceNovel() {
  const userId = process.env.NARRAVERSE_SEED_USER_ID;
  if (!userId) return;

  const novel = await prisma.novel.findUnique({ where: { id: WORKSPACE_NOVEL_ID } });
  if (!novel) return;

  await prisma.novel.update({
    where: { id: WORKSPACE_NOVEL_ID },
    data: {
      title: "雾港来信",
      description: "长夜之后，仍有灯火。",
      cover: WORKSPACE_COVER,
      word_count: 126_000,
      chapter_count: WORKSPACE_CHAPTER_TITLES.length,
    },
  });

  const chapterCount = await prisma.chapter.count({ where: { novel_id: WORKSPACE_NOVEL_ID } });
  if (chapterCount > 0) return;

  const volumeIds = WORKSPACE_VOLUMES.map(
    (_, index) =>
      `${WORKSPACE_NOVEL_ID.slice(0, 8)}-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
  );
  await prisma.volume.createMany({
    data: WORKSPACE_VOLUMES.map((volume, index) => ({
      id: volumeIds[index],
      novel_id: WORKSPACE_NOVEL_ID,
      user_id: userId,
      title: volume.title,
      order_index: index + 1,
    })),
  });

  let orderIndex = 0;
  const chapterData = WORKSPACE_VOLUMES.flatMap((volume, volumeIndex) =>
    Array.from({ length: volume.chapterCount }, () => {
      orderIndex += 1;
      const words = WORKSPACE_CHAPTER_WORDS[orderIndex - 1] ?? 0;
      const title = WORKSPACE_CHAPTER_TITLES[orderIndex - 1] ?? `第${orderIndex}章`;
      return {
        novel_id: WORKSPACE_NOVEL_ID,
        volume_id: volumeIds[volumeIndex],
        user_id: userId,
        title: `第${orderIndex}章 ${title}`,
        content:
          words > 0
            ? `「${title}」联调占位正文。\n\n这一章用于前后端联调，正文后续在编辑器中填写。`
            : "",
        order_index: orderIndex,
        word_count: words,
        status: "draft" as const,
      };
    }),
  );
  await prisma.chapter.createMany({ data: chapterData });
}

/** 额外的可切换作品，覆盖草稿/发布状态、分卷与正文调试场景。 */
async function seedDebugNovels() {
  const userId = process.env.NARRAVERSE_SEED_USER_ID;
  if (!userId) return;

  for (const [novelIndex, novel] of DEBUG_NOVELS.entries()) {
    const chapters = novel.volumes.flatMap((volume) => volume.chapters);
    const wordCount = chapters.reduce((total, chapter) => total + chapter[1].length, 0);
    await prisma.novel.upsert({
      where: { id: novel.id },
      update: {
        title: novel.title,
        description: novel.description,
        cover: novel.cover,
        word_count: wordCount,
        chapter_count: chapters.length,
        status: novel.status,
      },
      create: {
        id: novel.id,
        user_id: userId,
        title: novel.title,
        description: novel.description,
        cover: novel.cover,
        tags: [],
        characters: [],
        relationships: [],
        word_count: wordCount,
        chapter_count: chapters.length,
        status: novel.status,
        order_index: novelIndex + 1,
      },
    });

    const existingChapters = await prisma.chapter.count({ where: { novel_id: novel.id } });
    if (existingChapters > 0) continue;

    const volumeIds = novel.volumes.map(
      (_, index) => `${novel.id.slice(0, 8)}-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
    );
    await prisma.volume.createMany({
      data: novel.volumes.map((volume, index) => ({
        id: volumeIds[index],
        novel_id: novel.id,
        user_id: userId,
        title: volume.title,
        order_index: index + 1,
      })),
    });

    let chapterOrder = 0;
    await prisma.chapter.createMany({
      data: novel.volumes.flatMap((volume, volumeIndex) =>
        volume.chapters.map(([title, content]) => {
          chapterOrder += 1;
          return {
            novel_id: novel.id,
            volume_id: volumeIds[volumeIndex],
            user_id: userId,
            title,
            content,
            order_index: chapterOrder,
            word_count: content.length,
            status: novel.status === "published" ? ("published" as const) : ("draft" as const),
          };
        }),
      ),
    });
  }
}

async function main() {
  await seedNews();
  await seedWorkspaceNovel();
  await seedDebugNovels();
}

main()
  .finally(() => prisma.$disconnect())
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
