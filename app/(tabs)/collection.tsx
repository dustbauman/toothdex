import { Image, StyleSheet, Text, View } from 'react-native';

import { ScreenScroll } from '@/components/toothdex/ScreenScroll';
import { ToothCard } from '@/components/toothdex/ToothCard';
import { Theme } from '@/constants/Theme';
import { TOOTH_BY_ID } from '@/data/teeth';
import { useCollection } from '@/context/CollectionContext';
import { rarityColor, rarityLabel } from '@/lib/rarity';

export default function CollectionScreen() {
  const { collection } = useCollection();

  return (
    <ScreenScroll>
      <Text style={styles.head}>Your finds</Text>
      <Text style={styles.sub}>Every saved tooth stays on-device — perfect for show-and-tell demos.</Text>

      {collection.length === 0 ? (
        <ToothCard title="No teeth yet" subtitle="Scan a tooth, run Identify, then tap Add to collection.">
          <Text style={styles.emptyBody}>
            Your vault will list rarity, date, and photo thumbnails so you can relive each hunt.
          </Text>
        </ToothCard>
      ) : (
        <View style={{ gap: 12 }}>
          {collection.map((item) => {
            const tooth = TOOTH_BY_ID[item.toothId];
            if (!tooth) return null;
            return (
              <View key={item.entryId} style={styles.row}>
                {item.imageUri ? (
                  <Image source={{ uri: item.imageUri }} style={styles.thumb} />
                ) : (
                  <View style={[styles.thumb, styles.thumbPh]}>
                    <Text style={styles.thumbGlyph}>🦈</Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{tooth.commonName}</Text>
                  <Text style={styles.meta}>
                    {new Date(item.savedAt).toLocaleString()} ·{' '}
                    <Text style={{ color: rarityColor(tooth.rarity) }}>{rarityLabel(tooth.rarity)}</Text>
                  </Text>
                  <Text style={styles.conf}>
                    Match confidence {(item.confidence * 100).toFixed(0)}% (demo)
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  head: {
    fontSize: 26,
    fontWeight: '800',
    color: Theme.bone,
    marginBottom: 8,
  },
  sub: {
    color: Theme.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
  },
  emptyBody: {
    color: Theme.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 14,
    padding: 14,
    borderRadius: 16,
    backgroundColor: Theme.oceanMid,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: Theme.mystery,
  },
  thumbPh: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbGlyph: {
    fontSize: 28,
  },
  name: {
    color: Theme.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  meta: {
    color: Theme.textMuted,
    marginTop: 4,
    fontSize: 13,
  },
  conf: {
    color: Theme.textSecondary,
    marginTop: 8,
    fontSize: 12,
  },
});
