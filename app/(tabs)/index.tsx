import { Link, useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/toothdex/PrimaryButton';
import { ScreenScroll } from '@/components/toothdex/ScreenScroll';
import { ToothCard } from '@/components/toothdex/ToothCard';
import { ScreenCopy, Theme } from '@/constants/Theme';
import { TOOTH_BY_ID } from '@/data/teeth';
import { useCollection } from '@/context/CollectionContext';
import { hrefDex, hrefScan, hrefSpecimen, hrefToothGuide } from '@/lib/nav';
import { rarityColor, rarityLabel } from '@/lib/rarity';

export default function HomeScreen() {
  const router = useRouter();
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
      <Text style={[ScreenCopy.intro, styles.tagline]}>Identify · collect · complete the Species Dex.</Text>

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
        <ToothCard title="Vault is empty" subtitle="Run Identify on the Scan tab, then save — your loop starts here.">
          <Text style={styles.emptyHint}>
            Prefer no camera roll? Tap Try Demo Scan on Scan — same Identify and Add to collection flow.
          </Text>
          <Link href={hrefScan()} asChild>
            <PrimaryButton label="Go to Scan" style={styles.emptyPrimary} />
          </Link>
          <Link href={hrefDex()} asChild>
            <PrimaryButton variant="outline" label="Browse Species Dex" style={styles.emptySecondary} />
          </Link>
        </ToothCard>
      ) : (
        <View style={styles.recentList}>
          {recent.map((item) => {
            const tooth = TOOTH_BY_ID[item.toothId];
            if (!tooth) return null;
            return (
              <Pressable
                key={item.entryId}
                accessibilityRole="button"
                accessibilityHint="Long press to open the species field guide"
                onPress={() => router.push(hrefSpecimen(item.entryId))}
                onLongPress={() => router.push(hrefToothGuide(item.toothId))}
                style={({ pressed }) => [styles.recentRow, pressed && styles.recentRowPressed]}>
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
                  <Text style={styles.recentHint}>Specimen record → · hold for field guide</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

      <Text style={styles.ctaEyebrow}>Primary action</Text>
      <Link href={hrefScan()} asChild>
        <PrimaryButton label="Open Scan" style={styles.scanCta} />
      </Link>
      <Text style={styles.ctaHint}>Photo, gallery, or Try Demo Scan — then Identify and save.</Text>
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
    marginTop: 4,
    marginBottom: 20,
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
    ...ScreenCopy.sectionLabel,
    marginTop: 8,
  },
  ctaEyebrow: {
    ...ScreenCopy.sectionLabel,
    marginTop: 20,
    marginBottom: 8,
  },
  ctaHint: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 18,
    color: Theme.textMuted,
    textAlign: 'center',
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  emptyPrimary: {
    marginTop: 16,
  },
  emptySecondary: {
    marginTop: 10,
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
  recentRowPressed: {
    opacity: 0.92,
  },
  recentHint: {
    marginTop: 4,
    color: Theme.amberGlow,
    fontSize: 11,
    fontWeight: '700',
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
    marginTop: 0,
  },
});
