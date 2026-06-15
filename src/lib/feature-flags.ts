/**
 * Feature flag definitions for frontend navigation visibility control.
 * These flags allow administrators to toggle features on/off without code changes.
 */

/** All available feature flag IDs */
export const FEATURE_FLAG_IDS = {
  // Site-wide chrome
  SITE_BETA_BANNER: "site.beta-banner",
  // Navigation flags
  NAV_DISCUSSION: "nav.discussion",
  NAV_REPORT_ISSUE: "nav.report-issue",
  NAV_CALENDAR: "nav.calendar",
  NAV_BLOG: "nav.blog",
  NAV_MANAGEMENT: "nav.management",
  NAV_ABOUT: "nav.about",
  NAV_MAP: "nav.map",
  // Footer flags
  FOOTER_QUICK_LINKS: "footer.quick-links",
  FOOTER_SUPPORT: "footer.support",
  // Homepage flags
  HOME_UTILITY_DOCK: "home.utility-dock",
  HOME_QUICK_ACCESS: "home.quick-access",
  // Account flags
  ACCOUNT_VERIFICATION: "account.verification",
  ACCOUNT_REPORTED_ISSUES: "account.reported-issues",
  ACCOUNT_MY_PROPERTY: "account.my-property",
  // Petition
  PETITION_ACTIVE: "petition.active",
} as const;

export type FeatureFlagId = (typeof FEATURE_FLAG_IDS)[keyof typeof FEATURE_FLAG_IDS];

/** Map of nav item hrefs to their corresponding feature flag IDs */
export const NAV_ITEM_TO_FLAG: Record<string, FeatureFlagId | undefined> = {
  "/discussion": FEATURE_FLAG_IDS.NAV_DISCUSSION,
  "/management-request": FEATURE_FLAG_IDS.NAV_REPORT_ISSUE,
  "/calendar": FEATURE_FLAG_IDS.NAV_CALENDAR,
  "/blog": FEATURE_FLAG_IDS.NAV_BLOG,
  "/admin": FEATURE_FLAG_IDS.NAV_MANAGEMENT,
  "/about": FEATURE_FLAG_IDS.NAV_ABOUT,
  "/map": FEATURE_FLAG_IDS.NAV_MAP,
};

/** Flag ID to display label mapping */
export const FLAG_LABELS: Record<FeatureFlagId, string> = {
  [FEATURE_FLAG_IDS.SITE_BETA_BANNER]: "Beta Testing Banner",
  [FEATURE_FLAG_IDS.NAV_DISCUSSION]: "Discussion",
  [FEATURE_FLAG_IDS.NAV_REPORT_ISSUE]: "Report Issue",
  [FEATURE_FLAG_IDS.NAV_CALENDAR]: "Calendar",
  [FEATURE_FLAG_IDS.NAV_BLOG]: "Blog",
  [FEATURE_FLAG_IDS.NAV_MANAGEMENT]: "Management",
  [FEATURE_FLAG_IDS.NAV_ABOUT]: "About",
  [FEATURE_FLAG_IDS.NAV_MAP]: "Map",
  [FEATURE_FLAG_IDS.FOOTER_QUICK_LINKS]: "Footer Quick Links",
  [FEATURE_FLAG_IDS.FOOTER_SUPPORT]: "Footer Support",
  [FEATURE_FLAG_IDS.HOME_UTILITY_DOCK]: "Home Utility Dock",
  [FEATURE_FLAG_IDS.HOME_QUICK_ACCESS]: "Home Quick Access",
  [FEATURE_FLAG_IDS.ACCOUNT_VERIFICATION]: "Account Verification",
  [FEATURE_FLAG_IDS.ACCOUNT_REPORTED_ISSUES]: "Account Reported Issues",
  [FEATURE_FLAG_IDS.ACCOUNT_MY_PROPERTY]: "Account My Property",
  [FEATURE_FLAG_IDS.PETITION_ACTIVE]: "Petition Active",
};

/** Group flags by category */
export const FLAG_GROUPS = {
  site: [
    FEATURE_FLAG_IDS.SITE_BETA_BANNER,
  ],
  navigation: [
    FEATURE_FLAG_IDS.NAV_DISCUSSION,
    FEATURE_FLAG_IDS.NAV_REPORT_ISSUE,
    FEATURE_FLAG_IDS.NAV_CALENDAR,
    FEATURE_FLAG_IDS.NAV_BLOG,
    FEATURE_FLAG_IDS.NAV_MANAGEMENT,
    FEATURE_FLAG_IDS.NAV_ABOUT,
    FEATURE_FLAG_IDS.NAV_MAP,
  ],
  footer: [
    FEATURE_FLAG_IDS.FOOTER_QUICK_LINKS,
    FEATURE_FLAG_IDS.FOOTER_SUPPORT,
  ],
  homepage: [
    FEATURE_FLAG_IDS.HOME_UTILITY_DOCK,
    FEATURE_FLAG_IDS.HOME_QUICK_ACCESS,
  ],
  account: [
    FEATURE_FLAG_IDS.ACCOUNT_VERIFICATION,
    FEATURE_FLAG_IDS.ACCOUNT_REPORTED_ISSUES,
    FEATURE_FLAG_IDS.ACCOUNT_MY_PROPERTY,
  ],
} as const;

export type FlagGroup = keyof typeof FLAG_GROUPS;
