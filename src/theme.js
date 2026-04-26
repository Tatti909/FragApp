import { DarkTheme as NavigationDarkTheme } from '@react-navigation/native';
import { MD3DarkTheme } from 'react-native-paper';

export const colors = {
  background: '#18181b',
  surface: '#27272a',
  primary: '#f97316',
  secondary: '#fb923c',
  text: '#fafaf9',
  muted: '#a8a29e',
  border: '#3f3f46',
};

export const paperTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    background: colors.background,
    surface: colors.surface,
    onSurface: colors.text,
    onSurfaceVariant: colors.muted,
    outline: colors.border,
  },
};

export const navigationTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.secondary,
  },
};
