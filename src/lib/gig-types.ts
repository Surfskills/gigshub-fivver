/**
 * Supported gig types for the platform.
 * Used in gig forms and gig editing.
 */
export const GIG_TYPES = [
  'APA/MLA',
  'SYSTEMATIC REVIEW & META ANALYSIS',
  'TRINETX',
  'TECH(AI | SOFTWARE DEV)',
  'BUSINESS SERVICES',
] as const;

export type GigType = (typeof GIG_TYPES)[number];
