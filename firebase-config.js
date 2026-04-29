/**
 * @fileoverview Firebase configuration and analytics integration for Election Guide.
 * Initializes Firebase services including Analytics and Cloud Firestore
 * for tracking user interactions and collecting feedback.
 * 
 * @module firebase-config
 * @version 1.0.0
 * @see https://firebase.google.com/docs/web/setup
 */

'use strict';

/**
 * Firebase configuration object.
 * Replace these values with your own Firebase project credentials.
 * 
 * @constant {Object}
 * @property {string} apiKey - Firebase API key
 * @property {string} authDomain - Firebase auth domain
 * @property {string} projectId - Firebase project ID
 * @property {string} storageBucket - Firebase storage bucket
 * @property {string} messagingSenderId - Firebase messaging sender ID
 * @property {string} appId - Firebase app ID
 * @property {string} measurementId - Google Analytics measurement ID
 */
const FIREBASE_CONFIG = Object.freeze({
  apiKey: "AIzaSyDemoKeyReplaceMeWithYourActualKey",
  authDomain: "election-guide-app.firebaseapp.com",
  projectId: "election-guide-app",
  storageBucket: "election-guide-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456ghi789",
  measurementId: "G-XXXXXXXXXX"
});

/**
 * Analytics event names used throughout the application.
 * Centralized here to avoid typos and ensure consistency.
 * 
 * @constant {Object.<string, string>}
 */
const ANALYTICS_EVENTS = Object.freeze({
  PAGE_VIEW: 'page_view',
  COUNTRY_SELECTED: 'country_selected',
  TOPIC_VIEWED: 'topic_viewed',
  MESSAGE_SENT: 'message_sent',
  FEEDBACK_SUBMITTED: 'feedback_submitted',
  SESSION_STARTED: 'session_started',
  RESET_CLICKED: 'reset_clicked',
  QUICK_ACTION_USED: 'quick_action_used'
});

/**
 * ElectionAnalytics — Wrapper around Firebase Analytics and Firestore.
 * Provides a clean API for logging events and storing feedback.
 * Gracefully degrades if Firebase is not available.
 * 
 * @class ElectionAnalytics
 */
class ElectionAnalytics {
  /**
   * Creates a new ElectionAnalytics instance.
   * Initializes Firebase if the SDK is available.
   */
  constructor() {
    /** @type {Object|null} Firebase app instance */
    this.app = null;
    /** @type {Object|null} Firebase Analytics instance */
    this.analytics = null;
    /** @type {Object|null} Firebase Firestore instance */
    this.db = null;
    /** @type {boolean} Whether Firebase is successfully initialized */
    this.isInitialized = false;
    /** @type {string} Anonymous session ID */
    this.sessionId = this._generateSessionId();

    this._initialize();
  }

  /**
   * Initializes Firebase services.
   * Wrapped in try/catch to gracefully handle missing SDK.
   * 
   * @private
   */
  _initialize() {
    try {
      if (typeof firebase !== 'undefined' && firebase.initializeApp) {
        this.app = firebase.initializeApp(FIREBASE_CONFIG);

        if (firebase.analytics) {
          this.analytics = firebase.analytics();
        }

        if (firebase.firestore) {
          this.db = firebase.firestore();
        }

        this.isInitialized = true;
        this.logEvent(ANALYTICS_EVENTS.SESSION_STARTED, {
          sessionId: this.sessionId,
          timestamp: new Date().toISOString()
        });

        console.info('[Analytics] Firebase initialized successfully');
      } else {
        console.info('[Analytics] Firebase SDK not loaded — analytics disabled');
      }
    } catch (error) {
      console.warn('[Analytics] Firebase initialization failed:', error.message);
      this.isInitialized = false;
    }
  }

  /**
   * Generates a random anonymous session ID.
   * 
   * @private
   * @returns {string} A random hex string
   */
  _generateSessionId() {
    return 'sess_' + Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
  }

  /**
   * Logs an analytics event.
   * No-ops gracefully if analytics is not available.
   * 
   * @param {string} eventName - Name of the event (from ANALYTICS_EVENTS)
   * @param {Object} [params={}] - Event parameters
   */
  logEvent(eventName, params = {}) {
    try {
      if (this.analytics) {
        this.analytics.logEvent(eventName, {
          ...params,
          sessionId: this.sessionId
        });
      }

      // Also log to gtag if available
      if (typeof gtag === 'function') {
        gtag('event', eventName, params);
      }
    } catch (error) {
      console.warn('[Analytics] Event logging failed:', error.message);
    }
  }

  /**
   * Logs a country selection event.
   * 
   * @param {string} countryKey - The selected country key
   * @param {string} countryName - The display name of the country
   */
  logCountrySelected(countryKey, countryName) {
    this.logEvent(ANALYTICS_EVENTS.COUNTRY_SELECTED, {
      country_key: countryKey,
      country_name: countryName
    });
  }

  /**
   * Logs a topic view event.
   * 
   * @param {string} topic - The topic identifier
   * @param {string} country - The current country context
   */
  logTopicViewed(topic, country) {
    this.logEvent(ANALYTICS_EVENTS.TOPIC_VIEWED, {
      topic: topic,
      country: country
    });
  }

  /**
   * Logs a user message event (without logging the actual message content for privacy).
   * 
   * @param {number} messageLength - Length of the user's message
   */
  logMessageSent(messageLength) {
    this.logEvent(ANALYTICS_EVENTS.MESSAGE_SENT, {
      message_length: messageLength
    });
  }

  /**
   * Stores user feedback in Firestore.
   * 
   * @param {string} topic - The topic the feedback is about
   * @param {boolean} helpful - Whether the user found it helpful
   * @returns {Promise<boolean>} True if feedback was stored successfully
   */
  async submitFeedback(topic, helpful) {
    try {
      if (this.db) {
        await this.db.collection('feedback').add({
          sessionId: this.sessionId,
          topic: topic,
          helpful: helpful,
          timestamp: new Date().toISOString()
        });
      }

      this.logEvent(ANALYTICS_EVENTS.FEEDBACK_SUBMITTED, {
        topic: topic,
        helpful: helpful
      });

      return true;
    } catch (error) {
      console.warn('[Analytics] Feedback submission failed:', error.message);
      return false;
    }
  }
}

// Export for both module and browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ElectionAnalytics, ANALYTICS_EVENTS, FIREBASE_CONFIG };
}
