import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/toothdex/PrimaryButton';
import { ScreenScroll } from '@/components/toothdex/ScreenScroll';
import { ToothCard } from '@/components/toothdex/ToothCard';
import { Theme } from '@/constants/Theme';
import { useCollection } from '@/context/CollectionContext';
import { classifyToothDemo } from '@/lib/demoClassifier';
import { rarityColor, rarityLabel } from '@/lib/rarity';
import type { ScanResult } from '@/types/tooth';

export default function ScanScreen() {
  const { registerDiscovery, addToCollection } = useCollection();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [busy, setBusy] = useState(false);

  const pickFromLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to pick a tooth image.');
      return;
    }
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    });
    if (!picked.canceled && picked.assets[0]) {
      setImageUri(picked.assets[0].uri);
      setResult(null);
    }
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow camera access to photograph a tooth.');
      return;
    }
    const shot = await ImagePicker.launchCameraAsync({ quality: 0.85 });
    if (!shot.canceled && shot.assets[0]) {
      setImageUri(shot.assets[0].uri);
      setResult(null);
    }
  };

  const identify = () => {
    setBusy(true);
    try {
      const next = classifyToothDemo(imageUri);
      setResult(next);
      registerDiscovery(next.tooth.id);
    } finally {
      setBusy(false);
    }
  };

  const addFind = () => {
    if (!result) return;
    addToCollection({
      toothId: result.tooth.id,
      imageUri,
      confidence: result.confidence,
    });
    Alert.alert('Saved', `${result.tooth.commonName} added to your collection.`);
  };

  return (
    <ScreenScroll>
      <Text style={styles.lead}>
        Snap or upload a tooth photo. The demo classifier picks a plausible match from the local shark
        database — swap in a vision API later without changing the UI flow.
      </Text>

      <View style={styles.row}>
        <PrimaryButton label="Choose from library" variant="outline" style={styles.half} onPress={pickFromLibrary} />
        <PrimaryButton label="Take photo" variant="outline" style={styles.half} onPress={takePhoto} />
      </View>

      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
      ) : (
        <View style={styles.previewPlaceholder}>
          <Text style={styles.previewHint}>Image preview</Text>
          <Text style={styles.previewSub}>Your fossil portrait appears here</Text>
        </View>
      )}

      <PrimaryButton
        label={busy ? 'Identifying…' : 'Identify tooth'}
        onPress={identify}
        disabled={!imageUri || busy}
        style={styles.identify}
      />

      {result ? (
        <ToothCard
          style={styles.result}
          title="Likely match"
          subtitle={`${(result.confidence * 100).toFixed(0)}% confidence (demo)`}>
          <Text style={styles.matchName}>{result.tooth.commonName}</Text>
          <Text style={styles.latin}>{result.tooth.scientificName}</Text>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { borderColor: rarityColor(result.tooth.rarity) }]}>
              <Text style={[styles.badgeText, { color: rarityColor(result.tooth.rarity) }]}>
                {rarityLabel(result.tooth.rarity)}
              </Text>
            </View>
            <Text style={styles.era}>{result.tooth.era}</Text>
          </View>

          <Text style={styles.blockLabel}>ID traits</Text>
          {result.highlightedTraits.map((t) => (
            <Text key={t} style={styles.bullet}>
              • {t}
            </Text>
          ))}

          <Text style={styles.blockLabel}>Quick fact</Text>
          <Text style={styles.body}>{result.tooth.funFacts[0]}</Text>

          <PrimaryButton label="Add to collection" onPress={addFind} style={styles.addBtn} />
        </ToothCard>
      ) : null}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  lead: {
    color: Theme.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  half: {
    flex: 1,
    paddingVertical: 14,
  },
  preview: {
    width: '100%',
    height: 240,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: Theme.mystery,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  previewPlaceholder: {
    width: '100%',
    height: 240,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Theme.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(19,47,69,0.55)',
  },
  previewHint: {
    color: Theme.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  previewSub: {
    color: Theme.textMuted,
    marginTop: 6,
    fontSize: 13,
  },
  identify: {
    marginBottom: 18,
  },
  result: {
    marginBottom: 8,
  },
  matchName: {
    color: Theme.bone,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  latin: {
    color: Theme.foam,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
    flexWrap: 'wrap',
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
  blockLabel: {
    color: Theme.amberGlow,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 4,
    marginBottom: 6,
  },
  bullet: {
    color: Theme.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  body: {
    color: Theme.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  addBtn: {
    marginTop: 8,
  },
});
