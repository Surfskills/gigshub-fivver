import { memo, useMemo } from 'react';

interface ITSupportLeaderboardProps {
  data: {
    name: string;
    email: string;
    reportsSubmitted: number;
  }[];
}

// Memoized rank badge component
const RankBadge = memo(({ rank }: { rank: number }) => {
  const getBadgeStyles = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          bg: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
          text: 'text-white',
          icon: '🥇',
          ring: 'ring-2 ring-yellow-400 ring-offset-2'
        };
      case 2:
        return {
          bg: 'bg-gradient-to-br from-gray-300 to-gray-500',
          text: 'text-white',
          icon: '🥈',
          ring: 'ring-2 ring-gray-400 ring-offset-2'
        };
      case 3:
        return {
          bg: 'bg-gradient-to-br from-orange-400 to-orange-600',
          text: 'text-white',
          icon: '🥉',
          ring: 'ring-2 ring-orange-400 ring-offset-2'
        };
      default:
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          icon: '',
          ring: ''
        };
    }
  };

  const styles = getBadgeStyles(rank);

  return (
    <span className={`
      flex h-7 w-7 sm:h-8 sm:w-8 shrink-0
      items-center justify-center rounded-full 
      text-xs sm:text-sm font-bold
      ${styles.bg} ${styles.text} ${styles.ring}
      transition-transform hover:scale-110
    `}>
      {styles.icon || rank}
    </span>
  );
});
RankBadge.displayName = 'RankBadge';

// Memoized leaderboard row
const LeaderboardRow = memo(({ 
  analyst, 
  rank 
}: { 
  analyst: { name: string; email: string; reportsSubmitted: number }; 
  rank: number;
}) => (
  <>
    {/* Mobile Card Layout */}
    <div className="sm:hidden border-b last:border-b-0 p-3 hover:bg-gray-50 active:bg-gray-100 transition-colors">
      <div className="flex items-start gap-3 mb-2">
        <RankBadge rank={rank} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm sm:text-base truncate mb-0.5">
            {analyst.name}
          </p>
          <p className="text-xs text-gray-600 truncate">
            {analyst.email}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[10px] text-gray-500 mb-0.5">Reports</p>
          <p className="font-bold text-lg text-blue-600">
            {analyst.reportsSubmitted}
          </p>
        </div>
      </div>
    </div>

    {/* Desktop Table Row */}
    <tr className="hidden sm:table-row border-b hover:bg-gray-50 transition-colors">
      <td className="p-3 sm:p-4">
        <RankBadge rank={rank} />
      </td>
      <td className="p-3 sm:p-4">
        <span className="font-semibold truncate block max-w-[200px]">
          {analyst.name}
        </span>
      </td>
      <td className="p-3 sm:p-4 text-gray-600">
        <span className="truncate block max-w-[250px]">
          {analyst.email}
        </span>
      </td>
      <td className="p-3 sm:p-4 text-right">
        <span className="font-bold text-blue-600 tabular-nums">
          {analyst.reportsSubmitted}
        </span>
      </td>
    </tr>
  </>
));
LeaderboardRow.displayName = 'LeaderboardRow';

// Memoized empty state
const EmptyState = memo(() => (
  <div className="rounded-lg border bg-white p-3 sm:p-4 md:p-6">
    <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
      Account Management Analyst Leaderboard
      <span className="block sm:inline text-sm sm:text-base text-gray-500 font-normal sm:ml-1">
        (Last 30 Days)
      </span>
    </h3>
    <div className="flex flex-col items-center justify-center h-[180px] sm:h-[200px] text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
        <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <p className="text-xs sm:text-sm text-gray-500">No leaderboard data available</p>
      <p className="text-[10px] sm:text-xs text-gray-400 mt-1">Submit reports to appear on the leaderboard</p>
    </div>
  </div>
));
EmptyState.displayName = 'EmptyState';

// Memoized podium component for top 3
const TopThreePodium = memo(({ topThree }: { topThree: any[] }) => (
  <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
    <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3 text-center">🏆 Top Performers</h4>
    <div className="flex items-end justify-center gap-2 sm:gap-4">
      {/* 2nd Place */}
      {topThree[1] && (
        <div className="flex flex-col items-center flex-1 max-w-[100px]">
          <RankBadge rank={2} />
          <p className="text-[10px] sm:text-xs font-medium mt-1 truncate w-full text-center">
            {topThree[1].name}
          </p>
          <p className="text-xs sm:text-sm font-bold text-gray-700">
            {topThree[1].reportsSubmitted}
          </p>
        </div>
      )}
      
      {/* 1st Place */}
      {topThree[0] && (
        <div className="flex flex-col items-center flex-1 max-w-[100px] -mt-4">
          <RankBadge rank={1} />
          <p className="text-[11px] sm:text-sm font-semibold mt-1 truncate w-full text-center">
            {topThree[0].name}
          </p>
          <p className="text-sm sm:text-base font-bold text-blue-600">
            {topThree[0].reportsSubmitted}
          </p>
        </div>
      )}
      
      {/* 3rd Place */}
      {topThree[2] && (
        <div className="flex flex-col items-center flex-1 max-w-[100px]">
          <RankBadge rank={3} />
          <p className="text-[10px] sm:text-xs font-medium mt-1 truncate w-full text-center">
            {topThree[2].name}
          </p>
          <p className="text-xs sm:text-sm font-bold text-gray-700">
            {topThree[2].reportsSubmitted}
          </p>
        </div>
      )}
    </div>
  </div>
));
TopThreePodium.displayName = 'TopThreePodium';

export const ITSupportLeaderboard = memo(({ data }: ITSupportLeaderboardProps) => {
  // Memoize top three
  const topThree = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.slice(0, 3);
  }, [data]);

  // Early return for empty state
  if (!data || data.length === 0) {
    return <EmptyState />;
  }

  const showPodium = data.length >= 3;

  return (
    <div className="rounded-lg border bg-white overflow-hidden">
      {/* Header */}
      <div className="p-3 sm:p-4 md:p-6 border-b bg-gray-50/50">
        <h3 className="text-base sm:text-lg font-semibold">
          Account Management Analyst Leaderboard
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Last 30 Days • {data.length} {data.length === 1 ? 'analyst' : 'analysts'}
        </p>
      </div>

      <div className="p-3 sm:p-4 md:p-6">
        {/* Top 3 Podium (optional) */}
        {showPodium && <TopThreePodium topThree={topThree} />}

        {/* Mobile Card List */}
        <div className="sm:hidden">
          {data.map((analyst, idx) => (
            <LeaderboardRow key={analyst.email} analyst={analyst} rank={idx + 1} />
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50/80">
                <th className="text-left p-3 sm:p-4 font-semibold text-gray-700 text-xs sm:text-sm w-16">
                  Rank
                </th>
                <th className="text-left p-3 sm:p-4 font-semibold text-gray-700 text-xs sm:text-sm">
                  Analyst
                </th>
                <th className="text-left p-3 sm:p-4 font-semibold text-gray-700 text-xs sm:text-sm">
                  Email
                </th>
                <th className="text-right p-3 sm:p-4 font-semibold text-gray-700 text-xs sm:text-sm">
                  Reports
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((analyst, idx) => (
                <LeaderboardRow key={analyst.email} analyst={analyst} rank={idx + 1} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

ITSupportLeaderboard.displayName = 'ITSupportLeaderboard';