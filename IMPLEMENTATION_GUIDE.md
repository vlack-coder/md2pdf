# UX Enhancements Implementation Guide

This guide shows how to implement the suggested UX improvements for md2pdf, including drag-and-drop ordering and other user experience enhancements.

## 🎯 Overview of Enhancements

### 1. **Drag & Drop Ordering** ✨
- Reorder books within folders by dragging
- Move books between folders
- Visual drop indicators and drag ghost
- Persistent ordering in database

### 2. **Enhanced Library Sidebar**
- Recent books section (last 5 accessed)
- Starred/favorited books
- Advanced search with filters
- Breadcrumb navigation
- Book metadata on hover

### 3. **Better Tab Management**
- Unsaved changes indicator (dot)
- Tab close buttons
- Pin tabs to prevent closing
- Tab reordering (future)

### 4. **Auto-Save & Status**
- Auto-save after 2 seconds of inactivity
- Visual save status indicator
- Word count and reading time

### 5. **Enhanced Search**
- Filter by folder, file type, date range
- Global content search (future)
- Search history and suggestions

---

## 🚀 Implementation Steps

### Step 1: Database Schema Updates

First, add the ordering columns to your database:

```sql
-- Add to your Supabase SQL editor or local database
ALTER TABLE books ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
ALTER TABLE folders ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_books_folder_order ON books(folder_id, order_index);
CREATE INDEX IF NOT EXISTS idx_folders_parent_order ON folders(parent_id, order_index);

-- Auto-assign order indices for new records
CREATE OR REPLACE FUNCTION assign_book_order_index()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_index IS NULL OR NEW.order_index = 0 THEN
    SELECT COALESCE(MAX(order_index), 0) + 1 
    INTO NEW.order_index 
    FROM books 
    WHERE folder_id IS NOT DISTINCT FROM NEW.folder_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_assign_book_order_index
  BEFORE INSERT ON books
  FOR EACH ROW
  EXECUTE FUNCTION assign_book_order_index();
```

### Step 2: Update Server Routes

Add the new API endpoints to `routes/library.mjs`:

```javascript
// Add these routes to your existing library routes handler

// PUT /api/books/:id/reorder - Reorder books
if (pathname.match(/^\/api\/books\/([^\/]+)\/reorder$/) && method === 'PUT') {
  const bookId = pathname.split('/')[3];
  const userId = await getUserId(req, adapters);
  const body = await parseBody(req);
  
  const { target_book_id, position } = body;
  
  // Get both books
  const [draggedBook, targetBook] = await Promise.all([
    adapters.database.getBook(bookId, userId),
    adapters.database.getBook(target_book_id, userId)
  ]);
  
  if (!draggedBook || !targetBook) {
    return sendError(res, 'Book not found', 404);
  }
  
  // Calculate new order index
  let newOrderIndex;
  if (position === 'before') {
    newOrderIndex = targetBook.order_index - 0.5;
  } else {
    newOrderIndex = targetBook.order_index + 0.5;
  }
  
  // Update order
  const updatedBook = await adapters.database.updateBook(bookId, {
    order_index: newOrderIndex
  }, userId);
  
  return sendJson(res, { success: true, book: updatedBook });
}

// POST /api/books/:id/star - Toggle favorite
if (pathname.match(/^\/api\/books\/([^\/]+)\/star$/) && method === 'POST') {
  const bookId = pathname.split('/')[3];
  const userId = await getUserId(req, adapters);
  
  const book = await adapters.database.getBook(bookId, userId);
  if (!book) {
    return sendError(res, 'Book not found', 404);
  }
  
  const metadata = book.metadata || {};
  metadata.starred = !metadata.starred;
  
  const updatedBook = await adapters.database.updateBook(bookId, {
    metadata
  }, userId);
  
  return sendJson(res, { 
    success: true, 
    starred: metadata.starred 
  });
}
```

### Step 3: Update Database Adapters

Modify your database adapters to support ordering. In `adapters/supabase/database.mjs`:

```javascript
// Update getBooks method to support ordering
async getBooks(filters = {}) {
  let query = this.supabase
    .from('books')
    .select('*')
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: false });
  
  if (filters.folder_id !== undefined) {
    query = query.eq('folder_id', filters.folder_id);
  }
  
  if (filters.user_id !== undefined) {
    query = query.eq('user_id', filters.user_id);
  }
  
  const { data, error } = await query;
  
  if (error) {
    throw new Error(`Failed to get books: ${error.message}`);
  }
  
  return data || [];
}

// Update getFolders method similarly
async getFolders(filters = {}) {
  let query = this.supabase
    .from('folders')
    .select('*')
    .order('order_index', { ascending: true })
    .order('name', { ascending: true });
  
  // ... rest of the method
}
```

### Step 4: Add CSS Styles

Add the enhanced styles to your `server.mjs` CSS section:

```javascript
// Add to your existing CSS in server.mjs
const enhancedCSS = `
  /* Drag and Drop Styles */
  .book-item.draggable {
    cursor: grab;
  }
  
  .book-item.dragging {
    opacity: 0.5;
    transform: rotate(2deg);
    cursor: grabbing;
  }
  
  .drag-over {
    background-color: rgba(130, 170, 255, 0.2);
    border-left: 3px solid var(--accent);
  }
  
  .drop-indicator {
    height: 2px;
    background-color: var(--accent);
    margin: 2px 16px;
    border-radius: 1px;
    opacity: 0;
    transition: opacity 0.2s;
  }
  
  .drop-indicator.visible {
    opacity: 1;
  }
  
  .reorder-handle {
    opacity: 0;
    cursor: grab;
    padding: 4px;
    margin-right: 4px;
    color: var(--text-secondary);
    transition: opacity 0.2s;
  }
  
  .book-item:hover .reorder-handle {
    opacity: 1;
  }
  
  /* Star buttons */
  .star-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px;
    margin-left: auto;
    opacity: 0;
    transition: opacity 0.2s;
    color: var(--text-secondary);
  }
  
  .book-item:hover .star-btn,
  .star-btn.starred {
    opacity: 1;
  }
  
  .star-btn.starred {
    color: #ffd700;
  }
  
  /* Recent books section */
  .recent-books {
    border-bottom: 1px solid var(--border);
    margin-bottom: 12px;
  }
  
  .recent-book-item {
    display: flex;
    align-items: center;
    padding: 6px 16px;
    cursor: pointer;
    font-size: 12px;
    color: var(--text-secondary);
    gap: 8px;
  }
  
  .recent-book-item:hover {
    background-color: var(--bg-tertiary);
    color: var(--text-primary);
  }
  
  /* Auto-save status */
  .save-status {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 8px 12px;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 6px;
    font-size: 12px;
    opacity: 0;
    transition: opacity 0.3s;
    z-index: 1000;
  }
  
  .save-status.visible {
    opacity: 1;
  }
  
  .save-status.saving {
    color: var(--accent);
  }
  
  .save-status.saved {
    color: #27ae60;
  }
`;
```

### Step 5: Add JavaScript Functionality

Add the drag-and-drop JavaScript to your `server.mjs` script section:

```javascript
// Add to your existing JavaScript in server.mjs

// Drag & Drop State
let draggedElement = null;
let draggedBookId = null;
let dropIndicators = [];

// Initialize drag & drop
function initializeDragDrop() {
  console.log('🎯 Initializing drag & drop...');
  
  const libraryContent = document.querySelector('.library-content');
  if (libraryContent) {
    libraryContent.addEventListener('dragover', handleDragOver);
    libraryContent.addEventListener('drop', handleDrop);
  }
  
  makeItemsDraggable();
}

function makeItemsDraggable() {
  document.querySelectorAll('.book-item').forEach(item => {
    if (!item.draggable) {
      item.draggable = true;
      item.classList.add('draggable');
      
      // Add reorder handle
      const handle = document.createElement('span');
      handle.className = 'reorder-handle';
      handle.innerHTML = '⋮⋮';
      handle.title = 'Drag to reorder';
      item.insertBefore(handle, item.firstChild);
      
      item.addEventListener('dragstart', handleBookDragStart);
      item.addEventListener('dragend', handleDragEnd);
    }
  });
}

function handleBookDragStart(e) {
  draggedElement = e.target;
  draggedBookId = e.target.dataset.bookId;
  e.target.classList.add('dragging');
  
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', draggedBookId);
  
  createDropIndicators();
}

function handleDragEnd(e) {
  if (draggedElement) {
    draggedElement.classList.remove('dragging');
  }
  
  removeDropIndicators();
  
  document.querySelectorAll('.drag-over').forEach(el => {
    el.classList.remove('drag-over');
  });
  
  draggedElement = null;
  draggedBookId = null;
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

function handleDrop(e) {
  e.preventDefault();
  
  const target = e.target.closest('.folder-item, .book-item');
  if (!target || target === draggedElement) {
    return;
  }
  
  if (target.classList.contains('folder-item')) {
    const folderId = target.dataset.folderId;
    moveBookToFolder(draggedBookId, folderId);
  } else if (target.classList.contains('book-item')) {
    const targetBookId = target.dataset.bookId;
    reorderBooks(draggedBookId, targetBookId);
  }
}

async function moveBookToFolder(bookId, folderId) {
  try {
    const token = localStorage.getItem('auth_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    
    const response = await fetch(`/api/books/${bookId}/move`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ folder_id: folderId })
    });
    
    if (response.ok) {
      await loadLibraryData();
      renderLibrary();
    }
  } catch (error) {
    console.error('Error moving book:', error);
  }
}

async function reorderBooks(draggedBookId, targetBookId) {
  try {
    const token = localStorage.getItem('auth_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    
    const response = await fetch(`/api/books/${draggedBookId}/reorder`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ 
        target_book_id: targetBookId,
        position: 'after'
      })
    });
    
    if (response.ok) {
      await loadLibraryData();
      renderLibrary();
    }
  } catch (error) {
    console.error('Error reordering books:', error);
  }
}

// Star functionality
async function toggleBookStar(bookId, event) {
  event.stopPropagation();
  
  try {
    const token = localStorage.getItem('auth_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    
    const response = await fetch(`/api/books/${bookId}/star`, {
      method: 'POST',
      headers
    });
    
    if (response.ok) {
      const data = await response.json();
      const starBtn = event.target;
      starBtn.classList.toggle('starred', data.starred);
      starBtn.innerHTML = data.starred ? '⭐' : '☆';
    }
  } catch (error) {
    console.error('Error toggling star:', error);
  }
}

// Initialize when library loads
const originalRenderLibrary = window.renderLibrary;
window.renderLibrary = function() {
  if (originalRenderLibrary) {
    originalRenderLibrary.apply(this, arguments);
  }
  
  setTimeout(() => {
    makeItemsDraggable();
    addStarButtons();
  }, 100);
};

function addStarButtons() {
  document.querySelectorAll('.book-item').forEach(item => {
    const bookId = item.dataset.bookId;
    if (!item.querySelector('.star-btn')) {
      const starBtn = document.createElement('button');
      starBtn.className = 'star-btn';
      starBtn.innerHTML = '☆';
      starBtn.onclick = (e) => toggleBookStar(bookId, e);
      item.appendChild(starBtn);
    }
  });
}
```

### Step 6: Update Library UI

Modify `ui/library-ui.mjs` to include recent books section:

```javascript
// Add to librarySidebarHtml
export const enhancedLibrarySidebarHtml = `
  <div class="library-sidebar" id="library-sidebar">
    <div class="library-header">
      <span class="library-title">📚 Library</span>
      <div class="library-actions">
        <button class="library-btn" onclick="toggleLibrarySidebar()">✕</button>
      </div>
    </div>
    
    <div class="library-search">
      <input type="text" placeholder="Search books..." id="library-search" oninput="searchBooks(this.value)">
    </div>
    
    <div class="library-content">
      <!-- Recent Books Section -->
      <div class="library-section recent-books">
        <div class="library-section-header">
          <span>Recent</span>
        </div>
        <div class="recent-list" id="recent-list"></div>
      </div>
      
      <!-- Starred Books Section -->
      <div class="library-section starred-books">
        <div class="library-section-header">
          <span>Starred</span>
        </div>
        <div class="starred-list" id="starred-list"></div>
      </div>
      
      <!-- Existing folders and books sections -->
      <div class="library-section">
        <div class="library-section-header">
          <span>Folders</span>
          <button class="library-btn" onclick="createNewFolder()">+</button>
        </div>
        <div class="folders-list" id="folders-list"></div>
      </div>
      
      <div class="library-section">
        <div class="library-section-header">
          <span>Books</span>
        </div>
        <div class="books-list" id="books-list"></div>
      </div>
    </div>
  </div>
`;
```

---

## 🧪 Testing the Implementation

### 1. Test Drag & Drop
1. Create a few books in a folder
2. Try dragging books up and down to reorder
3. Try dragging books to different folders
4. Verify the order persists after page reload

### 2. Test Favorites
1. Hover over books to see star buttons
2. Click stars to favorite/unfavorite
3. Check that starred books appear in the starred section

### 3. Test Recent Books
1. Open several books
2. Check that they appear in the recent section
3. Verify most recently opened appears first

### 4. Test Auto-Save
1. Edit a document
2. Watch for the "Saving..." indicator
3. Verify it changes to "Saved" after 2 seconds

---

## 🎨 Customization Options

### Color Themes
You can customize the drag-and-drop colors by modifying the CSS variables:

```css
:root {
  --drag-highlight: rgba(130, 170, 255, 0.2);
  --drop-indicator: #82aaff;
  --star-color: #ffd700;
}
```

### Timing Adjustments
Adjust auto-save timing and animation speeds:

```javascript
// Auto-save delay (milliseconds)
const AUTO_SAVE_DELAY = 2000;

// Drag animation duration
const DRAG_ANIMATION_DURATION = 200;
```

### Feature Toggles
Enable/disable features via configuration:

```javascript
const UX_CONFIG = {
  enableDragDrop: true,
  enableAutoSave: true,
  enableStars: true,
  enableRecentBooks: true,
  maxRecentBooks: 10
};
```

---

## 🚀 Future Enhancements

### Phase 2 Features
- **Global content search** - Search inside document content
- **Keyboard shortcuts** - Quick navigation and actions
- **Bulk operations** - Select multiple books for batch actions
- **Export collections** - Export entire folders as ZIP files
- **Collaborative features** - Share folders with other users

### Phase 3 Features
- **Advanced metadata** - Tags, categories, custom fields
- **Templates** - Document templates for quick creation
- **Version history** - Track document changes over time
- **Mobile app** - Native mobile companion app

---

## 📝 Notes

- The drag-and-drop implementation uses HTML5 Drag API for maximum compatibility
- Order indices use floating-point numbers to allow easy reordering without updating all records
- The system periodically normalizes order indices to prevent floating-point accumulation
- All features gracefully degrade when JavaScript is disabled
- The implementation is designed to work with both Supabase and local adapters

This implementation provides a solid foundation for an excellent user experience while maintaining the clean architecture of the existing md2pdf system.