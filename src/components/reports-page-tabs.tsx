'use client';

import { useState } from 'react';
import { ReportsSubmissionSection } from '@/components/reports-submission-section';
import { AccountsCreatedSection } from '@/components/accounts-created-section';

type Account = { id: string; platform: string; username: string };

interface ReportsPageTabsProps {
  accounts: Account[];
  isAdmin?: boolean;
}

type TabType = 'shift' | 'accounts-created';

export function ReportsPageTabs({ accounts, isAdmin = false }: ReportsPageTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('shift');

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6" aria-label="Tabs">
          <button
            type="button"
            onClick={() => setActiveTab('shift')}
            className={`border-b-2 py-3 text-sm font-medium ${activeTab === 'shift' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}
          >
            Shift Reports
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('accounts-created')}
            className={`border-b-2 py-3 text-sm font-medium ${activeTab === 'accounts-created' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}
          >
            Accounts Created
          </button>
        </nav>
      </div>

      {activeTab === 'shift' && <ReportsSubmissionSection accounts={accounts} isAdmin={isAdmin} />}
      {activeTab === 'accounts-created' && <AccountsCreatedSection isAdmin={isAdmin} />}
    </div>
  );
}
