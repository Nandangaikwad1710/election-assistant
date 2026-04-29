# 🗳️ Election Guide — Interactive Election Process Assistant

An interactive, accessible, and secure web application that helps users understand how elections work across multiple countries. Built with vanilla HTML, CSS, and JavaScript with Firebase integration for analytics.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## 🎯 Overview

Election Guide is a conversational assistant that breaks down complex election processes into clear, step-by-step explanations. It adapts to the user's country and experience level, providing tailored information about voter registration, eligibility, voting methods, and more.

## ✨ Features

- **🌍 Multi-Country Support** — Detailed election data for India, USA, UK, and a general global overview
- **💬 Interactive Chat Interface** — Conversational flow with quick-action buttons and natural language input
- **📋 5 Information Modules** — Full overview, step-by-step guide, timeline, how-to-vote checklist, eligibility check
- **🧠 NLP Keyword Detection** — Understands natural language queries and routes to relevant content
- **🔒 Security Hardened** — CSP headers, input sanitization, rate limiting, XSS protection
- **♿ Fully Accessible** — ARIA live regions, keyboard navigation, screen reader support, reduced-motion support
- **📊 Firebase Analytics** — Tracks user interactions for insight without compromising privacy
- **🎨 Premium Dark UI** — Glassmorphism design, animated backgrounds, smooth micro-animations
- **📱 Responsive Design** — Works seamlessly on mobile and desktop

## 🏗️ Architecture

```
election-assistant/
├── index.html          # Main HTML with semantic structure, CSP, and accessibility
├── style.css           # Design system with CSS custom properties and animations
├── app.js              # Core application logic, chat engine, NLP, and DOM management
├── security.js         # Security utilities: sanitizer, rate limiter, input validator
├── firebase-config.js  # Firebase initialization, analytics, and Firestore integration
├── package.json        # Dependencies and scripts
├── jest.config.js      # Jest testing configuration
├── .eslintrc.json      # ESLint code quality rules
├── .gitignore          # Git ignore patterns
├── __tests__/
│   ├── app.test.js       # Unit and integration tests for core app logic
│   └── security.test.js  # Security module tests (sanitizer, rate limiter)
└── README.md           # This file
```

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Node.js ≥ 18 (for running tests and linting)

### Installation

```bash
# Clone the repository
git clone https://github.com/Nandangaikwad1710/election-assistant.git
cd election-assistant

# Install development dependencies
npm install
```

### Running Locally

Simply open `index.html` in your browser — no build step required:

```bash
open index.html
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Linting

```bash
# Check for code quality issues
npm run lint

# Auto-fix issues
npm run lint:fix

# Run full validation (lint + tests)
npm run validate
```

## 🔒 Security

This application implements multiple layers of security:

- **Content Security Policy (CSP)** — Restricts resource loading to trusted origins
- **Input Sanitization** — All user input is sanitized to prevent XSS attacks
- **Rate Limiting** — Prevents spam/abuse of the chat interface (max 10 messages per 10 seconds)
- **Input Validation** — Enforces character limits and blocks malicious patterns
- **Immutable Data** — Election data is frozen with `Object.freeze()` to prevent tampering
- **No eval()** — Strict ESLint rules prevent use of `eval()`, `Function()`, and similar unsafe patterns

## ♿ Accessibility

- **WCAG 2.1 AA compliant** design
- **ARIA live regions** announce new messages to screen readers
- **Keyboard navigable** — all interactive elements are reachable via Tab/Enter
- **Skip-to-content** link for keyboard users
- **`prefers-reduced-motion`** — respects user's motion preferences
- **High contrast** focus indicators on all interactive elements
- **Semantic HTML** — proper heading hierarchy, landmarks, and roles

## 📊 Google Services Integration

- **Firebase Analytics** — Anonymous usage tracking (country selection, topic views)
- **Cloud Firestore** — Optional feedback collection
- **Google Fonts** — Inter and JetBrains Mono typefaces
- **Google Analytics (gtag.js)** — Page view and event tracking

## 🧪 Testing

Tests cover:
- **Unit tests** — All content builder functions, NLP detection, HTML escaping
- **Security tests** — XSS vector sanitization, rate limiter behavior, input validation
- **Integration tests** — Message flow, DOM manipulation, user interaction flows
- **Edge cases** — Empty input, special characters, extremely long input, rapid submission

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Election data sourced from official election commission websites
- Built for the PromptWars hackathon on Hack2Skill
