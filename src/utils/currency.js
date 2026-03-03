
/**
 * Formats a number as a currency string.
 * @param {number} amount - The amount to format.
 * @param {string} lang - The language code ('ar' or 'en'). Defaults to 'ar'.
 * @param {string} currency - The currency code. Defaults to 'SAR'.
 * @returns {string} The formatted currency string.
 */
export const formatCurrency = (amount, lang = 'ar', currency = 'SAR') => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '-';
  }

  const locale = lang === 'en' ? 'en-US' : 'ar-SA';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
