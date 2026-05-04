import { Theme } from '@/constants/Theme';
import type { ToothRarity } from '@/types/tooth';

export function rarityLabel(r: ToothRarity): string {
  switch (r) {
    case 'common':
      return 'Common';
    case 'uncommon':
      return 'Uncommon';
    case 'rare':
      return 'Rare';
    case 'legendary':
      return 'Legendary';
    default:
      return r;
  }
}

export function rarityColor(r: ToothRarity): string {
  switch (r) {
    case 'common':
      return Theme.foam;
    case 'uncommon':
      return Theme.sand;
    case 'rare':
      return Theme.amberGlow;
    case 'legendary':
      return Theme.amber;
    default:
      return Theme.textMuted;
  }
}
