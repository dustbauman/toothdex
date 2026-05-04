import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from '@react-navigation/native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ConfidenceMeter } from '@/components/toothdex/ConfidenceMeter';
import { PrimaryButton } from '@/components/toothdex/PrimaryButton';
import { ScanAnalyzingBanner } from '@/components/toothdex/ScanAnalyzingBanner';
import { ScreenScroll } from '@/components/toothdex/ScreenScroll';
import { ToothCard } from '@/components/toothdex/ToothCard';
import { TraitChecklist } from '@/components/toothdex/TraitChecklist';
import { Theme } from '@/constants/Theme';
import { useCollection } from '@/context/CollectionContext';
import { classifyToothDemo } from '@/lib/demoClassifier';
import { hrefFieldNote, hrefToothGuide } from '@/lib/nav';
import { rarityColor, rarityLabel } from '@/lib/rarity';
import type { ScanResult } from '@/types/tooth';

const ANALYSIS_MS = 1680;

type Phase = 'idle' | 'analyzing' | 'revealed';
type Celebration = { type: 'newDex' | 'saved'; name: string } | null;

export default function ScanScreen() {
  const router = useRouter();
  const {
    registerDiscovery,
    collection,
    setFieldNoteDraft,
    consumeQueuedScanCelebration,
  } = useCollection();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [celebration, setCelebration] = useState<Celebration>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scanRunRef = useRef(0);

  const bumpScanGeneration = useCallback(() => {
    scanRunRef.current += 1;
    progressAnim.stopAnimation();
  }, [progressAnim]);

  const analyzing = phase === 'analyzing';
  const revealed = phase === 'revealed' && result !== null;

  const pickFromLibrary = async () => {
    if (analyzing) return;
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
      bumpScanGeneration();
      setImageUri(picked.assets[0].uri);
      setResult(null);
      setPhase('idle');
      setCelebration(null);
    }
  };

  const takePhoto = async () => {
    if (analyzing) return;
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow camera access to photograph a tooth.');
      return;
    }
    const shot = await ImagePicker.launchCameraAsync({ quality: 0.85 });
    if (!shot.canceled && shot.assets[0]) {
      bumpScanGeneration();
      setImageUri(shot.assets[0].uri);
      setResult(null);
      setPhase('idle');
      setCelebration(null);
    }
  };

  const runIdentify = useCallback(() => {
    if (!imageUri || analyzing) return;
    bumpScanGeneration();
    const runId = scanRunRef.current;
    setCelebration(null);
    setResult(null);
    setPhase('analyzing');
    progressAnim.setValue(0);

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: ANALYSIS_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (!finished || scanRunRef.current !== runId) return;
      const next = classifyToothDemo(imageUri);
      setResult(next);
      registerDiscovery(next.tooth.id);
      setPhase('revealed');
      if (Platform.OS !== 'web') {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    });
  }, [analyzing, imageUri, progressAnim, registerDiscovery]);

  useFocusEffect(
    useCallback(() => {
      const c = consumeQueuedScanCelebration();
      if (!c) return;
      setCelebration(c);
      if (Platform.OS !== 'web') {
        if (c.type === 'newDex') {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }
      // Do not clear this timeout on blur — tab switches would leave the banner stuck.
      setTimeout(() => setCelebration(null), 4200);
    }, [consumeQueuedScanCelebration])
  );

  const openFieldNote = () => {
    if (!result) return;
    const hadSpeciesInVault = collection.some((e) => e.toothId === result.tooth.id);
    setFieldNoteDraft({
      toothId: result.tooth.id,
      imageUri,
      confidence: result.confidence,
      toothCommonName: result.tooth.commonName,
      isFirstVaultSpecies: !hadSpeciesInVault,
    });
    router.push(hrefFieldNote());
  };

  return (
    <ScreenScroll>
      <Text style={styles.lead}>
        Snap or upload a tooth photo. The demo classifier picks a plausible match from the local shark
        database — swap in a vision API later without changing the UI flow.
      </Text>

      <View style={styles.row}>
        <PrimaryButton
          label="Choose from library"
          variant="outline"
          style={styles.half}
          onPress={pickFromLibrary}
          disabled={analyzing}
        />
        <PrimaryButton
          label="Take photo"
          variant="outline"
          style={styles.half}
          onPress={takePhoto}
          disabled={analyzing}
        />
      </View>

      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={[styles.preview, analyzing && styles.previewDim]}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.previewPlaceholder}>
          <Text style={styles.previewHint}>Image preview</Text>
          <Text style={styles.previewSub}>Your fossil portrait appears here</Text>
        </View>
      )}

      <ScanAnalyzingBanner active={analyzing} progress={progressAnim} />

      <PrimaryButton
        label={analyzing ? 'Analyzing…' : 'Identify tooth'}
        onPress={runIdentify}
        disabled={!imageUri || analyzing}
        style={styles.identify}
      />

      {result && revealed ? (
        <ToothCard style={styles.result} title="Likely match" subtitle="Demo classifier — for show only">
          <ConfidenceMeter confidence={result.confidence} reveal={revealed} />

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

          <TraitChecklist
            key={result.tooth.id}
            traits={result.tooth.identificationTraits}
            active={revealed}
          />

          <Text style={styles.blockLabel}>Fun facts</Text>
          {result.tooth.funFacts.slice(0, 2).map((f) => (
            <Text key={f} style={styles.body}>
              {f}
            </Text>
          ))}

          <Text style={styles.blockLabel}>Collector tip</Text>
          <Text style={styles.body}>{result.tooth.collectingTips[0]}</Text>

          <PrimaryButton
            label="View full field guide"
            variant="ghost"
            onPress={() => router.push(hrefToothGuide(result.tooth.id))}
            style={styles.guideBtn}
          />

          <PrimaryButton label="Add to collection" onPress={openFieldNote} style={styles.addBtn} />
          <Text style={styles.fieldNoteHint}>Opens a quick field note — every line is optional.</Text>

          {celebration?.type === 'newDex' ? (
            <View style={styles.celebrateNew} accessibilityRole="alert">
              <FontAwesome name="star" size={22} color={Theme.amberGlow} style={styles.celebrateIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.celebrateTitle}>New Dex entry unlocked</Text>
                <Text style={styles.celebrateSub}>
                  {celebration.name} is now in your vault roster. Keep hunting the rest!
                </Text>
              </View>
            </View>
          ) : celebration?.type === 'saved' ? (
            <View style={styles.celebrateSaved} accessibilityRole="text">
              <FontAwesome name="bookmark" size={18} color={Theme.foam} style={styles.celebrateIcon} />
              <Text style={styles.celebrateSavedText}>
                {celebration.name} saved — another specimen for your collection.
              </Text>
            </View>
          ) : null}
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
  previewDim: {
    opacity: 0.52,
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
  body: {
    color: Theme.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  guideBtn: {
    marginTop: 4,
    marginBottom: 4,
  },
  addBtn: {
    marginTop: 8,
  },
  fieldNoteHint: {
    marginTop: 8,
    textAlign: 'center',
    color: Theme.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  celebrateNew: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(232, 184, 77, 0.12)',
    borderWidth: 1.5,
    borderColor: Theme.amber,
  },
  celebrateSaved: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(168, 197, 217, 0.1)',
    borderWidth: 1,
    borderColor: Theme.border,
  },
  celebrateIcon: {
    marginTop: 2,
  },
  celebrateTitle: {
    color: Theme.amberGlow,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  celebrateSub: {
    color: Theme.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  celebrateSavedText: {
    flex: 1,
    color: Theme.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
});
