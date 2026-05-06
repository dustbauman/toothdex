import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { TEETH_DATABASE } from '@/data/teeth';
import { backfillDiscoveryAt, type ToothDiscoveryMap } from '@/lib/dexDiscovery';
import { ensureSpecimenCodes, type CollectionEntryPersisted } from '@/lib/specimen';
import type { CollectionEntry, FieldNoteSaveDraft } from '@/types/tooth';

const STORAGE_KEY = '@toothdex/persisted/v1';

type PersistedShape = {
  collection: unknown[];
  unlockedToothIds: string[];
  toothDiscoveryAt?: ToothDiscoveryMap;
};

export type ScanSaveCelebration = { type: 'newDex' | 'saved'; name: string } | null;

type CollectionContextValue = {
  collection: CollectionEntry[];
  unlockedToothIds: Set<string>;
  totalSpecies: number;
  collectedSpeciesCount: number;
  unlockedSpeciesCount: number;
  isHydrated: boolean;
  registerDiscovery: (toothId: string) => void;
  addToCollection: (
    entry: Omit<CollectionEntry, 'entryId' | 'savedAt' | 'specimenCode'> & { savedAt?: string }
  ) => void;
  getRecentDiscoveries: (limit?: number) => CollectionEntry[];
  fieldNoteDraft: FieldNoteSaveDraft | null;
  setFieldNoteDraft: (draft: FieldNoteSaveDraft | null) => void;
  /** After saving from Field Note, Scan consumes this on focus. */
  queueScanSaveCelebration: (c: ScanSaveCelebration) => void;
  consumeQueuedScanCelebration: () => ScanSaveCelebration;
  /** ISO first-unlock timestamps for Dex UX (persisted). */
  toothDiscoveryAt: ToothDiscoveryMap;
};

const CollectionContext = createContext<CollectionContextValue | null>(null);

function uniqueSpeciesIds(entries: CollectionEntry[]): Set<string> {
  return new Set(entries.map((e) => e.toothId));
}

export function CollectionProvider({ children }: { children: React.ReactNode }) {
  const [collection, setCollection] = useState<CollectionEntry[]>([]);
  const [unlockedToothIds, setUnlockedToothIds] = useState<string[]>([]);
  const [toothDiscoveryAt, setToothDiscoveryAt] = useState<ToothDiscoveryMap>({});
  const [isHydrated, setIsHydrated] = useState(false);
  const [fieldNoteDraft, setFieldNoteDraft] = useState<FieldNoteSaveDraft | null>(null);
  const scanCelebrationQueueRef = useRef<ScanSaveCelebration>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (cancelled) return;
        if (raw) {
          const parsed = JSON.parse(raw) as PersistedShape;
          const migrated = ensureSpecimenCodes((parsed.collection ?? []) as CollectionEntryPersisted[]);
          const unlocked = parsed.unlockedToothIds ?? [];
          const discovered = backfillDiscoveryAt(
            migrated,
            unlocked,
            parsed.toothDiscoveryAt
          );
          setCollection(migrated);
          setUnlockedToothIds(unlocked);
          setToothDiscoveryAt(discovered);
        }
      } catch {
        // ignore corrupt storage
      } finally {
        if (!cancelled) setIsHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    const payload: PersistedShape = { collection, unlockedToothIds, toothDiscoveryAt };
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [collection, unlockedToothIds, toothDiscoveryAt, isHydrated]);

  const registerDiscovery = useCallback((toothId: string) => {
    const ts = new Date().toISOString();
    setUnlockedToothIds((prev) => (prev.includes(toothId) ? prev : [...prev, toothId]));
    setToothDiscoveryAt((prev) =>
      prev[toothId] ? prev : { ...prev, [toothId]: ts }
    );
  }, []);

  const addToCollection = useCallback(
    (entry: Omit<CollectionEntry, 'entryId' | 'savedAt' | 'specimenCode'> & { savedAt?: string }) => {
      setCollection((prev) => {
        const maxCode = prev.reduce((m, e) => Math.max(m, e.specimenCode ?? 0), 0);
        const full: CollectionEntry = {
          entryId: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          specimenCode: maxCode + 1,
          toothId: entry.toothId,
          imageUri: entry.imageUri,
          confidence: entry.confidence,
          savedAt: entry.savedAt ?? new Date().toISOString(),
          fieldNotes: entry.fieldNotes,
        };
        return [full, ...prev];
      });
      setUnlockedToothIds((prev) =>
        prev.includes(entry.toothId) ? prev : [...prev, entry.toothId]
      );
      const stamp = entry.savedAt ?? new Date().toISOString();
      setToothDiscoveryAt((prev) =>
        prev[entry.toothId] ? prev : { ...prev, [entry.toothId]: stamp }
      );
    },
    []
  );

  const queueScanSaveCelebration = useCallback((c: ScanSaveCelebration) => {
    scanCelebrationQueueRef.current = c;
  }, []);

  const consumeQueuedScanCelebration = useCallback(() => {
    const v = scanCelebrationQueueRef.current;
    scanCelebrationQueueRef.current = null;
    return v;
  }, []);

  const collectedSpecies = useMemo(() => uniqueSpeciesIds(collection), [collection]);
  const unlockedSet = useMemo(() => new Set(unlockedToothIds), [unlockedToothIds]);

  const getRecentDiscoveries = useCallback(
    (limit = 4) =>
      [...collection]
        .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())
        .slice(0, limit),
    [collection]
  );

  const value = useMemo<CollectionContextValue>(
    () => ({
      collection,
      unlockedToothIds: unlockedSet,
      totalSpecies: TEETH_DATABASE.length,
      collectedSpeciesCount: collectedSpecies.size,
      unlockedSpeciesCount: unlockedSet.size,
      isHydrated,
      registerDiscovery,
      addToCollection,
      getRecentDiscoveries,
      fieldNoteDraft,
      setFieldNoteDraft,
      queueScanSaveCelebration,
      consumeQueuedScanCelebration,
      toothDiscoveryAt,
    }),
    [
      collection,
      unlockedSet,
      collectedSpecies.size,
      isHydrated,
      registerDiscovery,
      addToCollection,
      getRecentDiscoveries,
      fieldNoteDraft,
      queueScanSaveCelebration,
      consumeQueuedScanCelebration,
      toothDiscoveryAt,
    ]
  );

  return <CollectionContext.Provider value={value}>{children}</CollectionContext.Provider>;
}

export function useCollection() {
  const ctx = useContext(CollectionContext);
  if (!ctx) throw new Error('useCollection must be used within CollectionProvider');
  return ctx;
}
