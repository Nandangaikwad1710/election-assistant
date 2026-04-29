/**
 * @fileoverview Security module tests covering Sanitizer, InputValidator,
 * and RateLimiter classes with comprehensive edge cases and XSS vectors.
 *
 * @module __tests__/security
 */

const { Sanitizer, InputValidator, RateLimiter } = require('../security');

// ============================================================
// SANITIZER TESTS
// ============================================================
describe('Sanitizer', () => {
  let sanitizer;

  beforeEach(() => {
    sanitizer = new Sanitizer();
  });

  describe('sanitize()', () => {
    test('should remove script tags', () => {
      const result = sanitizer.sanitize('<script>alert("xss")</script>');
      expect(result).not.toContain('<script');
    });

    test('should remove iframe tags', () => {
      const result = sanitizer.sanitize('<iframe src="evil.com"></iframe>');
      expect(result).not.toContain('<iframe');
    });

    test('should remove event handlers', () => {
      const result = sanitizer.sanitize('<img onerror="alert(1)" src="x">');
      expect(result).not.toContain('onerror');
    });

    test('should remove javascript: protocol', () => {
      const result = sanitizer.sanitize('<a href="javascript:alert(1)">click</a>');
      expect(result).not.toContain('javascript:');
    });

    test('should remove onclick attributes', () => {
      const result = sanitizer.sanitize('<div onclick="alert(1)">text</div>');
      expect(result).not.toContain('onclick');
    });

    test('should remove onmouseover attributes', () => {
      const result = sanitizer.sanitize('<p onmouseover="alert(1)">hover</p>');
      expect(result).not.toContain('onmouseover');
    });

    test('should remove object and embed tags', () => {
      const input = '<object data="evil.swf"></object><embed src="evil.swf">';
      const result = sanitizer.sanitize(input);
      expect(result).not.toContain('<object');
      expect(result).not.toContain('<embed');
    });

    test('should remove form tags', () => {
      const result = sanitizer.sanitize('<form action="evil.com"><input></form>');
      expect(result).not.toContain('<form');
    });

    test('should preserve safe HTML', () => {
      const safe = '<p>Hello <strong>World</strong></p>';
      const result = sanitizer.sanitize(safe);
      expect(result).toContain('<p>');
      expect(result).toContain('<strong>');
    });

    test('should handle empty string', () => {
      expect(sanitizer.sanitize('')).toBe('');
    });

    test('should handle non-string input', () => {
      expect(sanitizer.sanitize(null)).toBe('');
      expect(sanitizer.sanitize(undefined)).toBe('');
      expect(sanitizer.sanitize(123)).toBe('');
    });

    test('should handle vbscript protocol', () => {
      const result = sanitizer.sanitize('<a href="vbscript:msgbox(1)">click</a>');
      expect(result).not.toContain('vbscript:');
    });

    test('should handle CSS expression()', () => {
      const result = sanitizer.sanitize('<div style="width:expression(alert(1))">');
      expect(result).not.toContain('expression(');
    });

    test('should remove data: protocol', () => {
      const result = sanitizer.sanitize('<a href="data:text/html,<script>alert(1)</script>">');
      expect(result).not.toContain('data:');
    });
  });

  describe('escapeHTML()', () => {
    test('should escape < and >', () => {
      expect(Sanitizer.escapeHTML('<div>')).toBe('&lt;div&gt;');
    });

    test('should escape &', () => {
      expect(Sanitizer.escapeHTML('A & B')).toBe('A &amp; B');
    });

    test('should escape quotes', () => {
      expect(Sanitizer.escapeHTML('"test"')).toContain('&quot;');
    });

    test('should escape single quotes', () => {
      expect(Sanitizer.escapeHTML("it's")).toContain('&#x27;');
    });

    test('should escape backticks', () => {
      expect(Sanitizer.escapeHTML('`code`')).toContain('&#96;');
    });

    test('should escape forward slashes', () => {
      expect(Sanitizer.escapeHTML('a/b')).toContain('&#x2F;');
    });

    test('should return empty string for non-string input', () => {
      expect(Sanitizer.escapeHTML(null)).toBe('');
      expect(Sanitizer.escapeHTML(undefined)).toBe('');
      expect(Sanitizer.escapeHTML(42)).toBe('');
      expect(Sanitizer.escapeHTML({})).toBe('');
    });

    test('should handle empty string', () => {
      expect(Sanitizer.escapeHTML('')).toBe('');
    });

    test('should not modify strings without special chars', () => {
      expect(Sanitizer.escapeHTML('Hello World')).toBe('Hello World');
    });
  });

  describe('isDangerous()', () => {
    test('should detect script tags', () => {
      expect(sanitizer.isDangerous('<script>')).toBe(true);
    });

    test('should detect javascript protocol', () => {
      expect(sanitizer.isDangerous('javascript:void(0)')).toBe(true);
    });

    test('should detect event handlers', () => {
      expect(sanitizer.isDangerous('onerror=alert(1)')).toBe(true);
    });

    test('should not flag safe text', () => {
      expect(sanitizer.isDangerous('Hello World')).toBe(false);
    });

    test('should return false for non-string input', () => {
      expect(sanitizer.isDangerous(null)).toBe(false);
      expect(sanitizer.isDangerous(123)).toBe(false);
    });
  });
});

// ============================================================
// INPUT VALIDATOR TESTS
// ============================================================
describe('InputValidator', () => {
  let validator;

  beforeEach(() => {
    validator = new InputValidator({ maxLength: 100, minLength: 1 });
  });

  test('should accept valid input', () => {
    const result = validator.validate('Hello');
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
    expect(result.sanitized).toBe('Hello');
  });

  test('should trim whitespace', () => {
    const result = validator.validate('  Hello  ');
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe('Hello');
  });

  test('should reject empty input', () => {
    const result = validator.validate('');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('too short');
  });

  test('should reject whitespace-only input', () => {
    const result = validator.validate('   ');
    expect(result.valid).toBe(false);
  });

  test('should reject overly long input', () => {
    const long = 'a'.repeat(200);
    const result = validator.validate(long);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('exceeds');
    expect(result.sanitized.length).toBe(100);
  });

  test('should reject non-string input', () => {
    expect(validator.validate(null).valid).toBe(false);
    expect(validator.validate(123).valid).toBe(false);
    expect(validator.validate(undefined).valid).toBe(false);
  });

  test('should use default max length of 500', () => {
    const defaultValidator = new InputValidator();
    const text = 'a'.repeat(499);
    expect(defaultValidator.validate(text).valid).toBe(true);
  });

  test('should accept input at exact max length', () => {
    const exact = 'a'.repeat(100);
    expect(validator.validate(exact).valid).toBe(true);
  });

  test('should reject input one char over max', () => {
    const over = 'a'.repeat(101);
    expect(validator.validate(over).valid).toBe(false);
  });
});

// ============================================================
// RATE LIMITER TESTS
// ============================================================
describe('RateLimiter', () => {
  let limiter;

  beforeEach(() => {
    limiter = new RateLimiter({ maxRequests: 3, windowMs: 1000 });
  });

  test('should allow requests under limit', () => {
    expect(limiter.isAllowed()).toBe(true);
    expect(limiter.isAllowed()).toBe(true);
    expect(limiter.isAllowed()).toBe(true);
  });

  test('should block requests over limit', () => {
    limiter.isAllowed();
    limiter.isAllowed();
    limiter.isAllowed();
    expect(limiter.isAllowed()).toBe(false);
  });

  test('should return retry-after time when blocked', () => {
    limiter.isAllowed();
    limiter.isAllowed();
    limiter.isAllowed();
    const retryAfter = limiter.getRetryAfter();
    expect(retryAfter).toBeGreaterThan(0);
    expect(retryAfter).toBeLessThanOrEqual(1000);
  });

  test('should return 0 retry-after when not blocked', () => {
    expect(limiter.getRetryAfter()).toBe(0);
  });

  test('should reset when reset() is called', () => {
    limiter.isAllowed();
    limiter.isAllowed();
    limiter.isAllowed();
    expect(limiter.isAllowed()).toBe(false);
    limiter.reset();
    expect(limiter.isAllowed()).toBe(true);
  });

  test('should allow requests after window expires', () => {
    jest.useFakeTimers();
    limiter.isAllowed();
    limiter.isAllowed();
    limiter.isAllowed();
    expect(limiter.isAllowed()).toBe(false);

    jest.advanceTimersByTime(1100);
    expect(limiter.isAllowed()).toBe(true);

    jest.useRealTimers();
  });

  test('should use default options when none provided', () => {
    const defaultLimiter = new RateLimiter();
    expect(defaultLimiter.maxRequests).toBe(10);
    expect(defaultLimiter.windowMs).toBe(10000);
  });
});
