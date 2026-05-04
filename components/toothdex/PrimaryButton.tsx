import { Pressable, StyleSheet, Text, type PressableProps, type ViewStyle } from 'react-native';

import { Theme } from '@/constants/Theme';

type Props = PressableProps & {
  label: string;
  variant?: 'amber' | 'outline' | 'ghost';
  style?: ViewStyle;
};

export function PrimaryButton({ label, variant = 'amber', style, disabled, ...rest }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'amber' && styles.amber,
        variant === 'outline' && styles.outline,
        variant === 'ghost' && styles.ghost,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      {...rest}>
      <Text
        style={[
          styles.label,
          variant === 'amber' && styles.labelOnAmber,
          variant === 'outline' && styles.labelOutline,
          variant === 'ghost' && styles.labelGhost,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amber: {
    backgroundColor: Theme.amber,
    shadowColor: Theme.amberGlow,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  outline: {
    borderWidth: 1.5,
    borderColor: Theme.amber,
    backgroundColor: 'transparent',
  },
  ghost: {
    backgroundColor: 'rgba(244,241,234,0.06)',
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  labelOnAmber: {
    color: Theme.charcoal,
  },
  labelOutline: {
    color: Theme.amberGlow,
  },
  labelGhost: {
    color: Theme.bone,
  },
});
