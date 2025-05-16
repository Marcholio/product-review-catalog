/**
 * Combines class names conditionally
 * 
 * @param classes - Array of class strings or objects with boolean conditions
 * @returns Combined class string
 * 
 * @example
 * // Returns "btn btn-primary" 
 * classNames('btn', 'btn-primary')
 * 
 * @example
 * // Returns "btn btn-primary" when isActive is true, otherwise "btn"
 * classNames('btn', { 'btn-primary': isActive })
 * 
 * @example
 * // Filters out falsy values
 * classNames('btn', null, undefined, 0, false, 'btn-secondary')
 * // Returns "btn btn-secondary"
 */
export function classNames(...classes: (string | number | boolean | undefined | null | { [key: string]: any })[]): string {
  return classes
    .filter(Boolean)
    .map((cls) => {
      if (typeof cls === 'object') {
        return Object.keys(cls)
          .filter(key => cls[key])
          .join(' ');
      }
      return cls;
    })
    .join(' ');
}

/**
 * Truncates text with ellipsis after a certain number of characters
 * 
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Formats a price number to a currency string
 * 
 * @param price - The price to format
 * @param currency - The currency symbol/code (default: '€')
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted price string
 */
export function formatPrice(price: number | string, currency = '€', decimals = 2): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return `${currency}${numPrice.toFixed(decimals)}`;
}

export default {
  classNames,
  truncateText,
  formatPrice,
};