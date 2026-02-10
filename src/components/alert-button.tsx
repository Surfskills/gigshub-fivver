'use client';

import { useState } from 'react';
import { sendMissingReportsEmail } from '@/lib/actions/alerts';

export function AlertButton() {
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSendAlert() {
    setIsSending(true);
    setMessage(null);

    const result = await sendMissingReportsEmail();

    if (result.success) {
      setMessage('✓ Alert sent to admins');
    } else {
      setMessage('✗ Failed to send alert');
    }

    setIsSending(false);

    setTimeout(() => setMessage(null), 3000);
  }

  return (
    <div className="flex items-center gap-3">
      {message && (
        <span className={`text-sm ${message.includes('✓') ? 'text-green-600' : 'text-red-600'}`}>{message}</span>
      )}
      <button
        onClick={handleSendAlert}
        disabled={isSending}
        className="rounded bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
      >
        {isSending ? 'Sending...' : '📧 Send Alert Email'}
      </button>
    </div>
  );
}
