/** Puntuaciones de ranking (mayor = mejor coincidencia). */
export const FOOD_SEARCH_SCORES = {
  exact: 100,
  startsWith: 80,
  contains: 60,
  synonym: 50,
  levenshtein: 40,
} as const;

export type FoodMatchReason = keyof typeof FOOD_SEARCH_SCORES;

/**
 * Sinónimos normalizados (sin tildes).
 * Compartido entre el agente y la UI de foodbank.
 */
const SYNONYMS: Record<string, string[]> = {
  banana: ["platano", "banano", "platano de seda"],
  platano: ["banana", "banano", "platano de seda"],
  banano: ["banana", "platano", "platano de seda"],
  "platano de seda": ["banana", "platano", "banano"],
  arroz: ["arroz blanco", "arroz cocido"],
  pan: ["pan de trigo", "pan blanco"],
  papa: ["patata"],
  patata: ["papa"],
  yuca: ["mandioca", "cassava"],
  mandioca: ["yuca", "cassava"],
};

export type RankableFood = {
  Codigo: string;
  Nombre: string;
};

export type FoodRankHit<T extends RankableFood = RankableFood> = {
  item: T;
  score: number;
  reason: FoodMatchReason;
};

export function normalizeFoodQuery(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

export function confidenceFromScore(
  score: number
): "high" | "medium" | "low" {
  if (score >= FOOD_SEARCH_SCORES.startsWith) return "high";
  if (score >= FOOD_SEARCH_SCORES.contains) return "medium";
  return "low";
}

/**
 * Ordena alimentos por relevancia inteligente (acentos, sinónimos, typos).
 */
export function rankFoodsByQuery<T extends RankableFood>(
  query: string,
  foods: T[]
): FoodRankHit<T>[] {
  const normalizedQuery = normalizeFoodQuery(query);
  if (!normalizedQuery) return [];

  const hits: FoodRankHit<T>[] = [];

  for (const food of foods) {
    const nameNorm = normalizeFoodQuery(food.Nombre);
    if (!nameNorm) continue;

    const scored = bestScoreForFood(normalizedQuery, nameNorm);
    if (scored) {
      hits.push({ item: food, score: scored.score, reason: scored.reason });
    }
  }

  return hits.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.item.Nombre.localeCompare(b.item.Nombre, "es");
  });
}

function bestScoreForFood(
  normalizedQuery: string,
  normalizedName: string
): { score: number; reason: FoodMatchReason } | null {
  const variants = expandWithSynonyms(normalizedQuery);
  let best: { score: number; reason: FoodMatchReason } | null = null;

  for (const variant of variants) {
    const fromSynonym = variant !== normalizedQuery;
    const pair = scorePair(variant, normalizedName);
    if (!pair) continue;

    let reason = pair.reason;
    let score = pair.score;

    if (fromSynonym && pair.reason === "exact") {
      reason = "synonym";
      score = FOOD_SEARCH_SCORES.synonym;
    }

    if (!best || score > best.score) {
      best = { score, reason };
    }
  }

  if (isSynonymOf(normalizedQuery, normalizedName)) {
    const syn = {
      score: FOOD_SEARCH_SCORES.synonym,
      reason: "synonym" as const,
    };
    if (!best || syn.score > best.score) best = syn;
  }

  return best;
}

function scorePair(
  query: string,
  name: string
): { score: number; reason: FoodMatchReason } | null {
  if (query === name) {
    return { score: FOOD_SEARCH_SCORES.exact, reason: "exact" };
  }
  if (name.startsWith(query)) {
    return { score: FOOD_SEARCH_SCORES.startsWith, reason: "startsWith" };
  }
  if (name.includes(query) || query.includes(name)) {
    return { score: FOOD_SEARCH_SCORES.contains, reason: "contains" };
  }

  const distance = levenshtein(query, name);
  const maxLen = Math.max(query.length, name.length);
  const relative = maxLen === 0 ? 1 : distance / maxLen;

  if (distance <= 2 || relative <= 0.25) {
    return { score: FOOD_SEARCH_SCORES.levenshtein, reason: "levenshtein" };
  }

  return null;
}

function expandWithSynonyms(normalizedQuery: string): string[] {
  const set = new Set<string>([normalizedQuery]);
  const direct = SYNONYMS[normalizedQuery];
  if (direct) {
    for (const s of direct) set.add(normalizeFoodQuery(s));
  }

  for (const [key, values] of Object.entries(SYNONYMS)) {
    if (normalizedQuery.includes(key) || key.includes(normalizedQuery)) {
      set.add(key);
      for (const v of values) set.add(normalizeFoodQuery(v));
    }
  }

  return Array.from(set);
}

function isSynonymOf(query: string, foodName: string): boolean {
  const list = SYNONYMS[query];
  if (list?.some((s) => normalizeFoodQuery(s) === foodName)) return true;
  if (list?.some((s) => foodName.includes(normalizeFoodQuery(s)))) return true;

  const fromFood = SYNONYMS[foodName];
  if (fromFood?.some((s) => normalizeFoodQuery(s) === query)) return true;

  return false;
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  const curr = Array<number>(b.length + 1).fill(0);

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j];
  }

  return prev[b.length];
}
