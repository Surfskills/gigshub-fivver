'use client';

import { useState } from 'react';
import { AccountsCreatedForm } from '@/components/forms/accounts-created-form';
import { AccountsCreatedList } from '@/components/accounts-created-list';

type SubTab = 'add' | 'view';

export function AccountsCreatedSection() {
  const [subTab, setSubTab] = useState<SubTab>('add');

  return (
    <div className="space-y-4">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-4" aria-label="Accounts Created tabs">
          <button
            type="button"
            onClick={() => setSubTab('add')}
            className={`border-b-2 py-2 text-sm font-medium ${
              subTab === 'add' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Add new
          </button>
          <button
            type="button"
            onClick={() => setSubTab('view')}
            className={`border-b-2 py-2 text-sm font-medium ${
              subTab === 'view' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            View all
          </button>
        </nav>
      </div>

      {subTab === 'add' && <AccountsCreatedForm />}
      {subTab === 'view' && <AccountsCreatedList />}
    </div>
  );
}
