/**
 * Authentication Adapter Interface
 * 
 * All auth adapters must implement these methods.
 * This allows switching between Supabase Auth, Firebase Auth, Auth0, custom JWT, etc.
 */

/**
 * @typedef {Object} User
 * @property {string} id - UUID
 * @property {string} email
 * @property {string|null} name
 * @property {string|null} avatar_url
 * @property {Object} metadata - Custom user metadata
 * @property {Date} created_at
 * @property {Date} last_sign_in
 */

/**
 * @typedef {Object} Session
 * @property {string} access_token
 * @property {string} refresh_token
 * @property {number} expires_at - Unix timestamp
 * @property {User} user
 */

/**
 * @typedef {Object} AuthResult
 * @property {User|null} user
 * @property {Session|null} session
 * @property {string|null} error
 */

/**
 * Abstract Auth Adapter
 * @abstract
 */
export class AuthAdapter {
  constructor(config = {}) {
    if (new.target === AuthAdapter) {
      throw new Error('AuthAdapter is abstract and cannot be instantiated directly');
    }
    this.config = config;
  }

  /**
   * Initialize the auth provider
   * @returns {Promise<void>}
   */
  async initialize() {
    throw new Error('Method initialize() must be implemented');
  }

  // ==================== SIGN UP / SIGN IN ====================

  /**
   * Sign up with email and password
   * @param {string} email
   * @param {string} password
   * @param {Object} metadata - Additional user data
   * @returns {Promise<AuthResult>}
   */
  async signUpWithEmail(email, password, metadata = {}) {
    throw new Error('Method signUpWithEmail() must be implemented');
  }

  /**
   * Sign in with email and password
   * @param {string} email
   * @param {string} password
   * @returns {Promise<AuthResult>}
   */
  async signInWithEmail(email, password) {
    throw new Error('Method signInWithEmail() must be implemented');
  }

  /**
   * Sign in with OAuth provider
   * @param {string} provider - 'google', 'github', etc.
   * @param {Object} options - Redirect URLs, scopes
   * @returns {Promise<{url: string}>} - OAuth URL to redirect to
   */
  async signInWithOAuth(provider, options = {}) {
    throw new Error('Method signInWithOAuth() must be implemented');
  }

  /**
   * Handle OAuth callback
   * @param {string} code - Authorization code
   * @returns {Promise<AuthResult>}
   */
  async handleOAuthCallback(code) {
    throw new Error('Method handleOAuthCallback() must be implemented');
  }

  /**
   * Send magic link to email
   * @param {string} email
   * @param {Object} options
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async sendMagicLink(email, options = {}) {
    throw new Error('Method sendMagicLink() must be implemented');
  }

  /**
   * Verify magic link token
   * @param {string} token
   * @returns {Promise<AuthResult>}
   */
  async verifyMagicLink(token) {
    throw new Error('Method verifyMagicLink() must be implemented');
  }

  // ==================== SESSION MANAGEMENT ====================

  /**
   * Get current session from token
   * @param {string} token - Access token or session token
   * @returns {Promise<Session|null>}
   */
  async getSession(token) {
    throw new Error('Method getSession() must be implemented');
  }

  /**
   * Refresh session
   * @param {string} refreshToken
   * @returns {Promise<Session|null>}
   */
  async refreshSession(refreshToken) {
    throw new Error('Method refreshSession() must be implemented');
  }

  /**
   * Sign out / invalidate session
   * @param {string} token
   * @returns {Promise<boolean>}
   */
  async signOut(token) {
    throw new Error('Method signOut() must be implemented');
  }

  /**
   * Verify and decode a token
   * @param {string} token
   * @returns {Promise<User|null>}
   */
  async verifyToken(token) {
    throw new Error('Method verifyToken() must be implemented');
  }

  // ==================== USER MANAGEMENT ====================

  /**
   * Get user by ID
   * @param {string} id
   * @returns {Promise<User|null>}
   */
  async getUser(id) {
    throw new Error('Method getUser() must be implemented');
  }

  /**
   * Update user profile
   * @param {string} id
   * @param {Object} data - { name?, avatar_url?, metadata? }
   * @returns {Promise<User|null>}
   */
  async updateUser(id, data) {
    throw new Error('Method updateUser() must be implemented');
  }

  /**
   * Delete user account
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async deleteUser(id) {
    throw new Error('Method deleteUser() must be implemented');
  }

  // ==================== PASSWORD MANAGEMENT ====================

  /**
   * Send password reset email
   * @param {string} email
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async sendPasswordReset(email) {
    throw new Error('Method sendPasswordReset() must be implemented');
  }

  /**
   * Reset password with token
   * @param {string} token
   * @param {string} newPassword
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async resetPassword(token, newPassword) {
    throw new Error('Method resetPassword() must be implemented');
  }

  /**
   * Change password (while logged in)
   * @param {string} userId
   * @param {string} currentPassword
   * @param {string} newPassword
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async changePassword(userId, currentPassword, newPassword) {
    throw new Error('Method changePassword() must be implemented');
  }
}

export default AuthAdapter;
