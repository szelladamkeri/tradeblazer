import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

/**
 * Formats a number as currency according to the current locale.
 * @param value - The number to format.
 * @param currencyCode - The ISO 4217 currency code (e.g., 'USD', 'EUR', 'HUF'). Defaults to 'USD'.
 * @returns The formatted currency string. Returns an empty string for null/undefined input.
 */
export function useCurrencyFormatter() {
  const { locale } = useI18n();

  const formatCurrency = (
    value: number | null | undefined,
    currencyCode: string = 'USD',
    options?: Intl.NumberFormatOptions
  ): string => {
    if (value === null || value === undefined) {
      // Return a default representation for null/undefined, e.g., $0.00 or just empty
      // For consistency with the previous '0.00', let's format 0.
      value = 0;
    }

    const defaultOptions: Intl.NumberFormatOptions = {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...options,
    };

    try {
      // Use the 'en-US' locale specifically for consistent currency formatting
      return new Intl.NumberFormat('en-US', defaultOptions).format(value);
    } catch (error) {
      console.error('Error formatting currency:', error);
      // Fallback formatting in case of error - use comma separator
      // Format the number part with commas and period for decimal for the fallback as well
      const fallbackFormattedValue = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
      return `${currencyCode} ${fallbackFormattedValue}`; // Keep space for fallback for clarity
    }
  };

  return { formatCurrency };
}

/**
 * Formats a number with thousand separators and optional decimal places.
 * @param value - The number to format.
 * @param options - Intl.NumberFormat options.
 * @returns The formatted number string. Returns an empty string for null/undefined input.
 */
export function useNumberFormatter() {
    const { locale } = useI18n();

    const formatNumber = (
        value: number | null | undefined,
        options?: Intl.NumberFormatOptions
    ): string => {
        if (value === null || value === undefined) {
            return ''; // Or return '0' or handle as needed
        }

        const defaultOptions: Intl.NumberFormatOptions = {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2, // Default, adjust as needed
            ...options,
        };

         try {
            // Use the current i18n locale for formatting
            return new Intl.NumberFormat(locale.value, defaultOptions).format(value);
        } catch (error) {
            console.error('Error formatting number:', error);
            // Fallback formatting
            return String(value);
        }
    };

    return { formatNumber };
}
