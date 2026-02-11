'use client';

import { memo, useState, useCallback, useRef, useEffect } from 'react';
import { sendMissingReportsEmail } from '@/lib/actions/alerts';

// Toast notification component (same as before)
const Toast = memo(({ 
  message, 
  type, 
  onClose 
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

// Spinner component (same as before)
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

export const AlertButton = memo(function AlertButton() {
  const [isSending, setIsSending] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const lastClickRef = useRef<number>(0);

  const handleSendAlert = useCallback(async () => {
    // Prevent rapid double-clicks (debounce 1 second)
    const now = Date.now();
    if (now - lastClickRef.current < 1000) {
      return;
    }
    lastClickRef.current = now;

    setIsSending(true);
    setNotification(null);

    try {
      const result = await sendMissingReportsEmail();

      if (result.success) {
        setNotification({
          message: 'message' in result ? result.message : 'Alert email sent successfully to all admins',
          type: 'success',
        });
      } else {
        // Handle error - check for error property or message property
        const errorMessage = 
          'error' in result && result.error
            ? typeof result.error === 'string' 
              ? result.error 
              : 'Failed to send alert email'
            : 'message' in result 
              ? result.message 
              : 'Failed to send alert email. Please try again.';
        
        setNotification({
          message: errorMessage,
          type: 'error',
        });
      }
    } catch (error) {
      setNotification({
        message: 'An unexpected error occurred. Please try again.',
        type: 'error',
      });
    } finally {
      setIsSending(false);
    }
  }, []);

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

      {/* Alert Button */}
      <button
        onClick={handleSendAlert}
        disabled={isSending}
        className="
          inline-flex items-center justify-center gap-2
          px-4 py-2 sm:px-5 sm:py-2.5
          min-h-[44px]
          rounded-lg
          bg-orange-600 text-white
          text-sm font-medium
          shadow-sm hover:shadow
          hover:bg-orange-700
          active:bg-orange-800
          focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-150
          active:scale-[0.97]
          touch-manipulation select-none
        "
        aria-busy={isSending}
        aria-label={isSending ? 'Sending alert email' : 'Send alert email to admins'}
      >
        {isSending ? (
          <>
            <Spinner />
            <span>Sending...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="hidden sm:inline">Send Alert Email</span>
            <span className="sm:hidden">Send Alert</span>
          </>
        )}
      </button>
    </>
  );
});

// Alternative compact version for mobile toolbars
export const AlertButtonCompact = memo(function AlertButtonCompact() {
  const [isSending, setIsSending] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const lastClickRef = useRef<number>(0);

  const handleSendAlert = useCallback(async () => {
    const now = Date.now();
    if (now - lastClickRef.current < 1000) return;
    lastClickRef.current = now;

    setIsSending(true);
    setNotification(null);

    try {
      const result = await sendMissingReportsEmail();

      if (result.success) {
        setNotification({
          message: 'Alert sent successfully',
          type: 'success',
        });
      } else {
        const errorMessage = 
          'error' in result && result.error
            ? typeof result.error === 'string' 
              ? result.error 
              : 'Failed to send alert'
            : 'Failed to send alert';
        
        setNotification({
          message: errorMessage,
          type: 'error',
        });
      }
    } catch (error) {
      setNotification({
        message: 'Error sending alert',
        type: 'error',
      });
    } finally {
      setIsSending(false);
    }
  }, []);

  const closeNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return (
    <>
      {notification && (
        <Toast
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}

      <button
        onClick={handleSendAlert}
        disabled={isSending}
        className="
          inline-flex items-center justify-center
          w-10 h-10
          rounded-full
          bg-orange-600 text-white
          hover:bg-orange-700
          active:bg-orange-800
          focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-150
          active:scale-[0.97]
          touch-manipulation
          shadow-sm hover:shadow
        "
        aria-label={isSending ? 'Sending alert' : 'Send alert email'}
        title={isSending ? 'Sending alert' : 'Send alert email'}
      >
        {isSending ? (
          <Spinner />
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        )}
      </button>
    </>
  );
});

// Full-width mobile version
export const AlertButtonFullWidth = memo(function AlertButtonFullWidth() {
  const [isSending, setIsSending] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const lastClickRef = useRef<number>(0);

  const handleSendAlert = useCallback(async () => {
    const now = Date.now();
    if (now - lastClickRef.current < 1000) return;
    lastClickRef.current = now;

    setIsSending(true);
    setNotification(null);

    try {
      const result = await sendMissingReportsEmail();

      if (result.success) {
        setNotification({
          message: 'message' in result ? result.message : 'Alert email sent successfully to all admins',
          type: 'success',
        });
      } else {
        const errorMessage = 
          'error' in result && result.error
            ? typeof result.error === 'string' 
              ? result.error 
              : 'Failed to send alert'
            : 'message' in result 
              ? result.message 
              : 'Failed to send alert. Please try again.';
        
        setNotification({
          message: errorMessage,
          type: 'error',
        });
      }
    } catch (error) {
      setNotification({
        message: 'An error occurred. Please try again.',
        type: 'error',
      });
    } finally {
      setIsSending(false);
    }
  }, []);

  const closeNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return (
    <>
      {notification && (
        <Toast
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}

      <button
        onClick={handleSendAlert}
        disabled={isSending}
        className="
          w-full
          inline-flex items-center justify-center gap-2
          px-6 py-3
          min-h-[48px]
          rounded-lg
          bg-orange-600 text-white
          text-base font-medium
          shadow-sm hover:shadow-md
          hover:bg-orange-700
          active:bg-orange-800
          focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-150
          active:scale-[0.98]
          touch-manipulation select-none
        "
        aria-busy={isSending}
      >
        {isSending ? (
          <>
            <Spinner />
            <span>Sending Alert...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>Send Alert to Admins</span>
          </>
        )}
      </button>
    </>
  );
});