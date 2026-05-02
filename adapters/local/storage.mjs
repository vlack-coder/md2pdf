/**
 * Local Storage Adapter
 * 
 * Filesystem-based storage for development and self-hosted deployments.
 */

import { StorageAdapter } from '../interfaces/storage.mjs';
import { 
  readFileSync, 
  writeFileSync, 
  unlinkSync, 
  existsSync, 
  mkdirSync, 
  readdirSync, 
  statSync, 
  copyFileSync, 
  renameSync 
} from 'fs';
import { join, dirname, basename } from 'path';

export class LocalStorageAdapter extends StorageAdapter {
  constructor(config) {
    super(config);
    this.baseDir = config.storageDir || './storage';
    this.baseUrl = config.baseUrl || '/files';
  }

  async initialize() {
    // Ensure storage directory exists
    if (!existsSync(this.baseDir)) {
      mkdirSync(this.baseDir, { recursive: true });
    }
  }

  _getFullPath(path) {
    return join(this.baseDir, path);
  }

  _ensureDir(filePath) {
    const dir = dirname(filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  _getMimeType(filename) {
    const ext = filename.split('.').pop()?.toLowerCase();
    const mimeTypes = {
      'pdf': 'application/pdf',
      'html': 'text/html',
      'htm': 'text/html',
      'md': 'text/markdown',
      'txt': 'text/plain',
      'json': 'application/json',
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'svg': 'image/svg+xml'
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  async upload(path, data, options = {}) {
    const fullPath = this._getFullPath(path);
    this._ensureDir(fullPath);

    // Convert various input types to Buffer
    let buffer;
    if (Buffer.isBuffer(data)) {
      buffer = data;
    } else if (data instanceof Uint8Array) {
      buffer = Buffer.from(data);
    } else if (typeof data === 'string') {
      buffer = Buffer.from(data, 'utf-8');
    } else {
      throw new Error('Unsupported data type for upload');
    }

    // Check if file exists and upsert is false
    if (existsSync(fullPath) && !options.upsert) {
      throw new Error('File already exists');
    }

    writeFileSync(fullPath, buffer);

    return this.getMetadata(path);
  }

  async download(path) {
    const fullPath = this._getFullPath(path);
    
    if (!existsSync(fullPath)) {
      throw new Error('File not found');
    }

    return readFileSync(fullPath);
  }

  async delete(path) {
    const fullPath = this._getFullPath(path);
    
    if (existsSync(fullPath)) {
      unlinkSync(fullPath);
    }

    return true;
  }

  async deleteMany(paths) {
    const deleted = [];
    const errors = [];

    for (const path of paths) {
      try {
        await this.delete(path);
        deleted.push(path);
      } catch (e) {
        errors.push(`${path}: ${e.message}`);
      }
    }

    return { deleted, errors };
  }

  async list(prefix, options = {}) {
    const fullPath = this._getFullPath(prefix);
    
    if (!existsSync(fullPath)) {
      return [];
    }

    const stat = statSync(fullPath);
    if (!stat.isDirectory()) {
      return [];
    }

    const files = readdirSync(fullPath);
    const results = [];
    const limit = options.limit || 100;
    const offset = options.offset || 0;

    let count = 0;
    for (const name of files) {
      const filePath = join(fullPath, name);
      const fileStat = statSync(filePath);
      
      if (fileStat.isFile()) {
        if (count >= offset && results.length < limit) {
          const relativePath = prefix ? `${prefix}/${name}` : name;
          results.push({
            path: relativePath,
            name: name,
            size: fileStat.size,
            mimeType: this._getMimeType(name),
            url: `${this.baseUrl}/${relativePath}`,
            created_at: fileStat.birthtime,
            updated_at: fileStat.mtime
          });
        }
        count++;
      }
    }

    return results;
  }

  getPublicUrl(path) {
    return `${this.baseUrl}/${path}`;
  }

  async getSignedUrl(path, expiresIn = 3600) {
    // Local storage doesn't support signed URLs
    // Return the public URL instead
    return this.getPublicUrl(path);
  }

  async exists(path) {
    const fullPath = this._getFullPath(path);
    return existsSync(fullPath);
  }

  async copy(sourcePath, destPath) {
    const srcFull = this._getFullPath(sourcePath);
    const destFull = this._getFullPath(destPath);

    if (!existsSync(srcFull)) {
      throw new Error('Source file not found');
    }

    this._ensureDir(destFull);
    copyFileSync(srcFull, destFull);

    return this.getMetadata(destPath);
  }

  async move(sourcePath, destPath) {
    const srcFull = this._getFullPath(sourcePath);
    const destFull = this._getFullPath(destPath);

    if (!existsSync(srcFull)) {
      throw new Error('Source file not found');
    }

    this._ensureDir(destFull);
    renameSync(srcFull, destFull);

    return this.getMetadata(destPath);
  }

  async getMetadata(path) {
    const fullPath = this._getFullPath(path);

    if (!existsSync(fullPath)) {
      return null;
    }

    const stat = statSync(fullPath);
    const name = basename(path);

    return {
      path: path,
      name: name,
      size: stat.size,
      mimeType: this._getMimeType(name),
      url: this.getPublicUrl(path),
      created_at: stat.birthtime,
      updated_at: stat.mtime
    };
  }
}

export default LocalStorageAdapter;
