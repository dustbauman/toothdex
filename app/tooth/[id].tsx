import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useLayoutEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/toothdex/PrimaryButton';
import { ScreenScroll } from '@/components/toothdex/ScreenScroll';
import { ToothCard } from '@/components/toothdex/ToothCard';
import { Theme } from '@/constants/Theme';
import { TOOTH_BY_ID } from '@/data/teeth';
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
        <PrimaryButton label="Back to Dex" onPress={() => router.back()} />
      </ScreenScroll>
    );
  }

  return (
    <ScreenScroll>
      <Text style={styles.latin}>{tooth.scientificName}</Text>
      <View style={styles.badgeRow}>
        <View style={[styles.badge, { borderColor: rarityColor(tooth.rarity) }]}>
          <Text style={[styles.badgeText, { color: rarityColor(tooth.rarity) }]}>
            {rarityLabel(tooth.rarity)}
          </Text>
        </View>
        <Text style={styles.era}>{tooth.era}</Text>
      </View>

      <ToothCard title="Overview" style={styles.block}>
        <Text style={styles.body}>{tooth.shortDescription}</Text>
      </ToothCard>

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

      <Pressable onPress={() => router.push('/scan')} accessibilityRole="button">
        <Text style={styles.link}>Scan another tooth</Text>
      </Pressable>
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
  },
  latin: {
    color: Theme.foam,
    fontSize: 17,
    fontStyle: 'italic',
    marginBottom: 10,
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
  body: {
    color: Theme.textSecondary,
    fontSize: 15,
    lineHeight: 22,
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
  link: {
    marginTop: 8,
    marginBottom: 24,
    color: Theme.amberGlow,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});
