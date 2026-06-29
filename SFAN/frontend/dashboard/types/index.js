/**
 * Types and documentation for the dashboard architecture.
 * This is vanilla JS, but we use JSDoc for IDE support.
 */

/**
 * @typedef {Object} UserState
 * @property {string} email
 * @property {string} role
 * @property {string} fullName
 */

/**
 * @typedef {Object} DashboardState
 * @property {string} activeModule - The ID of the currently active module
 * @property {UserState} user - The currently logged-in user
 */

export const Types = {};
