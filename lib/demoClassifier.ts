import { TEETH_DATABASE, TOOTH_BY_ID } from '@/data/teeth';
import type { ScanResult, ToothRecord } from '@/types/tooth';

/** Weight showcase demo toward crowd-pleasing sharks. */
const DEMO_WEIGHTS: { toothId: string; weight: number }[] = [
  { toothId: 'megalodon', weight: 5 },
  { toothId: 'sand-tiger', weight: 4 },
  { toothId: 'mako', weight: 4 },
  { toothId: 'great-white', weight: 4 },
  { toothId: 'hemipristis', weight: 4 },
];

/**
 * Deterministic demo “vision” classifier.
 * Replace this module later with a real vision API — keep the same `ScanResult` shape.
 */
function hashString(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (Math.imul(31, h) + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function scanResultDemoForTooth(tooth: ToothRecord, seed: number): ScanResult {
  const confidence = 0.72 + (seed % 23) / 100; // 0.72–0.94
  const traitCount = 2 + (seed % 2); // 2–3 traits
  const highlightedTraits = tooth.identificationTraits.slice(0, traitCount);

  return { tooth, confidence, highlightedTraits };
}

export function classifyToothDemo(imageUri: string | null): ScanResult {
  const seedSource = imageUri ?? `camera-${Date.now()}`;
  const seed = hashString(seedSource);
  const tooth = TEETH_DATABASE[seed % TEETH_DATABASE.length]!;
  return scanResultDemoForTooth(tooth, seed);
}

function pickWeightedShowcaseSpeciesId(): string {
  const total = DEMO_WEIGHTS.reduce((sum, row) => sum + row.weight, 0);
  let roll = Math.random() * total;
  for (const row of DEMO_WEIGHTS) {
    roll -= row.weight;
    if (roll <= 0) return row.toothId;
  }
  return DEMO_WEIGHTS[DEMO_WEIGHTS.length - 1]?.toothId ?? 'megalodon';
}

/**
 * Random-ish demo tuned for flashy species; swaps in cleanly for real vision APIs.
 */
export function classifyDemoWeightedShowcase(): ScanResult {
  const toothId = pickWeightedShowcaseSpeciesId();
  const tooth = TOOTH_BY_ID[toothId] ?? TEETH_DATABASE[0]!;
  const seed =
    hashString(`${toothId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`);
  return scanResultDemoForTooth(tooth, seed);
}
