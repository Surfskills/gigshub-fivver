import { memo, useMemo } from 'react';
import { AccountStatus, AccountLevel, Platform } from '@prisma/client';
import { SubmitButton } from '@/components/ui/submit-button';

interface AccountFormProps {
  action: (formData: FormData) => void | Promise<void>;
  defaultValues?: {
    platform?: Platform;
    email?: string;
    username?: string;
    typeOfGigs?: string;
    currency?: string;
    status?: AccountStatus;
    accountLevel?: AccountLevel;
    successRate?: number | null;
    browserType?: string | null;
    proxy?: string | null;
  };
  submitLabel?: string;
  isEdit?: boolean;
}

// Platform configuration with icons and labels
const PLATFORM_CONFIG = {
  fiverr: { label: 'Fiverr', icon: '🟢' },
  upwork: { label: 'Upwork', icon: '🔵' },
  direct: { label: 'Direct Client', icon: '💼' },
} as const;

// Account level options
const ACCOUNT_LEVEL_OPTIONS: { value: AccountLevel; label: string }[] = [
  { value: 'starter', label: 'Starter' },
  { value: 'level1', label: 'Level 1' },
  { value: 'level2', label: 'Level 2' },
  { value: 'proRated', label: 'Pro Rated' },
  { value: 'fivverVetted', label: 'Fivver Vetted' },
];

// Status configuration with colors
const STATUS_CONFIG = {
  active: { label: 'Active', color: 'text-emerald-700', bgColor: 'bg-emerald-50' },
  paused: { label: 'Paused', color: 'text-amber-700', bgColor: 'bg-amber-50' },
  risk: { label: 'At Risk', color: 'text-red-700', bgColor: 'bg-red-50' },
} as const;

// Common currencies
const COMMON_CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'] as const;

// Memoized form field component
const FormField = memo(({
  label,
  name,
  type = 'text',
  required = false,
  disabled = false,
  defaultValue,
  placeholder,
  helpText,
  children,
}: {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'select';
  required?: boolean;
  disabled?: boolean;
  defaultValue?: string;
  placeholder?: string;
  helpText?: string;
  children?: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <label htmlFor={name} className="block text-xs sm:text-sm font-semibold text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    
    {children || (
      <input
        id={name}
        type={type}
        name={name}
        defaultValue={defaultValue}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        className={`
          w-full rounded-lg border border-gray-300
          px-3 py-2 sm:py-2.5
          text-sm sm:text-base
          transition-all duration-200
          placeholder:text-gray-400
          focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none
          disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
          hover:border-gray-400
          ${disabled ? '' : 'active:border-blue-600'}
        `}
      />
    )}
    
    {helpText && (
      <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
        {helpText}
      </p>
    )}
    
    {disabled && (
      <p className="text-[10px] sm:text-xs text-amber-600 flex items-center gap-1 mt-1">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        This field cannot be changed
      </p>
    )}
  </div>
));
FormField.displayName = 'FormField';

// Memoized section header
const SectionHeader = memo(({ title, description }: { title: string; description?: string }) => (
  <div className="mb-4 sm:mb-5 pb-3 border-b border-gray-200">
    <h3 className="text-base sm:text-lg font-bold text-gray-900">{title}</h3>
    {description && (
      <p className="text-xs sm:text-sm text-gray-600 mt-1">{description}</p>
    )}
  </div>
));
SectionHeader.displayName = 'SectionHeader';

export const AccountForm = memo(({ 
  action, 
  defaultValues, 
  submitLabel = 'Save Account', 
  isEdit = false 
}: AccountFormProps) => {
  const platforms: Platform[] = useMemo(() => ['fiverr', 'upwork', 'direct'], []);
  const statuses: AccountStatus[] = useMemo(() => ['active', 'paused', 'risk'], []);

  return (
    <form action={action} className="space-y-5 sm:space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5 md:p-6 shadow-sm">
        {/* Header */}
        <SectionHeader 
          title={isEdit ? 'Edit Account' : 'Add New Account'}
          description={isEdit ? 'Update account information' : 'Fill in the details for your new account'}
        />

        {/* Platform & Email Section */}
        <div className="space-y-4 sm:space-y-5 mb-5 sm:mb-6">
          <div className="grid gap-4 sm:gap-5 sm:grid-cols-2">
            {/* Platform */}
            <FormField
              label="Platform"
              name="platform"
              type="select"
              required
              disabled={isEdit}
              helpText={isEdit ? undefined : 'Cannot be changed after creation'}
            >
              <select
                id="platform"
                name="platform"
                defaultValue={defaultValues?.platform ?? 'fiverr'}
                disabled={isEdit}
                className={`
                  w-full rounded-lg border border-gray-300
                  px-3 py-2 sm:py-2.5
                  text-sm sm:text-base
                  transition-all duration-200
                  focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none
                  disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
                  hover:border-gray-400
                  appearance-none bg-[length:16px_16px] bg-[position:right_0.75rem_center] bg-no-repeat
                  ${isEdit ? '' : 'cursor-pointer'}
                `}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`
                }}
              >
                {platforms.map((platform) => (
                  <option key={platform} value={platform}>
                    {PLATFORM_CONFIG[platform].icon} {PLATFORM_CONFIG[platform].label}
                  </option>
                ))}
              </select>
            </FormField>

            {/* Email */}
            <FormField
              label="Email Address"
              name="email"
              type="email"
              required
              disabled={isEdit}
              defaultValue={defaultValues?.email}
              placeholder="account@example.com"
              helpText={isEdit ? undefined : 'Cannot be changed after creation'}
            />
          </div>
        </div>

        {/* Account Details Section */}
        <div className="space-y-4 sm:space-y-5 mb-5 sm:mb-6">
          <div className="grid gap-4 sm:gap-5 sm:grid-cols-2">
            {/* Username */}
            <FormField
              label="Username"
              name="username"
              required
              defaultValue={defaultValues?.username}
              placeholder="your_username"
              helpText="Your public username on the platform"
            />

            {/* Currency */}
            <FormField
              label="Currency"
              name="currency"
              type="select"
              required
              helpText="Primary currency for this account"
            >
              <select
                id="currency"
                name="currency"
                defaultValue={defaultValues?.currency ?? 'USD'}
                required
                className={`
                  w-full rounded-lg border border-gray-300
                  px-3 py-2 sm:py-2.5
                  text-sm sm:text-base
                  transition-all duration-200
                  focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none
                  hover:border-gray-400
                  appearance-none bg-[length:16px_16px] bg-[position:right_0.75rem_center] bg-no-repeat
                  cursor-pointer
                `}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`
                }}
              >
                {COMMON_CURRENCIES.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
                <option value="other">Other</option>
              </select>
            </FormField>
          </div>
        </div>

        {/* Success Rate, Browser, Proxy */}
        <div className="mb-5 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Account Metrics</h4>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField
              label="Success Rate (%)"
              name="successRate"
              placeholder="e.g., 85.5"
              helpText="0-100 percentage"
              defaultValue={defaultValues?.successRate != null ? String(defaultValues.successRate) : undefined}
            />
            <FormField
              label="Browser"
              name="browserType"
              placeholder="e.g., Chrome, Firefox"
              helpText="Browser used for this account"
              defaultValue={defaultValues?.browserType ?? undefined}
            />
            <FormField
              label="Proxy"
              name="proxy"
              placeholder="Proxy configuration"
              helpText="Proxy used for this account"
              defaultValue={defaultValues?.proxy ?? undefined}
            />
          </div>
        </div>

        {/* Type of Gigs */}
        <div className="mb-5 sm:mb-6">
          <FormField
            label="Type of Gigs"
            name="typeOfGigs"
            required
            defaultValue={defaultValues?.typeOfGigs}
            placeholder="e.g., API Development, MVP Building, Full-Stack Development"
            helpText="Comma-separated list of services you offer"
          />
        </div>

        {/* Account Level */}
        <div className="mb-5 sm:mb-6">
          <FormField
            label="Account Level"
            name="accountLevel"
            type="select"
            required
            helpText="Platform seller level (e.g., Starter, Level 1, Fivver Vetted)"
          >
            <select
              id="accountLevel"
              name="accountLevel"
              defaultValue={defaultValues?.accountLevel ?? 'starter'}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 sm:py-2.5 text-sm sm:text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none hover:border-gray-400 appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.75rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '16px 16px',
              }}
            >
              {ACCOUNT_LEVEL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        {/* Status (Edit Mode Only) */}
        {isEdit && (
          <div className="mb-5 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
            <FormField
              label="Account Status"
              name="status"
              type="select"
              required
              helpText="Current operational status of this account"
            >
              <select
                id="status"
                name="status"
                defaultValue={defaultValues?.status ?? 'active'}
                className={`
                  w-full rounded-lg border border-gray-300
                  px-3 py-2 sm:py-2.5
                  text-sm sm:text-base font-semibold
                  transition-all duration-200
                  focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none
                  hover:border-gray-400
                  appearance-none bg-[length:16px_16px] bg-[position:right_0.75rem_center] bg-no-repeat
                  cursor-pointer
                  ${STATUS_CONFIG[defaultValues?.status ?? 'active'].bgColor}
                  ${STATUS_CONFIG[defaultValues?.status ?? 'active'].color}
                `}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`
                }}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_CONFIG[status].label}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4 sm:pt-5 border-t border-gray-200">
          <SubmitButton 
            pendingLabel="Saving..."
            className="w-full sm:w-auto sm:min-w-[200px]"
          >
            {submitLabel}
          </SubmitButton>
        </div>
      </div>

      {/* Info Card */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 sm:p-4">
        <div className="flex gap-2 sm:gap-3">
          <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-xs sm:text-sm font-semibold text-blue-900 mb-1">
              {isEdit ? 'Editing Account' : 'Important Information'}
            </p>
            <p className="text-[10px] sm:text-xs text-blue-800">
              {isEdit 
                ? 'Platform and email cannot be changed once the account is created. If you need to change these, please create a new account.'
                : 'Once created, platform and email cannot be modified. Please ensure all information is correct before saving.'}
            </p>
          </div>
        </div>
      </div>
    </form>
  );
});

AccountForm.displayName = 'AccountForm';