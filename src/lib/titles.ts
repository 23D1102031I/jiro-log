import { createClient } from "@/lib/supabase/client";

export interface AwardedTitle {
  name: string;
  description: string;
}

type CallKey = "call_garlic" | "call_yasai" | "call_abura" | "call_karame";

const KANTO_REGIONS = new Set(["23区", "多摩", "神奈川", "千葉", "埼玉"]);

function getJSTDate(isoString: string): Date {
  const d = new Date(isoString);
  return new Date(d.getTime() + 9 * 3600000);
}

function dayKey(jst: Date): string {
  return `${jst.getFullYear()}-${jst.getMonth()}-${jst.getDate()}`;
}

export async function evaluateAndAwardTitles(userId: string): Promise<AwardedTitle[]> {
  const supabase = createClient();

  // Fetch all user reviews
  const { data: reviews } = await supabase
    .from("reviews")
    .select(
      "id, store_id, created_at, call_garlic, call_yasai, call_abura, call_karame, pork_score, dero_score, emulsification_score"
    )
    .eq("user_id", userId);

  if (!reviews || reviews.length === 0) return [];

  // Fetch all stores (to resolve regions for area titles)
  const { data: stores } = await supabase
    .from("stores")
    .select("id, name, region");

  const storeMap = new Map(
    (stores ?? []).map((s) => [s.id, { name: s.name, region: s.region }])
  );

  // Fetch already owned title names
  const { data: ownedRaw } = await supabase
    .from("user_titles")
    .select("title_id, titles(name)")
    .eq("user_id", userId);

  const ownedNames = new Set(
    (ownedRaw ?? []).map((ut) => {
      const t = Array.isArray(ut.titles) ? ut.titles[0] : ut.titles;
      return (t as { name: string } | null)?.name ?? "";
    })
  );

  // Fetch all title definitions
  const { data: allTitles } = await supabase
    .from("titles")
    .select("id, name, description, condition_type, condition_value");

  if (!allTitles) return [];

  // --- Pre-compute stats ---
  const total = reviews.length;
  const visitedStoreIds = new Set(reviews.map((r) => r.store_id));

  const reviewsByDay = new Map<string, { storeIds: Set<string>; hours: number[] }>();
  const reviewDayTimestamps: number[] = [];

  reviews.forEach((r) => {
    const jst = getJSTDate(r.created_at);
    const dk = dayKey(jst);
    if (!reviewsByDay.has(dk)) reviewsByDay.set(dk, { storeIds: new Set(), hours: [] });
    reviewsByDay.get(dk)!.storeIds.add(r.store_id);
    reviewsByDay.get(dk)!.hours.push(jst.getHours());
    reviewDayTimestamps.push(new Date(jst.getFullYear(), jst.getMonth(), jst.getDate()).getTime());
  });

  const uniqueDayTimestamps = [...new Set(reviewDayTimestamps)].sort();
  let maxConsecutive = 1;
  let consecutive = 1;
  for (let i = 1; i < uniqueDayTimestamps.length; i++) {
    consecutive = uniqueDayTimestamps[i] - uniqueDayTimestamps[i - 1] === 86400000 ? consecutive + 1 : 1;
    maxConsecutive = Math.max(maxConsecutive, consecutive);
  }

  const highCall = (key: CallKey) =>
    reviews.filter((r) => ["マシ", "マシマシ"].includes(r[key] ?? "")).length;

  const porkFiveCount = reviews.filter((r) => r.pork_score === 5).length;

  const deroVals = reviews.map((r) => r.dero_score).filter((v): v is number => v != null);
  const deroAvg = deroVals.length > 0 ? deroVals.reduce((a, b) => a + b, 0) / deroVals.length : null;

  const emulVals = reviews.map((r) => r.emulsification_score).filter((v): v is number => v != null);
  const emulAvg = emulVals.length > 0 ? emulVals.reduce((a, b) => a + b, 0) / emulVals.length : null;

  const winterReviews = reviews.filter((r) => {
    const m = getJSTDate(r.created_at).getMonth() + 1;
    return m === 1 || m === 2;
  }).length;

  const outsideKantoStores = new Set(
    reviews
      .filter((r) => {
        const s = storeMap.get(r.store_id);
        return s && !KANTO_REGIONS.has(s.region);
      })
      .map((r) => r.store_id)
  );

  const storesByRegion = new Map<string, Set<string>>();
  for (const [id, s] of storeMap) {
    if (!storesByRegion.has(s.region)) storesByRegion.set(s.region, new Set());
    storesByRegion.get(s.region)!.add(id);
  }

  const visitedInRegion = (region: string) => {
    const all = storesByRegion.get(region);
    if (!all) return { done: false };
    return { done: all.size > 0 && [...all].every((id) => visitedStoreIds.has(id)) };
  };

  const mitaStore = [...storeMap.entries()].find(([, s]) => s.name === "ラーメン二郎 三田本店");
  const visitedMita = mitaStore ? visitedStoreIds.has(mitaStore[0]) : false;

  const allStoreIds = new Set(storeMap.keys());
  const visitedAll = allStoreIds.size > 0 && [...allStoreIds].every((id) => visitedStoreIds.has(id));

  // --- Evaluate each title ---
  const newlyAchieved: typeof allTitles = [];

  for (const title of allTitles) {
    if (ownedNames.has(title.name)) continue;

    const cv = title.condition_value as Record<string, unknown>;
    let achieved = false;

    switch (title.condition_type) {
      case "count":
        achieved = total >= (cv.min as number);
        break;

      case "area": {
        const t = cv.type as string | undefined;
        if (t === "store_count") {
          achieved = visitedStoreIds.size >= (cv.min as number);
        } else if (t === "all") {
          achieved = visitedInRegion(cv.region as string).done;
        } else if (t === "outside_kanto") {
          achieved = outsideKantoStores.size >= (cv.min as number);
        } else if (t === "specific_store") {
          achieved = visitedMita && cv.store_name === "ラーメン二郎 三田本店";
        }
        break;
      }

      case "all":
        achieved = visitedAll;
        break;

      case "call": {
        const callMap: Record<string, CallKey> = {
          yasai: "call_yasai",
          garlic: "call_garlic",
          abura: "call_abura",
          karame: "call_karame",
        };
        const key = callMap[cv.call as string];
        if (key) achieved = highCall(key) >= (cv.count as number);
        break;
      }

      case "parameter": {
        const param = cv.param as string;
        const minReviews = (cv.min_reviews as number) ?? 20;
        if (param === "pork_score") {
          achieved = porkFiveCount >= (cv.count as number);
        } else if (param === "dero_score") {
          if (total >= minReviews && deroAvg !== null) {
            if (cv.avg_min !== undefined) achieved = deroAvg >= (cv.avg_min as number);
            if (cv.avg_max !== undefined) achieved = deroAvg <= (cv.avg_max as number);
          }
        } else if (param === "emulsification_score") {
          if (total >= minReviews && emulAvg !== null) {
            if (cv.avg_min !== undefined) achieved = emulAvg >= (cv.avg_min as number);
            if (cv.avg_max !== undefined) achieved = emulAvg <= (cv.avg_max as number);
          }
        }
        break;
      }

      case "special": {
        const st = cv.type as string;
        if (st === "same_day_lunch_dinner") {
          for (const { hours } of reviewsByDay.values()) {
            const lunch = hours.some((h) => h >= 10 && h < 14);
            const dinner = hours.some((h) => h >= 17);
            if (lunch && dinner) { achieved = true; break; }
          }
        } else if (st === "hashigo") {
          for (const { storeIds } of reviewsByDay.values()) {
            if (storeIds.size >= (cv.count as number ?? 2)) { achieved = true; break; }
          }
        } else if (st === "consecutive_days") {
          achieved = maxConsecutive >= (cv.count as number ?? 3);
        } else if (st === "seasonal") {
          achieved = winterReviews >= (cv.count as number ?? 5);
        }
        break;
      }
    }

    if (achieved) newlyAchieved.push(title);
  }

  if (newlyAchieved.length === 0) return [];

  // Save to user_titles
  await supabase.from("user_titles").upsert(
    newlyAchieved.map((t) => ({ user_id: userId, title_id: t.id }))
  );

  return newlyAchieved.map((t) => ({ name: t.name, description: t.description }));
}
