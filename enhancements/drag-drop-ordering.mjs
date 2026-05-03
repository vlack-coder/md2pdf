/**
 * Drag & Drop Ordering Enhancement for md2pdf Library
 * 
 * Adds drag-and-drop functionality to reorder books within folders
 * and move books between folders.
 */

// CSS for drag and drop styling
export const dragDropStyles = `
    /* Drag and Drop Styles */
    .book-item, .folder-item {
      transition: all 0.2s ease;
    }
    
    .book-item.draggable {
      cursor: grab;
    }
    
    .book-item.dragging {
      opacity: 0.5;
      transform: rotate(2deg);
      cursor: grabbing;
      z-index: 1000;
      position: relative;
    }
    
    .folder-item.drag-over,
    .book-item.drag-over {
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
    
    .drag-ghost {
      position: fixed;
      pointer-events: none;
      z-index: 10000;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 8px 12px;
      font-size: 13px;
      color: var(--text-primary);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transform: rotate(2deg);
    }
    
    .reorder-handle {
      opacity: 0;
      cursor: grab;
      padding: 4px;
      margin-right: 4px;
      color: var(--text-secondary);
      transition: opacity 0.2s;
    }
    
    .book-item:hover .reorder-handle,
    .folder-item:hover .reorder-handle {
      opacity: 1;
    }
    
    .reorder-handle:hover {
      color: var(--text-primary);
    }
`;

// JavaScript for drag and drop functionality
export const dragDropScript = `
    // ==================== DRAG & DROP STATE ====================
    let draggedElement = null;
    let draggedBookId = null;
    let draggedFolderId = null;
    let dropIndicators = [];
    let dragGhost = null;
    
    // ==================== DRAG & DROP INITIALIZATION ====================
    
    function initializeDragDrop() {
      console.log('🎯 Initializing drag & drop...');
      
      // Add event listeners to the library content area
      const libraryContent = document.querySelector('.library-content');
      if (libraryContent) {
        libraryContent.addEventListener('dragover', handleDragOver);
        libraryContent.addEventListener('drop', handleDrop);
        libraryContent.addEventListener('dragenter', handleDragEnter);
        libraryContent.addEventListener('dragleave', handleDragLeave);
      }
      
      // Make existing items draggable
      makeItemsDraggable();
    }
    
    function makeItemsDraggable() {
      // Make books draggable
      document.querySelectorAll('.book-item').forEach(item => {
        if (!item.draggable) {
          item.draggable = true;
          item.classList.add('draggable');
          
          // Add reorder handle
          if (!item.querySelector('.reorder-handle')) {
            const handle = document.createElement('span');
            handle.className = 'reorder-handle';
            handle.innerHTML = '⋮⋮';
            handle.title = 'Drag to reorder';
            item.insertBefore(handle, item.firstChild);
          }
          
          item.addEventListener('dragstart', handleBookDragStart);
          item.addEventListener('dragend', handleDragEnd);
        }
      });
      
      // Make folders draggable (for moving books into them)
      document.querySelectorAll('.folder-item').forEach(item => {
        if (!item.classList.contains('drop-target')) {
          item.classList.add('drop-target');
          
          // Add reorder handle for folders too
          if (!item.querySelector('.reorder-handle')) {
            const handle = document.createElement('span');
            handle.className = 'reorder-handle';
            handle.innerHTML = '⋮⋮';
            handle.title = 'Drag to reorder';
            item.insertBefore(handle, item.firstChild);
          }
        }
      });
    }
    
    // ==================== DRAG EVENT HANDLERS ====================
    
    function handleBookDragStart(e) {
      draggedElement = e.target;
      draggedBookId = e.target.dataset.bookId;
      
      console.log('📖 Started dragging book:', draggedBookId);
      
      e.target.classList.add('dragging');
      
      // Create drag ghost
      createDragGhost(e.target.querySelector('.book-title').textContent);
      
      // Set drag data
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', draggedBookId);
      
      // Create drop indicators
      createDropIndicators();
    }
    
    function handleDragEnd(e) {
      console.log('🏁 Drag ended');
      
      // Clean up
      if (draggedElement) {
        draggedElement.classList.remove('dragging');
      }
      
      // Remove drag ghost
      if (dragGhost) {
        dragGhost.remove();
        dragGhost = null;
      }
      
      // Remove drop indicators
      removeDropIndicators();
      
      // Remove drag-over classes
      document.querySelectorAll('.drag-over').forEach(el => {
        el.classList.remove('drag-over');
      });
      
      // Reset state
      draggedElement = null;
      draggedBookId = null;
      draggedFolderId = null;
    }
    
    function handleDragOver(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      
      // Update ghost position
      if (dragGhost) {
        dragGhost.style.left = (e.clientX + 10) + 'px';
        dragGhost.style.top = (e.clientY - 10) + 'px';
      }
      
      // Show appropriate drop indicator
      updateDropIndicators(e);
    }
    
    function handleDragEnter(e) {
      e.preventDefault();
      
      const target = e.target.closest('.folder-item, .book-item');
      if (target && target !== draggedElement) {
        target.classList.add('drag-over');
      }
    }
    
    function handleDragLeave(e) {
      const target = e.target.closest('.folder-item, .book-item');
      if (target) {
        target.classList.remove('drag-over');
      }
    }
    
    function handleDrop(e) {
      e.preventDefault();
      
      const target = e.target.closest('.folder-item, .book-item');
      if (!target || target === draggedElement) {
        return;
      }
      
      console.log('📥 Drop detected on:', target);
      
      if (target.classList.contains('folder-item')) {
        // Dropped on folder - move book to folder
        const folderId = target.dataset.folderId;
        moveBookToFolder(draggedBookId, folderId);
      } else if (target.classList.contains('book-item')) {
        // Dropped on book - reorder within same folder
        const targetBookId = target.dataset.bookId;
        reorderBooks(draggedBookId, targetBookId);
      }
    }
    
    // ==================== DRAG VISUAL HELPERS ====================
    
    function createDragGhost(text) {
      dragGhost = document.createElement('div');
      dragGhost.className = 'drag-ghost';
      dragGhost.textContent = '📖 ' + text;
      document.body.appendChild(dragGhost);
    }
    
    function createDropIndicators() {
      const books = document.querySelectorAll('.book-item');
      books.forEach((book, index) => {
        if (book === draggedElement) return;
        
        const indicator = document.createElement('div');
        indicator.className = 'drop-indicator';
        book.parentNode.insertBefore(indicator, book);
        dropIndicators.push(indicator);
      });
    }
    
    function removeDropIndicators() {
      dropIndicators.forEach(indicator => {
        if (indicator.parentNode) {
          indicator.parentNode.removeChild(indicator);
        }
      });
      dropIndicators = [];
    }
    
    function updateDropIndicators(e) {
      const rect = e.target.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      const isAbove = e.clientY < midpoint;
      
      // Hide all indicators
      dropIndicators.forEach(indicator => {
        indicator.classList.remove('visible');
      });
      
      // Show appropriate indicator
      const target = e.target.closest('.book-item');
      if (target && target !== draggedElement) {
        const targetIndex = Array.from(target.parentNode.children).indexOf(target);
        const indicatorIndex = isAbove ? targetIndex : targetIndex + 1;
        
        if (dropIndicators[indicatorIndex]) {
          dropIndicators[indicatorIndex].classList.add('visible');
        }
      }
    }
    
    // ==================== DRAG & DROP API CALLS ====================
    
    async function moveBookToFolder(bookId, folderId) {
      console.log(\`📁 Moving book \${bookId} to folder \${folderId}\`);
      
      try {
        const token = localStorage.getItem('auth_token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = 'Bearer ' + token;
        
        const response = await fetch(\`/api/books/\${bookId}/move\`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ folder_id: folderId })
        });
        
        if (response.ok) {
          console.log('✅ Book moved successfully');
          // Refresh library to show new organization
          await loadLibraryData();
          renderLibrary();
        } else {
          console.error('❌ Failed to move book');
          showNotification('Failed to move book', 'error');
        }
      } catch (error) {
        console.error('❌ Error moving book:', error);
        showNotification('Error moving book', 'error');
      }
    }
    
    async function reorderBooks(draggedBookId, targetBookId) {
      console.log(\`🔄 Reordering: \${draggedBookId} relative to \${targetBookId}\`);
      
      try {
        const token = localStorage.getItem('auth_token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = 'Bearer ' + token;
        
        const response = await fetch(\`/api/books/\${draggedBookId}/reorder\`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ 
            target_book_id: targetBookId,
            position: 'after' // or 'before' based on drop position
          })
        });
        
        if (response.ok) {
          console.log('✅ Books reordered successfully');
          await loadLibraryData();
          renderLibrary();
        } else {
          console.error('❌ Failed to reorder books');
          showNotification('Failed to reorder books', 'error');
        }
      } catch (error) {
        console.error('❌ Error reordering books:', error);
        showNotification('Error reordering books', 'error');
      }
    }
    
    // ==================== NOTIFICATION HELPER ====================
    
    function showNotification(message, type = 'info') {
      // Create notification element
      const notification = document.createElement('div');
      notification.className = \`notification notification-\${type}\`;
      notification.textContent = message;
      
      // Style the notification
      Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 16px',
        borderRadius: '6px',
        color: 'white',
        fontSize: '14px',
        zIndex: '10000',
        backgroundColor: type === 'error' ? '#e74c3c' : '#27ae60',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
      });
      
      document.body.appendChild(notification);
      
      // Remove after 3 seconds
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 3000);
    }
    
    // ==================== INITIALIZE ON LOAD ====================
    
    // Initialize drag & drop when library is loaded
    const originalRenderLibrary = window.renderLibrary;
    window.renderLibrary = function() {
      if (originalRenderLibrary) {
        originalRenderLibrary.apply(this, arguments);
      }
      
      // Initialize drag & drop after rendering
      setTimeout(() => {
        makeItemsDraggable();
      }, 100);
    };
    
    // Initialize immediately if library is already loaded
    if (document.querySelector('.library-content')) {
      initializeDragDrop();
    }
`;

// Database schema additions needed for ordering
export const orderingSchemaSQL = `
-- Add order_index column to books table for custom ordering
ALTER TABLE books ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- Add order_index column to folders table for custom ordering  
ALTER TABLE folders ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- Create index for faster ordering queries
CREATE INDEX IF NOT EXISTS idx_books_folder_order ON books(folder_id, order_index);
CREATE INDEX IF NOT EXISTS idx_folders_parent_order ON folders(parent_id, order_index);

-- Function to auto-assign order_index for new books
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

-- Trigger to auto-assign order_index
DROP TRIGGER IF EXISTS trigger_assign_book_order_index ON books;
CREATE TRIGGER trigger_assign_book_order_index
  BEFORE INSERT ON books
  FOR EACH ROW
  EXECUTE FUNCTION assign_book_order_index();

-- Function to auto-assign order_index for new folders
CREATE OR REPLACE FUNCTION assign_folder_order_index()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_index IS NULL OR NEW.order_index = 0 THEN
    SELECT COALESCE(MAX(order_index), 0) + 1 
    INTO NEW.order_index 
    FROM folders 
    WHERE parent_id IS NOT DISTINCT FROM NEW.parent_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-assign order_index
DROP TRIGGER IF EXISTS trigger_assign_folder_order_index ON folders;
CREATE TRIGGER trigger_assign_folder_order_index
  BEFORE INSERT ON folders
  FOR EACH ROW
  EXECUTE FUNCTION assign_folder_order_index();
`;

export default {
  dragDropStyles,
  dragDropScript,
  orderingSchemaSQL
};