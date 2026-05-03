/**
 * Configuration Management
 * 
 * Loads configuration from environment variables and config files.
 */

import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

/**
 * Default configuration
 */
const defaults = {
  // Server
  port: 8080, // Changed from 3000 to 8080
  host: '0.0.0.0',
  
  // Adapter provider: 'local' | 'supabase'
  provider: 'local',
  
  // Auth (disabled by default for backward compatibility)
  authEnabled: false,
  
  // Storage bucket name
  storageBucket: 'library',
  
  // Local adapter config
  local: {
    dataDir: join(ROOT_DIR, 'data'),
    storageDir: join(ROOT_DIR, 'storage'),
    baseUrl: '/files'
  },
  
  // Supabase config (loaded from env)
  supabase: {
    url: null,
    key: null,
    serviceKey: null
  }
};

/**
 * Load configuration from environment and files
 */
export function loadConfig() {
  const config = { ...defaults };
  
  // Load from config file if exists
  const configPath = join(ROOT_DIR, 'config.json');
  if (existsSync(configPath)) {
    try {
      const fileConfig = JSON.parse(readFileSync(configPath, 'utf-8'));
      Object.assign(config, fileConfig);
    } catch (e) {
      console.warn('Failed to load config.json:', e.message);
    }
  }
  
  // Override with environment variables
  if (process.env.PORT) {
    config.port = parseInt(process.env.PORT);
  }
  
  if (process.env.HOST) {
    config.host = process.env.HOST;
  }
  
  if (process.env.ADAPTER_PROVIDER) {
    config.provider = process.env.ADAPTER_PROVIDER;
  }
  
  if (process.env.AUTH_ENABLED) {
    config.authEnabled = process.env.AUTH_ENABLED === 'true';
  }
  
  if (process.env.STORAGE_BUCKET) {
    config.storageBucket = process.env.STORAGE_BUCKET;
  }
  
  // Local adapter env vars
  if (process.env.DATA_DIR) {
    config.local.dataDir = process.env.DATA_DIR;
  }
  
  if (process.env.STORAGE_DIR) {
    config.local.storageDir = process.env.STORAGE_DIR;
  }
  
  // Supabase env vars
  if (process.env.SUPABASE_URL) {
    let url = process.env.SUPABASE_URL;
    // Ensure URL has https:// prefix
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    // Remove 'db.' prefix if present (common mistake)
    url = url.replace('://db.', '://');
    config.supabase.url = url;
  }
  
  if (process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY) {
    config.supabase.key = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;
  }
  
  if (process.env.SUPABASE_SERVICE_KEY) {
    config.supabase.serviceKey = process.env.SUPABASE_SERVICE_KEY;
  }
  
  // JWT secret for local auth
  if (process.env.JWT_SECRET) {
    config.local.jwtSecret = process.env.JWT_SECRET;
  }
  
  // Validate required config for providers
  if (config.provider === 'supabase') {
    if (!config.supabase.url || !config.supabase.key) {
      console.warn('Supabase provider selected but SUPABASE_URL/SUPABASE_KEY not set. Falling back to local.');
      config.provider = 'local';
    }
  }
  
  return config;
}

/**
 * Get adapter-specific configuration
 */
export function getAdapterConfig(config) {
  const provider = config.provider;
  
  return {
    provider,
    authEnabled: config.authEnabled,
    storageBucket: config.storageBucket,
    ...(config[provider] || {})
  };
}

export default { loadConfig, getAdapterConfig };
