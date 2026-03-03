/**
 * Utility functions for build information and last update tracking
 * Works with Netlify build environment variables and Next.js
 */

/**
 * Get the last update/build time
 * Uses Netlify build time if available, otherwise uses current time
 * @returns {Date} Last update date
 */
export function getLastUpdateTime() {
  // Client-side: try to get from meta tag
  if (typeof window !== 'undefined') {
    const metaTag = document.querySelector('meta[name="last-update"]');
    if (metaTag) {
      const content = metaTag.getAttribute('content');
      if (content) {
        return new Date(content);
      }
    }
    
    // Try to get from window object (set during build)
    if (window.__BUILD_TIME__) {
      return new Date(window.__BUILD_TIME__);
    }
  }
  
  // Server-side: use environment variable or current time
  const buildTime = 
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_BUILD_TIME) ||
    (typeof process !== 'undefined' && process.env?.BUILD_TIME) ||
    new Date().toISOString();
  
  return new Date(buildTime);
}

/**
 * Format the last update date for display
 * @param {Date} date - Date to format
 * @param {string} locale - Locale for formatting (default: 'ar-SA')
 * @returns {string} Formatted date string
 */
export function formatLastUpdate(date, locale = 'ar-SA') {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }

  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Riyadh',
  };

  try {
    return new Intl.DateTimeFormat(locale, options).format(date);
  } catch {
    // Fallback to simple format
    return date.toLocaleDateString(locale);
  }
}

/**
 * Get build information object
 * @returns {Object} Build info with lastUpdate and version
 */
export function getBuildInfo() {
  const lastUpdate = getLastUpdateTime();
  const version = process.env.NEXT_PUBLIC_APP_VERSION || 
                  process.env.npm_package_version || 
                  '1.0.0';

  return {
    lastUpdate,
    version,
    formattedLastUpdate: formatLastUpdate(lastUpdate),
  };
}

