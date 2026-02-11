/** Build reports history URL with account + date range pre-filled */
export function reportsHistoryUrl(accountId: string): string {
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const params = new URLSearchParams();
  params.set('accountId', accountId);
  params.set('startDate', thirtyDaysAgo);
  params.set('endDate', today);
  return `/reports/history?${params.toString()}`;
}
