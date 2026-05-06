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
import { ScreenCopy, Theme } from '@/constants/Theme';
import { useCollection } from '@/context/CollectionContext';
import { classifyDemoWeightedShowcase, classifyToothDemo } from '@/lib/demoClassifier';
import { DEMO_SCAN_PREVIEW_URI, isDemoScanPreviewUri } from '@/lib/demoScan';
import { hrefFieldNote, hrefToothGuide } from '@/lib/nav';
import { rarityColor, rarityLabel } from '@/lib/rarity';
import type { ScanResult } from '@/types/tooth';

const ANALYSIS_MS = 1680;

function DemoScanPreviewCard({ analyzing }: { analyzing: boolean }) {
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel="Demo specimen placeholder illustration"
      style={[styles.preview, styles.demoPreview, analyzing && styles.previewDim]}>
      <View pointerEvents="none" style={styles.demoGlowBlob} />
      <View pointerEvents="none" style={styles.demoGlowBlobRight} />
      <View style={styles.demoRibbon}>
        <FontAwesome name="magic" size={12} color={Theme.charcoal} style={styles.demoRibbonIcon} />
        <Text style={styles.demoRibbonText}>DEMO FIND</Text>
      </View>
      <Text style={styles.demoToothEmoji} accessibilityElementsHidden importantForAccessibility="no">
        🦷
      </Text>
      <Text style={styles.demoPreviewTitle}>Showcase specimen</Text>
      <Text style={styles.demoPreviewCaption}>
        Local placeholder — no gallery access needed. Matches run through the live analyzer reel.
      </Text>
      <View style={styles.demoSerration}>
        {[0, 1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.demoSerrDot} />
        ))}
      </View>
    </View>
  );
}

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

  const scheduleAnalysis = useCallback(
    (resolveResult: () => ScanResult) => {
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
        const next = resolveResult();
        setResult(next);
        registerDiscovery(next.tooth.id);
        setPhase('revealed');
        if (Platform.OS !== 'web') {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      });
    },
    [bumpScanGeneration, progressAnim, registerDiscovery]
  );

  const runIdentify = useCallback(() => {
    if (!imageUri || analyzing || isDemoScanPreviewUri(imageUri)) return;
    scheduleAnalysis(() => classifyToothDemo(imageUri));
  }, [analyzing, imageUri, scheduleAnalysis]);

  const tryDemoScan = useCallback(() => {
    if (analyzing) return;
    setCelebration(null);
    setImageUri(DEMO_SCAN_PREVIEW_URI);
    setResult(null);
    setPhase('idle');
    scheduleAnalysis(() => classifyDemoWeightedShowcase());
  }, [analyzing, scheduleAnalysis]);

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
      imageUri: isDemoScanPreviewUri(imageUri) ? null : imageUri,
      confidence: result.confidence,
      toothCommonName: result.tooth.commonName,
      isFirstVaultSpecies: !hadSpeciesInVault,
    });
    router.push(hrefFieldNote());
  };

  return (
    <ScreenScroll>
      <Text style={ScreenCopy.intro}>
        Add your own photo below, or use Try Demo Scan for the full Identify → Dex → Collection demo with no gallery
        access.
      </Text>

      <Text style={[ScreenCopy.sectionLabel, styles.sectionPhoto]}>Your photo</Text>
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

      <Text style={[ScreenCopy.sectionLabel, styles.sectionDemo]}>Demo shortcut</Text>
      <PrimaryButton
        label={analyzing ? 'Working…' : 'Try Demo Scan'}
        variant="outline"
        onPress={tryDemoScan}
        disabled={analyzing}
        style={styles.demoScanBtn}
      />
      <Text style={styles.demoScanHint}>Weighted Meg · Sand tiger · Mako · Great white · Snaggle — same analyzer reel as photo mode.</Text>

      {imageUri && isDemoScanPreviewUri(imageUri) ? (
        <DemoScanPreviewCard analyzing={analyzing} />
      ) : imageUri ? (
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

      <Text style={[ScreenCopy.sectionLabel, styles.sectionAnalyze]}>Analyze</Text>
      <PrimaryButton
        label={analyzing ? 'Analyzing…' : 'Identify tooth'}
        onPress={runIdentify}
        disabled={!imageUri || analyzing || isDemoScanPreviewUri(imageUri)}
        style={styles.identify}
      />
      {revealed && imageUri && isDemoScanPreviewUri(imageUri) ? (
        <Text style={styles.demoIdentifyNote}>
          Demo scans save like real finds — your vault sees the chosen species without a gallery photo attached.
        </Text>
      ) : null}

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

          <PrimaryButton label="Add to collection" onPress={openFieldNote} style={styles.addBtn} />
          <Text style={styles.fieldNoteHint}>Opens a quick field note — optional lines, swipe back to Scan when done.</Text>

          <PrimaryButton
            label="Species field guide"
            variant="ghost"
            onPress={() => router.push(hrefToothGuide(result.tooth.id))}
            style={styles.guideBtn}
          />

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
  sectionPhoto: {
    marginBottom: 6,
    marginTop: -4,
  },
  sectionDemo: {
    marginTop: 4,
    marginBottom: 6,
  },
  sectionAnalyze: {
    marginTop: 2,
    marginBottom: 8,
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
  demoScanBtn: {
    marginBottom: 10,
    paddingVertical: 14,
  },
  demoScanHint: {
    color: Theme.textMuted,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 16,
    paddingHorizontal: 4,
    textAlign: 'center',
  },
  demoPreview: {
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: 'rgba(30, 47, 68, 0.95)',
    borderStyle: 'solid',
    borderColor: Theme.amber,
    borderWidth: 1.5,
  },
  demoRibbon: {
    position: 'absolute',
    top: 14,
    right: -28,
    backgroundColor: Theme.amberGlow,
    paddingHorizontal: 36,
    paddingVertical: 6,
    transform: [{ rotate: '35deg' }],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 3,
    shadowColor: Theme.amber,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  demoRibbonIcon: {
    marginRight: -2,
  },
  demoRibbonText: {
    color: Theme.charcoal,
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 1,
  },
  demoGlowBlob: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(201, 148, 58, 0.12)',
    top: -40,
    left: -70,
    zIndex: 0,
  },
  demoGlowBlobRight: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(168, 197, 217, 0.09)',
    bottom: -30,
    right: -40,
    zIndex: 0,
  },
  demoToothEmoji: {
    fontSize: 64,
    zIndex: 1,
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowRadius: 6,
    textShadowOffset: { width: 0, height: 2 },
  },
  demoPreviewTitle: {
    zIndex: 1,
    color: Theme.bone,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  demoPreviewCaption: {
    zIndex: 1,
    color: Theme.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  demoSerration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 1,
  },
  demoSerrDot: {
    width: 12,
    height: 26,
    borderRadius: 3,
    backgroundColor: 'rgba(232, 184, 77, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(244,241,234,0.25)',
    transform: [{ rotate: '-8deg' }],
  },
  demoIdentifyNote: {
    color: Theme.textMuted,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: -10,
    marginBottom: 16,
    paddingHorizontal: 12,
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
    marginTop: 6,
  },
  addBtn: {
    marginTop: 12,
    marginBottom: 4,
  },
  fieldNoteHint: {
    marginTop: -2,
    marginBottom: 4,
    textAlign: 'center',
    color: Theme.textMuted,
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: 8,
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
