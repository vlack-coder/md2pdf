#!/usr/bin/env node

/**
 * Supabase Setup Script
 * 
 * Creates the required database tables and storage bucket in Supabase.
 * 
 * Usage: 
 *   1. Set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables
 *   2. Run: npm run setup:supabase
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error(`
❌ Missing required environment variables!

Please set:
  SUPABASE_URL=https://your-project.supabase.co
  SUPABASE_SERVICE_KEY=your-service-role-key

You can find these in your Supabase project settings > API
`);
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setup() {
  console.log('🚀 Setting up Supabase for md2pdf E-Library...\n');

  // Create tables using SQL
  const createTablesSQL = `
    -- Enable UUID extension if not already enabled
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- Folders table (topic/category hierarchy)
    CREATE TABLE IF NOT EXISTS folders (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
      user_id UUID, -- Will reference auth.users when auth is enabled
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Books table (documents/files)
    CREATE TABLE IF NOT EXISTS books (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title TEXT NOT NULL,
      folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
      file_path TEXT, -- Path in Supabase storage
      file_type TEXT DEFAULT 'md' CHECK (file_type IN ('md', 'pdf', 'html')),
      file_size INTEGER DEFAULT 0,
      user_id UUID, -- Will reference auth.users when auth is enabled
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON folders(parent_id);
    CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders(user_id);
    CREATE INDEX IF NOT EXISTS idx_books_folder_id ON books(folder_id);
    CREATE INDEX IF NOT EXISTS idx_books_user_id ON books(user_id);
    CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);

    -- Updated_at trigger function
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ language 'plpgsql';

    -- Apply trigger to tables
    DROP TRIGGER IF EXISTS update_folders_updated_at ON folders;
    CREATE TRIGGER update_folders_updated_at
      BEFORE UPDATE ON folders
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();

    DROP TRIGGER IF EXISTS update_books_updated_at ON books;
    CREATE TRIGGER update_books_updated_at
      BEFORE UPDATE ON books
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `;

  console.log('📦 Creating database tables...');
  
  let sqlError = null;
  try {
    // In supabase-js v2, rpc() returns a query builder that becomes a Promise when awaited
    const result = await supabase.rpc('exec_sql', { sql: createTablesSQL });
    sqlError = result.error;
  } catch (err) {
    // If RPC doesn't exist or fails
    sqlError = { message: err.message || 'SQL RPC not available' };
  }

  if (sqlError) {
    console.log('⚠️  Could not run SQL directly. Please run the following SQL in your Supabase SQL Editor:\n');
    console.log('─'.repeat(60));
    console.log(createTablesSQL);
    console.log('─'.repeat(60));
    console.log('\n');
  } else {
    console.log('✅ Database tables created successfully!\n');
  }

  // Create storage bucket
  console.log('📁 Creating storage bucket...');
  
  const { data: buckets } = await supabase.storage.listBuckets();
  const libraryBucketExists = buckets?.some(b => b.name === 'library');

  if (!libraryBucketExists) {
    const { error: bucketError } = await supabase.storage.createBucket('library', {
      public: false,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: [
        'application/pdf',
        'text/html',
        'text/markdown',
        'text/plain'
      ]
    });

    if (bucketError) {
      console.log(`⚠️  Could not create storage bucket: ${bucketError.message}`);
      console.log('   Please create a bucket named "library" in your Supabase dashboard.\n');
    } else {
      console.log('✅ Storage bucket "library" created!\n');
    }
  } else {
    console.log('✅ Storage bucket "library" already exists!\n');
  }

  // Print RLS policies for future auth
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Row Level Security (RLS) Policies

When you enable authentication, add these policies in the SQL Editor:

-- Enable RLS
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- Folders: Users can only access their own folders
CREATE POLICY "Users can view own folders"
  ON folders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own folders"
  ON folders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own folders"
  ON folders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own folders"
  ON folders FOR DELETE
  USING (auth.uid() = user_id);

-- Books: Users can only access their own books
CREATE POLICY "Users can view own books"
  ON books FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own books"
  ON books FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own books"
  ON books FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own books"
  ON books FOR DELETE
  USING (auth.uid() = user_id);

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

  console.log(`
✨ Setup complete!

Next steps:
1. Copy the SQL above and run it in your Supabase SQL Editor
2. Create a .env file or set environment variables:

   SUPABASE_URL=${SUPABASE_URL}
   SUPABASE_KEY=${SUPABASE_KEY}

3. Start the server:
   npm start

`);
}

setup().catch(console.error);
