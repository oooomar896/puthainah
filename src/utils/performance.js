/**
 * Performance utilities for React components
 */

import { useMemo, useCallback } from "react";

/**
 * Memoize expensive calculations
 * @param {Function} fn - Function to memoize
 * @param {Array} deps - Dependencies array
 * @returns {any} Memoized result
 */
export const useMemoizedValue = (fn, deps) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => fn(), deps);
};

/**
 * Memoize callback functions
 * @param {Function} fn - Callback function
 * @param {Array} deps - Dependencies array
 * @returns {Function} Memoized callback
 */
export const useMemoizedCallback = (fn, deps) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(() => fn(), deps);
};

/**
 * Debounce function for performance optimization
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function for performance optimization
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Check if component should update (shallow comparison)
 * @param {Object} prevProps - Previous props
 * @param {Object} nextProps - Next props
 * @returns {boolean} Whether component should update
 */
export const shouldUpdate = (prevProps, nextProps) => {
  const prevKeys = Object.keys(prevProps);
  const nextKeys = Object.keys(nextProps);

  if (prevKeys.length !== nextKeys.length) {
    return true;
  }

  for (let key of prevKeys) {
    if (prevProps[key] !== nextProps[key]) {
      return true;
    }
  }

  return false;
};

/**
 * Lazy load images hook
 * Note: Import useState and useEffect from React when using this hook
 * 
 * Example usage:
 * import { useState, useEffect } from 'react';
 * const { imageSrc, isLoaded } = useLazyImage(src, placeholder);
 */
export const useLazyImage = (src, placeholder) => {
  // This is a placeholder - implement with useState and useEffect when needed
  // See docs/PERFORMANCE_IMPROVEMENTS.md for usage examples
  return { imageSrc: placeholder, isLoaded: false };
};

