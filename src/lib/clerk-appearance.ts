/**
 * Shared Clerk appearance config for CGRS brand (forest, bone, terracotta, sage).
 * Use in ClerkProvider for global styling and optionally extend on SignIn/UserButton/UserProfile.
 */

/** CGRS brand hex values for Clerk variables (use direct values for broad browser support). */
const BRAND = {
  forest: '#1A2218',
  bone: '#F4F1EA',
  terracotta: '#D95D39',
  sage: '#A8B5A0',
  forestLight: '#2C3E2D',
} as const;

/** Base Clerk appearance: variables and layout. Apply to ClerkProvider and/or components. */
export const clerkAppearance = {
  variables: {
    colorPrimary: BRAND.forest,
    colorPrimaryForeground: BRAND.bone,
    colorBackground: BRAND.bone,
    colorForeground: BRAND.forest,
    colorMutedForeground: BRAND.forestLight,
    colorMuted: BRAND.sage,
    colorBorder: BRAND.sage,
    colorInput: BRAND.bone,
    colorInputForeground: BRAND.forest,
    colorDanger: BRAND.terracotta,
    fontFamily: 'var(--font-manrope), sans-serif',
    fontFamilyButtons: 'var(--font-manrope), sans-serif',
    borderRadius: '0.375rem',
  },
  layout: {
    // Set to true only to preview production look while still on dev keys. Production keys remove the badge.
    unsafe_disableDevelopmentModeWarnings: false,
  },
} as const;
