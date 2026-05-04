import { useEffect, useMemo, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { Theme } from '@/constants/Theme';

const STATUS_LINES = [
  'Reading crown silhouette…',
  'Serration pass…',
  'Querying local ToothDex…',
  'Locking in a match…',
];

type Props = {
  active: boolean;
  progress: Animated.Value;
};

export function ScanAnalyzingBanner({ active, progress }: Props) {
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    if (!active) {
      setLineIndex(0);
      return;
    }
    const id = setInterval(() => {
      setLineIndex((i) => (i + 1) % STATUS_LINES.length);
    }, 420);
    return () => clearInterval(id);
  }, [active]);

  const widthInterpolated = useMemo(
    () =>
      progress.interpolate({
        inputRange: [0, 1],
        outputRange: ['4%', '100%'],
      }),
    [progress]
  );

  if (!active) return null;

  return (
    <View style={styles.wrap} accessibilityLiveRegion="polite">
      <Text style={styles.title}>Analyzing specimen</Text>
      <Text style={styles.status}>{STATUS_LINES[lineIndex]}</Text>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width: widthInterpolated }]} />
      </View>
      <Text style={styles.hint}>Demo classifier — swap for real vision later</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 18,
    padding: 16,
    borderRadius: 16,
    backgroundColor: Theme.oceanMid,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  title: {
    color: Theme.amberGlow,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  status: {
    color: Theme.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 14,
    minHeight: 44,
  },
  track: {
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(244,241,234,0.08)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: Theme.amber,
  },
  hint: {
    marginTop: 10,
    color: Theme.textMuted,
    fontSize: 12,
  },
});
