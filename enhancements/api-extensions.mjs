/**
 * API Extensions for Enhanced UX Features
 * 
 * Additional API endpoints needed for:
 * - Book reordering
 * - Folder reordering  
 * - Recent books tracking
 * - Favorites management
 */

/**
 * Extended Library Routes for UX Features
 * Add these routes to routes/library.mjs
 */
export function createExtendedLibraryRoutes(adapters) {
  return async function handleExtendedRequest(req, res, pathname) {
    const method = req.method;
    const { path, query } = parseUrl(req.url);
    
    try {
      // PUT /api/books/:id/reorder - Reorder books within folder
      if (pathname.match(/^\/api\/books\/([^\/]+)\/reorder$/) && method === 'PUT') {
        const bookId = pathname.split('/')[3];
        const userId = await getUserId(req, adapters);
        const body = await parseBody(req);
        
        const { target_book_id, position } = body;
        
        if (!target_book_id || !position) {
          return sendError(res, 'target_book_id and position are required');
        }
        
        // Get both books to determine new order
        const [draggedBook, targetBook] = await Promise.all([
          adapters.database.getBook(bookId, userId),
          adapters.database.getBook(target_book_id, userId)
        ]);
        
        if (!draggedBook || !targetBook) {
          return sendError(res, 'Book not found', 404);
        }
        
        // Ensure books are in same folder
        if (draggedBook.folder_id !== targetBook.folder_id) {
          return sendError(res, 'Books must be in same folder for reordering');
        }
        
        // Calculate new order index
        let newOrderIndex;
        if (position === 'before') {
          newOrderIndex = targetBook.order_index - 0.5;
        } else {
          newOrderIndex = targetBook.order_index + 0.5;
        }
        
        // Update the dragged book's order
        const updatedBook = await adapters.database.updateBook(bookId, {
          order_index: newOrderIndex
        }, userId);
        
        if (!updatedBook) {
          return sendError(res, 'Failed to reorder book', 500);
        }
        
        // Normalize order indices to prevent floating point issues
        await normalizeBookOrder(adapters.database, draggedBook.folder_id, userId);
        
        return sendJson(res, { success: true, book: updatedBook });
      }
      
      // PUT /api/folders/:id/reorder - Reorder folders
      if (pathname.match(/^\/api\/folders\/([^\/]+)\/reorder$/) && method === 'PUT') {
        const folderId = pathname.split('/')[3];
        const userId = await getUserId(req, adapters);
        const body = await parseBody(req);
        
        const { target_folder_id, position } = body;
        
        if (!target_folder_id || !position) {
          return sendError(res, 'target_folder_id and position are required');
        }
        
        // Get both folders
        const [draggedFolder, targetFolder] = await Promise.all([
          adapters.database.getFolder(folderId, userId),
          adapters.database.getFolder(target_folder_id, userId)
        ]);
        
        if (!draggedFolder || !targetFolder) {
          return sendError(res, 'Folder not found', 404);
        }
        
        // Ensure folders have same parent
        if (draggedFolder.parent_id !== targetFolder.parent_id) {
          return sendError(res, 'Folders must have same parent for reordering');
        }
        
        // Calculate new order index
        let newOrderIndex;
        if (position === 'before') {
          newOrderIndex = targetFolder.order_index - 0.5;
        } else {
          newOrderIndex = targetFolder.order_index + 0.5;
        }
        
        // Update the dragged folder's order
        const updatedFolder = await adapters.database.updateFolder(folderId, {
          order_index: newOrderIndex
        }, userId);
        
        if (!updatedFolder) {
          return sendError(res, 'Failed to reorder folder', 500);
        }
        
        // Normalize order indices
        await normalizeFolderOrder(adapters.database, draggedFolder.parent_id, userId);
        
        return sendJson(res, { success: true, folder: updatedFolder });
      }
      
      // POST /api/books/:id/star - Toggle book favorite status
      if (pathname.match(/^\/api\/books\/([^\/]+)\/star$/) && method === 'POST') {
        const bookId = pathname.split('/')[3];
        const userId = await getUserId(req, adapters);
        
        const book = await adapters.database.getBook(bookId, userId);
        if (!book) {
          return sendError(res, 'Book not found', 404);
        }
        
        // Toggle starred status in metadata
        const metadata = book.metadata || {};
        metadata.starred = !metadata.starred;
        
        const updatedBook = await adapters.database.updateBook(bookId, {
          metadata
        }, userId);
        
        return sendJson(res, { 
          success: true, 
          starred: metadata.starred,
          book: updatedBook 
        });
      }
      
      // GET /api/books/starred - Get starred books
      if (pathname === '/api/books/starred' && method === 'GET') {
        const userId = await getUserId(req, adapters);
        
        const books = await adapters.database.getBooks({ 
          user_id: userId 
        });
        
        const starredBooks = books.filter(book => 
          book.metadata?.starred === true
        );
        
        return sendJson(res, { books: starredBooks });
      }
      
      // GET /api/books/recent - Get recently accessed books
      if (pathname === '/api/books/recent' && method === 'GET') {
        const userId = await getUserId(req, adapters);
        const limit = parseInt(query.limit) || 10;
        
        const books = await adapters.database.getBooks({ 
          user_id: userId 
        });
        
        // Sort by last_accessed or updated_at
        const recentBooks = books
          .sort((a, b) => {
            const aTime = new Date(a.metadata?.last_accessed || a.updated_at);
            const bTime = new Date(b.metadata?.last_accessed || b.updated_at);
            return bTime - aTime;
          })
          .slice(0, limit);
        
        return sendJson(res, { books: recentBooks });
      }
      
      // POST /api/books/:id/access - Track book access for recent list
      if (pathname.match(/^\/api\/books\/([^\/]+)\/access$/) && method === 'POST') {
        const bookId = pathname.split('/')[3];
        const userId = await getUserId(req, adapters);
        
        const book = await adapters.database.getBook(bookId, userId);
        if (!book) {
          return sendError(res, 'Book not found', 404);
        }
        
        // Update last_accessed in metadata
        const metadata = book.metadata || {};
        metadata.last_accessed = new Date().toISOString();
        
        await adapters.database.updateBook(bookId, {
          metadata
        }, userId);
        
        return sendJson(res, { success: true });
      }
      
      // GET /api/library/stats - Enhanced library statistics
      if (pathname === '/api/library/stats' && method === 'GET') {
        const userId = await getUserId(req, adapters);
        
        const [folders, books] = await Promise.all([
          adapters.database.getFolders({ user_id: userId }),
          adapters.database.getBooks({ user_id: userId })
        ]);
        
        const stats = {
          totalFolders: folders.length,
          totalBooks: books.length,
          totalSize: books.reduce((sum, book) => sum + (book.file_size || 0), 0),
          booksByType: books.reduce((acc, book) => {
            acc[book.file_type] = (acc[book.file_type] || 0) + 1;
            return acc;
          }, {}),
          starredBooks: books.filter(book => book.metadata?.starred).length,
          recentActivity: books
            .filter(book => {
              const lastWeek = Date.now() - (7 * 24 * 60 * 60 * 1000);
              return new Date(book.updated_at) > lastWeek;
            }).length
        };
        
        return sendJson(res, stats);
      }
      
      return null; // Route not handled
      
    } catch (error) {
      console.error('Extended API error:', error);
      return sendError(res, 'Internal server error', 500);
    }
  };
}

/**
 * Normalize book order indices to prevent floating point accumulation
 */
async function normalizeBookOrder(database, folderId, userId) {
  try {
    const books = await database.getBooks({ 
      folder_id: folderId, 
      user_id: userId 
    });
    
    // Sort by current order_index
    books.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
    
    // Reassign sequential order indices
    for (let i = 0; i < books.length; i++) {
      await database.updateBook(books[i].id, {
        order_index: (i + 1) * 10 // Use increments of 10 for future insertions
      }, userId);
    }
  } catch (error) {
    console.error('Failed to normalize book order:', error);
  }
}

/**
 * Normalize folder order indices
 */
async function normalizeFolderOrder(database, parentId, userId) {
  try {
    const folders = await database.getFolders({ 
      parent_id: parentId, 
      user_id: userId 
    });
    
    // Sort by current order_index
    folders.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
    
    // Reassign sequential order indices
    for (let i = 0; i < folders.length; i++) {
      await database.updateFolder(folders[i].id, {
        order_index: (i + 1) * 10
      }, userId);
    }
  } catch (error) {
    console.error('Failed to normalize folder order:', error);
  }
}

/**
 * Helper functions (add to routes/library.mjs)
 */
export const helperFunctions = `
// Add these helper functions to routes/library.mjs

async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
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

function sendJson(res, data, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function sendError(res, message, status = 400) {
  sendJson(res, { error: message }, status);
}

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

async function getUserId(req, adapters) {
  if (!adapters.isAuthEnabled()) {
    return null;
  }
  
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return null;
  }
  
  const token = auth.slice(7);
  try {
    const user = await adapters.auth.verifyToken(token);
    return user?.id || null;
  } catch (error) {
    console.warn('Token verification failed:', error.message);
    return null;
  }
}
`;

/**
 * Database adapter extensions
 * Add these methods to your database adapters
 */
export const databaseExtensions = `
// Add these methods to adapters/interfaces/database.mjs and implement in providers

/**
 * Update book order index
 * @param {string} bookId
 * @param {number} orderIndex
 * @param {string|null} userId
 * @returns {Promise<Book|null>}
 */
async updateBookOrder(bookId, orderIndex, userId = null) {
  return this.updateBook(bookId, { order_index: orderIndex }, userId);
}

/**
 * Update folder order index
 * @param {string} folderId
 * @param {number} orderIndex
 * @param {string|null} userId
 * @returns {Promise<Folder|null>}
 */
async updateFolderOrder(folderId, orderIndex, userId = null) {
  return this.updateFolder(folderId, { order_index: orderIndex }, userId);
}

/**
 * Get books ordered by order_index
 * @param {Object} filters
 * @returns {Promise<Book[]>}
 */
async getBooksOrdered(filters = {}) {
  const books = await this.getBooks(filters);
  return books.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
}

/**
 * Get folders ordered by order_index
 * @param {Object} filters
 * @returns {Promise<Folder[]>}
 */
async getFoldersOrdered(filters = {}) {
  const folders = await this.getFolders(filters);
  return folders.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
}
`;

export default {
  createExtendedLibraryRoutes,
  helperFunctions,
  databaseExtensions
};