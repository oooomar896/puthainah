/**
 * Validation utility functions
 */

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (Saudi format)
 * @param {string} phone - Phone number
 * @returns {boolean}
 */
export const isValidPhone = (phone) => {
  if (!phone) return false;
  // Saudi phone number format: starts with 05 or +966
  const phoneRegex = /^(?:\+966|0)?5[0-9]{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

/**
 * Validate password strength
 * @param {string} password - Password
 * @returns {Object} Validation result
 */
export const validatePassword = (password) => {
  if (!password) {
    return {
      isValid: false,
      errors: ["كلمة المرور مطلوبة"],
    };
  }

  const errors = [];

  if (password.length < 6) {
    errors.push("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
  }

  if (password.length > 128) {
    errors.push("كلمة المرور طويلة جداً");
  }

  // Optional: Add more password requirements
  // if (!/[A-Z]/.test(password)) {
  //   errors.push("كلمة المرور يجب أن تحتوي على حرف كبير على الأقل");
  // }
  // if (!/[0-9]/.test(password)) {
  //   errors.push("كلمة المرور يجب أن تحتوي على رقم على الأقل");
  // }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Sanitize string input
 * @param {string} input - Input string
 * @returns {string} Sanitized string
 */
export const sanitizeInput = (input) => {
  if (typeof input !== "string") return input;
  return input.trim().replace(/[<>]/g, "");
};

/**
 * Format phone number for display
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("966")) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }
  if (cleaned.startsWith("05")) {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  return phone;
};

/**
 * Validate date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Object} Validation result
 */
export const validateDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return {
      isValid: false,
      error: "يجب تحديد تاريخ البداية والنهاية",
    };
  }

  if (endDate < startDate) {
    return {
      isValid: false,
      error: "تاريخ النهاية يجب أن يكون بعد تاريخ البداية",
    };
  }

  return {
    isValid: true,
  };
};

/**
 * Validate file size
 * @param {File} file - File object
 * @param {number} maxSizeMB - Maximum size in MB
 * @returns {Object} Validation result
 */
export const validateFileSize = (file, maxSizeMB = 10) => {
  if (!file) {
    return {
      isValid: false,
      error: "الملف مطلوب",
    };
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `حجم الملف يجب أن يكون أقل من ${maxSizeMB} MB`,
    };
  }

  return {
    isValid: true,
  };
};

/**
 * Validate file type
 * @param {File} file - File object
 * @param {string[]} allowedTypes - Allowed MIME types
 * @returns {Object} Validation result
 */
export const validateFileType = (file, allowedTypes = []) => {
  if (!file) {
    return {
      isValid: false,
      error: "الملف مطلوب",
    };
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `نوع الملف غير مدعوم. الأنواع المدعومة: ${allowedTypes.join(", ")}`,
    };
  }

  return {
    isValid: true,
  };
};

