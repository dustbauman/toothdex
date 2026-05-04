import { StyleSheet, Text, View, type ViewProps } from 'react-native';

import { Theme } from '@/constants/Theme';

type Props = ViewProps & {
  title?: string;
  subtitle?: string;
};

export function ToothCard({ title, subtitle, children, style, ...rest }: Props) {
  return (
    <View style={[styles.card, style]} {...rest}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.oceanMid,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  title: {
    color: Theme.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    color: Theme.textSecondary,
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
});
