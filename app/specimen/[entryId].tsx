import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useLayoutEffect, useMemo } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/toothdex/PrimaryButton';
import { ToothCard } from '@/components/toothdex/ToothCard';
import { Theme } from '@/constants/Theme';
import { TOOTH_BY_ID } from '@/data/teeth';
import { useCollection } from '@/context/CollectionContext';
import { conditionLabel } from '@/lib/fieldNotes';
import { hrefToothGuide } from '@/lib/nav';
import { rarityColor, rarityLabel } from '@/lib/rarity';
import { specimenCatalogLabel } from '@/lib/specimen';

export default function SpecimenDetailScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const raw = useLocalSearchParams<{ entryId?: string | string[] }>();
  const entryId = Array.isArray(raw.entryId) ? raw.entryId[0] : raw.entryId;
  const { collection } = useCollection();

  const entry = useMemo(
    () => (entryId ? collection.find((e) => e.entryId === entryId) : undefined),
    [collection, entryId]
  );
  const tooth = entry ? TOOTH_BY_ID[entry.toothId] : undefined;

  useLayoutEffect(() => {
    if (entry && tooth) {
      navigation.setOptions({
        title: specimenCatalogLabel(entry.specimenCode),
      });
    } else {
      navigation.setOptions({ title: 'Specimen' });
    }
  }, [navigation, entry, tooth]);

  if (!entryId || !entry || !tooth) {
    return (
      <View style={[styles.missWrap, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
        <FontAwesome name="search" size={40} color={Theme.textMuted} style={styles.missIcon} />
        <Text style={styles.missTitle}>Specimen not found</Text>
        <Text style={styles.missBody}>
          This entry may have been removed, or the link is outdated. Try opening it again from Collection.
        </Text>
        <PrimaryButton label="Back to Collection" variant="outline" onPress={() => router.back()} />
      </View>
    );
  }

  const notes = entry.fieldNotes;
  const catalog = specimenCatalogLabel(entry.specimenCode);
  const foundLabel = new Date(entry.savedAt).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingBottom: 32 + insets.bottom }]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.plaque}>
        <Text style={styles.plaqueEyebrow}>Vault specimen</Text>
        <Text style={styles.catalog}>{catalog}</Text>
        <Text style={styles.commonName}>{tooth.commonName}</Text>
        <Text style={styles.latin}>{tooth.scientificName}</Text>
        <View style={styles.plaqueRow}>
          <View style={[styles.rarityPill, { borderColor: rarityColor(tooth.rarity) }]}>
            <Text style={[styles.rarityPillText, { color: rarityColor(tooth.rarity) }]}>
              {rarityLabel(tooth.rarity)}
            </Text>
          </View>
          <Text style={styles.foundDate}>{foundLabel}</Text>
        </View>
      </View>

      {entry.imageUri ? (
        <Image source={{ uri: entry.imageUri }} style={styles.hero} resizeMode="cover" />
      ) : (
        <View style={styles.heroPh}>
          <Text style={styles.heroPhGlyph}>🦷</Text>
          <Text style={styles.heroPhCap}>No photo on file</Text>
        </View>
      )}

      <ToothCard title="Field journal" style={styles.card}>
        <Text style={styles.kvLabel}>Date cataloged</Text>
        <Text style={styles.kvValue}>{new Date(entry.savedAt).toLocaleString()}</Text>
        {notes?.locationNote ? (
          <>
            <Text style={styles.kvLabel}>Location</Text>
            <Text style={styles.kvValue}>{notes.locationNote}</Text>
          </>
        ) : null}
        {notes?.sizeEstimate ? (
          <>
            <Text style={styles.kvLabel}>Size estimate</Text>
            <Text style={styles.kvValue}>{notes.sizeEstimate}</Text>
          </>
        ) : null}
        {notes?.condition ? (
          <>
            <Text style={styles.kvLabel}>Condition</Text>
            <View style={styles.condChip}>
              <Text style={styles.condChipText}>{conditionLabel(notes.condition)}</Text>
            </View>
          </>
        ) : null}
        {notes?.personalNotes ? (
          <>
            <Text style={styles.kvLabel}>Personal notes</Text>
            <Text style={styles.notesBody}>{notes.personalNotes}</Text>
          </>
        ) : null}
        <Text style={styles.kvLabel}>Match confidence (demo)</Text>
        <Text style={styles.kvValue}>{(entry.confidence * 100).toFixed(0)}%</Text>
        <Text style={styles.eraLine}>Era · {tooth.era}</Text>
      </ToothCard>

      <ToothCard title="Identification traits" style={styles.card}>
        {tooth.identificationTraits.map((t) => (
          <Text key={t} style={styles.bullet}>
            • {t}
          </Text>
        ))}
      </ToothCard>

      <ToothCard title="Fun facts" style={styles.card}>
        {tooth.funFacts.map((f) => (
          <Text key={f} style={styles.fact}>
            {f}
          </Text>
        ))}
      </ToothCard>

      <ToothCard title="Collecting tips" style={styles.card}>
        {tooth.collectingTips.map((t) => (
          <Text key={t} style={styles.tip}>
            → {t}
          </Text>
        ))}
      </ToothCard>

      <PrimaryButton
        label="Open species field guide"
        variant="ghost"
        onPress={() => router.push(hrefToothGuide(tooth.id))}
        style={styles.guideBtn}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: Theme.oceanDeep,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
  },
  missWrap: {
    flex: 1,
    backgroundColor: Theme.oceanDeep,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  missIcon: {
    marginBottom: 16,
  },
  missTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Theme.bone,
    marginBottom: 8,
    textAlign: 'center',
  },
  missBody: {
    color: Theme.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  plaque: {
    backgroundColor: Theme.oceanMid,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Theme.border,
    marginBottom: 16,
  },
  plaqueEyebrow: {
    color: Theme.amberGlow,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  catalog: {
    fontSize: 28,
    fontWeight: '800',
    color: Theme.amberGlow,
    letterSpacing: 1,
    marginBottom: 8,
  },
  commonName: {
    fontSize: 24,
    fontWeight: '800',
    color: Theme.bone,
  },
  latin: {
    fontSize: 16,
    color: Theme.foam,
    fontStyle: 'italic',
    marginTop: 4,
    marginBottom: 12,
  },
  plaqueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
  },
  rarityPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  rarityPillText: {
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  foundDate: {
    flex: 1,
    textAlign: 'right',
    color: Theme.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    minWidth: 120,
  },
  hero: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    marginBottom: 18,
    backgroundColor: Theme.mystery,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  heroPh: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 18,
    backgroundColor: 'rgba(42,53,64,0.9)',
    borderWidth: 1,
    borderColor: Theme.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroPhGlyph: {
    fontSize: 48,
    marginBottom: 8,
  },
  heroPhCap: {
    color: Theme.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    marginBottom: 14,
  },
  kvLabel: {
    color: Theme.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 8,
    marginBottom: 4,
  },
  kvValue: {
    color: Theme.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 4,
  },
  notesBody: {
    color: Theme.sand,
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  eraLine: {
    marginTop: 12,
    color: Theme.foam,
    fontSize: 13,
    lineHeight: 19,
  },
  condChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(232, 184, 77, 0.15)',
    borderWidth: 1,
    borderColor: Theme.border,
    marginBottom: 4,
  },
  condChipText: {
    color: Theme.amberGlow,
    fontWeight: '800',
    fontSize: 13,
  },
  bullet: {
    color: Theme.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 8,
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
  guideBtn: {
    marginTop: 4,
  },
});
