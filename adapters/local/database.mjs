/**
 * Local Database Adapter
 * 
 * JSON file-based database for development and self-hosted deployments.
 */

import { DatabaseAdapter } from '../interfaces/database.mjs';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { randomUUID } from 'crypto';

export class LocalDatabaseAdapter extends DatabaseAdapter {
  constructor(config) {
    super(config);
    this.dataDir = config.dataDir || './data';
    this.foldersFile = join(this.dataDir, 'folders.json');
    this.booksFile = join(this.dataDir, 'books.json');
    this.folders = [];
    this.books = [];
  }

  async initialize() {
    // Ensure data directory exists
    if (!existsSync(this.dataDir)) {
      mkdirSync(this.dataDir, { recursive: true });
    }

    // Load existing data
    this.folders = this._loadJson(this.foldersFile, []);
    this.books = this._loadJson(this.booksFile, []);
  }

  async close() {
    // Save any pending changes
    this._saveJson(this.foldersFile, this.folders);
    this._saveJson(this.booksFile, this.books);
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
    this._saveJson(this.foldersFile, this.folders);
    this._saveJson(this.booksFile, this.books);
  }

  // ==================== FOLDER OPERATIONS ====================

  async createFolder(data) {
    const folder = {
      id: randomUUID(),
      name: data.name,
      parent_id: data.parent_id || null,
      user_id: data.user_id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.folders.push(folder);
    this._save();
    return folder;
  }

  async getFolder(id, userId = null) {
    return this.folders.find(f => 
      f.id === id && (userId === null || f.user_id === userId)
    ) || null;
  }

  async getFolders(filters = {}) {
    let result = [...this.folders];

    if (filters.parent_id !== undefined) {
      result = result.filter(f => f.parent_id === filters.parent_id);
    }

    if (filters.user_id !== undefined) {
      result = result.filter(f => f.user_id === filters.user_id);
    }

    return result.sort((a, b) => a.name.localeCompare(b.name));
  }

  async getFolderTree(userId = null) {
    let folders = userId 
      ? this.folders.filter(f => f.user_id === userId)
      : [...this.folders];

    const folderMap = new Map();
    const roots = [];

    // First pass: create map with children arrays
    for (const folder of folders) {
      folderMap.set(folder.id, { ...folder, children: [] });
    }

    // Second pass: build tree
    for (const folder of folders) {
      const node = folderMap.get(folder.id);
      if (folder.parent_id && folderMap.has(folder.parent_id)) {
        folderMap.get(folder.parent_id).children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  async updateFolder(id, data, userId = null) {
    const index = this.folders.findIndex(f => 
      f.id === id && (userId === null || f.user_id === userId)
    );

    if (index === -1) return null;

    if (data.name !== undefined) this.folders[index].name = data.name;
    if (data.parent_id !== undefined) this.folders[index].parent_id = data.parent_id;
    this.folders[index].updated_at = new Date().toISOString();

    this._save();
    return this.folders[index];
  }

  async deleteFolder(id, cascade = false, userId = null) {
    if (cascade) {
      // Get all descendant folder IDs
      const descendants = this._getDescendants(id, userId);
      const allIds = [id, ...descendants];

      // Delete books in these folders
      this.books = this.books.filter(b => 
        !allIds.includes(b.folder_id) || (userId !== null && b.user_id !== userId)
      );

      // Delete folders
      this.folders = this.folders.filter(f => 
        !allIds.includes(f.id) || (userId !== null && f.user_id !== userId)
      );
    } else {
      this.folders = this.folders.filter(f => 
        f.id !== id || (userId !== null && f.user_id !== userId)
      );
    }

    this._save();
    return true;
  }

  _getDescendants(parentId, userId) {
    const children = this.folders.filter(f => 
      f.parent_id === parentId && (userId === null || f.user_id === userId)
    );

    let descendants = [];
    for (const child of children) {
      descendants.push(child.id);
      descendants = descendants.concat(this._getDescendants(child.id, userId));
    }

    return descendants;
  }

  // ==================== BOOK OPERATIONS ====================

  async createBook(data) {
    const book = {
      id: randomUUID(),
      title: data.title,
      folder_id: data.folder_id || null,
      file_path: data.file_path || null,
      file_type: data.file_type || 'md',
      file_size: data.file_size || 0,
      user_id: data.user_id || null,
      metadata: data.metadata || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.books.push(book);
    this._save();
    return book;
  }

  async getBook(id, userId = null) {
    const book = this.books.find(b => 
      b.id === id && (userId === null || b.user_id === userId)
    );

    if (!book) return null;

    // Add folder info
    const folder = book.folder_id 
      ? this.folders.find(f => f.id === book.folder_id)
      : null;

    return {
      ...book,
      folder: folder ? { id: folder.id, name: folder.name } : null
    };
  }

  async getBooks(filters = {}) {
    let result = [...this.books];

    if (filters.folder_id !== undefined) {
      result = result.filter(b => b.folder_id === filters.folder_id);
    }

    if (filters.user_id !== undefined) {
      result = result.filter(b => b.user_id === filters.user_id);
    }

    if (filters.file_type) {
      result = result.filter(b => b.file_type === filters.file_type);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(b => b.title.toLowerCase().includes(search));
    }

    // Add folder info
    return result
      .sort((a, b) => a.title.localeCompare(b.title))
      .map(book => {
        const folder = book.folder_id 
          ? this.folders.find(f => f.id === book.folder_id)
          : null;
        return {
          ...book,
          folder: folder ? { id: folder.id, name: folder.name } : null
        };
      });
  }

  async updateBook(id, data, userId = null) {
    const index = this.books.findIndex(b => 
      b.id === id && (userId === null || b.user_id === userId)
    );

    if (index === -1) return null;

    if (data.title !== undefined) this.books[index].title = data.title;
    if (data.folder_id !== undefined) this.books[index].folder_id = data.folder_id;
    if (data.file_path !== undefined) this.books[index].file_path = data.file_path;
    if (data.file_type !== undefined) this.books[index].file_type = data.file_type;
    if (data.file_size !== undefined) this.books[index].file_size = data.file_size;
    if (data.metadata !== undefined) this.books[index].metadata = data.metadata;
    this.books[index].updated_at = new Date().toISOString();

    this._save();
    return this.getBook(id, userId);
  }

  async deleteBook(id, userId = null) {
    this.books = this.books.filter(b => 
      b.id !== id || (userId !== null && b.user_id !== userId)
    );

    this._save();
    return true;
  }

  async moveBook(bookId, folderId, userId = null) {
    return this.updateBook(bookId, { folder_id: folderId }, userId);
  }

  async searchBooks(query, userId = null) {
    return this.getBooks({ search: query, user_id: userId });
  }
}

export default LocalDatabaseAdapter;
