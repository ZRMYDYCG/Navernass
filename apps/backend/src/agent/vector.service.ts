import type { EnvConfig } from "../config/env-schema.js";
import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { QdrantClient } from "@qdrant/js-client-rest";

interface VectorPayload {
  [key: string]: unknown;
  userId: string;
  novelId: string;
  chapterId?: string | null;
  kind: string;
}

@Injectable()
export class VectorService {
  private readonly client: QdrantClient;
  private readonly baseCollection: string;
  private readonly collections = new Map<number, Promise<string>>();

  constructor(@Inject(ConfigService) config: ConfigService<EnvConfig, true>) {
    this.client = new QdrantClient({
      url: config.get("QDRANT_URL", { infer: true }),
      apiKey: config.get("QDRANT_API_KEY", { infer: true }),
      checkCompatibility: false,
    });
    this.baseCollection = config.get("QDRANT_COLLECTION", { infer: true });
  }

  async upsert(id: string, vector: number[], payload: VectorPayload) {
    const collection = await this.ensureCollection(vector.length);
    await this.client.upsert(collection, {
      wait: true,
      points: [{ id, vector, payload }],
    });
  }

  async search(
    vector: number[],
    payload: VectorPayload,
    kinds: string[] | undefined,
    limit: number,
    minScore: number,
  ) {
    const collection = await this.ensureCollection(vector.length);
    const result = await this.client.query(collection, {
      query: vector,
      limit,
      score_threshold: minScore,
      with_payload: true,
      filter: {
        must: [
          { key: "userId", match: { value: payload.userId } },
          { key: "novelId", match: { value: payload.novelId } },
          ...(payload.chapterId ? [{ key: "chapterId", match: { value: payload.chapterId } }] : []),
          ...(kinds?.length ? [{ key: "kind", match: { any: kinds } }] : []),
        ],
      },
    });
    return result.points;
  }

  async remove(id: string, dimension: number) {
    await this.client.delete(this.collectionName(dimension), { wait: true, points: [id] });
  }

  async health() {
    return this.client.getCollections();
  }

  private async ensureCollection(dimension: number) {
    const active = this.collections.get(dimension);
    if (active) return active;
    const setup = this.setupCollection(dimension).catch((error) => {
      this.collections.delete(dimension);
      throw error;
    });
    this.collections.set(dimension, setup);
    return setup;
  }

  private async setupCollection(dimension: number) {
    const collection = this.collectionName(dimension);
    const exists = await this.client.collectionExists(collection);
    if (!exists.exists) {
      await this.client.createCollection(collection, {
        vectors: { size: dimension, distance: "Cosine" },
        on_disk_payload: true,
      });
      await Promise.all([
        this.client.createPayloadIndex(collection, {
          field_name: "userId",
          field_schema: "keyword",
          wait: true,
        }),
        this.client.createPayloadIndex(collection, {
          field_name: "novelId",
          field_schema: "keyword",
          wait: true,
        }),
        this.client.createPayloadIndex(collection, {
          field_name: "chapterId",
          field_schema: "keyword",
          wait: true,
        }),
        this.client.createPayloadIndex(collection, {
          field_name: "kind",
          field_schema: "keyword",
          wait: true,
        }),
      ]);
    }
    return collection;
  }

  private collectionName(dimension: number) {
    return `${this.baseCollection}_${dimension}`.replace(/[^\w-]/g, "_");
  }
}
