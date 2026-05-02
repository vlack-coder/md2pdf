/**
 * Auth API Routes
 * 
 * REST API for authentication operations.
 */

/**
 * Parse JSON body from request
 */
async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error('Request body too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

/**
 * Send JSON response
 */
function sendJson(res, data, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

/**
 * Send error response
 */
function sendError(res, message, status = 400) {
  sendJson(res, { error: message }, status);
}

/**
 * Get token from Authorization header
 */
function getToken(req) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    return auth.slice(7);
  }
  return null;
}

/**
 * Create auth routes handler
 */
export function createAuthRoutes(adapters) {
  return async function handleAuthRequest(req, res, pathname) {
    const method = req.method;
    
    // Check if auth is enabled
    if (!adapters.isAuthEnabled()) {
      // Provide mock responses for local development without auth
      return handleMockAuth(req, res, pathname);
    }
    
    try {
      // POST /api/auth/signup - Register new user
      if (pathname === '/api/auth/signup' && method === 'POST') {
        const body = await parseBody(req);
        
        if (!body.email || !body.password) {
          return sendError(res, 'Email and password are required');
        }
        
        if (body.password.length < 6) {
          return sendError(res, 'Password must be at least 6 characters');
        }
        
        const result = await adapters.auth.signUpWithEmail(
          body.email, 
          body.password,
          { name: body.name }
        );
        
        if (result.error) {
          return sendError(res, result.error);
        }
        
        return sendJson(res, {
          user: result.user,
          session: result.session
        }, 201);
      }
      
      // POST /api/auth/signin - Sign in
      if (pathname === '/api/auth/signin' && method === 'POST') {
        const body = await parseBody(req);
        
        if (!body.email || !body.password) {
          return sendError(res, 'Email and password are required');
        }
        
        const result = await adapters.auth.signInWithEmail(body.email, body.password);
        
        if (result.error) {
          return sendError(res, result.error, 401);
        }
        
        return sendJson(res, {
          user: result.user,
          session: result.session
        });
      }
      
      // POST /api/auth/signout - Sign out
      if (pathname === '/api/auth/signout' && method === 'POST') {
        const token = getToken(req);
        
        if (token) {
          await adapters.auth.signOut(token);
        }
        
        return sendJson(res, { success: true });
      }
      
      // GET /api/auth/me - Get current user
      if (pathname === '/api/auth/me' && method === 'GET') {
        const token = getToken(req);
        
        if (!token) {
          return sendError(res, 'Not authenticated', 401);
        }
        
        const user = await adapters.auth.verifyToken(token);
        
        if (!user) {
          return sendError(res, 'Invalid or expired token', 401);
        }
        
        return sendJson(res, { user });
      }
      
      // POST /api/auth/refresh - Refresh token
      if (pathname === '/api/auth/refresh' && method === 'POST') {
        const body = await parseBody(req);
        
        if (!body.refresh_token) {
          return sendError(res, 'Refresh token is required');
        }
        
        const session = await adapters.auth.refreshSession(body.refresh_token);
        
        if (!session) {
          return sendError(res, 'Invalid refresh token', 401);
        }
        
        return sendJson(res, { session });
      }
      
      // Not found
      return null;
      
    } catch (error) {
      console.error('Auth API error:', error);
      return sendError(res, error.message || 'Internal server error', 500);
    }
  };
}

/**
 * Mock auth for local development without auth enabled
 * Provides basic functionality without requiring a database
 */
async function handleMockAuth(req, res, pathname) {
  const method = req.method;
  
  // For development, we'll use a simple in-memory store
  // This allows the UI to work without full auth setup
  
  if (pathname === '/api/auth/signup' && method === 'POST') {
    // Mock signup - just return success
    return sendJson(res, {
      user: null,
      session: null,
      error: 'Auth is not enabled. Set AUTH_ENABLED=true to enable authentication.'
    });
  }
  
  if (pathname === '/api/auth/signin' && method === 'POST') {
    return sendJson(res, {
      user: null,
      session: null,
      error: 'Auth is not enabled. Set AUTH_ENABLED=true to enable authentication.'
    });
  }
  
  if (pathname === '/api/auth/signout' && method === 'POST') {
    return sendJson(res, { success: true });
  }
  
  if (pathname === '/api/auth/me' && method === 'GET') {
    return sendJson(res, { user: null });
  }
  
  if (pathname === '/api/auth/refresh' && method === 'POST') {
    return sendError(res, 'Auth is not enabled', 401);
  }
  
  return null;
}

export default { createAuthRoutes };
