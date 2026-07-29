import { TextStyle, ViewStyle } from 'react-native';

export type ColorTokens = {
  bg: string;
  card: string;
  glass: string;
  label: string;
  secondaryLabel: string;
  tertiaryLabel: string;
  separator: string;
  hairline: string;
  tint: string;
  tintSoft: string;
  pink: string;
  pinkSoft: string;
  green: string;
  greenSoft: string;
  orange: string;
  orangeSoft: string;
  red: string;
  blue: string;
  skeleton: string;
  fill: string;
  fillStrong: string;
};

export const lightColors: ColorTokens = {
  bg: '#F2F2F7',
  card: '#FFFFFF',
  glass: 'rgba(255,255,255,0.72)',
  label: '#0B0B0F',
  secondaryLabel: 'rgba(60,60,67,0.60)',
  tertiaryLabel: 'rgba(60,60,67,0.33)',
  separator: 'rgba(60,60,67,0.12)',
  hairline: 'rgba(0,0,0,0.06)',
  tint: '#5E5CE6',
  tintSoft: 'rgba(94,92,230,0.12)',
  pink: '#FF2D55',
  pinkSoft: 'rgba(255,45,85,0.12)',
  green: '#34C759',
  greenSoft: 'rgba(52,199,89,0.14)',
  orange: '#FF9500',
  orangeSoft: 'rgba(255,149,0,0.14)',
  red: '#FF3B30',
  blue: '#007AFF',
  skeleton: 'rgba(120,120,128,0.14)',
  fill: 'rgba(120,120,128,0.10)',
  fillStrong: 'rgba(120,120,128,0.20)',
};

export const darkColors: ColorTokens = {
  bg: '#000000',
  card: '#1C1C1E',
  glass: 'rgba(28,28,30,0.72)',
  label: '#FFFFFF',
  secondaryLabel: 'rgba(235,235,245,0.60)',
  tertiaryLabel: 'rgba(235,235,245,0.33)',
  separator: 'rgba(84,84,88,0.65)',
  hairline: 'rgba(255,255,255,0.08)',
  tint: '#7D7AFF',
  tintSoft: 'rgba(125,122,255,0.18)',
  pink: '#FF375F',
  pinkSoft: 'rgba(255,55,95,0.18)',
  green: '#32D74B',
  greenSoft: 'rgba(50,215,75,0.18)',
  orange: '#FF9F0A',
  orangeSoft: 'rgba(255,159,10,0.18)',
  red: '#FF453A',
  blue: '#0A84FF',
  skeleton: 'rgba(120,120,128,0.24)',
  fill: 'rgba(120,120,128,0.20)',
  fillStrong: 'rgba(120,120,128,0.32)',
};

/** Static light tokens, for the rare call site with no component tree to read useTheme() from (e.g. mock data). */
export const colors = lightColors;

export const spacing = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
} as const;

export const radius = {
  s: 10,
  m: 16,
  l: 20,
  xl: 24,
  xxl: 28,
  pill: 999,
} as const;

export type TypeTokens = Record<string, TextStyle>;

export function makeType(c: ColorTokens): TypeTokens {
  return {
    largeTitle: { fontSize: 34, fontWeight: '800', letterSpacing: 0.2, color: c.label },
    title1: { fontSize: 28, fontWeight: '700', letterSpacing: 0.1, color: c.label },
    title2: { fontSize: 22, fontWeight: '700', color: c.label },
    title3: { fontSize: 20, fontWeight: '600', color: c.label },
    headline: { fontSize: 17, fontWeight: '600', color: c.label },
    body: { fontSize: 17, fontWeight: '400', color: c.label },
    callout: { fontSize: 16, fontWeight: '400', color: c.label },
    subhead: { fontSize: 15, fontWeight: '400', color: c.secondaryLabel },
    subheadBold: { fontSize: 15, fontWeight: '600', color: c.label },
    footnote: { fontSize: 13, fontWeight: '400', color: c.secondaryLabel },
    caption: { fontSize: 12, fontWeight: '500', color: c.secondaryLabel },
    caption2: { fontSize: 11, fontWeight: '600', letterSpacing: 0.3, color: c.tertiaryLabel },
  };
}

/** Static light type styles, for the rare call site with no component tree to read useTheme() from. */
export const type: TypeTokens = makeType(lightColors);

export function makeShadows(scheme: 'light' | 'dark'): Record<string, ViewStyle> {
  const shadowColor = scheme === 'dark' ? '#000000' : '#1a1a2e';
  const boost = scheme === 'dark' ? 1.6 : 1;
  return {
    card: {
      shadowColor,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.07 * boost,
      shadowRadius: 16,
      elevation: 4,
    },
    soft: {
      shadowColor,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.05 * boost,
      shadowRadius: 8,
      elevation: 2,
    },
    float: {
      shadowColor,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.14 * boost,
      shadowRadius: 24,
      elevation: 8,
    },
  };
}

/** Static light shadow styles, for the rare call site with no component tree to read useTheme() from. */
export const shadows: Record<string, ViewStyle> = makeShadows('light');

/** Gradient pairs used for generated "photos" and avatars — no remote images anywhere. */
export const gradients: ReadonlyArray<[string, string]> = [
  ['#667eea', '#764ba2'],
  ['#f093fb', '#f5576c'],
  ['#4facfe', '#00f2fe'],
  ['#43e97b', '#38f9d7'],
  ['#fa709a', '#fee140'],
  ['#30cfd0', '#330867'],
  ['#a8edea', '#fed6e3'],
  ['#ff9a9e', '#fecfef'],
  ['#fbc2eb', '#a6c1ee'],
  ['#fdcbf1', '#e6dee9'],
  ['#a1c4fd', '#c2e9fb'],
  ['#d4fc79', '#96e6a1'],
  ['#84fab0', '#8fd3f4'],
  ['#cfd9df', '#e2ebf0'],
  ['#fccb90', '#d57eeb'],
  ['#e0c3fc', '#8ec5fc'],
  ['#f77062', '#fe5196'],
  ['#08aeea', '#2af598'],
  ['#ff758c', '#ff7eb3'],
  ['#c471f5', '#fa71cd'],
];

export { ThemeProvider, useTheme } from './ThemeContext';
