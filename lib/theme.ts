export type ThemeKey = 'futbol' | 'f1' | 'ambos'

export interface Theme {
  pageBg: string
  cardBg: string
  cardBorder: string
  accent: string
  accentLight: string
  accentBg: string
  accentText: string
  sidebarBg: string
  sidebarBorder: string
  activeGradient: string
  activeBorder: string
  activeIconColor: string
  heroBg: string
  heroAccentText: string
  heroSubText: string
  heroLeftBar: string
  heroRightBar: string
  statColor1: string
  statColor2: string
  statColor3: string
  inputBorder: string
  buttonBg: string
}

export const FUTBOL_THEME: Theme = {
  pageBg: '#060E1E',
  cardBg: '#0D1B2A',
  cardBorder: 'rgba(255,255,255,0.06)',
  accent: '#4ADE80',
  accentLight: 'rgba(74,222,128,0.12)',
  accentBg: 'rgba(74,222,128,0.1)',
  accentText: '#4ADE80',
  sidebarBg: '#0D1B2A',
  sidebarBorder: 'rgba(255,255,255,0.06)',
  activeGradient: 'linear-gradient(135deg, rgba(0,104,71,0.3), rgba(0,40,104,0.3))',
  activeBorder: 'rgba(74,222,128,0.2)',
  activeIconColor: '#4ADE80',
  heroBg: 'linear-gradient(135deg, #003d20 0%, #001f5c 50%, #8b0000 100%)',
  heroAccentText: '#86EFAC',
  heroSubText: '#93C5FD',
  heroLeftBar: '#16A34A',
  heroRightBar: '#DC2626',
  statColor1: '#4ADE80',
  statColor2: '#60A5FA',
  statColor3: '#F87171',
  inputBorder: 'rgba(74,222,128,0.3)',
  buttonBg: 'linear-gradient(135deg, #006847, #16A34A)',
}

export const F1_THEME: Theme = {
  pageBg: '#15151E',
  cardBg: '#1e1e2e',
  cardBorder: 'rgba(232,0,45,0.12)',
  accent: '#E8002D',
  accentLight: 'rgba(232,0,45,0.12)',
  accentBg: 'rgba(232,0,45,0.08)',
  accentText: '#E8002D',
  sidebarBg: '#111118',
  sidebarBorder: 'rgba(232,0,45,0.12)',
  activeGradient: 'linear-gradient(135deg, rgba(232,0,45,0.25), rgba(30,30,46,0.9))',
  activeBorder: 'rgba(232,0,45,0.4)',
  activeIconColor: '#E8002D',
  heroBg: 'linear-gradient(135deg, #1a0005 0%, #15151E 45%, #1f0008 100%)',
  heroAccentText: '#E8002D',
  heroSubText: '#ffffff',
  heroLeftBar: '#E8002D',
  heroRightBar: '#ffffff',
  statColor1: '#E8002D',
  statColor2: '#ffffff',
  statColor3: '#FF6B6B',
  inputBorder: 'rgba(232,0,45,0.4)',
  buttonBg: 'linear-gradient(135deg, #E8002D, #9B0018)',
}

export function getTheme (pref: string | null | undefined): Theme {
  return pref === 'f1' ? F1_THEME : FUTBOL_THEME
}

export function getThemeFromStorage (): Theme {
  if (typeof window === 'undefined') return FUTBOL_THEME
  return getTheme(localStorage.getItem('futbol_f1'))
}
