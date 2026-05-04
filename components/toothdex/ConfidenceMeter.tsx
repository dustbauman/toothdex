import { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { Theme } from '@/constants/Theme';

type Props = {
  confidence: number;
  reveal: boolean;
};

export function ConfidenceMeter({ confidence, reveal }: Props) {
  const pct = Math.round(Math.min(1, Math.max(0, confidence)) * 100);
  const fill = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!reveal) {
      fill.setValue(0);
      return;
    }
    fill.setValue(0);
    Animated.timing(fill, {
      toValue: pct,
      duration: 700,
      useNativeDriver: false,
    }).start();
  }, [reveal, pct, fill]);

  const widthInterpolated = useMemo(
    () =>
      fill.interpolate({
        inputRange: [0, Math.max(pct, 1)],
        outputRange: ['0%', `${pct}%`],
      }),
    [fill, pct]
  );

  const labelColor =
    pct >= 85 ? Theme.amberGlow : pct >= 70 ? Theme.sand : Theme.foam;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.label}>Match confidence</Text>
        <Text style={[styles.pct, { color: labelColor }]}>{pct}%</Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width: widthInterpolated }]} />
      </View>
      <View style={styles.ticks}>
        {[25, 50, 75].map((t) => (
          <Text key={t} style={styles.tick}>
            {t}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  label: {
    color: Theme.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  pct: {
    fontSize: 28,
    fontWeight: '800',
  },
  track: {
    height: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(244,241,234,0.08)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: Theme.amber,
    shadowColor: Theme.amberGlow,
    shadowOpacity: 0.45,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  ticks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingHorizontal: 2,
  },
  tick: {
    color: Theme.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
});
