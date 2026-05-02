/**
 * Adapter Factory
 * 
 * Creates and manages adapter instances based on configuration.
 * Supports switching between providers (Supabase, Firebase, Local, etc.)
 */

// Lazy-loaded adapter modules
const adapters = {
  supabase: null,
  local: null
};

/**
 * Load adapter module lazily
 */
async function loadAdapter(provider) {
  if (!adapters[provider]) {
    switch (provider) {
      case 'supabase':
        adapters[provider] = await import('./supabase/index.mjs');
        break;
      case 'local':
        adapters[provider] = await import('./local/index.mjs');
        break;
      default:
        throw new Error(`Unknown adapter provider: ${provider}`);
    }
  }
  return adapters[provider];
}

/**
 * Create a database adapter instance
 * @param {string} provider - 'supabase' | 'local' | 'firebase' etc.
 * @param {Object} config - Provider-specific configuration
 * @returns {Promise<DatabaseAdapter>}
 */
export async function createDatabaseAdapter(provider, config) {
  const module = await loadAdapter(provider);
  
  let adapter;
  switch (provider) {
    case 'supabase':
      adapter = new module.SupabaseDatabaseAdapter(config);
      break;
    case 'local':
      adapter = new module.LocalDatabaseAdapter(config);
      break;
    default:
      throw new Error(`No database adapter for provider: ${provider}`);
  }

  await adapter.initialize();
  return adapter;
}

/**
 * Create a storage adapter instance
 * @param {string} provider
 * @param {Object} config
 * @returns {Promise<StorageAdapter>}
 */
export async function createStorageAdapter(provider, config) {
  const module = await loadAdapter(provider);
  
  let adapter;
  switch (provider) {
    case 'supabase':
      adapter = new module.SupabaseStorageAdapter(config);
      break;
    case 'local':
      adapter = new module.LocalStorageAdapter(config);
      break;
    default:
      throw new Error(`No storage adapter for provider: ${provider}`);
  }

  await adapter.initialize();
  return adapter;
}

/**
 * Create an auth adapter instance
 * @param {string} provider
 * @param {Object} config
 * @returns {Promise<AuthAdapter>}
 */
export async function createAuthAdapter(provider, config) {
  const module = await loadAdapter(provider);
  
  let adapter;
  switch (provider) {
    case 'supabase':
      adapter = new module.SupabaseAuthAdapter(config);
      break;
    case 'local':
      // Local auth uses JWT-based authentication
      adapter = new module.LocalAuthAdapter(config);
      break;
    default:
      throw new Error(`No auth adapter for provider: ${provider}`);
  }

  await adapter.initialize();
  return adapter;
}

/**
 * AdapterManager - manages all adapters for the application
 */
export class AdapterManager {
  constructor() {
    this.database = null;
    this.storage = null;
    this.auth = null;
    this.config = null;
    this.initialized = false;
  }

  /**
   * Initialize all adapters from configuration
   * @param {Object} config
   */
  async initialize(config) {
    this.config = config;
    
    const provider = config.provider || 'local';
    const providerConfig = config[provider] || config;

    // Initialize adapters in parallel
    const [database, storage] = await Promise.all([
      createDatabaseAdapter(provider, providerConfig),
      createStorageAdapter(provider, {
        ...providerConfig,
        bucket: config.storageBucket || 'library'
      })
    ]);

    this.database = database;
    this.storage = storage;

    // Auth is optional - only initialize if auth is enabled
    if (config.authEnabled) {
      this.auth = await createAuthAdapter(provider, providerConfig);
    }

    this.initialized = true;
  }

  /**
   * Close all adapter connections
   */
  async close() {
    if (this.database?.close) await this.database.close();
    this.initialized = false;
  }

  /**
   * Get the current provider name
   */
  getProvider() {
    return this.config?.provider || 'local';
  }

  /**
   * Check if auth is enabled
   */
  isAuthEnabled() {
    return this.config?.authEnabled && this.auth !== null;
  }
}

// Singleton instance
let managerInstance = null;

/**
 * Get the global AdapterManager instance
 */
export function getAdapterManager() {
  if (!managerInstance) {
    managerInstance = new AdapterManager();
  }
  return managerInstance;
}

/**
 * Initialize the global adapter manager with config
 */
export async function initializeAdapters(config) {
  const manager = getAdapterManager();
  await manager.initialize(config);
  return manager;
}

export default {
  createDatabaseAdapter,
  createStorageAdapter,
  createAuthAdapter,
  AdapterManager,
  getAdapterManager,
  initializeAdapters
};
