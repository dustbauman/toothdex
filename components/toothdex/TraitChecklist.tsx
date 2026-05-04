import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Theme } from '@/constants/Theme';

type Props = {
  traits: string[];
  /** When true, stagger-check items; when false, hide checks. */
  active: boolean;
};

const STAGGER_MS = 130;

export function TraitChecklist({ traits, active }: Props) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (!active || traits.length === 0) {
      setVisibleCount(0);
      return;
    }
    setVisibleCount(0);
    let revealed = 0;
    const id = setInterval(() => {
      revealed += 1;
      setVisibleCount(Math.min(revealed, traits.length));
      if (revealed >= traits.length) clearInterval(id);
    }, STAGGER_MS);
    return () => clearInterval(id);
  }, [active, traits]);

  if (traits.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>ID trait checklist</Text>
      {traits.map((trait, i) => {
        const checked = active && i < visibleCount;
        return (
          <View key={`${i}-${trait.slice(0, 24)}`} style={styles.row}>
            <FontAwesome
              name={checked ? 'check-circle' : 'circle-o'}
              size={20}
              color={checked ? Theme.success : Theme.textMuted}
              style={styles.icon}
            />
            <Text style={[styles.text, checked && styles.textOn]}>{trait}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 8,
  },
  title: {
    color: Theme.amberGlow,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  icon: {
    marginTop: 2,
  },
  text: {
    flex: 1,
    color: Theme.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  textOn: {
    color: Theme.textSecondary,
  },
});
