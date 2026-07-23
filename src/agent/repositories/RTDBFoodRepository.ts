import { getDatabase } from "firebase-admin/database";
import { initAdmin } from "@/app/firebase/admin";
import { FOOD_BANK_RTDB_PATH } from "@/constants/foodBank";
import type { Food } from "../models/Food";
import { FoodMapper } from "../mappers/FoodMapper";
import type { FoodRepository } from "./FoodRepository";

/** TTL del cache en memoria (la tabla boliviana cambia poco). */
const DEFAULT_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutos

type CacheEntry = {
  foods: Food[];
  expiresAt: number;
};

/**
 * Lee AlimentosDB desde Realtime Database (Admin SDK).
 * Solo getAll — sin búsqueda. El mapeo lo hace FoodMapper.
 */
export class RTDBFoodRepository implements FoodRepository {
  private cache: CacheEntry | null = null;
  private inflight: Promise<Food[]> | null = null;

  constructor(private readonly cacheTtlMs: number = DEFAULT_CACHE_TTL_MS) {}

  async getAll(): Promise<Food[]> {
    const now = Date.now();
    if (this.cache && this.cache.expiresAt > now) {
      return this.cache.foods;
    }

    if (this.inflight) {
      return this.inflight;
    }

    this.inflight = this.fetchFromRtdb()
      .then((foods) => {
        this.cache = {
          foods,
          expiresAt: Date.now() + this.cacheTtlMs,
        };
        return foods;
      })
      .finally(() => {
        this.inflight = null;
      });

    return this.inflight;
  }

  clearCache() {
    this.cache = null;
  }

  private async fetchFromRtdb(): Promise<Food[]> {
    initAdmin();
    const db = getDatabase();
    const snapshot = await db.ref(FOOD_BANK_RTDB_PATH).get();

    if (!snapshot.exists()) {
      throw new Error("No se encontraron datos de alimentos en RTDB");
    }

    const data = snapshot.val() as Record<string, Record<string, unknown>>;
    return FoodMapper.fromRtdbMany(data);
  }
}
