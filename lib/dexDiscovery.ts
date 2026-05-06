import type { CollectionEntry } from '@/types/tooth';

/** How long a Dex entry stays visually “fresh”. */
export const RECENT_UNLOCK_MS = 72 * 60 * 60 * 1000;

/** First time a tooth id hits the Dex roster (persisted ISO string). */
export type ToothDiscoveryMap = Record<string, string>;

/** Backfill timestamps from earliest collection save per species. */
export function backfillDiscoveryAt(
  collection: CollectionEntry[],
  unlockedIds: string[],
  existing: ToothDiscoveryMap | undefined
): ToothDiscoveryMap {
  const clean: ToothDiscoveryMap = {};
  if (existing) {
    for (const [k, v] of Object.entries(existing)) {
      if (typeof v === 'string' && v.length > 0) clean[k] = v;
    }
  }

  const earliestBySpecies = new Map<string, string>();
  for (const e of collection) {
    const t = new Date(e.savedAt).getTime();
    const cur = earliestBySpecies.get(e.toothId);
    if (!cur || t < new Date(cur).getTime()) {
      earliestBySpecies.set(e.toothId, e.savedAt);
    }
  }

  for (const id of unlockedIds) {
    if (clean[id]) continue;
    const est = earliestBySpecies.get(id);
    if (est) clean[id] = est;
  }

  return clean;
}

export function isRecentlyDiscovered(atIso: string | undefined, nowMs: number): boolean {
  if (!atIso) return false;
  const t = new Date(atIso).getTime();
  if (Number.isNaN(t)) return false;
  return nowMs - t <= RECENT_UNLOCK_MS && nowMs >= t;
}
