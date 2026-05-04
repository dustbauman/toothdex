import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenScroll } from '@/components/toothdex/ScreenScroll';
import { Theme } from '@/constants/Theme';
import { TEETH_DATABASE } from '@/data/teeth';
import { useCollection } from '@/context/CollectionContext';
import { hrefToothGuide } from '@/lib/nav';
import { rarityColor, rarityLabel } from '@/lib/rarity';

export default function DexScreen() {
  const router = useRouter();
  const { unlockedToothIds, totalSpecies, unlockedSpeciesCount } = useCollection();

  return (
    <ScreenScroll>
      <Text style={styles.head}>Species Dex</Text>
      <Text style={styles.sub}>
        Unlocked {unlockedSpeciesCount}/{totalSpecies} — mystery silhouettes until you identify or collect each
        shark.
      </Text>

      <View style={styles.grid}>
        {TEETH_DATABASE.map((tooth) => {
          const unlocked = unlockedToothIds.has(tooth.id);
          const inner = !unlocked ? (
            <>
              <Text style={styles.mysteryMark}>?</Text>
              <Text style={styles.mysteryLabel}>Unknown species</Text>
            </>
          ) : (
            <>
              <Text style={styles.tileName} numberOfLines={2}>
                {tooth.commonName}
              </Text>
              <Text style={styles.tileLatin} numberOfLines={2}>
                {tooth.scientificName}
              </Text>
              <Text style={[styles.rarity, { color: rarityColor(tooth.rarity) }]}>
                {rarityLabel(tooth.rarity)}
              </Text>
              <Text style={styles.tapHint}>Field guide →</Text>
            </>
          );

          return unlocked ? (
            <Pressable
              key={tooth.id}
              accessibilityRole="button"
              accessibilityLabel={`Open field guide for ${tooth.commonName}`}
              onPress={() => router.push(hrefToothGuide(tooth.id))}
              style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]}>
              {inner}
            </Pressable>
          ) : (
            <View key={tooth.id} style={[styles.tile, styles.tileLocked]}>
              {inner}
            </View>
          );
        })}
      </View>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  head: {
    fontSize: 26,
    fontWeight: '800',
    color: Theme.bone,
    marginBottom: 8,
  },
  sub: {
    color: Theme.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tile: {
    flexGrow: 1,
    flexBasis: '47%',
    minWidth: '47%',
    minHeight: 128,
    backgroundColor: Theme.oceanMid,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  tileLocked: {
    backgroundColor: 'rgba(26,29,33,0.65)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tilePressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  tapHint: {
    marginTop: 8,
    color: Theme.amberGlow,
    fontSize: 12,
    fontWeight: '700',
  },
  mysteryMark: {
    fontSize: 40,
    color: Theme.textMuted,
    fontWeight: '800',
  },
  mysteryLabel: {
    marginTop: 8,
    color: Theme.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  tileName: {
    color: Theme.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  tileLatin: {
    color: Theme.foam,
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  rarity: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
