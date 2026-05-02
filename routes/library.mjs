/**
 * Library API Routes
 * 
 * REST API for folders and books management.
 */

/**
 * Parse JSON body from request
 */
async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      // Limit body size to 10MB
      if (body.length > 10 * 1024 * 1024) {
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
 * Get user ID from request by verifying auth token
 */
async function getUserId(req, adapters) {
  // When auth is disabled, allow anonymous access
  if (!adapters.isAuthEnabled()) {
    return null;
  }
  
  const token = getToken(req);
  if (!token) {
    return null;
  }
  
  try {
    const user = await adapters.auth.verifyToken(token);
    return user?.id || null;
  } catch (error) {
    console.warn('Token verification failed:', error.message);
    return null;
  }
}

/**
 * Parse URL and query string
 */
function parseUrl(url) {
  const [path, queryString] = url.split('?');
  const query = {};
  
  if (queryString) {
    for (const param of queryString.split('&')) {
      const [key, value] = param.split('=');
      query[decodeURIComponent(key)] = decodeURIComponent(value || '');
    }
  }
  
  return { path, query };
}

/**
 * Create library routes handler
 */
export function createLibraryRoutes(adapters) {
  return async function handleLibraryRequest(req, res, pathname) {
    const { path, query } = parseUrl(pathname);
    const method = req.method;
    
    try {
      // For write operations, require authentication when auth is enabled
      const isWriteOperation = method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE';
      
      if (isWriteOperation && adapters.isAuthEnabled()) {
        const userId = await getUserId(req, adapters);
        if (!userId) {
          return sendError(res, 'Authentication required', 401);
        }
      }
      
      // ==================== FOLDERS ====================
      
      // GET /api/folders - List folders
      if (path === '/api/folders' && method === 'GET') {
        const userId = await getUserId(req, adapters);
        const filters = {};
        
        if (query.parent_id !== undefined) {
          filters.parent_id = query.parent_id === 'null' ? null : query.parent_id;
        }
        
        // When auth is enabled, always filter by user (return empty if not authenticated)
        if (adapters.isAuthEnabled()) {
          filters.user_id = userId; // null if not authenticated = no results
        }
        
        const folders = await adapters.database.getFolders(filters);
        return sendJson(res, { folders });
      }
      
      // GET /api/folders/tree - Get folder tree
      if (path === '/api/folders/tree' && method === 'GET') {
        const userId = await getUserId(req, adapters);
        
        // When auth is enabled, require authentication
        if (adapters.isAuthEnabled() && !userId) {
          return sendJson(res, { tree: [] });
        }
        
        const tree = await adapters.database.getFolderTree(userId);
        return sendJson(res, { tree });
      }
      
      // POST /api/folders - Create folder
      if (path === '/api/folders' && method === 'POST') {
        const body = await parseBody(req);
        const userId = await getUserId(req, adapters);
        
        if (!body.name) {
          return sendError(res, 'Folder name is required');
        }
        
        const folder = await adapters.database.createFolder({
          name: body.name,
          parent_id: body.parent_id || null,
          user_id: userId
        });
        
        return sendJson(res, { folder }, 201);
      }
      
      // GET /api/folders/:id - Get folder
      const folderMatch = path.match(/^\/api\/folders\/([a-f0-9-]+)$/);
      if (folderMatch && method === 'GET') {
        const userId = await getUserId(req, adapters);
        const folder = await adapters.database.getFolder(folderMatch[1], userId);
        
        if (!folder) {
          return sendError(res, 'Folder not found', 404);
        }
        
        return sendJson(res, { folder });
      }
      
      // PUT /api/folders/:id - Update folder
      if (folderMatch && method === 'PUT') {
        const body = await parseBody(req);
        const userId = await getUserId(req, adapters);
        
        const folder = await adapters.database.updateFolder(
          folderMatch[1],
          body,
          userId
        );
        
        if (!folder) {
          return sendError(res, 'Folder not found', 404);
        }
        
        return sendJson(res, { folder });
      }
      
      // DELETE /api/folders/:id - Delete folder
      if (folderMatch && method === 'DELETE') {
        const userId = await getUserId(req, adapters);
        const cascade = query.cascade === 'true';
        
        await adapters.database.deleteFolder(folderMatch[1], cascade, userId);
        return sendJson(res, { success: true });
      }
      
      // ==================== BOOKS ====================
      
      // GET /api/books - List books
      if (path === '/api/books' && method === 'GET') {
        const userId = await getUserId(req, adapters);
        const filters = {};
        
        if (query.folder_id !== undefined) {
          filters.folder_id = query.folder_id === 'null' ? null : query.folder_id;
        }
        if (query.file_type) filters.file_type = query.file_type;
        if (query.search) filters.search = query.search;
        
        // When auth is enabled, always filter by user
        if (adapters.isAuthEnabled()) {
          filters.user_id = userId;
        }
        
        const books = await adapters.database.getBooks(filters);
        return sendJson(res, { books });
      }
      
      // POST /api/books - Create book
      if (path === '/api/books' && method === 'POST') {
        const body = await parseBody(req);
        const userId = await getUserId(req, adapters);
        
        if (!body.title) {
          return sendError(res, 'Book title is required');
        }
        
        const book = await adapters.database.createBook({
          title: body.title,
          folder_id: body.folder_id || null,
          file_path: body.file_path || null,
          file_type: body.file_type || 'md',
          file_size: body.file_size || 0,
          metadata: body.metadata || {},
          user_id: userId
        });
        
        return sendJson(res, { book }, 201);
      }
      
      // GET /api/books/search - Search books
      if (path === '/api/books/search' && method === 'GET') {
        const userId = await getUserId(req, adapters);
        
        if (!query.q) {
          return sendError(res, 'Search query is required');
        }
        
        // When auth is enabled but not authenticated, return empty
        if (adapters.isAuthEnabled() && !userId) {
          return sendJson(res, { books: [] });
        }
        
        const books = await adapters.database.searchBooks(query.q, userId);
        return sendJson(res, { books });
      }
      
      // GET /api/books/:id - Get book
      const bookMatch = path.match(/^\/api\/books\/([a-f0-9-]+)$/);
      if (bookMatch && method === 'GET') {
        const userId = await getUserId(req, adapters);
        const book = await adapters.database.getBook(bookMatch[1], userId);
        
        if (!book) {
          return sendError(res, 'Book not found', 404);
        }
        
        return sendJson(res, { book });
      }
      
      // PUT /api/books/:id - Update book
      // PATCH /api/books/:id - Partial update book
      if (bookMatch && (method === 'PUT' || method === 'PATCH')) {
        const body = await parseBody(req);
        const userId = await getUserId(req, adapters);
        
        const book = await adapters.database.updateBook(
          bookMatch[1],
          body,
          userId
        );
        
        if (!book) {
          return sendError(res, 'Book not found', 404);
        }
        
        return sendJson(res, { book });
      }
      
      // DELETE /api/books/:id - Delete book
      if (bookMatch && method === 'DELETE') {
        const userId = await getUserId(req, adapters);
        const book = await adapters.database.getBook(bookMatch[1], userId);
        
        if (book && book.file_path) {
          // Delete associated file from storage
          try {
            await adapters.storage.delete(book.file_path);
          } catch (e) {
            console.warn('Failed to delete book file:', e.message);
          }
        }
        
        await adapters.database.deleteBook(bookMatch[1], userId);
        return sendJson(res, { success: true });
      }
      
      // PUT /api/books/:id/move - Move book to folder
      const moveMatch = path.match(/^\/api\/books\/([a-f0-9-]+)\/move$/);
      if (moveMatch && method === 'PUT') {
        const body = await parseBody(req);
        const userId = await getUserId(req, adapters);
        
        const book = await adapters.database.moveBook(
          moveMatch[1],
          body.folder_id,
          userId
        );
        
        if (!book) {
          return sendError(res, 'Book not found', 404);
        }
        
        return sendJson(res, { book });
      }
      
      // ==================== FILE UPLOAD ====================
      
      // POST /api/upload - Upload file and create book
      if (path === '/api/upload' && method === 'POST') {
        // For file uploads, we need to handle multipart form data
        // This is a simplified version - in production, use a proper multipart parser
        return sendError(res, 'File upload requires multipart handling - use /api/books with file_path', 501);
      }
      
      // ==================== STATS ====================
      
      // GET /api/stats - Get library statistics
      if (path === '/api/stats' && method === 'GET') {
        const userId = await getUserId(req, adapters);
        
        // When auth is enabled, filter by user
        const userFilter = adapters.isAuthEnabled() ? { user_id: userId } : {};
        
        const folders = await adapters.database.getFolders(userFilter);
        const books = await adapters.database.getBooks(userFilter);
        
        const stats = {
          totalFolders: folders.length,
          totalBooks: books.length,
          booksByType: {},
          totalSize: 0
        };
        
        for (const book of books) {
          stats.booksByType[book.file_type] = (stats.booksByType[book.file_type] || 0) + 1;
          stats.totalSize += book.file_size || 0;
        }
        
        return sendJson(res, { stats });
      }
      
      // Not found
      return null;
      
    } catch (error) {
      console.error('Library API error:', error);
      return sendError(res, error.message || 'Internal server error', 500);
    }
  };
}

export default { createLibraryRoutes };
