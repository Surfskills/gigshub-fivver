'use client';

import { memo, useState, useCallback, useEffect } from 'react';
import { updateGig } from '@/lib/actions/gigs';
import { GIG_TYPES } from '@/lib/gig-types';

const RATING_TYPES = ['client', 'paypal', 'cash'] as const;
type RatingType = (typeof RATING_TYPES)[number];

type Gig = {
  id: string;
  name: string;
  type: string;
  status: string;
  rated: boolean;
  lastRatedDate: Date | null;
  nextPossibleRateDate: Date | null;
  ratingType?: string | null;
  ratingEmail?: string | null;
};

interface GigRatingEditProps {
  gig: Gig;
}

// Helper function
function toDateInputValue(d: Date | null): string {
  if (!d) return '';
  const date = new Date(d);
  return date.toISOString().split('T')[0];
}

// Format date for display
function formatDate(date: Date | null): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Loading spinner
const Spinner = memo(() => (
  <svg
    className="animate-spin w-4 h-4"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
));

Spinner.displayName = 'Spinner';

// Toast notification
const Toast = memo(({
  message,
  type,
  onClose,
}: {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: (
      <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
  };

  const styles = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
  };

  return (
    <div
      className={`
        fixed top-4 right-4 left-4 sm:left-auto sm:min-w-[320px] sm:max-w-md
        flex items-center gap-3 p-4 rounded-lg border shadow-lg
        ${styles[type]}
        animate-in slide-in-from-top-5 fade-in duration-300
        z-50
      `}
      role="alert"
    >
      {icons[type]}
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 hover:opacity-70 transition-opacity"
        aria-label="Close notification"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
});

Toast.displayName = 'Toast';

// Status badge
const StatusBadge = memo(({ status }: { status: string }) => {
  const variants: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-800',
    INACTIVE: 'bg-gray-100 text-gray-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    SUSPENDED: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium uppercase ${variants[status.toUpperCase()] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
});

StatusBadge.displayName = 'StatusBadge';

// Custom checkbox
const Checkbox = memo(({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}) => {
  return (
    <label className="flex items-center gap-3 cursor-pointer touch-manipulation select-none">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only peer"
        />
        <div
          className={`
            w-10 h-10 sm:w-5 sm:h-5
            rounded border-2 transition-all
            peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-2
            peer-disabled:opacity-50 peer-disabled:cursor-not-allowed
            ${
              checked
                ? 'bg-blue-600 border-blue-600'
                : 'bg-white border-gray-300 peer-hover:border-gray-400'
            }
          `}
        >
          {checked && (
            <svg
              className="w-full h-full text-white p-1 sm:p-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
      <span className="text-sm font-medium text-gray-900">{label}</span>
    </label>
  );
});

Checkbox.displayName = 'Checkbox';

export const GigRatingEdit = memo(function GigRatingEdit({ gig }: GigRatingEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(gig.name);
  const [type, setType] = useState(gig.type);
  const [status, setStatus] = useState(gig.status);
  const [rated, setRated] = useState(gig.rated);
  const [lastRatedDate, setLastRatedDate] = useState(toDateInputValue(gig.lastRatedDate));
  const [nextPossibleRateDate, setNextPossibleRateDate] = useState(
    toDateInputValue(gig.nextPossibleRateDate)
  );
  const [ratingType, setRatingType] = useState<string>(gig.ratingType || '');
  const [ratingEmail, setRatingEmail] = useState<string>(gig.ratingEmail || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNotification(null);

    try {
      const result = await updateGig(gig.id, {
        name: name.trim(),
        type: type.trim(),
        status: status as 'active' | 'paused' | 'deprecated',
        rated,
        lastRatedDate: rated && lastRatedDate ? lastRatedDate : null,
        nextPossibleRateDate: rated && nextPossibleRateDate ? nextPossibleRateDate : null,
        ratingType: rated && ratingType ? (ratingType as RatingType) : null,
        ratingEmail: rated && ratingType === 'paypal' ? ratingEmail.trim() || null : null,
      });

      if (result.success) {
        setNotification({
          message: 'Gig updated successfully',
          type: 'success',
        });
        setIsEditing(false);
      } else {
        setNotification({
          message: result.error || 'Failed to update gig',
          type: 'error',
        });
      }
    } catch (error) {
      setNotification({
        message: 'An unexpected error occurred',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [gig.id, name, type, status, rated, lastRatedDate, nextPossibleRateDate, ratingType, ratingEmail]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setName(gig.name);
    setType(gig.type);
    setStatus(gig.status);
    setRated(gig.rated);
    setLastRatedDate(toDateInputValue(gig.lastRatedDate));
    setNextPossibleRateDate(toDateInputValue(gig.nextPossibleRateDate));
    setRatingType(gig.ratingType || '');
    setRatingEmail(gig.ratingEmail || '');
    setNotification(null);
  }, [gig.name, gig.type, gig.status, gig.rated, gig.lastRatedDate, gig.nextPossibleRateDate, gig.ratingType, gig.ratingEmail]);

  const closeNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return (
    <>
      {/* Toast Notification */}
      {notification && (
        <Toast
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}

      {/* Card */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="p-4 sm:p-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-base sm:text-sm truncate">
                {gig.name}
              </h3>
              <p className="text-sm sm:text-xs text-gray-600 mt-0.5">{gig.type}</p>
            </div>
            <StatusBadge status={gig.status} />
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-3">
          {!isEditing ? (
            <div className="space-y-3">
              {/* Gig info */}
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium text-gray-700">Type:</span> {gig.type}</p>
                {Boolean(gig.rated && (gig.lastRatedDate || gig.nextPossibleRateDate)) && (
                <div className="space-y-2 p-3 bg-blue-50 rounded-lg">
                  {gig.lastRatedDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-700">
                        <span className="font-medium">Rated:</span> {formatDate(gig.lastRatedDate)}
                      </span>
                    </div>
                  )}
                  {gig.nextPossibleRateDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-700">
                        <span className="font-medium">Next rate:</span> {formatDate(gig.nextPossibleRateDate)}
                      </span>
                    </div>
                  )}
                  {gig.ratingType && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-700">
                        <span className="font-medium">Type:</span> {gig.ratingType.charAt(0).toUpperCase() + gig.ratingType.slice(1)}
                        {gig.ratingType === 'paypal' && gig.ratingEmail && (
                          <span className="ml-1">({gig.ratingEmail})</span>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              )}

              </div>

              {/* Edit button */}
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="
                  w-full sm:w-auto
                  inline-flex items-center justify-center gap-2
                  px-4 py-2.5 sm:px-3 sm:py-2
                  min-h-[44px] sm:min-h-[36px]
                  bg-white border border-gray-300 rounded-lg
                  text-sm font-medium text-gray-700
                  hover:bg-gray-50 active:bg-gray-100
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  transition-all
                  active:scale-[0.97]
                  touch-manipulation
                "
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Gig
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name & Type */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gig Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                    required
                    className="w-full px-4 py-3 sm:px-3 sm:py-2 min-h-[48px] sm:min-h-[36px] border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    disabled={isSubmitting}
                    required
                    className="w-full px-4 py-3 sm:px-3 sm:py-2 min-h-[48px] sm:min-h-[36px] border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-50"
                  >
                    {!GIG_TYPES.includes(type as (typeof GIG_TYPES)[number]) && (
                      <option value={type}>{type} (legacy)</option>
                    )}
                    {GIG_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 sm:px-3 sm:py-2 min-h-[48px] sm:min-h-[36px] border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-50"
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="deprecated">Deprecated</option>
                  </select>
                </div>
              </div>

              {/* Rated checkbox */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <Checkbox
                  checked={rated}
                  onChange={setRated}
                  label="This is a rated gig"
                  disabled={isSubmitting}
                />
              </div>

              {/* Date inputs */}
              {rated && (
                <div className="space-y-4 animate-in slide-in-from-top-2 fade-in duration-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date Rated
                    </label>
                    <input
                      type="date"
                      value={lastRatedDate}
                      onChange={(e) => setLastRatedDate(e.target.value)}
                      disabled={isSubmitting}
                      className="
                        w-full
                        px-4 py-3 sm:px-3 sm:py-2
                        min-h-[48px] sm:min-h-[36px]
                        border border-gray-300 rounded-lg
                        text-sm
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        disabled:opacity-50 disabled:bg-gray-50
                        transition-all
                        touch-manipulation
                      "
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Next Possible Rate Date
                    </label>
                    <input
                      type="date"
                      value={nextPossibleRateDate}
                      onChange={(e) => setNextPossibleRateDate(e.target.value)}
                      disabled={isSubmitting}
                      className="
                        w-full
                        px-4 py-3 sm:px-3 sm:py-2
                        min-h-[48px] sm:min-h-[36px]
                        border border-gray-300 rounded-lg
                        text-sm
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        disabled:opacity-50 disabled:bg-gray-50
                        transition-all
                        touch-manipulation
                      "
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating Type
                    </label>
                    <select
                      value={ratingType}
                      onChange={(e) => setRatingType(e.target.value)}
                      disabled={isSubmitting}
                      className="
                        w-full
                        px-4 py-3 sm:px-3 sm:py-2
                        min-h-[48px] sm:min-h-[36px]
                        border border-gray-300 rounded-lg
                        text-sm
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        disabled:opacity-50 disabled:bg-gray-50
                        transition-all
                        touch-manipulation
                      "
                    >
                      <option value="">— Select type —</option>
                      {RATING_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {ratingType === 'paypal' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        PayPal Email
                      </label>
                      <input
                        type="email"
                        value={ratingEmail}
                        onChange={(e) => setRatingEmail(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="e.g., user@example.com"
                        className="
                          w-full
                          px-4 py-3 sm:px-3 sm:py-2
                          min-h-[48px] sm:min-h-[36px]
                          border border-gray-300 rounded-lg
                          text-sm
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          disabled:opacity-50 disabled:bg-gray-50
                          transition-all
                          touch-manipulation
                        "
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="
                    flex-1
                    inline-flex items-center justify-center gap-2
                    px-4 py-3 sm:px-3 sm:py-2
                    min-h-[48px] sm:min-h-[36px]
                    border border-gray-300 rounded-lg
                    text-sm font-medium text-gray-700
                    bg-white
                    hover:bg-gray-50 active:bg-gray-100
                    focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all
                    active:scale-[0.97]
                    touch-manipulation
                  "
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="
                    flex-1
                    inline-flex items-center justify-center gap-2
                    px-4 py-3 sm:px-3 sm:py-2
                    min-h-[48px] sm:min-h-[36px]
                    bg-blue-600 text-white rounded-lg
                    text-sm font-medium
                    hover:bg-blue-700 active:bg-blue-800
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all
                    active:scale-[0.97]
                    touch-manipulation
                    shadow-sm
                  "
                >
                  {isSubmitting ? (
                    <>
                      <Spinner />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
});