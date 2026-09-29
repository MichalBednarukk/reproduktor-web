// Palety 1:1 z Androida: app/src/main/java/com/example/reproduktor/ui/theme/AppThemePalette.kt

export type AppThemeKey = 'classic' | 'pride' | 'forest'

export type AppPaletteColors = {
  background: string
  backgroundSecondary: string
  surface: string
  surfaceVariant: string
  primary: string
  secondary: string
  accent: string
  textPrimary: string
  textSecondary: string
  muted: string
  success: string
  warning: string
  error: string
  overlayDark: string
}

export type AppColorTheme = {
  key: AppThemeKey
  title: string
  description: string
  previewColors: string[]
  colors: AppPaletteColors
}

export const THEMES: AppColorTheme[] = [
  {
    key: 'classic',
    title: 'Reproduktor Classic',
    description: 'Ciemny granat, fiolet i turkus.',
    previewColors: ['#0F1020', '#7C5CFF', '#2DE2E6', '#FF6B9A'],
    colors: {
      background: '#0F1020',
      backgroundSecondary: '#1A1D3A',
      surface: '#171B34',
      surfaceVariant: '#1E2447',
      primary: '#7C5CFF',
      secondary: '#2DE2E6',
      accent: '#FF6B9A',
      textPrimary: '#F4F3FF',
      textSecondary: '#B8BCD9',
      muted: '#7F84A8',
      success: '#3EE08F',
      warning: '#FFD166',
      error: '#FF5C7A',
      overlayDark: '#090A14',
    },
  },
  {
    key: 'pride',
    title: 'Pride Pop / Tęczowy',
    description: 'Błękit, róż i jasne akcenty rainbow.',
    previewColors: ['#5BCEFA', '#F5A9B8', '#FFFFFF', '#FF5C7A', '#FFB347', '#FFE66D', '#5CFF9B', '#B983FF'],
    colors: {
      background: '#111225',
      backgroundSecondary: '#1B1A36',
      surface: '#1B1A36',
      surfaceVariant: '#26204A',
      primary: '#5BCEFA',
      secondary: '#F5A9B8',
      accent: '#FFFFFF',
      textPrimary: '#FFFFFF',
      textSecondary: '#D9D7FF',
      muted: '#A9A7C7',
      success: '#5CFF9B',
      warning: '#FFE66D',
      error: '#FF5C7A',
      overlayDark: '#0B0D19',
    },
  },
  {
    key: 'forest',
    title: 'Forest Glow',
    description: 'Ciemna zieleń, limonka i złoto.',
    previewColors: ['#0E1711', '#7ED957', '#4CE0B3', '#FFC857'],
    colors: {
      background: '#0E1711',
      backgroundSecondary: '#15251A',
      surface: '#15251A',
      surfaceVariant: '#1D3525',
      primary: '#7ED957',
      secondary: '#4CE0B3',
      accent: '#FFC857',
      textPrimary: '#F4FFF6',
      textSecondary: '#BCD8C1',
      muted: '#7F9A86',
      success: '#7ED957',
      warning: '#FFC857',
      error: '#FF6B6B',
      overlayDark: '#0A120D',
    },
  },
]

export const themeFromStorage = (value: string | null): AppColorTheme =>
  THEMES.find((t) => t.key === value) ?? THEMES[0]

/** Wystawia paletę jako zmienne CSS (--bg, --primary, ...) używane w index.css. */
export function applyTheme(theme: AppColorTheme) {
  const c = theme.colors
  const vars: Record<string, string> = {
    '--bg': c.background,
    '--bg-secondary': c.backgroundSecondary,
    '--card': c.surface,
    '--card-light': c.surfaceVariant,
    '--primary': c.primary,
    '--secondary': c.secondary,
    '--accent': c.accent,
    '--text': c.textPrimary,
    '--text-secondary': c.textSecondary,
    '--muted': c.muted,
    '--success': c.success,
    '--warning': c.warning,
    '--error': c.error,
    '--overlay-dark': c.overlayDark,
  }
  const root = document.documentElement
  for (const [name, value] of Object.entries(vars)) root.style.setProperty(name, value)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', c.background)
}
