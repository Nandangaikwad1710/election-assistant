/**
 * @fileoverview Unit and integration tests for the Election Guide application.
 * Tests cover content builders, NLP routing, DOM manipulation, escaping,
 * accessibility features, and edge cases.
 *
 * @module __tests__/app
 */

const { Sanitizer, InputValidator, RateLimiter } = require('../security');

beforeEach(() => {
  // Set up DOM
  document.body.innerHTML = `
    <div id="aria-live-region" aria-live="polite"></div>
    <header id="app-header" class="header"></header>
    <main id="chat-area" class="chat-area">
      <div id="messages" class="messages"></div>
    </main>
    <div id="quick-actions" class="quick-actions"></div>
    <footer id="input-bar" class="input-bar">
      <input id="user-input" type="text" />
      <button id="btn-send"></button>
    </footer>
    <button id="btn-reset"></button>
  `;

  // Make security classes global
  global.Sanitizer = Sanitizer;
  global.InputValidator = InputValidator;
  global.RateLimiter = RateLimiter;
  global.ElectionAnalytics = undefined;
  global.gtag = undefined;
  global.firebase = undefined;

  // Load app.js — it assigns to globalThis
  jest.resetModules();
  require('../app');
});

afterEach(() => {
  jest.restoreAllMocks();
});

// ============================================================
// ELECTION DATA TESTS
// ============================================================
describe('ELECTION_DATA', () => {
  test('should contain all required countries', () => {
    expect(global.ELECTION_DATA).toBeDefined();
    expect(global.ELECTION_DATA).toHaveProperty('india');
    expect(global.ELECTION_DATA).toHaveProperty('usa');
    expect(global.ELECTION_DATA).toHaveProperty('uk');
    expect(global.ELECTION_DATA).toHaveProperty('general');
  });

  test('each country should have required fields', () => {
    const required = ['name', 'flag', 'commission', 'eligibility', 'votingMethod', 'steps', 'timeline', 'checklist', 'tips'];
    Object.keys(global.ELECTION_DATA).forEach((key) => {
      required.forEach((field) => {
        expect(global.ELECTION_DATA[key]).toHaveProperty(field);
      });
    });
  });

  test('each country should have at least 5 steps', () => {
    Object.keys(global.ELECTION_DATA).forEach((key) => {
      expect(global.ELECTION_DATA[key].steps.length).toBeGreaterThanOrEqual(5);
    });
  });

  test('each step should have title and desc', () => {
    Object.keys(global.ELECTION_DATA).forEach((key) => {
      global.ELECTION_DATA[key].steps.forEach((step) => {
        expect(step).toHaveProperty('title');
        expect(step).toHaveProperty('desc');
        expect(step.title.length).toBeGreaterThan(0);
      });
    });
  });

  test('eligibility should have age, citizenship, id, residency', () => {
    Object.keys(global.ELECTION_DATA).forEach((key) => {
      const e = global.ELECTION_DATA[key].eligibility;
      expect(e).toHaveProperty('age');
      expect(e).toHaveProperty('citizenship');
      expect(e).toHaveProperty('id');
      expect(e).toHaveProperty('residency');
    });
  });

  test('timeline items should have phase, duration, desc', () => {
    Object.keys(global.ELECTION_DATA).forEach((key) => {
      global.ELECTION_DATA[key].timeline.forEach((item) => {
        expect(item).toHaveProperty('phase');
        expect(item).toHaveProperty('duration');
        expect(item).toHaveProperty('desc');
      });
    });
  });
});

// ============================================================
// ESCAPE HTML TESTS
// ============================================================
describe('escapeHTML', () => {
  test('should escape angle brackets', () => {
    const result = global.escapeHTML('<script>alert("xss")</script>');
    expect(result).not.toContain('<script>');
  });

  test('should escape ampersands', () => {
    const result = global.escapeHTML('A & B');
    expect(result).toContain('&amp;');
  });

  test('should escape quotes', () => {
    const result = global.escapeHTML('"hello"');
    expect(result).toContain('&quot;');
  });

  test('should return empty string for non-string input', () => {
    expect(global.escapeHTML(null)).toBe('');
    expect(global.escapeHTML(undefined)).toBe('');
  });

  test('should handle empty string', () => {
    expect(global.escapeHTML('')).toBe('');
  });

  test('should preserve safe text', () => {
    expect(global.escapeHTML('Hello World')).toBe('Hello World');
  });
});

// ============================================================
// CONTENT BUILDER TESTS
// ============================================================
describe('Content Builders', () => {
  test('buildSteps should return HTML with step cards for India', () => {
    const html = global.buildSteps(global.ELECTION_DATA.india);
    expect(html).toContain('Step-by-Step');
    expect(html).toContain('step-card');
    expect(html).toContain('India');
    global.ELECTION_DATA.india.steps.forEach((s) => {
      expect(html).toContain(s.title);
    });
  });

  test('buildTimeline should return HTML with timeline items', () => {
    const html = global.buildTimeline(global.ELECTION_DATA.usa);
    expect(html).toContain('Timeline');
    expect(html).toContain('timeline__item');
    global.ELECTION_DATA.usa.timeline.forEach((t) => {
      expect(html).toContain(t.phase);
    });
  });

  test('buildEligibility should include eligibility details', () => {
    const html = global.buildEligibility(global.ELECTION_DATA.uk);
    expect(html).toContain('Eligibility');
    expect(html).toContain(String(global.ELECTION_DATA.uk.eligibility.age));
    expect(html).toContain('official election commission');
  });

  test('buildHowToVote should include voting method and checklist', () => {
    const html = global.buildHowToVote(global.ELECTION_DATA.india);
    expect(html).toContain(global.ELECTION_DATA.india.votingMethod);
    expect(html).toContain('checklist__icon');
    global.ELECTION_DATA.india.checklist.forEach((item) => {
      expect(html).toContain(item);
    });
  });

  test('buildFullOverview should include commission and steps', () => {
    const html = global.buildFullOverview(global.ELECTION_DATA.general);
    expect(html).toContain(global.ELECTION_DATA.general.commission);
    global.ELECTION_DATA.general.steps.forEach((s) => {
      expect(html).toContain(s.title);
    });
  });

  test('all builders should work for all countries without errors', () => {
    Object.keys(global.ELECTION_DATA).forEach((key) => {
      const data = global.ELECTION_DATA[key];
      expect(() => global.buildSteps(data)).not.toThrow();
      expect(() => global.buildTimeline(data)).not.toThrow();
      expect(() => global.buildEligibility(data)).not.toThrow();
      expect(() => global.buildHowToVote(data)).not.toThrow();
      expect(() => global.buildFullOverview(data)).not.toThrow();
    });
  });
});

// ============================================================
// DOM INTERACTION TESTS
// ============================================================
describe('DOM Interactions', () => {
  test('addMessage should append a bot message', () => {
    const el = document.getElementById('messages');
    const before = el.children.length;
    global.addMessage('bot', '<p>Test</p>');
    expect(el.children.length).toBe(before + 1);
    expect(el.lastElementChild.classList.contains('message--bot')).toBe(true);
  });

  test('addMessage should append a user message', () => {
    global.addMessage('user', '<p>Hi</p>');
    const el = document.getElementById('messages');
    expect(el.lastElementChild.classList.contains('message--user')).toBe(true);
  });

  test('addUserMessage should escape XSS in user text', () => {
    global.addUserMessage('<script>alert(1)</script>');
    const el = document.getElementById('messages');
    expect(el.lastElementChild.innerHTML).not.toContain('<script>');
  });

  test('showTyping should add typing indicator', () => {
    global.showTyping();
    expect(document.getElementById('typing-msg')).not.toBeNull();
  });

  test('hideTyping should remove typing indicator', () => {
    // Remove any existing typing indicators from app startup
    document.querySelectorAll('#typing-msg').forEach(el => el.remove());
    global.showTyping();
    expect(document.getElementById('typing-msg')).not.toBeNull();
    global.hideTyping();
    expect(document.getElementById('typing-msg')).toBeNull();
  });

  test('clearQuickActions should empty the container', () => {
    const qa = document.getElementById('quick-actions');
    qa.innerHTML = '<button>X</button>';
    global.clearQuickActions();
    expect(qa.children.length).toBe(0);
  });

  test('setQuickActions should create buttons with aria-labels', () => {
    global.setQuickActions([{ emoji: '📋', label: 'Test', handler: jest.fn() }]);
    const qa = document.getElementById('quick-actions');
    expect(qa.children.length).toBe(1);
    expect(qa.children[0].getAttribute('aria-label')).toBe('Test');
  });
});

// ============================================================
// ACCESSIBILITY TESTS
// ============================================================
describe('Accessibility', () => {
  test('announceToScreenReader should update ARIA live region', () => {
    global.announceToScreenReader('Hello');
    expect(document.getElementById('aria-live-region').textContent).toBe('Hello');
  });

  test('quick action emoji should have aria-hidden', () => {
    global.setQuickActions([{ emoji: '📋', label: 'Act', handler: jest.fn() }]);
    const emoji = document.querySelector('.emoji');
    expect(emoji.getAttribute('aria-hidden')).toBe('true');
  });
});

// ============================================================
// EDGE CASE TESTS
// ============================================================
describe('Edge Cases', () => {
  test('getCountryData should fall back to general when no country set', () => {
    global.currentCountry = null;
    expect(global.getCountryData().name).toBe('General (Global Overview)');
  });

  test('getCountryData should return valid data object', () => {
    // Since currentCountry is in app.js closure, we test the fallback behavior
    const data = global.getCountryData();
    expect(data).toHaveProperty('name');
    expect(data).toHaveProperty('steps');
    expect(data).toHaveProperty('eligibility');
  });
});

// ============================================================
// INPUT HANDLING TESTS
// ============================================================
describe('Input Handling', () => {
  test('empty input should not add a user message', () => {
    document.getElementById('user-input').value = '';
    global.handleSend();
    const msgs = document.querySelectorAll('.message--user');
    expect(msgs.length).toBe(0);
  });

  test('whitespace-only input should not add a user message', () => {
    document.getElementById('user-input').value = '   ';
    global.handleSend();
    const msgs = document.querySelectorAll('.message--user');
    expect(msgs.length).toBe(0);
  });
});
