/**
 * Database Adapter Interface
 * 
 * All database adapters must implement these methods.
 * This allows switching between Supabase, Firebase, PostgreSQL, MongoDB, etc.
 */

/**
 * @typedef {Object} Folder
 * @property {string} id - UUID
 * @property {string} name - Folder name
 * @property {string|null} parent_id - Parent folder UUID or null for root
 * @property {string|null} user_id - Owner user UUID (null if no auth)
 * @property {Date} created_at
 * @property {Date} updated_at
 */

/**
 * @typedef {Object} Book
 * @property {string} id - UUID
 * @property {string} title - Book title
 * @property {string|null} folder_id - Parent folder UUID
 * @property {string|null} file_path - Storage path for the file
 * @property {string} file_type - 'pdf', 'html', 'md'
 * @property {number} file_size - Size in bytes
 * @property {string|null} user_id - Owner user UUID (null if no auth)
 * @property {Object|null} metadata - Additional metadata (cover, description, etc.)
 * @property {Date} created_at
 * @property {Date} updated_at
 */

/**
 * Abstract Database Adapter
 * @abstract
 */
export class DatabaseAdapter {
  constructor(config = {}) {
    if (new.target === DatabaseAdapter) {
      throw new Error('DatabaseAdapter is abstract and cannot be instantiated directly');
    }
    this.config = config;
  }

  /**
   * Initialize the database connection
   * @returns {Promise<void>}
   */
  async initialize() {
    throw new Error('Method initialize() must be implemented');
  }

  /**
   * Close the database connection
   * @returns {Promise<void>}
   */
  async close() {
    throw new Error('Method close() must be implemented');
  }

  // ==================== FOLDER OPERATIONS ====================

  /**
   * Create a new folder
   * @param {Object} data - { name, parent_id?, user_id? }
   * @returns {Promise<Folder>}
   */
  async createFolder(data) {
    throw new Error('Method createFolder() must be implemented');
  }

  /**
   * Get a folder by ID
   * @param {string} id
   * @param {string|null} userId - Filter by user (null for all)
   * @returns {Promise<Folder|null>}
   */
  async getFolder(id, userId = null) {
    throw new Error('Method getFolder() must be implemented');
  }

  /**
   * Get all folders (optionally filtered by parent or user)
   * @param {Object} filters - { parent_id?, user_id? }
   * @returns {Promise<Folder[]>}
   */
  async getFolders(filters = {}) {
    throw new Error('Method getFolders() must be implemented');
  }

  /**
   * Get folder tree (recursive structure)
   * @param {string|null} userId
   * @returns {Promise<Object[]>} - Nested folder structure
   */
  async getFolderTree(userId = null) {
    throw new Error('Method getFolderTree() must be implemented');
  }

  /**
   * Update a folder
   * @param {string} id
   * @param {Object} data - { name?, parent_id? }
   * @param {string|null} userId - Ownership check
   * @returns {Promise<Folder|null>}
   */
  async updateFolder(id, data, userId = null) {
    throw new Error('Method updateFolder() must be implemented');
  }

  /**
   * Delete a folder (and optionally its contents)
   * @param {string} id
   * @param {boolean} cascade - Delete children too
   * @param {string|null} userId - Ownership check
   * @returns {Promise<boolean>}
   */
  async deleteFolder(id, cascade = false, userId = null) {
    throw new Error('Method deleteFolder() must be implemented');
  }

  // ==================== BOOK OPERATIONS ====================

  /**
   * Create a new book
   * @param {Object} data - { title, folder_id?, file_path?, file_type, file_size?, user_id?, metadata? }
   * @returns {Promise<Book>}
   */
  async createBook(data) {
    throw new Error('Method createBook() must be implemented');
  }

  /**
   * Get a book by ID
   * @param {string} id
   * @param {string|null} userId
   * @returns {Promise<Book|null>}
   */
  async getBook(id, userId = null) {
    throw new Error('Method getBook() must be implemented');
  }

  /**
   * Get all books (optionally filtered)
   * @param {Object} filters - { folder_id?, user_id?, file_type?, search? }
   * @returns {Promise<Book[]>}
   */
  async getBooks(filters = {}) {
    throw new Error('Method getBooks() must be implemented');
  }

  /**
   * Update a book
   * @param {string} id
   * @param {Object} data
   * @param {string|null} userId
   * @returns {Promise<Book|null>}
   */
  async updateBook(id, data, userId = null) {
    throw new Error('Method updateBook() must be implemented');
  }

  /**
   * Delete a book
   * @param {string} id
   * @param {string|null} userId
   * @returns {Promise<boolean>}
   */
  async deleteBook(id, userId = null) {
    throw new Error('Method deleteBook() must be implemented');
  }

  /**
   * Move a book to a different folder
   * @param {string} bookId
   * @param {string|null} folderId
   * @param {string|null} userId
   * @returns {Promise<Book|null>}
   */
  async moveBook(bookId, folderId, userId = null) {
    throw new Error('Method moveBook() must be implemented');
  }

  /**
   * Search books by title or content
   * @param {string} query
   * @param {string|null} userId
   * @returns {Promise<Book[]>}
   */
  async searchBooks(query, userId = null) {
    throw new Error('Method searchBooks() must be implemented');
  }
}

export default DatabaseAdapter;
