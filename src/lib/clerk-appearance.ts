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
  sageLight: '#E8EDE6',
} as const;

/** Base Clerk appearance: variables and layout. Apply to ClerkProvider and/or components. */
export const clerkAppearance = {
  variables: {
    colorPrimary: BRAND.terracotta,
    colorPrimaryForeground: BRAND.bone,
    colorBackground: BRAND.sageLight,
    colorForeground: BRAND.forest,
    colorMutedForeground: 'rgba(26, 34, 24, 0.6)', // forest with opacity
    colorMuted: 'rgba(168, 181, 160, 0.2)', // sage with opacity
    colorBorder: 'rgba(168, 181, 160, 0.3)', // sage with opacity
    colorInput: BRAND.bone,
    colorInputForeground: BRAND.forest,
    colorDanger: BRAND.terracotta,
    fontFamily: 'var(--font-manrope), sans-serif',
    fontFamilyButtons: 'var(--font-manrope), sans-serif',
    borderRadius: '12px',
    spacing: '1rem',
  },
  elements: {
    // General styles for all components
    headerTitle: 'font-display text-2xl sm:text-[32px] text-forest font-normal tracking-tight mb-2',
    headerSubtitle: 'text-[15px] text-forest/70 font-body mb-4',
    
    // Form buttons
    formButtonPrimary: 'bg-terracotta hover:bg-[#C74E2E] text-bone rounded-xl py-3.5 px-4 font-medium transition-all duration-300 shadow-[0_4px_12px_rgba(217,93,57,0.2)] hover:shadow-[0_8px_20px_rgba(217,93,57,0.3)] hover:-translate-y-0.5 text-[15px] border-none',
    
    // Form fields
    formFieldInput: 'bg-bone border border-sage/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta/50 outline-none transition-all text-[15px] text-forest placeholder:text-forest/50',
    formFieldLabel: 'text-[14px] font-medium text-forest/80 mb-1.5 flex items-center',
    
    // OTP / Verification code fields
    otpCodeFieldInput: 'bg-white border-2 border-sage/40 rounded-xl focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta/50 outline-none text-forest font-bold text-lg transition-all',
    
    // Dividers
    dividerLine: 'bg-sage/40',
    dividerText: 'text-forest/60 text-[11px] font-bold uppercase tracking-[0.1em]',
    
    // Social buttons
    socialButtonsBlockButton: 'bg-white text-forest border border-sage/30 hover:bg-bone hover:border-sage/40 hover:text-forest rounded-xl py-3 transition-all duration-300 shadow-[0_2px_8px_rgba(26,34,24,0.05)] relative overflow-hidden',
    socialButtonsBlockButtonText: 'font-medium text-[15px]',
    socialButtonsProviderIcon: 'mr-2',
    
    // Footers and links
    footerActionLink: 'text-terracotta hover:text-[#C74E2E] font-medium hover:underline underline-offset-4 transition-colors',
    footerActionText: 'text-forest/70 text-[14px]',
    
    // Identity preview (when you've entered email but not password yet)
    identityPreviewText: 'text-forest font-medium',
    identityPreviewEditButton: 'text-terracotta hover:text-[#C74E2E] transition-colors',
    
    // Alerts and errors
    formFieldWarningText: 'text-terracotta text-[13px] mt-1.5',
    formFieldErrorText: 'text-terracotta text-[13px] mt-1.5',
    alertText: 'text-terracotta font-medium',
    alert: 'bg-terracotta/10 border border-terracotta/20 rounded-xl p-4 text-forest',
    
    // Modals
    modalContent: 'bg-sage-light',
    modalBackdrop: 'bg-forest/60 backdrop-blur-sm',
    
    // User Button Dropdown overrides
    userButtonPopoverCard: 'bg-sage-light rounded-2xl shadow-[0_20px_60px_rgba(26,34,24,0.12)] border border-sage/30 overflow-hidden',
    userButtonPopoverActionButton: 'hover:bg-sage/30 text-forest transition-colors',
    userButtonPopoverActionButtonText: 'font-medium text-[14px] text-forest',
    userButtonPopoverActionButtonIcon: 'text-forest/70',
    userButtonPopoverFooter: 'hidden', // Hide the extra footer
    
    // User Profile (Account) modal overrides
    navbar: 'bg-forest-light text-bone [&_.cl-headerTitle]:!text-bone [&_.cl-headerSubtitle]:!text-bone/70',
    navbarMobileMenuRow: 'bg-forest-light text-bone',
    navbarButton: 'text-bone hover:bg-white/5 hover:text-bone',
    navbarButtonIcon: 'text-bone',
    breadcrumbsItem: 'text-bone hover:text-bone',
    pageScrollBox: 'bg-sage-light',
    profileSectionTitleText: 'font-display text-forest',
    profileSectionPrimaryButton: 'text-terracotta hover:text-terracotta-dark',
    
    // Avatar
    avatarBox: 'ring-2 ring-sage/50 hover:ring-terracotta transition-all duration-300',
    userPreviewMainIdentifier: 'font-display font-medium text-forest text-[16px]',
    userPreviewSecondaryIdentifier: 'text-forest/60 text-[13px]',
  },
  layout: {
    // Set to true only to preview production look while still on dev keys. Production keys remove the badge.
    unsafe_disableDevelopmentModeWarnings: true,
    socialButtonsPlacement: 'top',
    socialButtonsVariant: 'blockButton',
  },
} as const;
