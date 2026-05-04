import { TEETH_DATABASE } from '@/data/teeth';
import type { ScanResult } from '@/types/tooth';

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

export function classifyToothDemo(imageUri: string | null): ScanResult {
  const seedSource = imageUri ?? `camera-${Date.now()}`;
  const seed = hashString(seedSource);
  const index = seed % TEETH_DATABASE.length;
  const tooth = TEETH_DATABASE[index]!;

  const confidence = 0.72 + (seed % 23) / 100; // 0.72–0.94
  const traitCount = 2 + (seed % 2); // 2–3 traits
  const highlightedTraits = tooth.identificationTraits.slice(0, traitCount);

  return { tooth, confidence, highlightedTraits };
}
