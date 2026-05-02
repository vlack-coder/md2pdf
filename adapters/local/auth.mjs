/**
 * Local Auth Adapter
 * 
 * JWT-based authentication for self-hosted deployments.
 * Uses local JSON file for user storage.
 */

import { AuthAdapter } from '../interfaces/auth.mjs';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { randomUUID, createHash, randomBytes } from 'crypto';

export class LocalAuthAdapter extends AuthAdapter {
  constructor(config) {
    super(config);
    this.dataDir = config.dataDir || './data';
    this.usersFile = join(this.dataDir, 'users.json');
    this.sessionsFile = join(this.dataDir, 'sessions.json');
    this.users = [];
    this.sessions = [];
    this.jwtSecret = config.jwtSecret || randomBytes(32).toString('hex');
    this.tokenExpiry = config.tokenExpiry || 3600 * 24 * 7; // 7 days
  }

  async initialize() {
    if (!existsSync(this.dataDir)) {
      mkdirSync(this.dataDir, { recursive: true });
    }

    this.users = this._loadJson(this.usersFile, []);
    this.sessions = this._loadJson(this.sessionsFile, []);
    
    // Clean up expired sessions
    const now = Date.now();
    this.sessions = this.sessions.filter(s => s.expires_at > now);
    this._save();
  }

  _loadJson(file, defaultValue) {
    try {
      if (existsSync(file)) {
        return JSON.parse(readFileSync(file, 'utf-8'));
      }
    } catch (e) {
      console.warn(`Failed to load ${file}:`, e.message);
    }
    return defaultValue;
  }

  _saveJson(file, data) {
    try {
      writeFileSync(file, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error(`Failed to save ${file}:`, e.message);
    }
  }

  _save() {
    this._saveJson(this.usersFile, this.users);
    this._saveJson(this.sessionsFile, this.sessions);
  }

  _hashPassword(password) {
    return createHash('sha256').update(password + this.jwtSecret).digest('hex');
  }

  _generateToken() {
    return randomBytes(32).toString('hex');
  }

  _createSession(user) {
    const now = Date.now();
    const session = {
      id: randomUUID(),
      user_id: user.id,
      access_token: this._generateToken(),
      refresh_token: this._generateToken(),
      expires_at: now + (this.tokenExpiry * 1000),
      created_at: now
    };

    this.sessions.push(session);
    this._save();

    return {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: Math.floor(session.expires_at / 1000),
      user: this._transformUser(user)
    };
  }

  _transformUser(user) {
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      name: user.name || null,
      avatar_url: user.avatar_url || null,
      metadata: user.metadata || {},
      created_at: new Date(user.created_at),
      last_sign_in: user.last_sign_in ? new Date(user.last_sign_in) : null
    };
  }

  // ==================== SIGN UP / SIGN IN ====================

  async signUpWithEmail(email, password, metadata = {}) {
    // Check if user exists
    if (this.users.find(u => u.email === email)) {
      return { user: null, session: null, error: 'User already exists' };
    }

    const user = {
      id: randomUUID(),
      email,
      password_hash: this._hashPassword(password),
      name: metadata.name || null,
      avatar_url: metadata.avatar_url || null,
      metadata,
      created_at: new Date().toISOString(),
      last_sign_in: new Date().toISOString()
    };

    this.users.push(user);
    this._save();

    const session = this._createSession(user);

    return { user: this._transformUser(user), session, error: null };
  }

  async signInWithEmail(email, password) {
    const user = this.users.find(u => u.email === email);
    
    if (!user) {
      return { user: null, session: null, error: 'Invalid credentials' };
    }

    if (user.password_hash !== this._hashPassword(password)) {
      return { user: null, session: null, error: 'Invalid credentials' };
    }

    // Update last sign in
    user.last_sign_in = new Date().toISOString();
    this._save();

    const session = this._createSession(user);

    return { user: this._transformUser(user), session, error: null };
  }

  async signInWithOAuth(provider, options = {}) {
    // Local auth doesn't support OAuth
    throw new Error('OAuth not supported in local auth mode');
  }

  async handleOAuthCallback(code) {
    throw new Error('OAuth not supported in local auth mode');
  }

  async sendMagicLink(email, options = {}) {
    // Local auth doesn't support magic links (would need email service)
    return { success: false, error: 'Magic links not supported in local auth mode' };
  }

  async verifyMagicLink(token) {
    return { user: null, session: null, error: 'Magic links not supported' };
  }

  // ==================== SESSION MANAGEMENT ====================

  async getSession(token) {
    const session = this.sessions.find(s => 
      s.access_token === token && s.expires_at > Date.now()
    );

    if (!session) return null;

    const user = this.users.find(u => u.id === session.user_id);
    if (!user) return null;

    return {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: Math.floor(session.expires_at / 1000),
      user: this._transformUser(user)
    };
  }

  async refreshSession(refreshToken) {
    const session = this.sessions.find(s => s.refresh_token === refreshToken);

    if (!session) return null;

    const user = this.users.find(u => u.id === session.user_id);
    if (!user) return null;

    // Remove old session
    this.sessions = this.sessions.filter(s => s.id !== session.id);

    // Create new session
    return this._createSession(user);
  }

  async signOut(token) {
    this.sessions = this.sessions.filter(s => s.access_token !== token);
    this._save();
    return true;
  }

  async verifyToken(token) {
    const session = await this.getSession(token);
    return session?.user || null;
  }

  // ==================== USER MANAGEMENT ====================

  async getUser(id) {
    const user = this.users.find(u => u.id === id);
    return this._transformUser(user);
  }

  async updateUser(id, data) {
    const user = this.users.find(u => u.id === id);
    if (!user) return null;

    if (data.name !== undefined) user.name = data.name;
    if (data.avatar_url !== undefined) user.avatar_url = data.avatar_url;
    if (data.metadata) user.metadata = { ...user.metadata, ...data.metadata };

    this._save();
    return this._transformUser(user);
  }

  async deleteUser(id) {
    this.users = this.users.filter(u => u.id !== id);
    this.sessions = this.sessions.filter(s => s.user_id !== id);
    this._save();
    return true;
  }

  // ==================== PASSWORD MANAGEMENT ====================

  async sendPasswordReset(email) {
    // Would need email service
    return { success: false, error: 'Password reset email not supported in local mode' };
  }

  async resetPassword(token, newPassword) {
    return { success: false, error: 'Password reset not supported in local mode' };
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (user.password_hash !== this._hashPassword(currentPassword)) {
      return { success: false, error: 'Current password is incorrect' };
    }

    user.password_hash = this._hashPassword(newPassword);
    this._save();

    return { success: true };
  }
}

export default LocalAuthAdapter;
