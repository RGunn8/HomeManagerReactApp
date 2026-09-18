import { Platform } from 'react-native';

export const Palette = {
  canvas: '#f6f2ea',
  canvasTint: '#fbf7ef',
  card: '#fffaf3',
  hairline: '#e3dbcd',
  rowDivider: '#efe8db',
  forest: '#2c4a3a',
  forestDark: '#243d30',
  deepForest: '#22382c',
  ink: '#1f2a24',
  inkMuted: '#5c675f',
  inkFaint: '#8b938a',
  overdue: '#9b2c2c',
  sage: '#7a9a86',
  sageTint: '#eef2ea',
  clay: '#c46a48',
  clayTint: '#fbeee7',
  clayHairline: '#e7c9bb',
  clayLight: '#e8a184',
  cream: '#f4efe4',
  errorTint: '#f4dfd5',
  transparent: 'transparent',
  white: '#ffffff',
  black: '#000000',
} as const;

export const Colors = {
  light: {
    text: Palette.ink,
    background: Palette.canvas,
    backgroundElement: Palette.card,
    backgroundSelected: Palette.sageTint,
    textSecondary: Palette.inkMuted,
    textTertiary: Palette.inkFaint,
    border: Palette.hairline,
    primary: Palette.forest,
    primaryPressed: Palette.forestDark,
    accent: Palette.clay,
    danger: Palette.overdue,
    success: Palette.sage,
  },
  dark: {
    text: Palette.cream,
    background: Palette.deepForest,
    backgroundElement: 'rgba(244,239,228,0.07)',
    backgroundSelected: 'rgba(244,239,228,0.14)',
    textSecondary: 'rgba(244,239,228,0.68)',
    textTertiary: 'rgba(244,239,228,0.5)',
    border: 'rgba(244,239,228,0.2)',
    primary: Palette.clay,
    primaryPressed: Palette.clayLight,
    accent: Palette.clayLight,
    danger: Palette.clayLight,
    success: Palette.sage,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'Outfit_400Regular',
    sansMedium: 'Outfit_500Medium',
    sansSemiBold: 'Outfit_600SemiBold',
    serif: 'Fraunces_500Medium',
    serifSemiBold: 'Fraunces_600SemiBold',
    serifBold: 'Fraunces_700Bold',
    mono: 'ui-monospace',
  },
  android: {
    sans: 'Outfit_400Regular',
    sansMedium: 'Outfit_500Medium',
    sansSemiBold: 'Outfit_600SemiBold',
    serif: 'Fraunces_500Medium',
    serifSemiBold: 'Fraunces_600SemiBold',
    serifBold: 'Fraunces_700Bold',
    mono: 'monospace',
  },
  web: {
    sans: 'Outfit_400Regular, Outfit, var(--font-display)',
    sansMedium: 'Outfit_500Medium, Outfit, var(--font-display)',
    sansSemiBold: 'Outfit_600SemiBold, Outfit, var(--font-display)',
    serif: 'Fraunces_500Medium, Fraunces, var(--font-serif)',
    serifSemiBold: 'Fraunces_600SemiBold, Fraunces, var(--font-serif)',
    serifBold: 'Fraunces_700Bold, Fraunces, var(--font-serif)',
    mono: 'var(--font-mono)',
  },
  default: {
    sans: 'Outfit_400Regular',
    sansMedium: 'Outfit_500Medium',
    sansSemiBold: 'Outfit_600SemiBold',
    serif: 'Fraunces_500Medium',
    serifSemiBold: 'Fraunces_600SemiBold',
    serifBold: 'Fraunces_700Bold',
    mono: 'monospace',
  },
});

export const Typography = {
  authHeadline: { fontFamily: Fonts.serifSemiBold, fontSize: 36, lineHeight: 39, fontWeight: '600' },
  screenTitleLarge: { fontFamily: Fonts.serifSemiBold, fontSize: 32, lineHeight: 36, fontWeight: '600' },
  screenTitle: { fontFamily: Fonts.serifSemiBold, fontSize: 30, lineHeight: 34, fontWeight: '600' },
  pushedTitle: { fontFamily: Fonts.serifSemiBold, fontSize: 28, lineHeight: 32, fontWeight: '600' },
  cardTitle: { fontFamily: Fonts.serifSemiBold, fontSize: 21, lineHeight: 26, fontWeight: '600' },
  numeric: { fontFamily: Fonts.serifSemiBold, fontSize: 30, lineHeight: 34, fontWeight: '600' },
  button: { fontFamily: Fonts.sansSemiBold, fontSize: 16.5, lineHeight: 21, fontWeight: '600' },
  rowTitle: { fontFamily: Fonts.sansMedium, fontSize: 15.5, lineHeight: 21, fontWeight: '500' },
  body: { fontFamily: Fonts.sans, fontSize: 15, lineHeight: 23, fontWeight: '400' },
  subhead: { fontFamily: Fonts.sans, fontSize: 14.5, lineHeight: 22, fontWeight: '400' },
  chip: { fontFamily: Fonts.sansSemiBold, fontSize: 13.5, lineHeight: 18, fontWeight: '600' },
  rowSubtitle: { fontFamily: Fonts.sans, fontSize: 13, lineHeight: 18, fontWeight: '400' },
  pill: { fontFamily: Fonts.sansSemiBold, fontSize: 12.5, lineHeight: 16, fontWeight: '600' },
  caption: {
    fontFamily: Fonts.sans,
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: '600',
    letterSpacing: 1.38,
    textTransform: 'uppercase',
  },
  tabLabel: { fontFamily: Fonts.sans, fontSize: 11, lineHeight: 14, fontWeight: '600' },
} as const;

export const Radius = {
  checkbox: 7,
  stepper: 10,
  input: 14,
  button: 14,
  card: 16,
  iconTile: 16,
  pill: 999,
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 20,
  six: 24,
  seven: 32,
  eight: 48,
  nine: 64,
} as const;

export const Layout = {
  screenPadding: 20,
  rowPaddingHorizontal: 16,
  rowPaddingVertical: 15,
  cardGap: 12,
  cardCaptionGap: 8,
  minHitTarget: 44,
  primaryButtonHeight: 54,
  micButtonSize: 48,
  storeFabSize: 60,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
