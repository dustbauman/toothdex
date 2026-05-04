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

export type CollectionEntry = {
  entryId: string;
  toothId: string;
  savedAt: string;
  imageUri: string | null;
  confidence: number;
};

export type ScanResult = {
  tooth: ToothRecord;
  confidence: number;
  highlightedTraits: string[];
};
