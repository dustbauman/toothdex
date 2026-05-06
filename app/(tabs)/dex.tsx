import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenScroll } from '@/components/toothdex/ScreenScroll';
import { ToothCard } from '@/components/toothdex/ToothCard';
import { Theme } from '@/constants/Theme';
import { TEETH_DATABASE } from '@/data/teeth';
import { useCollection } from '@/context/CollectionContext';
import { isRecentlyDiscovered } from '@/lib/dexDiscovery';
import { hrefToothGuide } from '@/lib/nav';
import { rarityColor, rarityLabel } from '@/lib/rarity';
import type { ToothRarity } from '@/types/tooth';

const RARITY_ORDER: ToothRarity[] = ['legendary', 'rare', 'uncommon', 'common'];

export default function DexScreen() {
  const router = useRouter();
  const {
    unlockedToothIds,
    totalSpecies,
    unlockedSpeciesCount,
    toothDiscoveryAt,
  } = useCollection();

  const nowMs = Date.now();
  const pctComplete =
    totalSpecies > 0 ? Math.min(100, Math.round((unlockedSpeciesCount / totalSpecies) * 100)) : 0;

  const rarityBreakdown = useMemo(() => {
    const rows: { rarity: ToothRarity; unlocked: number; total: number }[] = RARITY_ORDER.map(
      (rarity) => ({
        rarity,
        unlocked: 0,
        total: 0,
      })
    );
    const byRarity = Object.fromEntries(rows.map((r) => [r.rarity, r])) as Record<
      ToothRarity,
      { rarity: ToothRarity; unlocked: number; total: number }
    >;

    for (const tooth of TEETH_DATABASE) {
      const slot = byRarity[tooth.rarity];
      slot.total += 1;
      if (unlockedToothIds.has(tooth.id)) slot.unlocked += 1;
    }

    return RARITY_ORDER.map((r) => byRarity[r]);
  }, [unlockedToothIds]);

  const lockedCount = totalSpecies - unlockedSpeciesCount;

  return (
    <ScreenScroll>
      <Text style={styles.head}>Species Dex</Text>
      <Text style={styles.sub}>
        Build your fossil roster — every scan or save can register a new predator in the Dex.
      </Text>

      <ToothCard style={styles.summary} title="Dex progression">
        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.bigCount}>
              {unlockedSpeciesCount}
              <Text style={styles.bigCountMuted}>/{totalSpecies}</Text>
            </Text>
            <Text style={styles.summaryHint}>species discovered</Text>
          </View>
          <View style={styles.pctBadge}>
            <Text style={styles.pctHuge}>{pctComplete}%</Text>
            <Text style={styles.pctLabel}>complete</Text>
          </View>
        </View>
        <Text style={styles.lockedInline}>
          {lockedCount === 0 ? 'Dex complete — apex catalogued!' : `${lockedCount} mystery slot${lockedCount !== 1 ? 's' : ''} remaining`}
        </Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pctComplete}%` }]} />
        </View>
      </ToothCard>

      <Text style={styles.sectionLabel}>Roster by rarity</Text>
      <View style={styles.rarityDeck}>
        {rarityBreakdown.map(({ rarity, unlocked, total }) => (
          <View key={rarity} style={[styles.rarityStripe, { borderLeftColor: rarityColor(rarity) }]}>
            <Text style={[styles.rarityStripeName, { color: rarityColor(rarity) }]}>
              {rarityLabel(rarity)}
            </Text>
            <Text style={styles.rarityStripeCount}>
              <Text style={styles.rarityStripeNum}>{unlocked}</Text>
              <Text style={styles.rarityStripeSlash}>/{total}</Text>
            </Text>
            <Text style={styles.rarityStripeSub}>
              {total === 0 ? '—' : `${Math.round((unlocked / total) * 100)}%`}
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Species grid</Text>
      <Text style={styles.gridHint}>Fresh discoveries glow for three days.</Text>

      <View style={styles.grid}>
        {TEETH_DATABASE.map((tooth) => {
          const unlocked = unlockedToothIds.has(tooth.id);
          const discoveredAt = toothDiscoveryAt[tooth.id];
          const recent = unlocked && isRecentlyDiscovered(discoveredAt, nowMs);

          const innerUnlocked = (
            <>
              {recent ? (
                <View style={styles.newRibbon}>
                  <Text style={styles.newRibbonText}>Recent</Text>
                </View>
              ) : null}
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

          const innerLocked = (
            <>
              <View style={styles.lockedGlow} pointerEvents="none" />
              <View style={styles.lockedIconRing}>
                <FontAwesome name="lock" size={18} color={Theme.textMuted} />
              </View>
              <Text style={styles.lockedEyebrow}>Uncharted entry</Text>
              <Text style={styles.lockedGlyphRow}>∿ · ∿</Text>
              <Text style={styles.lockedTitle}>???</Text>
              <Text style={styles.lockedSub}>Scan or vault a tooth to reveal this species.</Text>
              <View style={styles.rarityFog}>
                <Text style={styles.rarityFogText}>Rarity hidden</Text>
              </View>
            </>
          );

          return unlocked ? (
            <Pressable
              key={tooth.id}
              accessibilityRole="button"
              accessibilityLabel={`Open field guide for ${tooth.commonName}`}
              onPress={() => router.push(hrefToothGuide(tooth.id))}
              style={({ pressed }) => [
                styles.tile,
                recent && styles.tileRecent,
                pressed && styles.tilePressed,
              ]}>
              {innerUnlocked}
            </Pressable>
          ) : (
            <View key={tooth.id} style={[styles.tile, styles.tileLocked]}>
              {innerLocked}
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
  summary: {
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bigCount: {
    fontSize: 36,
    fontWeight: '800',
    color: Theme.amberGlow,
  },
  bigCountMuted: {
    fontSize: 22,
    color: Theme.textMuted,
    fontWeight: '700',
  },
  summaryHint: {
    color: Theme.textMuted,
    marginTop: 4,
    fontSize: 13,
  },
  pctBadge: {
    alignItems: 'flex-end',
  },
  pctHuge: {
    fontSize: 32,
    fontWeight: '800',
    color: Theme.success,
  },
  pctLabel: {
    color: Theme.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  lockedInline: {
    color: Theme.textSecondary,
    fontSize: 14,
    marginBottom: 10,
    lineHeight: 20,
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(244,241,234,0.08)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: Theme.amber,
  },
  sectionLabel: {
    color: Theme.amberGlow,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 4,
  },
  rarityDeck: {
    gap: 10,
    marginBottom: 22,
  },
  rarityStripe: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: Theme.oceanMid,
    borderWidth: 1,
    borderColor: Theme.border,
    borderLeftWidth: 5,
  },
  rarityStripeName: {
    flex: 1,
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.4,
  },
  rarityStripeCount: {
    minWidth: 52,
    alignItems: 'flex-end',
  },
  rarityStripeNum: {
    color: Theme.bone,
    fontSize: 18,
    fontWeight: '800',
  },
  rarityStripeSlash: {
    color: Theme.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  rarityStripeSub: {
    width: 36,
    textAlign: 'right',
    color: Theme.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  gridHint: {
    color: Theme.textMuted,
    fontSize: 12,
    marginBottom: 12,
    marginTop: -4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tile: {
    position: 'relative',
    flexGrow: 1,
    flexBasis: '47%',
    minWidth: '47%',
    minHeight: 148,
    backgroundColor: Theme.oceanMid,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Theme.border,
    overflow: 'hidden',
  },
  tileRecent: {
    borderColor: Theme.amberGlow,
    borderWidth: 1.5,
    shadowColor: Theme.amberGlow,
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  tileLocked: {
    backgroundColor: 'rgba(11, 16, 22, 0.92)',
    borderColor: 'rgba(184, 168, 146, 0.22)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  tilePressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  newRibbon: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Theme.amber,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    zIndex: 2,
  },
  newRibbonText: {
    color: Theme.charcoal,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  tapHint: {
    marginTop: 8,
    color: Theme.amberGlow,
    fontSize: 12,
    fontWeight: '700',
  },
  tileName: {
    color: Theme.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    paddingRight: 56,
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
  lockedGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(30, 74, 107, 0.12)',
  },
  lockedIconRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(168, 197, 217, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  lockedEyebrow: {
    color: Theme.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  lockedGlyphRow: {
    color: Theme.oceanHighlight,
    fontSize: 18,
    letterSpacing: 4,
    marginBottom: 4,
  },
  lockedTitle: {
    color: Theme.textSecondary,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 6,
    marginBottom: 6,
  },
  lockedSub: {
    textAlign: 'center',
    color: Theme.textMuted,
    fontSize: 12,
    lineHeight: 17,
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  rarityFog: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(244,241,234,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(244,241,234,0.08)',
  },
  rarityFogText: {
    color: Theme.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
