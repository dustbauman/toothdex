import type { CollectionEntry } from '@/types/tooth';

export function specimenCatalogLabel(code: number): string {
  return `TDX-${String(Math.max(0, Math.floor(code))).padStart(4, '0')}`;
}

export type CollectionEntryPersisted = Omit<CollectionEntry, 'specimenCode'> & {
  specimenCode?: number;
};

/**
 * Ensures every entry has a stable specimen code for catalog display (TDX-xxxx).
 * Preserves existing codes; assigns chronologically for legacy rows missing codes.
 */
export function ensureSpecimenCodes(entries: CollectionEntryPersisted[]): CollectionEntry[] {
  if (entries.length === 0) return [];

  const allHave = entries.every(
    (e) => typeof e.specimenCode === 'number' && !Number.isNaN(e.specimenCode)
  );
  if (allHave) return entries as CollectionEntry[];

  const used = new Set<number>(
    entries.map((e) => e.specimenCode).filter((c): c is number => typeof c === 'number' && !Number.isNaN(c))
  );
  let next = used.size > 0 ? Math.max(...used) + 1 : 1;

  const missing = [...entries]
    .filter((e) => e.specimenCode == null || Number.isNaN(e.specimenCode as number))
    .sort((a, b) => new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime());

  const assign = new Map<string, number>();
  for (const e of missing) {
    while (used.has(next)) next += 1;
    assign.set(e.entryId, next);
    used.add(next);
    next += 1;
  }

  return entries.map((e) => {
    if (typeof e.specimenCode === 'number' && !Number.isNaN(e.specimenCode)) return e as CollectionEntry;
    const code = assign.get(e.entryId);
    if (code == null) return e as CollectionEntry;
    return { ...e, specimenCode: code };
  });
}
