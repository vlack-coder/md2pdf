/**
 * Supabase Auth Adapter
 * 
 * Authentication operations via Supabase Auth.
 */

import { AuthAdapter } from '../interfaces/auth.mjs';

export class SupabaseAuthAdapter extends AuthAdapter {
  constructor(config) {
    super(config);
    this.client = null;
  }

  async initialize() {
    const { createClient } = await import('@supabase/supabase-js');
    
    if (!this.config.url || !this.config.key) {
      throw new Error('Supabase URL and key are required');
    }

    this.client = createClient(this.config.url, this.config.key, {
      auth: {
        autoRefreshToken: true,
        persistSession: false
      }
    });
  }

  // ==================== SIGN UP / SIGN IN ====================

  async signUpWithEmail(email, password, metadata = {}) {
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });

    if (error) {
      return { user: null, session: null, error: error.message };
    }

    return {
      user: this._transformUser(data.user),
      session: this._transformSession(data.session),
      error: null
    };
  }

  async signInWithEmail(email, password) {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return { user: null, session: null, error: error.message };
    }

    return {
      user: this._transformUser(data.user),
      session: this._transformSession(data.session),
      error: null
    };
  }

  async signInWithOAuth(provider, options = {}) {
    const { data, error } = await this.client.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: options.redirectTo,
        scopes: options.scopes
      }
    });

    if (error) {
      throw new Error(`OAuth sign in failed: ${error.message}`);
    }

    return { url: data.url };
  }

  async handleOAuthCallback(code) {
    const { data, error } = await this.client.auth.exchangeCodeForSession(code);

    if (error) {
      return { user: null, session: null, error: error.message };
    }

    return {
      user: this._transformUser(data.user),
      session: this._transformSession(data.session),
      error: null
    };
  }

  async sendMagicLink(email, options = {}) {
    const { error } = await this.client.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: options.redirectTo
      }
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  async verifyMagicLink(token) {
    const { data, error } = await this.client.auth.verifyOtp({
      token_hash: token,
      type: 'magiclink'
    });

    if (error) {
      return { user: null, session: null, error: error.message };
    }

    return {
      user: this._transformUser(data.user),
      session: this._transformSession(data.session),
      error: null
    };
  }

  // ==================== SESSION MANAGEMENT ====================

  async getSession(token) {
    // Set the session from the token
    const { data, error } = await this.client.auth.getUser(token);

    if (error) return null;

    return {
      access_token: token,
      refresh_token: null,
      expires_at: 0,
      user: this._transformUser(data.user)
    };
  }

  async refreshSession(refreshToken) {
    const { data, error } = await this.client.auth.refreshSession({
      refresh_token: refreshToken
    });

    if (error) return null;

    return this._transformSession(data.session);
  }

  async signOut(token) {
    // For server-side, we need to use admin API if available
    // For now, just return true as Supabase handles token invalidation
    const { error } = await this.client.auth.signOut();
    return !error;
  }

  async verifyToken(token) {
    const { data, error } = await this.client.auth.getUser(token);

    if (error) return null;
    return this._transformUser(data.user);
  }

  // ==================== USER MANAGEMENT ====================

  async getUser(id) {
    // Admin API required for getting user by ID
    const { data, error } = await this.client.auth.admin.getUserById(id);

    if (error) return null;
    return this._transformUser(data.user);
  }

  async updateUser(id, data) {
    const { data: result, error } = await this.client.auth.admin.updateUserById(id, {
      user_metadata: {
        name: data.name,
        avatar_url: data.avatar_url,
        ...data.metadata
      }
    });

    if (error) return null;
    return this._transformUser(result.user);
  }

  async deleteUser(id) {
    const { error } = await this.client.auth.admin.deleteUser(id);
    return !error;
  }

  // ==================== PASSWORD MANAGEMENT ====================

  async sendPasswordReset(email) {
    const { error } = await this.client.auth.resetPasswordForEmail(email);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  async resetPassword(token, newPassword) {
    const { error } = await this.client.auth.updateUser({
      password: newPassword
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  async changePassword(userId, currentPassword, newPassword) {
    // Supabase doesn't have a direct "change password" - user needs to be signed in
    const { error } = await this.client.auth.updateUser({
      password: newPassword
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  // ==================== HELPERS ====================

  _transformUser(user) {
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || null,
      avatar_url: user.user_metadata?.avatar_url || null,
      metadata: user.user_metadata || {},
      created_at: new Date(user.created_at),
      last_sign_in: user.last_sign_in_at ? new Date(user.last_sign_in_at) : null
    };
  }

  _transformSession(session) {
    if (!session) return null;

    return {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at,
      user: this._transformUser(session.user)
    };
  }
}

export default SupabaseAuthAdapter;
