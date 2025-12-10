/**
 * AppCMS Demo Theme Constants
 */
export const colors = {
  // Primary palette
  primary: '#3b82f6',
  primaryLight: '#60a5fa',
  primaryDark: '#1d4ed8',
  
  // Background
  backgroundDark: '#0a0f1c',
  backgroundMid: '#111827',
  backgroundLight: '#1f2937',
  
  // Surface
  surface: '#1e293b',
  surfaceLight: '#334155',
  surfaceBorder: '#475569',
  
  // Accent
  accent: '#06b6d4',
  accentGreen: '#10b981',
  accentOrange: '#f59e0b',
  accentPink: '#ec4899',
  
  // Text
  textPrimary: '#f8fafc',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  
  // Status
  success: '#22c55e',
  warning: '#eab308',
  error: '#ef4444',
  
  // UI
  inputBackground: '#0f172a',
  inputBorder: '#334155',
  buttonDisabled: '#475569',
  tabBarBackground: '#111827',
  tabBarBorder: '#1f2937',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
  hero: 42,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};
