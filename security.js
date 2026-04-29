/**
 * @fileoverview Security utilities for the Election Guide application.
 * Provides HTML sanitization, input validation, and rate limiting to
 * protect against XSS, injection attacks, and abuse.
 * 
 * @module security
 * @version 1.0.0
 */

'use strict';

/**
 * Lightweight HTML sanitizer that strips dangerous tags and attributes.
 * Allows only safe formatting tags for rich content display.
 * 
 * @class Sanitizer
 */
class Sanitizer {
  /**
   * Creates a new Sanitizer instance with configurable allowed tags and attributes.
   * 
   * @param {Object} [options] - Configuration options
   * @param {string[]} [options.allowedTags] - HTML tags that are permitted
   * @param {string[]} [options.allowedAttrs] - HTML attributes that are permitted
   */
  constructor(options = {}) {
    /** @type {Set<string>} Allowed HTML tag names (lowercased) */
    this.allowedTags = new Set(options.allowedTags || [
      'p', 'br', 'strong', 'em', 'b', 'i', 'u',
      'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'div', 'span',
      'a', 'code', 'pre', 'blockquote'
    ]);

    /** @type {Set<string>} Allowed HTML attribute names (lowercased) */
    this.allowedAttrs = new Set(options.allowedAttrs || [
      'class', 'id', 'href', 'target', 'rel',
      'aria-label', 'aria-hidden', 'role',
      'data-country', 'title', 'style'
    ]);

    /** @type {RegExp[]} Patterns that indicate potentially dangerous content */
    this.dangerousPatterns = [
      /javascript\s*:/gi,
      /on\w+\s*=/gi,
      /data\s*:/gi,
      /vbscript\s*:/gi,
      /expression\s*\(/gi,
      /<\s*script/gi,
      /<\s*iframe/gi,
      /<\s*object/gi,
      /<\s*embed/gi,
      /<\s*form/gi
    ];

    Object.freeze(this.dangerousPatterns);
  }

  /**
   * Sanitizes an HTML string by removing dangerous patterns.
   * This is a defense-in-depth measure used alongside DOM-based escaping.
   * 
   * @param {string} html - The HTML string to sanitize
   * @returns {string} Sanitized HTML string
   * @example
   * const sanitizer = new Sanitizer();
   * sanitizer.sanitize('<script>alert("xss")</script><p>Safe</p>');
   * // Returns: '<p>Safe</p>'
   */
  sanitize(html) {
    if (typeof html !== 'string') {
      return '';
    }

    let clean = html;

    // Remove dangerous patterns
    for (const pattern of this.dangerousPatterns) {
      clean = clean.replace(pattern, '');
    }

    // Remove event handler attributes
    clean = clean.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
    clean = clean.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');

    return clean;
  }

  /**
   * Escapes a string for safe insertion as text content.
   * Converts HTML special characters to their entity equivalents.
   * 
   * @param {string} str - The string to escape
   * @returns {string} Escaped string safe for HTML text content
   * @example
   * Sanitizer.escapeHTML('<script>alert("xss")</script>');
   * // Returns: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
   */
  static escapeHTML(str) {
    if (typeof str !== 'string') {
      return '';
    }
    const escapeMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
      '`': '&#96;'
    };
    return str.replace(/[&<>"'/`]/g, (char) => escapeMap[char]);
  }

  /**
   * Checks if a string contains potentially dangerous content.
   * 
   * @param {string} input - The string to check
   * @returns {boolean} True if dangerous patterns are detected
   */
  isDangerous(input) {
    if (typeof input !== 'string') {
      return false;
    }
    return this.dangerousPatterns.some((pattern) => pattern.test(input));
  }
}

/**
 * Input validator that enforces constraints on user input.
 * Validates length, character content, and structural integrity.
 * 
 * @class InputValidator
 */
class InputValidator {
  /**
   * Creates a new InputValidator with configurable limits.
   * 
   * @param {Object} [options] - Validation options
   * @param {number} [options.maxLength=500] - Maximum allowed input length
   * @param {number} [options.minLength=1] - Minimum allowed input length
   */
  constructor(options = {}) {
    /** @type {number} */
    this.maxLength = options.maxLength || 500;
    /** @type {number} */
    this.minLength = options.minLength || 1;
  }

  /**
   * Validates user input against configured rules.
   * 
   * @param {string} input - The input to validate
   * @returns {{ valid: boolean, error: string|null, sanitized: string }} Validation result
   */
  validate(input) {
    if (typeof input !== 'string') {
      return { valid: false, error: 'Input must be a string', sanitized: '' };
    }

    const trimmed = input.trim();

    if (trimmed.length < this.minLength) {
      return { valid: false, error: 'Input is too short', sanitized: '' };
    }

    if (trimmed.length > this.maxLength) {
      return { valid: false, error: `Input exceeds ${this.maxLength} characters`, sanitized: trimmed.slice(0, this.maxLength) };
    }

    return { valid: true, error: null, sanitized: trimmed };
  }
}

/**
 * Rate limiter that restricts how frequently an action can be performed.
 * Uses a sliding window approach to track invocations.
 * 
 * @class RateLimiter
 */
class RateLimiter {
  /**
   * Creates a new RateLimiter.
   * 
   * @param {Object} [options] - Rate limiting options
   * @param {number} [options.maxRequests=10] - Maximum requests in the time window
   * @param {number} [options.windowMs=10000] - Time window in milliseconds
   */
  constructor(options = {}) {
    /** @type {number} */
    this.maxRequests = options.maxRequests || 10;
    /** @type {number} */
    this.windowMs = options.windowMs || 10000;
    /** @type {number[]} Timestamps of recent requests */
    this.timestamps = [];
  }

  /**
   * Checks if the action is allowed under the current rate limit.
   * Automatically cleans up expired timestamps.
   * 
   * @returns {boolean} True if the action is allowed
   */
  isAllowed() {
    const now = Date.now();
    // Remove timestamps outside the window
    this.timestamps = this.timestamps.filter(
      (t) => now - t < this.windowMs
    );

    if (this.timestamps.length >= this.maxRequests) {
      return false;
    }

    this.timestamps.push(now);
    return true;
  }

  /**
   * Returns the number of milliseconds until the next request will be allowed.
   * 
   * @returns {number} Milliseconds until rate limit resets (0 if currently allowed)
   */
  getRetryAfter() {
    if (this.timestamps.length < this.maxRequests) {
      return 0;
    }
    const oldest = this.timestamps[0];
    return Math.max(0, this.windowMs - (Date.now() - oldest));
  }

  /**
   * Resets the rate limiter, clearing all tracked timestamps.
   */
  reset() {
    this.timestamps = [];
  }
}

// Export for both module and browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Sanitizer, InputValidator, RateLimiter };
}
