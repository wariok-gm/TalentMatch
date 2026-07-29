import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { ColorTokens, darkColors, lightColors, makeShadows, makeType, radius, spacing, TypeTokens } from '.';

type Theme = {
  scheme: 'light' | 'dark';
  colors: ColorTokens;
  type: TypeTokens;
  spacing: typeof spacing;
  radius: typeof radius;
  shadows: ReturnType<typeof makeShadows>;
};

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';

  const theme = useMemo<Theme>(() => {
    const c = scheme === 'dark' ? darkColors : lightColors;
    return {
      scheme,
      colors: c,
      type: makeType(c),
      spacing,
      radius,
      shadows: makeShadows(scheme),
    };
  }, [scheme]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error('useTheme must be used within a ThemeProvider');
  return theme;
}
