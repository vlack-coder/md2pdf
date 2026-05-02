# E-Library Implementation Changes

## Overview

This document tracks the implementation of the E-Library system for md2pdf, transforming it from a simple markdown converter into a full-featured document library with folder organization and multi-provider storage support.

---

## Version 2.0.0 - E-Library System

### Architecture

The library system uses an **adapter pattern** that allows switching between storage providers without changing application code. This makes it easy to:
- Start with local file storage for development
- Switch to Supabase for production
- Add future providers (Firebase, MongoDB, S3, etc.)

```
┌─────────────────────────────────────────────────────────┐
│                    E-Library System                      │
├─────────────────────────────────────────────────────────┤
│  API Layer (REST endpoints in routes/library.mjs)        │
│  - /api/folders - CRUD for topics/folders                │
│  - /api/books - CRUD for books/documents                 │
│  - /api/stats - Library statistics                       │
├─────────────────────────────────────────────────────────┤
│  Adapter Manager (adapters/index.mjs)                    │
│  - Factory pattern for creating adapters                 │
│  - Singleton manager for global access                   │
├─────────────────────────────────────────────────────────┤
│  Adapter Interfaces (adapters/interfaces/)               │
│  - DatabaseAdapter - Folder/Book CRUD operations         │
│  - StorageAdapter - File upload/download                 │
│  - AuthAdapter - User authentication (future)            │
├─────────────────────────────────────────────────────────┤
│  Provider Implementations                                │
│  ┌─────────────────┐  ┌─────────────────┐               │
│  │  Local Adapter  │  │ Supabase Adapter│               │
│  │  (JSON + FS)    │  │ (PostgreSQL+S3) │               │
│  └─────────────────┘  └─────────────────┘               │
└─────────────────────────────────────────────────────────┘
```

---

## Files Created

### Adapter Interfaces
| File | Purpose |
|------|---------|
| `adapters/interfaces/database.mjs` | Abstract interface for database operations (folders, books) |
| `adapters/interfaces/storage.mjs` | Abstract interface for file storage operations |
| `adapters/interfaces/auth.mjs` | Abstract interface for authentication (future use) |
| `adapters/interfaces/index.mjs` | Export all interfaces |

### Supabase Implementation
| File | Purpose |
|------|---------|
| `adapters/supabase/database.mjs` | PostgreSQL database operations via Supabase |
| `adapters/supabase/storage.mjs` | File storage via Supabase Storage (S3-compatible) |
| `adapters/supabase/auth.mjs` | Authentication via Supabase Auth |
| `adapters/supabase/index.mjs` | Export all Supabase adapters |

### Local Implementation (Self-Hosted/Development)
| File | Purpose |
|------|---------|
| `adapters/local/database.mjs` | JSON file-based database |
| `adapters/local/storage.mjs` | Local filesystem storage |
| `adapters/local/auth.mjs` | JWT-based local authentication |
| `adapters/local/index.mjs` | Export all local adapters |

### Core System
| File | Purpose |
|------|---------|
| `adapters/index.mjs` | Adapter factory and manager |
| `config/index.mjs` | Configuration loading (env vars + config.json) |
| `routes/library.mjs` | REST API routes for library operations |
| `routes/auth.mjs` | REST API routes for authentication |

### User Interface
| File | Purpose |
|------|---------|
| `ui/library-ui.mjs` | Library sidebar, auth modal, save modal UI components |

### Setup & Configuration
| File | Purpose |
|------|---------|
| `scripts/setup-supabase.mjs` | Setup script for Supabase (creates tables, bucket) |
| `scripts/supabase-schema.sql` | SQL schema for manual setup |
| `config.example.json` | Example configuration file |
| `.env.example` | Example environment variables |

---

## Files Modified

### server.mjs
- Added library system imports
- Added adapter initialization on startup
- Added library API routes (/api/folders, /api/books, etc.)
- Added file serving for local storage (/files/*)
- Updated CORS to support PUT/DELETE methods
- Updated graceful shutdown to close adapters
- Updated server banner

### package.json
- Version bumped to 2.0.0
- Added `@supabase/supabase-js` dependency
- Added `setup:supabase` script
- Updated description and keywords

---

## API Endpoints

### Folders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/folders` | List folders (optional: ?parent_id=...) |
| GET | `/api/folders/tree` | Get folder tree structure |
| GET | `/api/folders/:id` | Get single folder |
| POST | `/api/folders` | Create folder |
| PUT | `/api/folders/:id` | Update folder |
| DELETE | `/api/folders/:id` | Delete folder (?cascade=true for recursive) |

### Books
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/books` | List books (optional: ?folder_id=...&search=...) |
| GET | `/api/books/search?q=...` | Search books by title |
| GET | `/api/books/:id` | Get single book |
| POST | `/api/books` | Create book |
| PUT | `/api/books/:id` | Update book |
| DELETE | `/api/books/:id` | Delete book (also removes file) |
| PUT | `/api/books/:id/move` | Move book to folder |

### Statistics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stats` | Get library statistics |

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/signin` | Sign in with email/password |
| POST | `/api/auth/signout` | Sign out (invalidate session) |
| GET | `/api/auth/me` | Get current authenticated user |
| POST | `/api/auth/refresh` | Refresh access token |

---

## Configuration

### Environment Variables
```bash
# Provider: 'local' or 'supabase'
ADAPTER_PROVIDER=local

# Auth (disabled by default)
AUTH_ENABLED=false

# Local adapter
DATA_DIR=./data
STORAGE_DIR=./storage
JWT_SECRET=your-secret

# Supabase adapter
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=your-anon-key
```

### config.json (optional)
```json
{
  "provider": "local",
  "authEnabled": false,
  "storageBucket": "library",
  "local": {
    "dataDir": "./data",
    "storageDir": "./storage"
  }
}
```

---

## Database Schema

### folders
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Folder name |
| parent_id | UUID | Parent folder (null for root) |
| user_id | UUID | Owner (null when no auth) |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update time |

### books
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | TEXT | Book title |
| folder_id | UUID | Parent folder |
| file_path | TEXT | Storage path |
| file_type | TEXT | 'md', 'pdf', 'html' |
| file_size | INTEGER | Size in bytes |
| user_id | UUID | Owner (null when no auth) |
| metadata | JSONB | Additional metadata |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update time |

---

## Quick Start

### Local Development (No Setup Required)
```bash
npm install
npm start
```
The server will automatically use local JSON files and filesystem storage.

### Production with Supabase
1. Create a Supabase project at https://supabase.com
2. Run the SQL from `scripts/supabase-schema.sql` in SQL Editor
3. Create a storage bucket named "library"
4. Set environment variables:
   ```bash
   export SUPABASE_URL=https://xxx.supabase.co
   export SUPABASE_KEY=your-anon-key
   export ADAPTER_PROVIDER=supabase
   ```
5. Start the server: `npm start`

---

## Future: Adding Authentication

When you're ready to add user authentication:

1. Set `AUTH_ENABLED=true`
2. For Supabase: Enable RLS and run the policy SQL from the schema file
3. For local: Generate a secure JWT_SECRET
4. The API will automatically filter by user_id

---

## Adding a New Provider

To add support for a new provider (e.g., Firebase):

1. Create adapter files:
   - `adapters/firebase/database.mjs` (extends DatabaseAdapter)
   - `adapters/firebase/storage.mjs` (extends StorageAdapter)
   - `adapters/firebase/auth.mjs` (extends AuthAdapter)
   - `adapters/firebase/index.mjs`

2. Update `adapters/index.mjs`:
   - Add lazy loading for firebase module
   - Add cases to factory functions

3. Update `config/index.mjs`:
   - Add firebase config defaults
   - Add environment variable loading

---

## Changelog

### [2.1.0] - 2026-05-02

#### Added
- **Library Sidebar UI** - Collapsible sidebar for browsing folders and books
- **Save to Library** - Save current markdown document to library with folder selection
- **Auth UI** - Sign in/Sign up modal with email authentication
- **User Menu** - Dropdown menu when signed in showing user info and sign out
- **Auth Routes** - REST API for authentication (`/api/auth/*`)
- **Folder Creation** - Create new folders from UI (sidebar and save modal)
- **Book Search** - Search books by title in sidebar
- **Library Stats** - View library statistics from user menu

#### New Files
| File | Purpose |
|------|---------|
| `ui/library-ui.mjs` | Library sidebar, auth modal, save modal components |
| `routes/auth.mjs` | Authentication API routes |

#### UI Features
- 📚 Library button in header to toggle sidebar
- 💾 Save to Library button to save documents
- 👤 Sign In button (or user menu when authenticated)
- Folder tree navigation with book counts
- Search bar for finding books
- New folder creation (inline)
- Responsive layout (sidebar collapses on mobile)

---

### [2.0.0] - 2026-05-01

#### Added
- E-Library system with folder/book management
- Adapter pattern for multi-provider support
- Supabase adapter (PostgreSQL + Storage)
- Local adapter (JSON + Filesystem)
- Auth adapter interfaces (for future use)
- REST API for library operations
- Configuration system (env vars + config.json)
- Setup scripts for Supabase

#### Changed
- Server now initializes adapters on startup
- Package version bumped to 2.0.0
- Updated CORS to support PUT/DELETE

#### Migration Notes
- Existing installations continue to work (local adapter is default)
- No breaking changes to existing /api/render and /api/pdf endpoints
