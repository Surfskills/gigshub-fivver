'use client';

import { useState, useCallback } from 'react';

interface CopyableValueProps {
  value: string | null | undefined;
  placeholder?: string;
  className?: string;
}

export function CopyableValue({ value, placeholder = '—', className = '' }: CopyableValueProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = value;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [value]);

  const displayValue = value ?? placeholder;
  const canCopy = !!value;

  return (
    <div className={`flex items-center gap-2 min-w-0 ${className}`}>
      <span className="truncate flex-1 font-semibold" title={value ?? undefined}>
        {displayValue}
      </span>
      {canCopy && (
        <button
          type="button"
          onClick={handleCopy}
          className="flex-shrink-0 p-1.5 rounded text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          title={copied ? 'Copied!' : 'Copy'}
          aria-label={copied ? 'Copied!' : 'Copy to clipboard'}
        >
          {copied ? (
            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}
