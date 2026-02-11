import { memo, useMemo } from 'react';

interface MissingAccount {
  id: string;
  username: string;
  platform: string;
  missingShifts: string[];
}

interface MissingReportsCardProps {
  items: MissingAccount[];
}

// Memoized shift badge component
const ShiftBadge = memo(({ shift }: { shift: string }) => (
  <span className="
    inline-flex items-center justify-center
    rounded-md bg-orange-100 
    px-2 py-1 sm:px-2.5 sm:py-1
    text-[10px] sm:text-xs font-semibold 
    text-orange-800
    whitespace-nowrap
    transition-colors hover:bg-orange-200
  ">
    {shift}
  </span>
));
ShiftBadge.displayName = 'ShiftBadge';

// Memoized missing account row
const MissingAccountRow = memo(({ account }: { account: MissingAccount }) => (
  <div className="
    flex flex-col sm:flex-row sm:items-center sm:justify-between 
    gap-2 sm:gap-4
    rounded-lg bg-white 
    p-3 sm:p-4
    border border-orange-100
    hover:border-orange-200 hover:shadow-sm
    transition-all duration-200
  ">
    {/* Account Info */}
    <div className="flex-1 min-w-0">
      <div className="font-semibold text-sm sm:text-base text-gray-900 truncate">
        {account.username}
      </div>
      <div className="text-xs sm:text-sm text-gray-600 truncate mt-0.5">
        {account.platform}
      </div>
    </div>

    {/* Missing Shifts */}
    <div className="flex flex-wrap gap-1.5 sm:gap-2 sm:shrink-0">
      {account.missingShifts.map((shift) => (
        <ShiftBadge key={shift} shift={shift} />
      ))}
    </div>
  </div>
));
MissingAccountRow.displayName = 'MissingAccountRow';

// Memoized success state
const SuccessState = memo(() => (
  <div className="
    rounded-lg border-2 border-emerald-200 
    bg-gradient-to-br from-emerald-50 to-green-50 
    p-4 sm:p-5 md:p-6
    transition-all duration-200
    hover:shadow-md
  ">
    <div className="flex items-start gap-3 sm:gap-4">
      {/* Success Icon */}
      <div className="shrink-0">
        <div className="
          flex items-center justify-center 
          w-10 h-10 sm:w-12 sm:h-12 
          rounded-full 
          bg-emerald-100 
          ring-4 ring-emerald-50
        ">
          <svg 
            className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2.5} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
        </div>
      </div>

      {/* Success Message */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm sm:text-base text-emerald-900 mb-1">
          All Reports Submitted ✓
        </p>
        <p className="text-xs sm:text-sm text-emerald-700">
          All shift reports have been submitted for today. Great work!
        </p>
      </div>
    </div>
  </div>
));
SuccessState.displayName = 'SuccessState';

// Memoized header component
const MissingReportsHeader = memo(({ count }: { count: number }) => (
  <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4">
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Warning Icon */}
      <div className="shrink-0">
        <div className="
          flex items-center justify-center 
          w-8 h-8 sm:w-10 sm:h-10 
          rounded-full 
          bg-orange-200
        ">
          <svg 
            className="w-4 h-4 sm:w-5 sm:h-5 text-orange-700" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
        </div>
      </div>

      {/* Title */}
      <div>
        <h2 className="text-base sm:text-lg font-bold text-orange-900">
          Missing Reports
        </h2>
        <p className="text-xs sm:text-sm text-orange-700">
          {count} {count === 1 ? 'account needs' : 'accounts need'} attention
        </p>
      </div>
    </div>

    {/* Count Badge */}
    <div className="shrink-0">
      <span className="
        inline-flex items-center justify-center
        min-w-[32px] sm:min-w-[40px] h-8 sm:h-10
        px-2 sm:px-3
        rounded-full 
        bg-orange-200 
        text-sm sm:text-base font-bold 
        text-orange-900
        tabular-nums
      ">
        {count}
      </span>
    </div>
  </div>
));
MissingReportsHeader.displayName = 'MissingReportsHeader';

export const MissingReportsCard = memo(({ items }: MissingReportsCardProps) => {
  // Memoize total missing shifts count
  const totalMissingShifts = useMemo(
    () => items.reduce((sum, account) => sum + account.missingShifts.length, 0),
    [items]
  );

  // Success state - all reports submitted
  if (items.length === 0) {
    return <SuccessState />;
  }

  return (
    <div className="
      rounded-lg border-2 border-orange-300 
      bg-gradient-to-br from-orange-50 to-amber-50 
      p-3 sm:p-4 md:p-6
      shadow-sm
    ">
      {/* Header */}
      <MissingReportsHeader count={items.length} />

      {/* Stats Bar (Mobile) */}
      <div className="sm:hidden mb-3 p-2 bg-white/60 rounded-md border border-orange-100">
        <p className="text-xs text-orange-800 text-center">
          <span className="font-semibold">{totalMissingShifts}</span> total missing {totalMissingShifts === 1 ? 'shift' : 'shifts'}
        </p>
      </div>

      {/* Missing Accounts List */}
      <div className="space-y-2 sm:space-y-3">
        {items.map((account) => (
          <MissingAccountRow key={account.id} account={account} />
        ))}
      </div>

      {/* Footer Stats (Desktop) */}
      <div className="hidden sm:block mt-4 pt-3 border-t border-orange-200">
        <p className="text-xs sm:text-sm text-orange-800 text-center">
          Total missing shifts: <span className="font-bold">{totalMissingShifts}</span>
        </p>
      </div>
    </div>
  );
});

MissingReportsCard.displayName = 'MissingReportsCard';