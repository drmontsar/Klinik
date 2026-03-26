/**
 * KliniK Design System — Color Palette
 * All UI colors used across the application.
 * @clinical-note High-contrast colors chosen for readability in clinical environments
 */

// CLINICAL: Color choices follow WCAG AA contrast guidelines for clinical displays
export const COLORS = {
  /** Main app background — soft off-white for reduced eye strain */
  bg: '#F8F9FB',
  /** Subtle background — cards, rows (gray-50) */
  bgSubtle: '#F9FAFB',
  /** Muted background — sidebars, stat bars (gray-100) */
  bgMuted: '#F3F4F6',
  /** Surface color for elevated elements */
  surface: '#FFFFFF',
  /** Card background */
  card: '#FFFFFF',
  /** Border / divider color */
  border: '#E2E6EE',
  /** Light border — component borders (gray-200) */
  borderLight: '#E5E7EB',

  /** Primary text — near-black for maximum readability (gray-900) */
  text: '#111827',
  /** Secondary text — labels and sub-headings (gray-700) */
  textSecondary: '#374151',
  /** Tertiary text — descriptions, metadata (gray-600) */
  textTertiary: '#4B5563',
  /** Muted text — secondary information (gray-500) */
  textMuted: '#6B7280',
  /** Dim text — timestamps and placeholders (gray-400) */
  textDim: '#9CA3AF',

  /** Brand primary — KliniK teal */
  brand: '#0D9488',
  /** Brand dark — hover state */
  brandDark: '#0F766E',
  /** Brand light — tinted backgrounds */
  brandLight: '#CCFBF1',
  /** Brand subtle — very light teal background */
  brandSubtle: '#F0FDFA',
  /** Brand border — light teal borders */
  brandBorder: '#CCFBF1',
  /** Brand shadow — button shadow */
  brandShadow: 'rgba(13, 148, 136, 0.25)',

  /** Clinical green — stable / normal values */
  green: '#16A34A',
  /** Green background for low-risk badges */
  greenBg: '#DCFCE7',

  /** Clinical amber — caution / medium risk */
  amber: '#D97706',
  /** Amber background for medium-risk badges */
  amberBg: '#FEF3C7',
  /** Amber background light — stat cards */
  amberBgLight: '#FFFBEB',
  /** Amber border — stat card borders */
  amberBorder: '#FDE68A',

  /** Clinical red — critical / high risk */
  red: '#DC2626',
  /** Red background for high-risk badges */
  redBg: '#FEE2E2',
  /** Red background light — stat cards */
  redBgLight: '#FEF2F2',
  /** Red border — stat card borders */
  redBorder: '#FECACA',

  /** Clinical yellow — warning / attention needed */
  yellow: '#EAB308',
  /** Yellow background for warning badges */
  yellowBg: '#FEF9C3',

  /** Clinical blue — active medications, info badges */
  blue: '#0369A1',
  /** Blue background — active medication badges */
  blueBg: '#E0F2FE',
  /** Blue light — active medication rows */
  blueLight: '#F0F9FF',
  /** Blue border — active medication borders */
  blueBorder: '#BAE6FD',

  /** AI purple — AI-generated content indicator */
  purple: '#7C3AED',
  /** Purple background — AI badges */
  purpleBg: '#EDE9FE',
  /** Purple light — AI-generated note backgrounds */
  purpleLight: '#F5F3FF',
  /** Purple border — AI-generated note borders */
  purpleBorder: '#DDD6FE',
} as const;

export type ColorKey = keyof typeof COLORS;
