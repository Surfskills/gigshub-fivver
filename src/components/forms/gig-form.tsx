'use client';

import { memo, useState, useCallback, useMemo } from 'react';
import { SubmitButton } from '@/components/ui/submit-button';
import { GIG_TYPES } from '@/lib/gig-types';

interface GigFormProps {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel?: string;
  defaultValues?: {
    name?: string;
    type?: string;
    rated?: boolean;
    lastRatedDate?: string;
    nextPossibleRateDate?: string;
    ratingType?: string;
    ratingEmail?: string;
  };
}

// Memoized form field component
const FormField = memo(({
  label,
  name,
  type = 'text',
  required = false,
  defaultValue,
  placeholder,
  helpText,
  children,
}: {
  label: string;
  name: string;
  type?: 'text' | 'date' | 'select';
  required?: boolean;
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
        placeholder={placeholder}
        className={`
          w-full rounded-lg border border-gray-300
          px-3 py-2 sm:py-2.5
          text-sm sm:text-base
          transition-all duration-200
          placeholder:text-gray-400
          focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none
          hover:border-gray-400
          ${type === 'date' ? 'cursor-pointer' : ''}
        `}
      />
    )}
    
    {helpText && (
      <p className="text-[10px] sm:text-xs text-gray-500">
        {helpText}
      </p>
    )}
  </div>
));
FormField.displayName = 'FormField';

// Memoized checkbox component
const CheckboxField = memo(({
  label,
  name,
  checked,
  onChange,
  description,
}: {
  label: string;
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}) => (
  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="relative flex items-center justify-center shrink-0 mt-0.5">
        <input
          type="checkbox"
          name={name}
          value="true"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="
            w-5 h-5 rounded border-2 border-gray-300
            text-blue-600 
            focus:ring-2 focus:ring-blue-200 focus:ring-offset-2
            transition-all duration-200
            cursor-pointer
            group-hover:border-blue-400
          "
        />
      </div>
      <div className="flex-1 min-w-0">
        <span className="block text-sm sm:text-base font-semibold text-gray-900">
          {label}
        </span>
        {description && (
          <span className="block text-[10px] sm:text-xs text-gray-600 mt-0.5">
            {description}
          </span>
        )}
      </div>
    </label>
  </div>
));
CheckboxField.displayName = 'CheckboxField';

const RATING_TYPES = ['client', 'paypal', 'cash'] as const;

// Memoized rated section
const RatedGigSection = memo(({
  lastRatedDate,
  nextPossibleRateDate,
  ratingType,
  ratingEmail,
  onRatingTypeChange,
  onRatingEmailChange,
}: {
  lastRatedDate?: string;
  nextPossibleRateDate?: string;
  ratingType?: string;
  ratingEmail?: string;
  onRatingTypeChange?: (value: string) => void;
  onRatingEmailChange?: (value: string) => void;
}) => (
  <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-3 sm:space-y-4">
    <div className="flex items-start gap-2">
      <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
      <div>
        <p className="text-xs sm:text-sm font-semibold text-blue-900">
          Rated Gig Information
        </p>
        <p className="text-[10px] sm:text-xs text-blue-700 mt-0.5">
          Track when this gig was rated and when it can be rated again
        </p>
      </div>
    </div>

    <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
      <FormField
        label="Date Rated"
        name="lastRatedDate"
        type="date"
        required
        defaultValue={lastRatedDate}
        helpText="When was this gig last rated?"
      />
      <FormField
        label="Next Possible Rate Date"
        name="nextPossibleRateDate"
        type="date"
        required
        defaultValue={nextPossibleRateDate}
        helpText="When can this gig be rated again?"
      />
    </div>

    <div className="space-y-3 sm:space-y-4">
      <div>
        <label htmlFor="ratingType" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
          Rating Type
        </label>
        <select
          id="ratingType"
          name="ratingType"
          value={ratingType ?? ''}
          onChange={(e) => onRatingTypeChange?.(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 sm:py-2.5 text-sm sm:text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
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
        <div className="space-y-1.5">
          <label htmlFor="ratingEmail" className="block text-xs sm:text-sm font-semibold text-gray-700">
            PayPal Email <span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            id="ratingEmail"
            type="email"
            name="ratingEmail"
            value={ratingEmail}
            onChange={(e) => onRatingEmailChange?.(e.target.value)}
            required
            placeholder="e.g., user@example.com"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 sm:py-2.5 text-sm sm:text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
          />
          <p className="text-[10px] sm:text-xs text-gray-500">Email address for PayPal rating</p>
        </div>
      )}
    </div>
  </div>
));
RatedGigSection.displayName = 'RatedGigSection';

export const GigForm = memo(({ 
  action, 
  submitLabel = 'Add Gig', 
  defaultValues 
}: GigFormProps) => {
  const [rated, setRated] = useState(defaultValues?.rated ?? false);
  const [gigType, setGigType] = useState(defaultValues?.type || '');
  const [ratingType, setRatingType] = useState(defaultValues?.ratingType || '');
  const [ratingEmail, setRatingEmail] = useState(defaultValues?.ratingEmail || '');

  // Memoized handlers
  const handleRatedChange = useCallback((checked: boolean) => {
    setRated(checked);
  }, []);

  const handleGigTypeChange = useCallback((value: string) => {
    setGigType(value);
  }, []);

  const handleRatingTypeChange = useCallback((value: string) => {
    setRatingType(value);
    if (value !== 'paypal') setRatingEmail('');
  }, []);

  // Calculate if form is in edit mode
  const isEdit = useMemo(() => !!defaultValues?.name, [defaultValues?.name]);

  return (
    <form action={action} className="space-y-4 sm:space-y-5">
      <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5 md:p-6 shadow-sm space-y-4 sm:space-y-5">
        {/* Header */}
        <div className="pb-3 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-bold text-gray-900">
            {isEdit ? 'Edit Gig' : 'Add New Gig'}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            {isEdit ? 'Update gig information' : 'Fill in the details for your new gig'}
          </p>
        </div>

        {/* Gig Name */}
        <FormField
          label="Gig Name"
          name="name"
          required
          defaultValue={defaultValues?.name}
          placeholder="e.g., Custom REST API Development"
          helpText="A clear, descriptive name for this gig"
        />

        {/* Gig Type */}
        <FormField
          label="Gig Type"
          name="type"
          required
          helpText="Select a category for this gig"
        >
          <div className="space-y-2">
            <select
              id="type"
              name="type"
              value={gigType}
              onChange={(e) => handleGigTypeChange(e.target.value)}
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
              <option value="">Select a type...</option>
              {GIG_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </FormField>

        {/* Rated Checkbox */}
        <CheckboxField
          label="Rated Gig"
          name="rated"
          checked={rated}
          onChange={handleRatedChange}
          description="Check this if the gig has been rated or reviewed on the platform"
        />

        {/* Rated Section (Conditional) */}
        {rated && (
          <RatedGigSection
            lastRatedDate={defaultValues?.lastRatedDate}
            nextPossibleRateDate={defaultValues?.nextPossibleRateDate}
            ratingType={ratingType}
            ratingEmail={ratingEmail}
            onRatingTypeChange={handleRatingTypeChange}
            onRatingEmailChange={setRatingEmail}
          />
        )}

        {/* Submit Button */}
        <div className="pt-4 border-t border-gray-200">
          <SubmitButton 
            pendingLabel={isEdit ? 'Updating...' : 'Adding...'}
            className="w-full sm:w-auto sm:min-w-[160px]"
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
              Gig Rating Information
            </p>
            <p className="text-[10px] sm:text-xs text-blue-800">
              Enable "Rated Gig" to track when this gig was rated and when it can be rated again. This helps manage platform rating cycles.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
});

GigForm.displayName = 'GigForm';