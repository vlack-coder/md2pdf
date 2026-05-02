/**
 * Storage Adapter Interface
 * 
 * All file storage adapters must implement these methods.
 * This allows switching between Supabase Storage, S3, Cloudflare R2, local filesystem, etc.
 */

/**
 * @typedef {Object} StorageFile
 * @property {string} path - Full path in storage
 * @property {string} name - File name
 * @property {number} size - Size in bytes
 * @property {string} mimeType - MIME type
 * @property {string} url - Public/signed URL
 * @property {Date} created_at
 * @property {Date} updated_at
 */

/**
 * @typedef {Object} UploadOptions
 * @property {string} [contentType] - MIME type
 * @property {boolean} [upsert] - Overwrite if exists
 * @property {Object} [metadata] - Custom metadata
 */

/**
 * Abstract Storage Adapter
 * @abstract
 */
export class StorageAdapter {
  constructor(config = {}) {
    if (new.target === StorageAdapter) {
      throw new Error('StorageAdapter is abstract and cannot be instantiated directly');
    }
    this.config = config;
  }

  /**
   * Initialize the storage connection
   * @returns {Promise<void>}
   */
  async initialize() {
    throw new Error('Method initialize() must be implemented');
  }

  /**
   * Upload a file
   * @param {string} path - Destination path (e.g., 'user-id/folder-id/file.pdf')
   * @param {Buffer|Uint8Array|Blob|ReadableStream} data - File data
   * @param {UploadOptions} options
   * @returns {Promise<StorageFile>}
   */
  async upload(path, data, options = {}) {
    throw new Error('Method upload() must be implemented');
  }

  /**
   * Download a file
   * @param {string} path
   * @returns {Promise<Buffer>}
   */
  async download(path) {
    throw new Error('Method download() must be implemented');
  }

  /**
   * Delete a file
   * @param {string} path
   * @returns {Promise<boolean>}
   */
  async delete(path) {
    throw new Error('Method delete() must be implemented');
  }

  /**
   * Delete multiple files
   * @param {string[]} paths
   * @returns {Promise<{deleted: string[], errors: string[]}>}
   */
  async deleteMany(paths) {
    throw new Error('Method deleteMany() must be implemented');
  }

  /**
   * List files in a path
   * @param {string} prefix - Path prefix
   * @param {Object} options - { limit?, offset? }
   * @returns {Promise<StorageFile[]>}
   */
  async list(prefix, options = {}) {
    throw new Error('Method list() must be implemented');
  }

  /**
   * Get a public URL for a file
   * @param {string} path
   * @returns {string}
   */
  getPublicUrl(path) {
    throw new Error('Method getPublicUrl() must be implemented');
  }

  /**
   * Get a signed/temporary URL for a file
   * @param {string} path
   * @param {number} expiresIn - Seconds until expiration
   * @returns {Promise<string>}
   */
  async getSignedUrl(path, expiresIn = 3600) {
    throw new Error('Method getSignedUrl() must be implemented');
  }

  /**
   * Check if a file exists
   * @param {string} path
   * @returns {Promise<boolean>}
   */
  async exists(path) {
    throw new Error('Method exists() must be implemented');
  }

  /**
   * Copy a file
   * @param {string} sourcePath
   * @param {string} destPath
   * @returns {Promise<StorageFile>}
   */
  async copy(sourcePath, destPath) {
    throw new Error('Method copy() must be implemented');
  }

  /**
   * Move/rename a file
   * @param {string} sourcePath
   * @param {string} destPath
   * @returns {Promise<StorageFile>}
   */
  async move(sourcePath, destPath) {
    throw new Error('Method move() must be implemented');
  }

  /**
   * Get file metadata
   * @param {string} path
   * @returns {Promise<StorageFile|null>}
   */
  async getMetadata(path) {
    throw new Error('Method getMetadata() must be implemented');
  }
}

export default StorageAdapter;
