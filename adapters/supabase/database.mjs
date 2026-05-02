/**
 * Supabase Database Adapter
 * 
 * PostgreSQL database operations via Supabase client.
 */

import { DatabaseAdapter } from '../interfaces/database.mjs';

export class SupabaseDatabaseAdapter extends DatabaseAdapter {
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
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  async close() {
    // Supabase client doesn't need explicit closing
    this.client = null;
  }

  // ==================== FOLDER OPERATIONS ====================

  async createFolder(data) {
    const { data: folder, error } = await this.client
      .from('folders')
      .insert({
        name: data.name,
        parent_id: data.parent_id || null,
        user_id: data.user_id || null
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create folder: ${error.message}`);
    return folder;
  }

  async getFolder(id, userId = null) {
    let query = this.client
      .from('folders')
      .select('*')
      .eq('id', id);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: folder, error } = await query.single();
    if (error && error.code !== 'PGRST116') throw new Error(`Failed to get folder: ${error.message}`);
    return folder || null;
  }

  async getFolders(filters = {}) {
    let query = this.client
      .from('folders')
      .select('*')
      .order('name');

    if (filters.parent_id !== undefined) {
      if (filters.parent_id === null) {
        query = query.is('parent_id', null);
      } else {
        query = query.eq('parent_id', filters.parent_id);
      }
    }

    if (filters.user_id !== undefined) {
      if (filters.user_id === null) {
        query = query.is('user_id', null);
      } else {
        query = query.eq('user_id', filters.user_id);
      }
    }

    const { data: folders, error } = await query;
    if (error) throw new Error(`Failed to get folders: ${error.message}`);
    return folders || [];
  }

  async getFolderTree(userId = null) {
    let query = this.client
      .from('folders')
      .select('*')
      .order('name');

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: folders, error } = await query;
    if (error) throw new Error(`Failed to get folder tree: ${error.message}`);

    // Build tree structure
    const folderMap = new Map();
    const roots = [];

    // First pass: create map
    for (const folder of folders || []) {
      folderMap.set(folder.id, { ...folder, children: [] });
    }

    // Second pass: build tree
    for (const folder of folders || []) {
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
    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.parent_id !== undefined) updateData.parent_id = data.parent_id;

    let query = this.client
      .from('folders')
      .update(updateData)
      .eq('id', id);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: folder, error } = await query.select().single();
    if (error && error.code !== 'PGRST116') throw new Error(`Failed to update folder: ${error.message}`);
    return folder || null;
  }

  async deleteFolder(id, cascade = false, userId = null) {
    if (cascade) {
      // Get all child folders recursively
      const children = await this._getDescendantFolderIds(id, userId);
      const allFolderIds = [id, ...children];

      // Delete all books in these folders
      let booksQuery = this.client
        .from('books')
        .delete()
        .in('folder_id', allFolderIds);

      if (userId) {
        booksQuery = booksQuery.eq('user_id', userId);
      }

      await booksQuery;

      // Delete all folders (children first, then parent)
      for (const folderId of allFolderIds.reverse()) {
        let folderQuery = this.client
          .from('folders')
          .delete()
          .eq('id', folderId);

        if (userId) {
          folderQuery = folderQuery.eq('user_id', userId);
        }

        await folderQuery;
      }
    } else {
      // Just delete the folder (will fail if has children due to FK)
      let query = this.client
        .from('folders')
        .delete()
        .eq('id', id);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { error } = await query;
      if (error) throw new Error(`Failed to delete folder: ${error.message}`);
    }

    return true;
  }

  async _getDescendantFolderIds(parentId, userId = null) {
    let query = this.client
      .from('folders')
      .select('id')
      .eq('parent_id', parentId);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: children, error } = await query;
    if (error) return [];

    const ids = [];
    for (const child of children || []) {
      ids.push(child.id);
      const descendants = await this._getDescendantFolderIds(child.id, userId);
      ids.push(...descendants);
    }

    return ids;
  }

  // ==================== BOOK OPERATIONS ====================

  async createBook(data) {
    const { data: book, error } = await this.client
      .from('books')
      .insert({
        title: data.title,
        folder_id: data.folder_id || null,
        file_path: data.file_path || null,
        file_type: data.file_type || 'md',
        file_size: data.file_size || 0,
        user_id: data.user_id || null,
        metadata: data.metadata || {}
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create book: ${error.message}`);
    return book;
  }

  async getBook(id, userId = null) {
    let query = this.client
      .from('books')
      .select('*, folder:folders(id, name)')
      .eq('id', id);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: book, error } = await query.single();
    if (error && error.code !== 'PGRST116') throw new Error(`Failed to get book: ${error.message}`);
    return book || null;
  }

  async getBooks(filters = {}) {
    let query = this.client
      .from('books')
      .select('*, folder:folders(id, name)')
      .order('title');

    if (filters.folder_id !== undefined) {
      if (filters.folder_id === null) {
        query = query.is('folder_id', null);
      } else {
        query = query.eq('folder_id', filters.folder_id);
      }
    }

    if (filters.user_id !== undefined) {
      if (filters.user_id === null) {
        query = query.is('user_id', null);
      } else {
        query = query.eq('user_id', filters.user_id);
      }
    }

    if (filters.file_type) {
      query = query.eq('file_type', filters.file_type);
    }

    if (filters.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }

    const { data: books, error } = await query;
    if (error) throw new Error(`Failed to get books: ${error.message}`);
    return books || [];
  }

  async updateBook(id, data, userId = null) {
    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.folder_id !== undefined) updateData.folder_id = data.folder_id;
    if (data.file_path !== undefined) updateData.file_path = data.file_path;
    if (data.file_type !== undefined) updateData.file_type = data.file_type;
    if (data.file_size !== undefined) updateData.file_size = data.file_size;
    if (data.metadata !== undefined) updateData.metadata = data.metadata;

    let query = this.client
      .from('books')
      .update(updateData)
      .eq('id', id);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: book, error } = await query.select().single();
    if (error && error.code !== 'PGRST116') throw new Error(`Failed to update book: ${error.message}`);
    return book || null;
  }

  async deleteBook(id, userId = null) {
    let query = this.client
      .from('books')
      .delete()
      .eq('id', id);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { error } = await query;
    if (error) throw new Error(`Failed to delete book: ${error.message}`);
    return true;
  }

  async moveBook(bookId, folderId, userId = null) {
    return this.updateBook(bookId, { folder_id: folderId }, userId);
  }

  async searchBooks(query, userId = null) {
    return this.getBooks({ search: query, user_id: userId });
  }
}

export default SupabaseDatabaseAdapter;
