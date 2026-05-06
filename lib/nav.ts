import type { Href } from 'expo-router';

/** Typed-route manifest may lag new files; keep navigation centralized. */
export function hrefToothGuide(toothId: string): Href {
  return { pathname: '/tooth/[id]', params: { id: toothId } } as unknown as Href;
}

export function hrefFieldNote(): Href {
  return '/field-note' as unknown as Href;
}

export function hrefSpecimen(entryId: string): Href {
  return { pathname: '/specimen/[entryId]', params: { entryId } } as unknown as Href;
}
