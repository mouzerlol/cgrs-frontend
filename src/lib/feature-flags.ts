/**
 * Feature flag definitions for frontend navigation visibility control.
 * These flags allow administrators to toggle features on/off without code changes.
 */

/** All available feature flag IDs */
export const FEATURE_FLAG_IDS = {
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
  // Profile flags
  PROFILE_VERIFICATION: "profile.verification",
  PROFILE_REPORTED_ISSUES: "profile.reported-issues",
  PROFILE_MY_PROPERTY: "profile.my-property",
} as const;

export type FeatureFlagId = (typeof FEATURE_FLAG_IDS)[keyof typeof FEATURE_FLAG_IDS];

/** Map of nav item hrefs to their corresponding feature flag IDs */
export const NAV_ITEM_TO_FLAG: Record<string, FeatureFlagId | undefined> = {
  "/discussion": FEATURE_FLAG_IDS.NAV_DISCUSSION,
  "/management-request": FEATURE_FLAG_IDS.NAV_REPORT_ISSUE,
  "/calendar": FEATURE_FLAG_IDS.NAV_CALENDAR,
  "/blog": FEATURE_FLAG_IDS.NAV_BLOG,
  "/work-management": FEATURE_FLAG_IDS.NAV_MANAGEMENT,
  "/about": FEATURE_FLAG_IDS.NAV_ABOUT,
  "/map": FEATURE_FLAG_IDS.NAV_MAP,
};

/** Flag ID to display label mapping */
export const FLAG_LABELS: Record<FeatureFlagId, string> = {
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
  [FEATURE_FLAG_IDS.PROFILE_VERIFICATION]: "Profile Verification",
  [FEATURE_FLAG_IDS.PROFILE_REPORTED_ISSUES]: "Profile Reported Issues",
  [FEATURE_FLAG_IDS.PROFILE_MY_PROPERTY]: "Profile My Property",
};

/** Group flags by category */
export const FLAG_GROUPS = {
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
  profile: [
    FEATURE_FLAG_IDS.PROFILE_VERIFICATION,
    FEATURE_FLAG_IDS.PROFILE_REPORTED_ISSUES,
    FEATURE_FLAG_IDS.PROFILE_MY_PROPERTY,
  ],
} as const;

export type FlagGroup = keyof typeof FLAG_GROUPS;
