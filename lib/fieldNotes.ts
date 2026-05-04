import type { FieldNotes, ToothCondition } from '@/types/tooth';

export function conditionLabel(c: ToothCondition): string {
  switch (c) {
    case 'excellent':
      return 'Excellent';
    case 'good':
      return 'Good';
    case 'worn':
      return 'Worn';
    case 'fragment':
      return 'Fragment';
    default:
      return c;
  }
}

/** Drop empty strings; omit fieldNotes entirely if nothing was captured. */
export function normalizeFieldNotes(input: FieldNotes): FieldNotes | undefined {
  const locationNote = input.locationNote?.trim() || undefined;
  const sizeEstimate = input.sizeEstimate?.trim() || undefined;
  const personalNotes = input.personalNotes?.trim() || undefined;
  const condition = input.condition;

  const out: FieldNotes = {};
  if (locationNote) out.locationNote = locationNote;
  if (sizeEstimate) out.sizeEstimate = sizeEstimate;
  if (personalNotes) out.personalNotes = personalNotes;
  if (condition) out.condition = condition;

  return Object.keys(out).length > 0 ? out : undefined;
}
