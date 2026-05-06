import * as Haptics from 'expo-haptics';
import { useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/toothdex/PrimaryButton';
import { ScreenCopy, Theme } from '@/constants/Theme';
import { useCollection } from '@/context/CollectionContext';
import { conditionLabel, normalizeFieldNotes } from '@/lib/fieldNotes';
import type { ToothCondition } from '@/types/tooth';

const CONDITIONS: ToothCondition[] = ['excellent', 'good', 'worn', 'fragment'];

export default function FieldNoteScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {
    fieldNoteDraft,
    setFieldNoteDraft,
    addToCollection,
    queueScanSaveCelebration,
  } = useCollection();

  const [locationNote, setLocationNote] = useState('');
  const [sizeEstimate, setSizeEstimate] = useState('');
  const [personalNotes, setPersonalNotes] = useState('');
  const [condition, setCondition] = useState<ToothCondition | undefined>(undefined);

  /** Cold-open / missing draft: leave once on first layout. */
  const openedRef = useRef(false);
  useEffect(() => {
    if (openedRef.current) return;
    openedRef.current = true;
    if (!fieldNoteDraft) {
      router.back();
    }
  }, [fieldNoteDraft, router]);

  const closeWithoutSave = useCallback(() => {
    router.back();
  }, [router]);

  useEffect(() => {
    return navigation.addListener('beforeRemove', () => {
      setFieldNoteDraft(null);
    });
  }, [navigation, setFieldNoteDraft]);

  useLayoutEffect(() => {
    const title = fieldNoteDraft ? `Field note · ${fieldNoteDraft.toothCommonName}` : 'Field note';
    navigation.setOptions({
      title,
      headerLeft: () => (
        <Pressable onPress={closeWithoutSave} hitSlop={12} accessibilityRole="button">
          <Text style={styles.headerLink}>Cancel</Text>
        </Pressable>
      ),
    });
  }, [navigation, fieldNoteDraft, closeWithoutSave]);

  const save = () => {
    if (!fieldNoteDraft) return;
    const fieldNotes = normalizeFieldNotes({
      locationNote,
      sizeEstimate,
      personalNotes,
      condition,
    });
    addToCollection({
      toothId: fieldNoteDraft.toothId,
      imageUri: fieldNoteDraft.imageUri,
      confidence: fieldNoteDraft.confidence,
      fieldNotes,
    });
    queueScanSaveCelebration(
      fieldNoteDraft.isFirstVaultSpecies
        ? { type: 'newDex', name: fieldNoteDraft.toothCommonName }
        : { type: 'saved', name: fieldNoteDraft.toothCommonName }
    );
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.back();
  };

  if (!fieldNoteDraft) {
    return <View style={styles.shell} />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.shell}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={insets.top + 56}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Text style={[ScreenCopy.sectionLabel, styles.stepEyebrow]}>Step 2 · optional details</Text>
        <Text style={styles.lead}>
          Everything here is optional. Skip straight to Save to collection — the specimen still lands with code,
          rarity, confidence, and date.
        </Text>

        <Text style={styles.label}>Location note</Text>
        <TextInput
          value={locationNote}
          onChangeText={setLocationNote}
          placeholder="e.g. Myrtle Beach, low tide line"
          placeholderTextColor={Theme.textMuted}
          style={styles.input}
          multiline
        />

        <Text style={styles.label}>Size estimate</Text>
        <TextInput
          value={sizeEstimate}
          onChangeText={setSizeEstimate}
          placeholder="e.g. ~2 in root-to-tip"
          placeholderTextColor={Theme.textMuted}
          style={styles.input}
        />

        <Text style={styles.label}>Condition</Text>
        <View style={styles.chipRow}>
          {CONDITIONS.map((c) => {
            const selected = condition === c;
            return (
              <Pressable
                key={c}
                onPress={() => setCondition(selected ? undefined : c)}
                style={[styles.chip, selected && styles.chipSelected]}
                accessibilityRole="button"
                accessibilityState={{ selected }}>
                <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
                  {conditionLabel(c)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Personal notes</Text>
        <TextInput
          value={personalNotes}
          onChangeText={setPersonalNotes}
          placeholder="Story, matrix, trade, anything you want to remember"
          placeholderTextColor={Theme.textMuted}
          style={[styles.input, styles.inputTall]}
          multiline
          textAlignVertical="top"
        />

        <PrimaryButton label="Save to collection" onPress={save} style={styles.saveBtn} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: Theme.oceanDeep,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  headerLink: {
    color: Theme.amberGlow,
    fontSize: 17,
    fontWeight: '600',
  },
  stepEyebrow: {
    marginBottom: 8,
  },
  lead: {
    color: Theme.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  label: {
    color: Theme.amberGlow,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    backgroundColor: Theme.oceanMid,
    borderWidth: 1,
    borderColor: Theme.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: Theme.textPrimary,
    fontSize: 16,
    marginBottom: 16,
    minHeight: 48,
  },
  inputTall: {
    minHeight: 120,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Theme.border,
    backgroundColor: 'rgba(19,47,69,0.5)',
  },
  chipSelected: {
    borderColor: Theme.amber,
    backgroundColor: 'rgba(201, 148, 58, 0.2)',
  },
  chipLabel: {
    color: Theme.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  chipLabelSelected: {
    color: Theme.amberGlow,
  },
  saveBtn: {
    marginTop: 18,
    marginBottom: 8,
  },
});
