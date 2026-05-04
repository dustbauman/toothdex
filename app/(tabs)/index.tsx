import { Link } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/toothdex/PrimaryButton';
import { ScreenScroll } from '@/components/toothdex/ScreenScroll';
import { ToothCard } from '@/components/toothdex/ToothCard';
import { Theme } from '@/constants/Theme';
import { TOOTH_BY_ID } from '@/data/teeth';
import { useCollection } from '@/context/CollectionContext';
import { rarityColor, rarityLabel } from '@/lib/rarity';

export default function HomeScreen() {
  const {
    totalSpecies,
    collectedSpeciesCount,
    unlockedSpeciesCount,
    getRecentDiscoveries,
  } = useCollection();
  const recent = getRecentDiscoveries(4);

  return (
    <ScreenScroll>
      <Text style={styles.brand}>ToothDex</Text>
      <Text style={styles.tagline}>Identify. Collect. Complete the hunt.</Text>

      <ToothCard style={styles.progressCard} title="Collection progress">
        <View style={styles.progressRow}>
          <View>
            <Text style={styles.progressBig}>
              {collectedSpeciesCount}/{totalSpecies}
            </Text>
            <Text style={styles.progressHint}>species in your vault</Text>
          </View>
          <View style={styles.dexMini}>
            <Text style={styles.dexMiniLabel}>Dex seen</Text>
            <Text style={styles.dexMiniValue}>
              {unlockedSpeciesCount}/{totalSpecies}
            </Text>
          </View>
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.min(100, (collectedSpeciesCount / totalSpecies) * 100)}%` },
            ]}
          />
        </View>
      </ToothCard>

      <Text style={styles.sectionLabel}>Recent discoveries</Text>
      {recent.length === 0 ? (
        <ToothCard subtitle="No finds yet — scan your first tooth to start the story.">
          <Text style={styles.emptyHint}>Your timeline will light up with names, dates, and rarities.</Text>
        </ToothCard>
      ) : (
        <View style={styles.recentList}>
          {recent.map((item) => {
            const tooth = TOOTH_BY_ID[item.toothId];
            if (!tooth) return null;
            return (
              <View key={item.entryId} style={styles.recentRow}>
                {item.imageUri ? (
                  <Image source={{ uri: item.imageUri }} style={styles.recentThumb} />
                ) : (
                  <View style={[styles.recentThumb, styles.recentThumbPlaceholder]}>
                    <Text style={styles.placeholderGlyph}>🦷</Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.recentName}>{tooth.commonName}</Text>
                  <Text style={styles.recentMeta}>
                    {new Date(item.savedAt).toLocaleDateString()} ·{' '}
                    <Text style={{ color: rarityColor(tooth.rarity) }}>{rarityLabel(tooth.rarity)}</Text>
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <Link href="/scan" asChild>
        <PrimaryButton label="Scan a tooth" style={styles.scanCta} />
      </Link>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  brand: {
    fontSize: 34,
    fontWeight: '800',
    color: Theme.bone,
    letterSpacing: 0.5,
    marginTop: 4,
  },
  tagline: {
    marginTop: 8,
    marginBottom: 22,
    fontSize: 16,
    color: Theme.textSecondary,
    lineHeight: 22,
  },
  progressCard: {
    marginBottom: 22,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  progressBig: {
    fontSize: 32,
    fontWeight: '800',
    color: Theme.amberGlow,
  },
  progressHint: {
    color: Theme.textMuted,
    marginTop: 4,
    fontSize: 13,
  },
  dexMini: {
    alignItems: 'flex-end',
  },
  dexMiniLabel: {
    color: Theme.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dexMiniValue: {
    color: Theme.foam,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 2,
  },
  progressTrack: {
    height: 8,
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
    color: Theme.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  recentList: {
    gap: 10,
    marginBottom: 22,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Theme.oceanMid,
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  recentThumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: Theme.mystery,
  },
  recentThumbPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderGlyph: {
    fontSize: 22,
  },
  recentName: {
    color: Theme.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  recentMeta: {
    color: Theme.textMuted,
    marginTop: 2,
    fontSize: 13,
  },
  emptyHint: {
    color: Theme.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  scanCta: {
    marginTop: 4,
  },
});
