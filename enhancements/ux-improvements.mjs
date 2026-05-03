/**
 * UX Improvements for md2pdf Library
 * 
 * Collection of user experience enhancements including:
 * - Recent books section
 * - Favorites/starred books
 * - Better search with filters
 * - Auto-save indicators
 * - Breadcrumb navigation
 * - Enhanced tab management
 */

// Enhanced CSS for UX improvements
export const uxStyles = `
    /* Recent Books Section */
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
    
    .recent-book-time {
      margin-left: auto;
      font-size: 11px;
      opacity: 0.7;
    }
    
    /* Favorites/Stars */
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
    
    .star-btn:hover {
      color: #ffd700;
    }
    
    /* Enhanced Search */
    .search-filters {
      padding: 8px 16px;
      border-bottom: 1px solid var(--border);
      display: none;
    }
    
    .search-filters.visible {
      display: block;
    }
    
    .filter-row {
      display: flex;
      gap: 8px;
      margin-bottom: 8px;
      align-items: center;
    }
    
    .filter-select {
      flex: 1;
      padding: 4px 8px;
      background: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: 4px;
      color: var(--text-primary);
      font-size: 12px;
    }
    
    .search-toggle {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 4px;
      margin-left: 8px;
    }
    
    .search-toggle:hover {
      color: var(--text-primary);
    }
    
    /* Auto-save Indicator */
    .save-status {
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 8px 12px;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 6px;
      font-size: 12px;
      color: var(--text-secondary);
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
    
    .save-status.error {
      color: #e74c3c;
    }
    
    /* Breadcrumb Navigation */
    .breadcrumb {
      padding: 8px 16px;
      border-bottom: 1px solid var(--border);
      font-size: 12px;
      color: var(--text-secondary);
      display: none;
    }
    
    .breadcrumb.visible {
      display: block;
    }
    
    .breadcrumb-item {
      display: inline;
      cursor: pointer;
    }
    
    .breadcrumb-item:hover {
      color: var(--text-primary);
    }
    
    .breadcrumb-separator {
      margin: 0 6px;
      color: var(--text-tertiary);
    }
    
    /* Enhanced Tabs */
    .tab {
      position: relative;
    }
    
    .tab.unsaved::after {
      content: '•';
      position: absolute;
      top: 8px;
      right: 24px;
      color: var(--accent);
      font-size: 16px;
    }
    
    .tab.pinned::before {
      content: '📌';
      position: absolute;
      top: 8px;
      left: 8px;
      font-size: 10px;
    }
    
    .tab.pinned {
      padding-left: 24px;
    }
    
    .tab-close {
      position: absolute;
      top: 6px;
      right: 6px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 12px;
      color: var(--text-secondary);
      display: none;
      align-items: center;
      justify-content: center;
    }
    
    .tab:hover .tab-close {
      display: flex;
    }
    
    .tab-close:hover {
      background: var(--bg-tertiary);
      color: var(--text-primary);
    }
    
    /* Book Metadata Display */
    .book-meta {
      font-size: 11px;
      color: var(--text-tertiary);
      margin-top: 2px;
      display: none;
    }
    
    .book-item:hover .book-meta {
      display: block;
    }
    
    /* Word Count & Reading Time */
    .editor-stats {
      position: absolute;
      bottom: 10px;
      right: 10px;
      font-size: 11px;
      color: var(--text-secondary);
      background: var(--bg-secondary);
      padding: 4px 8px;
      border-radius: 4px;
      border: 1px solid var(--border);
    }
    
    /* Folder Collapse State */
    .folder-item.collapsed .folder-icon::before {
      content: '📁';
    }
    
    .folder-item.expanded .folder-icon::before {
      content: '📂';
    }
    
    .folder-children {
      margin-left: 20px;
      max-height: 1000px;
      overflow: hidden;
      transition: max-height 0.3s ease;
    }
    
    .folder-children.collapsed {
      max-height: 0;
    }
`;

// JavaScript for UX improvements
export const uxScript = `
    // ==================== UX STATE ====================
    let recentBooks = JSON.parse(localStorage.getItem('recent_books') || '[]');
    let starredBooks = JSON.parse(localStorage.getItem('starred_books') || '[]');
    let autoSaveTimer = null;
    let lastSaveTime = null;
    let currentFolderPath = [];
    let searchFilters = {
      folder: '',
      type: '',
      dateRange: ''
    };
    
    // ==================== RECENT BOOKS ====================
    
    function addToRecentBooks(bookId, title) {
      // Remove if already exists
      recentBooks = recentBooks.filter(book => book.id !== bookId);
      
      // Add to beginning
      recentBooks.unshift({
        id: bookId,
        title: title,
        timestamp: Date.now()
      });
      
      // Keep only last 10
      recentBooks = recentBooks.slice(0, 10);
      
      // Save to localStorage
      localStorage.setItem('recent_books', JSON.stringify(recentBooks));
      
      // Re-render recent section
      renderRecentBooks();
    }
    
    function renderRecentBooks() {
      const recentSection = document.querySelector('.recent-books');
      if (!recentSection) return;
      
      const recentList = recentSection.querySelector('.recent-list') || 
        (() => {
          const list = document.createElement('div');
          list.className = 'recent-list';
          recentSection.appendChild(list);
          return list;
        })();
      
      recentList.innerHTML = '';
      
      recentBooks.slice(0, 5).forEach(book => {
        const item = document.createElement('div');
        item.className = 'recent-book-item';
        item.dataset.bookId = book.id;
        item.innerHTML = \`
          <span class="book-icon">📄</span>
          <span class="book-title">\${book.title}</span>
          <span class="recent-book-time">\${formatTimeAgo(book.timestamp)}</span>
        \`;
        item.addEventListener('click', () => openBook(book.id));
        recentList.appendChild(item);
      });
    }
    
    function formatTimeAgo(timestamp) {
      const now = Date.now();
      const diff = now - timestamp;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);
      
      if (minutes < 1) return 'now';
      if (minutes < 60) return \`\${minutes}m\`;
      if (hours < 24) return \`\${hours}h\`;
      return \`\${days}d\`;
    }
    
    // ==================== FAVORITES/STARS ====================
    
    function toggleBookStar(bookId, event) {
      event.stopPropagation();
      
      if (starredBooks.includes(bookId)) {
        starredBooks = starredBooks.filter(id => id !== bookId);
      } else {
        starredBooks.push(bookId);
      }
      
      localStorage.setItem('starred_books', JSON.stringify(starredBooks));
      
      // Update star button
      const starBtn = event.target;
      starBtn.classList.toggle('starred');
      starBtn.innerHTML = starredBooks.includes(bookId) ? '⭐' : '☆';
      
      // Re-render library to update starred section
      renderLibrary();
    }
    
    function renderStarredBooks() {
      const starredSection = document.querySelector('.starred-books');
      if (!starredSection) return;
      
      const starredList = starredSection.querySelector('.starred-list') || 
        (() => {
          const list = document.createElement('div');
          list.className = 'starred-list';
          starredSection.appendChild(list);
          return list;
        })();
      
      starredList.innerHTML = '';
      
      // Find starred books from library
      const starred = libraryBooks.filter(book => starredBooks.includes(book.id));
      
      starred.forEach(book => {
        const item = document.createElement('div');
        item.className = 'book-item starred';
        item.dataset.bookId = book.id;
        item.innerHTML = \`
          <span class="book-icon">📄</span>
          <span class="book-title">\${book.title}</span>
          <button class="star-btn starred" onclick="toggleBookStar('\${book.id}', event)">⭐</button>
        \`;
        item.addEventListener('click', () => openBook(book.id));
        starredList.appendChild(item);
      });
    }
    
    // ==================== ENHANCED SEARCH ====================
    
    function toggleSearchFilters() {
      const filters = document.querySelector('.search-filters');
      filters.classList.toggle('visible');
    }
    
    function applySearchFilters() {
      const folderFilter = document.getElementById('filter-folder').value;
      const typeFilter = document.getElementById('filter-type').value;
      const dateFilter = document.getElementById('filter-date').value;
      
      searchFilters = {
        folder: folderFilter,
        type: typeFilter,
        dateRange: dateFilter
      };
      
      // Re-render library with filters
      renderFilteredLibrary();
    }
    
    function renderFilteredLibrary() {
      let filteredBooks = [...libraryBooks];
      
      // Apply folder filter
      if (searchFilters.folder) {
        filteredBooks = filteredBooks.filter(book => 
          book.folder_id === searchFilters.folder
        );
      }
      
      // Apply type filter
      if (searchFilters.type) {
        filteredBooks = filteredBooks.filter(book => 
          book.file_type === searchFilters.type
        );
      }
      
      // Apply date filter
      if (searchFilters.dateRange) {
        const now = Date.now();
        const ranges = {
          'today': 24 * 60 * 60 * 1000,
          'week': 7 * 24 * 60 * 60 * 1000,
          'month': 30 * 24 * 60 * 60 * 1000
        };
        
        const range = ranges[searchFilters.dateRange];
        if (range) {
          filteredBooks = filteredBooks.filter(book => 
            now - new Date(book.created_at).getTime() < range
          );
        }
      }
      
      // Render filtered results
      renderBooksSection(filteredBooks);
    }
    
    // ==================== AUTO-SAVE ====================
    
    function showSaveStatus(status, message) {
      const statusEl = document.querySelector('.save-status') || 
        (() => {
          const el = document.createElement('div');
          el.className = 'save-status';
          document.body.appendChild(el);
          return el;
        })();
      
      statusEl.className = \`save-status visible \${status}\`;
      statusEl.textContent = message;
      
      // Hide after 2 seconds unless it's an error
      if (status !== 'error') {
        setTimeout(() => {
          statusEl.classList.remove('visible');
        }, 2000);
      }
    }
    
    function setupAutoSave() {
      const editor = document.getElementById('editor');
      if (!editor) return;
      
      editor.addEventListener('input', () => {
        // Clear existing timer
        if (autoSaveTimer) {
          clearTimeout(autoSaveTimer);
        }
        
        // Show saving status
        showSaveStatus('saving', '💾 Saving...');
        
        // Set new timer
        autoSaveTimer = setTimeout(async () => {
          try {
            await saveCurrentTab();
            showSaveStatus('saved', '✅ Saved');
            lastSaveTime = Date.now();
          } catch (error) {
            showSaveStatus('error', '❌ Save failed');
            console.error('Auto-save failed:', error);
          }
        }, 2000); // Save after 2 seconds of inactivity
      });
    }
    
    // ==================== BREADCRUMB NAVIGATION ====================
    
    function updateBreadcrumb(folderId) {
      const breadcrumb = document.querySelector('.breadcrumb');
      if (!breadcrumb) return;
      
      // Build path from current folder to root
      currentFolderPath = [];
      let currentId = folderId;
      
      while (currentId) {
        const folder = libraryFolders.find(f => f.id === currentId);
        if (folder) {
          currentFolderPath.unshift(folder);
          currentId = folder.parent_id;
        } else {
          break;
        }
      }
      
      // Render breadcrumb
      const items = ['📚 Library', ...currentFolderPath.map(f => f.name)];
      breadcrumb.innerHTML = items.map((item, index) => {
        const isLast = index === items.length - 1;
        const folderId = index === 0 ? null : currentFolderPath[index - 1].id;
        
        return \`
          <span class="breadcrumb-item" onclick="navigateToFolder('\${folderId || ''}')">\${item}</span>
          \${!isLast ? '<span class="breadcrumb-separator">›</span>' : ''}
        \`;
      }).join('');
      
      breadcrumb.classList.toggle('visible', currentFolderPath.length > 0);
    }
    
    function navigateToFolder(folderId) {
      selectedFolderId = folderId || null;
      renderLibrary();
      updateBreadcrumb(folderId);
    }
    
    // ==================== ENHANCED TAB MANAGEMENT ====================
    
    function markTabUnsaved(tabId) {
      const tab = document.querySelector(\`[data-tab-id="\${tabId}"]\`);
      if (tab) {
        tab.classList.add('unsaved');
      }
    }
    
    function markTabSaved(tabId) {
      const tab = document.querySelector(\`[data-tab-id="\${tabId}"]\`);
      if (tab) {
        tab.classList.remove('unsaved');
      }
    }
    
    function toggleTabPin(tabId) {
      const tab = document.querySelector(\`[data-tab-id="\${tabId}"]\`);
      if (tab) {
        tab.classList.toggle('pinned');
        
        // Update tab data
        const tabData = tabs.find(t => t.id === tabId);
        if (tabData) {
          tabData.pinned = tab.classList.contains('pinned');
          saveTabs();
        }
      }
    }
    
    function addTabCloseButtons() {
      document.querySelectorAll('.tab').forEach(tab => {
        if (!tab.querySelector('.tab-close')) {
          const closeBtn = document.createElement('button');
          closeBtn.className = 'tab-close';
          closeBtn.innerHTML = '×';
          closeBtn.title = 'Close tab';
          closeBtn.onclick = (e) => {
            e.stopPropagation();
            const tabId = tab.dataset.tabId;
            closeTab(tabId);
          };
          tab.appendChild(closeBtn);
        }
      });
    }
    
    // ==================== WORD COUNT & READING TIME ====================
    
    function updateEditorStats() {
      const editor = document.getElementById('editor');
      const statsEl = document.querySelector('.editor-stats') || 
        (() => {
          const el = document.createElement('div');
          el.className = 'editor-stats';
          document.querySelector('.editor-panel').appendChild(el);
          return el;
        })();
      
      if (!editor) return;
      
      const content = editor.value;
      const wordCount = content.trim().split(/\\s+/).filter(w => w.length > 0).length;
      const charCount = content.length;
      const readingTime = Math.ceil(wordCount / 200); // 200 WPM average
      
      statsEl.innerHTML = \`
        \${wordCount} words • \${charCount} chars • \${readingTime}min read
      \`;
    }
    
    // ==================== INITIALIZATION ====================
    
    function initializeUXEnhancements() {
      console.log('🎨 Initializing UX enhancements...');
      
      // Setup auto-save
      setupAutoSave();
      
      // Update editor stats on input
      const editor = document.getElementById('editor');
      if (editor) {
        editor.addEventListener('input', updateEditorStats);
        updateEditorStats(); // Initial update
      }
      
      // Add tab close buttons
      addTabCloseButtons();
      
      // Render recent and starred books
      renderRecentBooks();
      renderStarredBooks();
    }
    
    // Override existing functions to add UX enhancements
    const originalOpenBook = window.openBook;
    window.openBook = function(bookId) {
      if (originalOpenBook) {
        originalOpenBook.apply(this, arguments);
      }
      
      // Add to recent books
      const book = libraryBooks.find(b => b.id === bookId);
      if (book) {
        addToRecentBooks(bookId, book.title);
      }
    };
    
    const originalRenderLibrary = window.renderLibrary;
    window.renderLibrary = function() {
      if (originalRenderLibrary) {
        originalRenderLibrary.apply(this, arguments);
      }
      
      // Add star buttons to books
      setTimeout(() => {
        document.querySelectorAll('.book-item').forEach(item => {
          const bookId = item.dataset.bookId;
          if (!item.querySelector('.star-btn')) {
            const starBtn = document.createElement('button');
            starBtn.className = 'star-btn';
            starBtn.innerHTML = starredBooks.includes(bookId) ? '⭐' : '☆';
            if (starredBooks.includes(bookId)) {
              starBtn.classList.add('starred');
            }
            starBtn.onclick = (e) => toggleBookStar(bookId, e);
            item.appendChild(starBtn);
          }
        });
        
        // Add metadata to books
        document.querySelectorAll('.book-item').forEach(item => {
          const bookId = item.dataset.bookId;
          const book = libraryBooks.find(b => b.id === bookId);
          if (book && !item.querySelector('.book-meta')) {
            const meta = document.createElement('div');
            meta.className = 'book-meta';
            meta.innerHTML = \`
              \${formatFileSize(book.file_size)} • 
              \${formatDate(book.updated_at)} • 
              \${book.file_type.toUpperCase()}
            \`;
            item.appendChild(meta);
          }
        });
      }, 100);
    };
    
    // Helper functions
    function formatFileSize(bytes) {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
      return Math.round(bytes / (1024 * 1024)) + ' MB';
    }
    
    function formatDate(dateString) {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now - date;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      
      if (days === 0) return 'Today';
      if (days === 1) return 'Yesterday';
      if (days < 7) return \`\${days} days ago\`;
      return date.toLocaleDateString();
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeUXEnhancements);
    } else {
      initializeUXEnhancements();
    }
`;

// HTML additions for enhanced UI
export const uxHTML = `
  <!-- Enhanced Library Sidebar with Recent & Starred -->
  <div class="library-sidebar" id="library-sidebar">
    <div class="library-header">
      <span class="library-title">📚 Library</span>
      <div class="library-actions">
        <button class="library-btn" onclick="toggleLibrarySidebar()" title="Close">✕</button>
      </div>
    </div>
    
    <div class="library-search">
      <input type="text" placeholder="Search books..." id="library-search" oninput="searchBooks(this.value)">
      <button class="search-toggle" onclick="toggleSearchFilters()" title="Filters">🔍</button>
    </div>
    
    <div class="search-filters" id="search-filters">
      <div class="filter-row">
        <select class="filter-select" id="filter-folder" onchange="applySearchFilters()">
          <option value="">All folders</option>
        </select>
        <select class="filter-select" id="filter-type" onchange="applySearchFilters()">
          <option value="">All types</option>
          <option value="md">Markdown</option>
          <option value="pdf">PDF</option>
          <option value="html">HTML</option>
        </select>
      </div>
      <div class="filter-row">
        <select class="filter-select" id="filter-date" onchange="applySearchFilters()">
          <option value="">Any time</option>
          <option value="today">Today</option>
          <option value="week">This week</option>
          <option value="month">This month</option>
        </select>
      </div>
    </div>
    
    <div class="breadcrumb" id="breadcrumb"></div>
    
    <div class="library-content">
      <!-- Recent Books Section -->
      <div class="library-section recent-books">
        <div class="library-section-header">
          <span>Recent</span>
        </div>
        <div class="recent-list"></div>
      </div>
      
      <!-- Starred Books Section -->
      <div class="library-section starred-books">
        <div class="library-section-header">
          <span>Starred</span>
        </div>
        <div class="starred-list"></div>
      </div>
      
      <!-- Folders Section -->
      <div class="library-section">
        <div class="library-section-header">
          <span>Folders</span>
          <button class="library-btn" onclick="createNewFolder()" title="New folder">+</button>
        </div>
        <div class="folders-list" id="folders-list"></div>
      </div>
      
      <!-- Books Section -->
      <div class="library-section">
        <div class="library-section-header">
          <span>Books</span>
        </div>
        <div class="books-list" id="books-list"></div>
      </div>
    </div>
  </div>
  
  <!-- Save Status Indicator -->
  <div class="save-status" id="save-status"></div>
`;

export default {
  uxStyles,
  uxScript,
  uxHTML
};