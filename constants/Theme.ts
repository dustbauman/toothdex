/**
 * ToothDex visual language: deep ocean, charcoal, bone, sand, fossil amber.
 */
export const Theme = {
  oceanDeep: '#0B1B2B',
  oceanMid: '#132F45',
  oceanHighlight: '#1E4A6B',
  charcoal: '#1A1D21',
  bone: '#F4F1EA',
  sand: '#D9CBB3',
  sandMuted: '#B8A892',
  amber: '#C9943A',
  amberGlow: '#E8B84D',
  foam: '#A8C5D9',
  textPrimary: '#F4F1EA',
  textSecondary: '#B8C5D0',
  textMuted: '#7A8B99',
  success: '#5CB88A',
  border: 'rgba(244, 241, 234, 0.12)',
  cardOverlay: 'rgba(11, 27, 43, 0.92)',
  mystery: '#2A3540',
} as const;

/** Shared screen typography for tab roots and modals (RN StyleSheet-ready). */
export const ScreenCopy = {
  /** Standard screen title below the nav header. */
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Theme.bone,
    letterSpacing: 0.35,
    marginBottom: 8,
  },
  intro: {
    fontSize: 15,
    lineHeight: 22,
    color: Theme.textSecondary,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800' as const,
    letterSpacing: 1.1,
    textTransform: 'uppercase' as const,
    color: Theme.amberGlow,
    marginBottom: 10,
    marginTop: 2,
  },
} as const;

/** Navigation theme color overrides merged with `DarkTheme` in `app/_layout.tsx`. */
export const NavTheme = {
  colors: {
    primary: Theme.amber,
    background: Theme.oceanDeep,
    card: Theme.oceanMid,
    text: Theme.textPrimary,
    border: Theme.border,
    notification: Theme.amber,
  },
} as const;
