import type { AccountLevel } from '@prisma/client';

export const ACCOUNT_LEVEL_LABELS: Record<AccountLevel, string> = {
  starter: 'Starter',
  level1: 'Level 1',
  level2: 'Level 2',
  proRated: 'Pro Rated',
  fivverVetted: 'Fivver Vetted',
};

export const ACCOUNT_LEVEL_STYLES: Record<AccountLevel, string> = {
  starter: 'bg-gray-100 text-gray-800',
  level1: 'bg-blue-100 text-blue-800',
  level2: 'bg-indigo-100 text-indigo-800',
  proRated: 'bg-amber-100 text-amber-800',
  fivverVetted: 'bg-emerald-100 text-emerald-800',
};

export function formatAccountLevel(level: AccountLevel): string {
  return ACCOUNT_LEVEL_LABELS[level] ?? level;
}

export function getAccountLevelStyle(level: AccountLevel): string {
  return ACCOUNT_LEVEL_STYLES[level] ?? 'bg-gray-100 text-gray-800';
}
