-- Supabase Database Schema for md2pdf E-Library
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== TABLES ====================

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

-- ==================== INDEXES ====================

CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders(user_id);
CREATE INDEX IF NOT EXISTS idx_books_folder_id ON books(folder_id);
CREATE INDEX IF NOT EXISTS idx_books_user_id ON books(user_id);
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);

-- ==================== TRIGGERS ====================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to folders
DROP TRIGGER IF EXISTS update_folders_updated_at ON folders;
CREATE TRIGGER update_folders_updated_at
  BEFORE UPDATE ON folders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to books
DROP TRIGGER IF EXISTS update_books_updated_at ON books;
CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==================== ROW LEVEL SECURITY (Enable when auth is enabled) ====================

-- Uncomment these when you enable authentication:

-- Enable RLS
-- ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- Folders: Users can only access their own folders
-- CREATE POLICY "Users can view own folders"
--   ON folders FOR SELECT
--   USING (auth.uid() = user_id);

-- CREATE POLICY "Users can create own folders"
--   ON folders FOR INSERT
--   WITH CHECK (auth.uid() = user_id);

-- CREATE POLICY "Users can update own folders"
--   ON folders FOR UPDATE
--   USING (auth.uid() = user_id);

-- CREATE POLICY "Users can delete own folders"
--   ON folders FOR DELETE
--   USING (auth.uid() = user_id);

-- Books: Users can only access their own books
-- CREATE POLICY "Users can view own books"
--   ON books FOR SELECT
--   USING (auth.uid() = user_id);

-- CREATE POLICY "Users can create own books"
--   ON books FOR INSERT
--   WITH CHECK (auth.uid() = user_id);

-- CREATE POLICY "Users can update own books"
--   ON books FOR UPDATE
--   USING (auth.uid() = user_id);

-- CREATE POLICY "Users can delete own books"
--   ON books FOR DELETE
--   USING (auth.uid() = user_id);
