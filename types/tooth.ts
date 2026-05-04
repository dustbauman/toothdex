export type ToothRarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export type ToothRecord = {
  id: string;
  commonName: string;
  scientificName: string;
  rarity: ToothRarity;
  era: string;
  shortDescription: string;
  identificationTraits: string[];
  funFacts: string[];
  collectingTips: string[];
};

export type ToothCondition = 'excellent' | 'good' | 'worn' | 'fragment';

/** Optional field notes captured when saving a find (all fields optional). */
export type FieldNotes = {
  locationNote?: string;
  sizeEstimate?: string;
  condition?: ToothCondition;
  personalNotes?: string;
};

/** In-memory payload while the Field Note modal is open (not persisted). */
export type FieldNoteSaveDraft = {
  toothId: string;
  imageUri: string | null;
  confidence: number;
  toothCommonName: string;
  isFirstVaultSpecies: boolean;
};

export type CollectionEntry = {
  entryId: string;
  toothId: string;
  savedAt: string;
  imageUri: string | null;
  confidence: number;
  fieldNotes?: FieldNotes;
};

export type ScanResult = {
  tooth: ToothRecord;
  confidence: number;
  highlightedTraits: string[];
};
