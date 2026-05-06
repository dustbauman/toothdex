import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useLayoutEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/toothdex/PrimaryButton';
import { ScreenScroll } from '@/components/toothdex/ScreenScroll';
import { ToothCard } from '@/components/toothdex/ToothCard';
import { ScreenCopy, Theme } from '@/constants/Theme';
import { TOOTH_BY_ID } from '@/data/teeth';
import { hrefDex, hrefScan } from '@/lib/nav';
import { rarityColor, rarityLabel } from '@/lib/rarity';

export default function ToothFieldGuideScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const rawId = params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const navigation = useNavigation();
  const router = useRouter();
  const tooth = id ? TOOTH_BY_ID[id] : undefined;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: tooth?.commonName ?? 'Field guide',
    });
  }, [navigation, tooth?.commonName]);

  if (!tooth) {
    return (
      <ScreenScroll contentContainerStyle={styles.centered}>
        <Text style={styles.missTitle}>Species not found</Text>
        <Text style={styles.missBody}>This ID is not in the ToothDex database.</Text>
        <PrimaryButton label="Open Species Dex" onPress={() => router.replace(hrefDex())} style={styles.missPrimary} />
        <PrimaryButton label="Go back" variant="outline" onPress={() => router.back()} style={styles.missGhost} />
      </ScreenScroll>
    );
  }

  return (
    <ScreenScroll>
      <Text style={styles.commonName}>{tooth.commonName}</Text>
      <Text style={styles.latin}>{tooth.scientificName}</Text>
      <Text style={[ScreenCopy.intro, styles.introBlurb]}>{tooth.shortDescription}</Text>
      <View style={styles.badgeRow}>
        <View style={[styles.badge, { borderColor: rarityColor(tooth.rarity) }]}>
          <Text style={[styles.badgeText, { color: rarityColor(tooth.rarity) }]}>
            {rarityLabel(tooth.rarity)}
          </Text>
        </View>
        <Text style={styles.era}>{tooth.era}</Text>
      </View>

      <ToothCard title="Identification traits" style={styles.block}>
        {tooth.identificationTraits.map((t) => (
          <Text key={t} style={styles.bullet}>
            • {t}
          </Text>
        ))}
      </ToothCard>

      <ToothCard title="Fun facts" style={styles.block}>
        {tooth.funFacts.map((f) => (
          <Text key={f} style={styles.fact}>
            {f}
          </Text>
        ))}
      </ToothCard>

      <ToothCard title="Collecting tips" style={styles.block}>
        {tooth.collectingTips.map((c) => (
          <Text key={c} style={styles.tip}>
            → {c}
          </Text>
        ))}
      </ToothCard>

      <PrimaryButton label="Identify another specimen" variant="outline" onPress={() => router.push(hrefScan())} style={styles.bottomCta} />
      <Text style={[ScreenCopy.intro, styles.linkHint]}>Returns to Scan — same demo loop as onboarding.</Text>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  centered: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingTop: 40,
  },
  missTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Theme.bone,
    marginBottom: 8,
  },
  missBody: {
    color: Theme.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  missPrimary: {
    alignSelf: 'stretch',
    marginBottom: 10,
  },
  missGhost: {
    alignSelf: 'stretch',
  },
  commonName: {
    color: Theme.bone,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  latin: {
    color: Theme.foam,
    fontSize: 17,
    fontStyle: 'italic',
    marginBottom: 6,
  },
  introBlurb: {
    marginTop: 0,
    marginBottom: 14,
    fontSize: 15,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
    marginBottom: 18,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  era: {
    color: Theme.textMuted,
    fontSize: 13,
    flex: 1,
  },
  block: {
    marginBottom: 14,
  },
  bullet: {
    color: Theme.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 6,
  },
  fact: {
    color: Theme.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 10,
  },
  tip: {
    color: Theme.sand,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 8,
  },
  bottomCta: {
    marginTop: 10,
    marginBottom: 8,
    width: '100%',
    alignSelf: 'center',
  },
  linkHint: {
    marginTop: 4,
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 13,
  },
});
