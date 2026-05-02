/**
 * Supabase Storage Adapter
 * 
 * File storage operations via Supabase Storage.
 */

import { StorageAdapter } from '../interfaces/storage.mjs';

export class SupabaseStorageAdapter extends StorageAdapter {
  constructor(config) {
    super(config);
    this.client = null;
    this.bucket = config.bucket || 'library';
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

    // Ensure bucket exists (requires service role key)
    try {
      const { data: buckets } = await this.client.storage.listBuckets();
      const bucketExists = buckets?.some(b => b.name === this.bucket);
      
      if (!bucketExists && this.config.createBucketIfNotExists) {
        await this.client.storage.createBucket(this.bucket, {
          public: this.config.publicBucket || false
        });
      }
    } catch (error) {
      // Bucket creation might fail if not using service role - that's okay
      console.warn(`Could not create bucket: ${error.message}`);
    }
  }

  async upload(path, data, options = {}) {
    const { data: result, error } = await this.client.storage
      .from(this.bucket)
      .upload(path, data, {
        contentType: options.contentType,
        upsert: options.upsert || false,
        cacheControl: options.cacheControl || '3600'
      });

    if (error) throw new Error(`Failed to upload file: ${error.message}`);

    // Get file metadata
    const metadata = await this.getMetadata(path);
    return metadata;
  }

  async download(path) {
    const { data, error } = await this.client.storage
      .from(this.bucket)
      .download(path);

    if (error) throw new Error(`Failed to download file: ${error.message}`);
    
    // Convert Blob to Buffer
    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  async delete(path) {
    const { error } = await this.client.storage
      .from(this.bucket)
      .remove([path]);

    if (error) throw new Error(`Failed to delete file: ${error.message}`);
    return true;
  }

  async deleteMany(paths) {
    const { data, error } = await this.client.storage
      .from(this.bucket)
      .remove(paths);

    if (error) {
      return {
        deleted: [],
        errors: paths.map(p => `${p}: ${error.message}`)
      };
    }

    return {
      deleted: paths,
      errors: []
    };
  }

  async list(prefix, options = {}) {
    const { data, error } = await this.client.storage
      .from(this.bucket)
      .list(prefix, {
        limit: options.limit || 100,
        offset: options.offset || 0,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (error) throw new Error(`Failed to list files: ${error.message}`);

    return (data || []).map(file => ({
      path: `${prefix}/${file.name}`.replace(/^\/+/, ''),
      name: file.name,
      size: file.metadata?.size || 0,
      mimeType: file.metadata?.mimetype || 'application/octet-stream',
      url: this.getPublicUrl(`${prefix}/${file.name}`),
      created_at: new Date(file.created_at),
      updated_at: new Date(file.updated_at || file.created_at)
    }));
  }

  getPublicUrl(path) {
    const { data } = this.client.storage
      .from(this.bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  async getSignedUrl(path, expiresIn = 3600) {
    const { data, error } = await this.client.storage
      .from(this.bucket)
      .createSignedUrl(path, expiresIn);

    if (error) throw new Error(`Failed to create signed URL: ${error.message}`);
    return data.signedUrl;
  }

  async exists(path) {
    try {
      const { data, error } = await this.client.storage
        .from(this.bucket)
        .list(path.split('/').slice(0, -1).join('/'), {
          search: path.split('/').pop()
        });

      if (error) return false;
      return data?.some(f => f.name === path.split('/').pop()) || false;
    } catch {
      return false;
    }
  }

  async copy(sourcePath, destPath) {
    const { data, error } = await this.client.storage
      .from(this.bucket)
      .copy(sourcePath, destPath);

    if (error) throw new Error(`Failed to copy file: ${error.message}`);
    return this.getMetadata(destPath);
  }

  async move(sourcePath, destPath) {
    const { data, error } = await this.client.storage
      .from(this.bucket)
      .move(sourcePath, destPath);

    if (error) throw new Error(`Failed to move file: ${error.message}`);
    return this.getMetadata(destPath);
  }

  async getMetadata(path) {
    // Supabase doesn't have a direct metadata endpoint, so we list and filter
    const folder = path.split('/').slice(0, -1).join('/') || '';
    const filename = path.split('/').pop();

    const { data, error } = await this.client.storage
      .from(this.bucket)
      .list(folder, {
        search: filename
      });

    if (error || !data?.length) return null;

    const file = data.find(f => f.name === filename);
    if (!file) return null;

    return {
      path: path,
      name: file.name,
      size: file.metadata?.size || 0,
      mimeType: file.metadata?.mimetype || 'application/octet-stream',
      url: this.getPublicUrl(path),
      created_at: new Date(file.created_at),
      updated_at: new Date(file.updated_at || file.created_at)
    };
  }
}

export default SupabaseStorageAdapter;
