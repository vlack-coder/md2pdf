# MD2PDF Development Session Notes

## Date: May 2, 2026

This document tracks all changes made during the development session for easier continuation.

---

## 1. Fullscreen Mode Improvements

### Changes Made:
- **Header hidden** in fullscreen mode (`body.fullscreen-mode .header { display: none; }`)
- **Library sidebar hidden** in fullscreen mode
- **Sidebar toggle hidden** in fullscreen mode
- **Status bar hidden** in fullscreen mode
- **Panel header hidden** for preview panel in fullscreen

### Floating Controls:
- Added **floating controls** that appear in fullscreen mode:
  - **Left side**: 📚 button to open fullscreen sidebar
  - **Right side**: ⛶ exit fullscreen button + 🌙/☀️ theme toggle
- Controls are positioned fixed and hidden when fullscreen sidebar is open

### Fullscreen Sidebar:
- Changed from **overlay** to **push layout** using flexbox
- Sidebar width: 320px
- Contains search, folders, and books list
- Event delegation implemented via `initFullscreenSidebarEvents()` for proper click handling

### CSS Height Fixes:
- `body.fullscreen-mode .app-container { height: 100vh; }`
- `body.fullscreen-mode.has-tabs .app-container { height: calc(100vh - 49px); }`
- Fixed empty space at bottom issue by only subtracting tab bar height when tabs exist

**Files Modified:**
- [server.mjs](server.mjs) - Lines 525-900 (CSS), Lines 1330-1380 (HTML)

---

## 2. Tab Management Improvements

### New Variable:
```javascript
let currentBookId = null; // Track currently edited book for Supabase sync
```

### Unique Tabs Logic:
- Tabs are now identified by `bookId` (priority) and `title` as fallback
- Opening a book that's already in a tab **switches to that tab** instead of creating a duplicate
- Works in both normal mode and fullscreen mode

### Functions Updated:

#### `createNewTab(title, content, bookId = null)`
- Added `bookId` parameter
- Checks for existing tab by `bookId` first, then by `title`
- Updates existing tab content if found, switches to it
- Only creates new tab if no match found

#### `saveAsTab()`
- Checks for existing tab by `currentBookId` first
- Updates title in case it changed from content
- Syncs to Supabase if book exists there

#### `switchToTab(tabId)`
- Now restores `currentBookId` from tab's `bookId`

#### `openFsBook(bookId)` - Fullscreen Book Opening
- Checks if book is already open in a tab
- If found, switches to existing tab and renders to preview
- If not found, creates new tab with `bookId` tracking
- Uses new helper `renderToFullscreenPreview(content)`

#### `editBookContent(bookId)`
- Now creates/updates tab with proper `bookId` linking

**Files Modified:**
- [server.mjs](server.mjs) - Lines 1672-1760, 2020-2145
- [ui/library-ui.mjs](ui/library-ui.mjs) - Line 1222 (openBook function)

---

## 3. Supabase Sync on Save

### New Function:
```javascript
async function updateBookInSupabase(bookId, content) {
  const token = localStorage.getItem('auth_token');
  if (!token) return;
  
  const res = await fetch('/api/books/' + bookId, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({
      metadata: { content },
      file_size: new Blob([content]).size
    })
  });
}
```

### Behavior:
- When saving a tab (`saveAsTab`) that has a linked `currentBookId`, content is automatically synced to Supabase
- Uses PUT `/api/books/:id` endpoint
- Only syncs if user is logged in (has auth token)

**Files Modified:**
- [server.mjs](server.mjs) - Lines 2080-2095

---

## 4. Book Content Path Fix

### Issue:
Books were not loading because content was stored at `data.book.metadata.content` but code was looking at `data.book.content`.

### Fix Applied To:
- `openFsBook()` - Now checks both paths
- `editBookContent()` - Now checks both paths
- `openBook()` (in library-ui.mjs) - Already had correct path

```javascript
const content = data.book?.content || data.book?.metadata?.content;
```

---

## 5. Helper Functions Added

### `renderToFullscreenPreview(content)`
Renders markdown content to the fullscreen preview iframe:
- Fetches rendered HTML from `/api/render`
- Writes to iframe document
- Applies current theme settings

**Location:** [server.mjs](server.mjs) - After `openFsBook()`

---

## 6. Library Save Improvements (May 2, 2026 - Session 2)

### Problem:
- Saving a book that already exists in library created duplicates
- `currentBookId` wasn't being linked to tabs when saving new books

### Solution - No DB Changes Needed:

#### `handleSaveToLibrary()` Updated:
1. **Checks `currentBookId` first** - If we're editing an existing book, update it
2. **Checks for title match** - If a book with same title exists, update it instead of creating duplicate
3. **Links to current tab** - After save, sets `currentBookId` and updates active tab's `bookId`

```javascript
// Logic flow:
1. Check if currentBookId is set → PUT to update
2. If not, check if book with same title exists → PUT to update
3. Otherwise → POST to create new
4. After save: Link bookId to current tab
```

#### `closeTab()` Updated:
- Clears `currentBookId` when closing a tab that was linked to it
- Ensures no stale bookId references

#### `newTab()` Updated:
- Clears `currentBookId` when creating fresh tab

**Files Modified:**
- [ui/library-ui.mjs](ui/library-ui.mjs) - `handleSaveToLibrary()` function
- [server.mjs](server.mjs) - `closeTab()` and `newTab()` functions

---

## Key File Locations

| Feature | File | Approximate Lines |
|---------|------|-------------------|
| Fullscreen CSS | server.mjs | 525-900 |
| Fullscreen HTML | server.mjs | 1330-1380 |
| Tab Management | server.mjs | 2020-2250 |
| Book Opening (FS) | server.mjs | 1672-1760 |
| Book Opening (Sidebar) | ui/library-ui.mjs | 1184-1240 |
| Save to Library | ui/library-ui.mjs | 1380-1480 |
| Supabase Sync | server.mjs | 2080-2095 |
| Event Delegation | server.mjs | Search for `initFullscreenSidebarEvents` |

---

## TODO / Future Improvements

- [ ] Add visual indicator on tab when content is synced/modified
- [ ] Handle sync failures gracefully with retry
- [ ] Consider debouncing Supabase sync for rapid saves
- [ ] Add offline support / queue for sync when back online
- [x] ~~Prevent duplicate books in library~~ (Done - checks title match)
- [x] ~~Link tabs to books after saving~~ (Done)

---

## How to Continue

1. Start the server: `npm start`
2. Open browser to the local URL
3. Test tab management by opening books from library
4. Test fullscreen mode with 📚 sidebar
5. Test Supabase sync by editing and saving a library book
6. **Test duplicate prevention**: Save a book, edit it, save again - should update not duplicate
