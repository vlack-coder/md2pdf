/**
 * Library UI HTML Components
 * 
 * CSS and HTML for the e-library sidebar, auth modal, and save dialogs.
 */

// Library and Auth CSS
export const libraryStyles = `
    /* Library Sidebar */
    .app-container {
      display: flex;
      height: calc(100vh - 73px);
    }
    
    body.has-tabs .app-container {
      height: calc(100vh - 73px - 49px);
    }
    
    .library-sidebar {
      width: 280px;
      min-width: 280px;
      background-color: var(--bg-secondary);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      transition: width 0.3s, min-width 0.3s, margin-left 0.3s;
    }
    
    .library-sidebar.collapsed {
      width: 0;
      min-width: 0;
      margin-left: -1px;
      overflow: hidden;
    }
    
    .library-header {
      padding: 16px;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .library-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .library-actions {
      display: flex;
      gap: 4px;
    }
    
    .library-btn {
      background: transparent;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 6px 8px;
      border-radius: 4px;
      font-size: 14px;
      transition: all 0.2s;
    }
    
    .library-btn:hover {
      background-color: var(--bg-tertiary);
      color: var(--text-primary);
    }
    
    .library-search {
      padding: 12px 16px;
      border-bottom: 1px solid var(--border);
    }
    
    .library-search input {
      width: 100%;
      padding: 8px 12px;
      background-color: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: 6px;
      color: var(--text-primary);
      font-size: 13px;
    }
    
    .library-search input:focus {
      outline: none;
      border-color: var(--accent);
    }
    
    .library-search input::placeholder {
      color: var(--text-secondary);
    }
    
    .library-content {
      flex: 1;
      overflow-y: auto;
      padding: 12px 0;
    }
    
    .library-section {
      margin-bottom: 16px;
    }
    
    .library-section-header {
      padding: 8px 16px;
      font-size: 11px;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .folder-item, .book-item {
      display: flex;
      align-items: center;
      padding: 8px 16px;
      cursor: pointer;
      transition: all 0.2s;
      gap: 8px;
      font-size: 13px;
      color: var(--text-primary);
      user-select: none;
    }
    
    .book-item {
      cursor: pointer !important;
    }
    
    .folder-item:hover, .book-item:hover {
      background-color: var(--bg-tertiary);
    }
    
    .folder-item.active, .book-item.active {
      background-color: rgba(130, 170, 255, 0.15);
      border-right: 2px solid var(--accent);
    }
    
    .folder-icon, .book-icon {
      font-size: 16px;
      flex-shrink: 0;
    }
    
    .folder-name, .book-title {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .folder-count {
      font-size: 11px;
      color: var(--text-secondary);
      background-color: var(--bg-tertiary);
      padding: 2px 6px;
      border-radius: 10px;
    }
    
    /* Drag and Drop Styles */
    .book-item[draggable="true"] {
      cursor: grab;
    }
    
    .book-item[draggable="true"]:active {
      cursor: grabbing;
    }
    
    .book-item.selected {
      background-color: rgba(130, 170, 255, 0.2);
      border-left: 2px solid var(--accent);
    }
    
    .book-item.dragging {
      opacity: 0.5;
    }
    
    .book-actions {
      display: none;
      gap: 4px;
      margin-left: auto;
    }
    
    .book-item:hover .book-actions {
      display: flex;
    }
    
    .book-action-btn {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 11px;
    }
    
    .book-action-btn:hover {
      background-color: var(--bg-primary);
      color: var(--text-primary);
    }
    
    .book-action-btn.delete:hover {
      background-color: var(--error);
      color: #fff;
    }
    
    .folder-item.drag-over {
      background-color: rgba(130, 170, 255, 0.3);
      outline: 2px dashed var(--accent);
      outline-offset: -2px;
    }
    
    .folder-item .drop-indicator {
      display: none;
      margin-left: auto;
      font-size: 11px;
      color: var(--accent);
    }
    
    .folder-item.drag-over .drop-indicator {
      display: inline;
    }
    
    .book-checkbox {
      width: 14px;
      height: 14px;
      margin-right: 4px;
      cursor: pointer;
      accent-color: var(--accent);
    }
    
    .selection-actions {
      display: none;
      padding: 8px 16px;
      background-color: var(--bg-tertiary);
      border-bottom: 1px solid var(--border);
      font-size: 12px;
      color: var(--text-secondary);
      align-items: center;
      gap: 12px;
    }
    
    .selection-actions.visible {
      display: flex;
    }
    
    .selection-count {
      font-weight: 500;
      color: var(--text-primary);
    }
    
    .selection-btn {
      background: transparent;
      border: none;
      color: var(--accent);
      cursor: pointer;
      padding: 4px 8px;
      font-size: 12px;
    }
    
    .selection-btn:hover {
      text-decoration: underline;
    }
    
    .nested-folders {
      margin-left: 20px;
    }
    
    .folder-item.collapsed .nested-folders {
      display: none;
    }
    
    .folder-toggle {
      font-size: 10px;
      color: var(--text-secondary);
      transition: transform 0.2s;
    }
    
    .folder-item.expanded .folder-toggle {
      transform: rotate(90deg);
    }
    
    .library-empty {
      text-align: center;
      padding: 40px 20px;
      color: var(--text-secondary);
    }
    
    .library-empty-icon {
      font-size: 48px;
      margin-bottom: 12px;
      opacity: 0.5;
    }
    
    .library-empty-text {
      font-size: 13px;
      margin-bottom: 16px;
    }
    
    /* Sidebar Toggle Button */
    .sidebar-toggle {
      position: fixed;
      left: 8px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 100;
      background-color: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 0 6px 6px 0;
      padding: 12px 6px;
      cursor: pointer;
      color: var(--text-secondary);
      transition: all 0.2s;
      display: none;
    }
    
    .library-sidebar.collapsed + .main-content + .sidebar-toggle,
    .library-sidebar.collapsed ~ .sidebar-toggle {
      display: block;
    }
    
    .sidebar-toggle:hover {
      background-color: var(--bg-tertiary);
      color: var(--text-primary);
    }
    
    /* Main content area when sidebar is present */
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    
    .main-content .main {
      height: 100%;
    }
    
    /* Auth UI */
    .auth-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .user-menu {
      position: relative;
    }
    
    .user-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background-color: var(--bg-tertiary);
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text-primary);
      cursor: pointer;
      font-size: 13px;
      transition: all 0.2s;
    }
    
    .user-btn:hover {
      background-color: var(--border);
    }
    
    .user-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background-color: var(--accent);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      color: #011627;
      font-weight: 600;
    }
    
    .user-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 8px;
      background-color: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 8px;
      min-width: 200px;
      z-index: 200;
      display: none;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
    
    .user-dropdown.visible {
      display: block;
    }
    
    .user-dropdown-header {
      padding: 12px 16px;
      border-bottom: 1px solid var(--border);
    }
    
    .user-dropdown-email {
      font-size: 13px;
      color: var(--text-primary);
      font-weight: 500;
    }
    
    .user-dropdown-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 16px;
      color: var(--text-primary);
      cursor: pointer;
      font-size: 13px;
      transition: all 0.2s;
      width: 100%;
      background: none;
      border: none;
      text-align: left;
    }
    
    .user-dropdown-item:hover {
      background-color: var(--bg-tertiary);
    }
    
    .user-dropdown-item.danger {
      color: var(--error);
    }
    
    /* Auth Modal */
    .auth-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.7);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    
    .auth-modal.visible {
      display: flex;
    }
    
    .auth-modal-content {
      background-color: var(--bg-secondary);
      border-radius: 12px;
      padding: 32px;
      width: 90%;
      max-width: 400px;
      border: 1px solid var(--border);
    }
    
    .auth-modal-header {
      text-align: center;
      margin-bottom: 24px;
    }
    
    .auth-modal-title {
      font-size: 24px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 8px;
    }
    
    .auth-modal-subtitle {
      font-size: 14px;
      color: var(--text-secondary);
    }
    
    .auth-tabs {
      display: flex;
      margin-bottom: 24px;
      border-bottom: 1px solid var(--border);
    }
    
    .auth-tab {
      flex: 1;
      padding: 12px;
      background: none;
      border: none;
      color: var(--text-secondary);
      font-size: 14px;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
    }
    
    .auth-tab.active {
      color: var(--accent);
      border-bottom-color: var(--accent);
    }
    
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .auth-input-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    
    .auth-label {
      font-size: 13px;
      color: var(--text-secondary);
    }
    
    .auth-input {
      padding: 12px;
      background-color: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text-primary);
      font-size: 14px;
    }
    
    .auth-input:focus {
      outline: none;
      border-color: var(--accent);
    }
    
    .auth-error {
      color: var(--error);
      font-size: 13px;
      display: none;
    }
    
    .auth-error.visible {
      display: block;
    }
    
    .auth-submit {
      padding: 12px;
      background-color: var(--accent);
      color: #011627;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .auth-submit:hover {
      background-color: var(--accent-hover);
    }
    
    .auth-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .auth-divider {
      display: flex;
      align-items: center;
      gap: 12px;
      color: var(--text-secondary);
      font-size: 12px;
    }
    
    .auth-divider::before,
    .auth-divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background-color: var(--border);
    }
    
    .auth-close {
      position: absolute;
      top: 16px;
      right: 16px;
      background: none;
      border: none;
      color: var(--text-secondary);
      font-size: 20px;
      cursor: pointer;
    }
    
    /* Save to Library Modal */
    .save-library-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.7);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    
    .save-library-modal.visible {
      display: flex;
    }
    
    .save-library-content {
      background-color: var(--bg-secondary);
      border-radius: 12px;
      padding: 24px;
      width: 90%;
      max-width: 450px;
      border: 1px solid var(--border);
    }
    
    .save-library-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    
    .save-library-title {
      font-size: 18px;
      font-weight: 600;
    }
    
    .folder-select {
      margin-bottom: 16px;
    }
    
    .folder-select-label {
      font-size: 13px;
      color: var(--text-secondary);
      margin-bottom: 8px;
      display: block;
    }
    
    .folder-select-dropdown {
      width: 100%;
      padding: 10px 12px;
      background-color: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: 6px;
      color: var(--text-primary);
      font-size: 14px;
    }
    
    .folder-select-dropdown:focus {
      outline: none;
      border-color: var(--accent);
    }
    
    .new-folder-row {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }
    
    .new-folder-input {
      flex: 1;
      padding: 8px 12px;
      background-color: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: 6px;
      color: var(--text-primary);
      font-size: 13px;
    }
    
    .new-folder-input:focus {
      outline: none;
      border-color: var(--accent);
    }
    
    /* Library toggle in header */
    .library-toggle-btn {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    @media (max-width: 1200px) {
      .library-sidebar {
        position: fixed;
        left: 0;
        top: 73px;
        bottom: 0;
        z-index: 90;
        transform: translateX(0);
      }
      
      .library-sidebar.collapsed {
        transform: translateX(-100%);
      }
      
      body.has-tabs .library-sidebar {
        top: 122px;
      }
    }
    
    @media (max-width: 768px) {
      .library-sidebar {
        width: 100%;
        max-width: 300px;
      }
      
      .auth-section .btn-text {
        display: none;
      }
    }
`;

// Library Sidebar HTML
export const librarySidebarHtml = `
  <!-- Library Sidebar -->
  <aside class="library-sidebar" id="library-sidebar">
    <div class="library-header">
      <span class="library-title">📚 Library</span>
      <div class="library-actions">
        <button class="library-btn" onclick="createNewFolder()" title="New Folder">📁+</button>
        <button class="library-btn" onclick="refreshLibrary()" title="Refresh">🔄</button>
        <button class="library-btn" onclick="toggleLibrarySidebar()" title="Close">✕</button>
      </div>
    </div>
    
    <div class="library-search">
      <input type="text" id="library-search" placeholder="🔍 Search books..." oninput="searchLibrary(this.value)">
    </div>
    
    <div class="selection-actions" id="selection-actions">
      <span class="selection-count">0 selected</span>
      <button class="selection-btn" onclick="openSelectedBooks()" style="color: var(--accent);">📂 Open</button>
      <button class="selection-btn" onclick="selectAllBooks()">Select All</button>
      <button class="selection-btn" onclick="clearSelection()">Clear</button>
    </div>
    
    <div class="library-content" id="library-content">
      <div class="library-empty" id="library-empty">
        <div class="library-empty-icon">📚</div>
        <div class="library-empty-text">Your library is empty</div>
        <button class="btn btn-primary" onclick="saveToLibrary()">Save Current Document</button>
      </div>
      
      <div class="library-section" id="folders-section" style="display: none;">
        <div class="library-section-header">
          <span>Folders</span>
        </div>
        <div id="folders-list"></div>
      </div>
      
      <div class="library-section" id="books-section" style="display: none;">
        <div class="library-section-header">
          <span id="books-section-title">All Books</span>
          <button class="library-btn" id="show-all-books-btn" style="display: none; font-size: 11px; padding: 2px 6px;" onclick="showAllBooks()">Show All</button>
        </div>
        <div id="books-list"></div>
      </div>
    </div>
  </aside>
`;

// Auth Modal HTML
export const authModalHtml = `
  <!-- Auth Modal -->
  <div class="auth-modal" id="auth-modal">
    <div class="auth-modal-content" style="position: relative;">
      <button class="auth-close" onclick="closeAuthModal()">✕</button>
      
      <div class="auth-modal-header">
        <div class="auth-modal-title">Welcome</div>
        <div class="auth-modal-subtitle">Sign in to sync your library</div>
      </div>
      
      <div class="auth-tabs">
        <button class="auth-tab active" id="signin-tab" onclick="switchAuthTab('signin')">Sign In</button>
        <button class="auth-tab" id="signup-tab" onclick="switchAuthTab('signup')">Sign Up</button>
      </div>
      
      <form class="auth-form" id="auth-form" onsubmit="handleAuthSubmit(event)">
        <div class="auth-input-group" id="name-group" style="display: none;">
          <label class="auth-label" for="auth-name">Name</label>
          <input type="text" class="auth-input" id="auth-name" placeholder="Your name">
        </div>
        
        <div class="auth-input-group">
          <label class="auth-label" for="auth-email">Email</label>
          <input type="email" class="auth-input" id="auth-email" placeholder="you@example.com" required>
        </div>
        
        <div class="auth-input-group">
          <label class="auth-label" for="auth-password">Password</label>
          <input type="password" class="auth-input" id="auth-password" placeholder="••••••••" required minlength="6">
        </div>
        
        <div class="auth-error" id="auth-error"></div>
        
        <button type="submit" class="auth-submit" id="auth-submit">Sign In</button>
      </form>
    </div>
  </div>
`;

// Save to Library Modal HTML
export const saveLibraryModalHtml = `
  <!-- Save to Library Modal -->
  <div class="save-library-modal" id="save-library-modal">
    <div class="save-library-content">
      <div class="save-library-header">
        <span class="save-library-title">📚 Save to Library</span>
        <button class="library-btn" onclick="closeSaveLibraryModal()">✕</button>
      </div>
      
      <form onsubmit="handleSaveToLibrary(event)">
        <div class="auth-input-group">
          <label class="auth-label" for="book-title">Title</label>
          <input type="text" class="auth-input" id="book-title" placeholder="My Document" required>
        </div>
        
        <div class="folder-select">
          <label class="folder-select-label">Save to folder</label>
          <select class="folder-select-dropdown" id="folder-select">
            <option value="">📂 Root (no folder)</option>
          </select>
          
          <div class="new-folder-row">
            <input type="text" class="new-folder-input" id="new-folder-name" placeholder="New folder name...">
            <button type="button" class="btn btn-secondary" onclick="createFolderInModal()">Create</button>
          </div>
        </div>
        
        <div class="modal-actions" style="margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeSaveLibraryModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">💾 Save</button>
        </div>
      </form>
    </div>
  </div>
`;

// Auth header buttons (for signed out state)
export const authButtonsHtml = `
  <div class="auth-section" id="auth-section">
    <button class="btn btn-secondary" onclick="openAuthModal()">
      👤 <span class="btn-text">Sign In</span>
    </button>
  </div>
`;

// User menu (for signed in state)
export const userMenuHtml = `
  <div class="user-menu" id="user-menu" style="display: none;">
    <button class="user-btn" onclick="toggleUserDropdown()">
      <span class="user-avatar" id="user-avatar">?</span>
      <span class="btn-text" id="user-name">User</span>
    </button>
    <div class="user-dropdown" id="user-dropdown">
      <div class="user-dropdown-header">
        <div class="user-dropdown-email" id="user-email">user@example.com</div>
      </div>
      <button class="user-dropdown-item" onclick="openLibraryStats()">
        📊 Library Stats
      </button>
      <button class="user-dropdown-item danger" onclick="handleSignOut()">
        🚪 Sign Out
      </button>
    </div>
  </div>
`;

// Library JavaScript functions
export const libraryScript = `
    console.log('🔧 Library script starting...');
    
    // ==================== LIBRARY STATE ====================
    let currentUser = null;
    let libraryFolders = [];
    let libraryBooks = [];
    let selectedFolderId = null;
    let authMode = 'signin';
    let selectedBookIds = new Set();
    let lastSelectedBookId = null;
    
    // ==================== AUTH FUNCTIONS ====================
    
    function openAuthModal() {
      document.getElementById('auth-modal').classList.add('visible');
    }
    
    function closeAuthModal() {
      document.getElementById('auth-modal').classList.remove('visible');
      document.getElementById('auth-error').textContent = '';
      document.getElementById('auth-error').classList.remove('visible');
    }
    
    function switchAuthTab(mode) {
      authMode = mode;
      document.getElementById('signin-tab').classList.toggle('active', mode === 'signin');
      document.getElementById('signup-tab').classList.toggle('active', mode === 'signup');
      document.getElementById('name-group').style.display = mode === 'signup' ? 'flex' : 'none';
      document.getElementById('auth-submit').textContent = mode === 'signin' ? 'Sign In' : 'Sign Up';
    }
    
    async function handleAuthSubmit(e) {
      e.preventDefault();
      
      const email = document.getElementById('auth-email').value;
      const password = document.getElementById('auth-password').value;
      const name = document.getElementById('auth-name').value;
      const errorEl = document.getElementById('auth-error');
      const submitBtn = document.getElementById('auth-submit');
      
      submitBtn.disabled = true;
      submitBtn.textContent = authMode === 'signin' ? 'Signing in...' : 'Creating account...';
      
      try {
        const endpoint = authMode === 'signin' ? '/api/auth/signin' : '/api/auth/signup';
        const body = authMode === 'signin' 
          ? { email, password }
          : { email, password, name };
        
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        
        const data = await res.json();
        
        if (data.error) {
          errorEl.textContent = data.error;
          errorEl.classList.add('visible');
        } else {
          // Store session
          localStorage.setItem('auth_token', data.session.access_token);
          localStorage.setItem('refresh_token', data.session.refresh_token);
          currentUser = data.user;
          updateAuthUI();
          closeAuthModal();
          refreshLibrary();
          showToast('success', 'Signed in successfully!');
        }
      } catch (err) {
        errorEl.textContent = 'Connection error. Please try again.';
        errorEl.classList.add('visible');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = authMode === 'signin' ? 'Sign In' : 'Sign Up';
      }
    }
    
    async function handleSignOut() {
      const token = localStorage.getItem('auth_token');
      
      try {
        await fetch('/api/auth/signout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          }
        });
      } catch (e) {}
      
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      currentUser = null;
      updateAuthUI();
      refreshLibrary();
      showToast('success', 'Signed out');
    }
    
    function updateAuthUI() {
      const authSection = document.getElementById('auth-section');
      const userMenu = document.getElementById('user-menu');
      
      if (currentUser) {
        authSection.style.display = 'none';
        userMenu.style.display = 'block';
        document.getElementById('user-avatar').textContent = (currentUser.name || currentUser.email)[0].toUpperCase();
        document.getElementById('user-name').textContent = currentUser.name || 'User';
        document.getElementById('user-email').textContent = currentUser.email;
      } else {
        authSection.style.display = 'flex';
        userMenu.style.display = 'none';
      }
    }
    
    function toggleUserDropdown() {
      document.getElementById('user-dropdown').classList.toggle('visible');
    }
    
    // ==================== LIBRARY FUNCTIONS ====================
    
    function toggleLibrarySidebar() {
      const sidebar = document.getElementById('library-sidebar');
      sidebar.classList.toggle('collapsed');
      localStorage.setItem('library-collapsed', sidebar.classList.contains('collapsed'));
    }
    
    function openLibrarySidebar() {
      document.getElementById('library-sidebar').classList.remove('collapsed');
      localStorage.setItem('library-collapsed', 'false');
    }
    
    async function refreshLibrary() {
      const token = localStorage.getItem('auth_token');
      const headers = token ? { 'Authorization': 'Bearer ' + token } : {};
      
      try {
        // Fetch folders
        const foldersRes = await fetch('/api/folders', { headers });
        const foldersData = await foldersRes.json();
        libraryFolders = foldersData.folders || [];
        
        // Fetch books
        const booksRes = await fetch('/api/books', { headers });
        const booksData = await booksRes.json();
        libraryBooks = booksData.books || [];
        
        renderLibrary();
      } catch (err) {
        console.error('Failed to load library:', err);
      }
    }
    
    function renderLibrary() {
      const emptyEl = document.getElementById('library-empty');
      const foldersSection = document.getElementById('folders-section');
      const booksSection = document.getElementById('books-section');
      const foldersList = document.getElementById('folders-list');
      const booksList = document.getElementById('books-list');
      
      const hasContent = libraryFolders.length > 0 || libraryBooks.length > 0;
      
      emptyEl.style.display = hasContent ? 'none' : 'block';
      foldersSection.style.display = libraryFolders.length > 0 ? 'block' : 'none';
      booksSection.style.display = libraryBooks.length > 0 ? 'block' : 'none';
      
      // Render folders
      foldersList.innerHTML = libraryFolders
        .filter(f => !f.parent_id)
        .map(folder => renderFolderItem(folder))
        .join('');
      
      // Render books
      booksList.innerHTML = libraryBooks
        .slice(0, 10)
        .map(book => renderBookItem(book))
        .join('');
      
      updateSelectionUI();
      initDragDropListeners();
    }
    
    function renderBookItem(book) {
      const isSelected = selectedBookIds.has(book.id);
      return \`
        <div class="book-item\${isSelected ? ' selected' : ''}" 
             data-book-id="\${book.id}"
             draggable="true"
             oncontextmenu="showBookContextMenu(event, '\${book.id}')">
          <input type="checkbox" class="book-checkbox" 
                 \${isSelected ? 'checked' : ''}>
          <span class="book-icon">\${getBookIcon(book.file_type)}</span>
          <span class="book-title">\${escapeHtml(book.title)}</span>
          <div class="book-actions">
            <button class="book-action-btn" onclick="event.stopPropagation(); editBookName('\${book.id}')" title="Rename">✏️</button>
            <button class="book-action-btn delete" onclick="event.stopPropagation(); deleteBook('\${book.id}')" title="Delete">🗑️</button>
          </div>
        </div>
      \`;
    }
    
    function renderFolderItem(folder) {
      const children = libraryFolders.filter(f => f.parent_id === folder.id);
      const bookCount = libraryBooks.filter(b => b.folder_id === folder.id).length;
      
      return \`
        <div class="folder-item\${folder.id === selectedFolderId ? ' active' : ''}" 
             data-folder-id="\${folder.id}"
             oncontextmenu="showFolderContextMenu(event, '\${folder.id}')">
          <span class="folder-toggle">\${children.length > 0 ? '▶' : ''}</span>
          <span class="folder-icon">📁</span>
          <span class="folder-name">\${escapeHtml(folder.name)}</span>
          \${bookCount > 0 ? \`<span class="folder-count">\${bookCount}</span>\` : ''}
          <span class="drop-indicator">⬇️ Drop</span>
        </div>
        \${children.length > 0 ? \`<div class="nested-folders">\${children.map(c => renderFolderItem(c)).join('')}</div>\` : ''}
      \`;
    }
    
    function getBookIcon(fileType) {
      switch (fileType) {
        case 'pdf': return '📕';
        case 'html': return '📄';
        default: return '📝';
      }
    }
    
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
    
    async function selectFolder(folderId, folderElement) {
      selectedFolderId = folderId;
      
      // Update section title to show folder name
      const folder = libraryFolders.find(f => f.id === folderId);
      const titleEl = document.getElementById('books-section-title');
      const showAllBtn = document.getElementById('show-all-books-btn');
      
      if (titleEl && folder) {
        titleEl.textContent = '📁 ' + escapeHtml(folder.name);
      }
      if (showAllBtn) {
        showAllBtn.style.display = 'inline';
      }
      
      // Fetch books in this folder
      const token = localStorage.getItem('auth_token');
      const headers = token ? { 'Authorization': 'Bearer ' + token } : {};
      
      try {
        const res = await fetch('/api/books?folder_id=' + folderId, { headers });
        const data = await res.json();
        
        // Update books list to show only this folder's books
        const booksList = document.getElementById('books-list');
        const folderBooks = data.books || [];
        
        if (folderBooks.length === 0) {
          booksList.innerHTML = '<div class="library-empty-text" style="padding: 20px; text-align: center;">No books in this folder.<br><small>Drag books here to add them.</small></div>';
        } else {
          booksList.innerHTML = folderBooks.map(book => renderBookItem(book)).join('');
        }
        
        document.getElementById('books-section').style.display = 'block';
        document.querySelectorAll('.folder-item').forEach(el => el.classList.remove('active'));
        
        // Highlight selected folder
        if (folderElement) {
          folderElement.classList.add('active');
        } else {
          const el = document.querySelector(\`.folder-item[data-folder-id="\${folderId}"]\`);
          if (el) el.classList.add('active');
        }
        
        updateSelectionUI();
        initDragDropListeners(); // Re-init for new book items
      } catch (err) {
        console.error('Failed to load folder:', err);
      }
    }
    
    function showAllBooks() {
      selectedFolderId = null;
      
      // Reset section title
      const titleEl = document.getElementById('books-section-title');
      const showAllBtn = document.getElementById('show-all-books-btn');
      
      if (titleEl) {
        titleEl.textContent = 'All Books';
      }
      if (showAllBtn) {
        showAllBtn.style.display = 'none';
      }
      
      // Deselect all folders
      document.querySelectorAll('.folder-item').forEach(el => el.classList.remove('active'));
      
      // Render all books
      renderLibrary();
    }
    
    async function openBook(bookId) {
      const token = localStorage.getItem('auth_token');
      const headers = token ? { 'Authorization': 'Bearer ' + token } : {};
      
      try {
        const res = await fetch('/api/books/' + bookId, { headers });
        const data = await res.json();
        
        if (!data.book) {
          showToast('error', 'Book not found');
          return;
        }
        
        let content = '';
        const book = data.book;
        
        // Try to load from file_path first
        if (book.file_path) {
          try {
            const contentRes = await fetch('/files/' + book.file_path, { headers });
            if (contentRes.ok) {
              content = await contentRes.text();
            }
          } catch (e) {
            console.warn('Could not load file from path:', e);
          }
        }
        
        // Fall back to content stored in metadata
        if (!content && book.metadata && book.metadata.content) {
          content = book.metadata.content;
        }
        
        if (!content) {
          showToast('error', 'No content found for this book');
          return;
        }
        
        // Create a new tab for this book (or switch to existing)
        if (typeof createNewTab === 'function') {
          createNewTab(book.title, content, bookId);
        } else {
          // Fallback: just load into editor
          document.getElementById('markdown-input').value = content;
          if (typeof renderPreview === 'function') renderPreview();
        }
        
        showToast('success', 'Opened: ' + book.title);
      } catch (err) {
        console.error('Failed to load book:', err);
        showToast('error', 'Failed to load book');
      }
    }
    
    // Open multiple books at once (e.g., from multi-select)
    async function openSelectedBooks() {
      if (selectedBookIds.size === 0) {
        showToast('error', 'No books selected');
        return;
      }
      
      for (const bookId of selectedBookIds) {
        await openBook(bookId);
      }
      
      clearSelection();
    }
    
    async function searchLibrary(query) {
      if (!query) {
        renderLibrary();
        return;
      }
      
      const token = localStorage.getItem('auth_token');
      const headers = token ? { 'Authorization': 'Bearer ' + token } : {};
      
      try {
        const res = await fetch('/api/books/search?q=' + encodeURIComponent(query), { headers });
        const data = await res.json();
        
        const booksList = document.getElementById('books-list');
        booksList.innerHTML = (data.books || [])
          .map(book => renderBookItem(book))
          .join('');
        
        document.getElementById('books-section').style.display = 'block';
        document.getElementById('folders-section').style.display = 'none';
        document.getElementById('library-empty').style.display = 'none';
      } catch (err) {
        console.error('Search failed:', err);
      }
    }
    
    // ==================== SAVE TO LIBRARY ====================
    
    function saveToLibrary() {
      const content = document.getElementById('markdown-input').value.trim();
      if (!content) {
        showToast('error', 'Nothing to save');
        return;
      }
      
      // Extract title from first heading or use default
      const titleMatch = content.match(/^#\\s+(.+)$/m);
      const defaultTitle = titleMatch ? titleMatch[1] : 'Untitled Document';
      
      document.getElementById('book-title').value = defaultTitle;
      updateFolderSelect();
      document.getElementById('save-library-modal').classList.add('visible');
    }
    
    function closeSaveLibraryModal() {
      document.getElementById('save-library-modal').classList.remove('visible');
    }
    
    async function updateFolderSelect() {
      const select = document.getElementById('folder-select');
      const token = localStorage.getItem('auth_token');
      const headers = token ? { 'Authorization': 'Bearer ' + token } : {};
      
      try {
        const res = await fetch('/api/folders', { headers });
        const data = await res.json();
        
        select.innerHTML = '<option value="">📂 Root (no folder)</option>' +
          (data.folders || []).map(f => 
            \`<option value="\${f.id}">📁 \${escapeHtml(f.name)}</option>\`
          ).join('');
      } catch (err) {
        console.error('Failed to load folders:', err);
      }
    }
    
    async function createFolderInModal() {
      const nameInput = document.getElementById('new-folder-name');
      const name = nameInput.value.trim();
      
      if (!name) {
        showToast('error', 'Enter folder name');
        return;
      }
      
      const token = localStorage.getItem('auth_token');
      const headers = { 
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': 'Bearer ' + token } : {})
      };
      
      try {
        const res = await fetch('/api/folders', {
          method: 'POST',
          headers,
          body: JSON.stringify({ name })
        });
        
        const data = await res.json();
        
        if (data.folder) {
          nameInput.value = '';
          await updateFolderSelect();
          document.getElementById('folder-select').value = data.folder.id;
          showToast('success', 'Folder created');
        }
      } catch (err) {
        showToast('error', 'Failed to create folder');
      }
    }
    
    async function createNewFolder() {
      const name = prompt('Enter folder name:');
      if (!name) return;
      
      const token = localStorage.getItem('auth_token');
      const headers = { 
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': 'Bearer ' + token } : {})
      };
      
      try {
        const res = await fetch('/api/folders', {
          method: 'POST',
          headers,
          body: JSON.stringify({ name, parent_id: selectedFolderId })
        });
        
        const data = await res.json();
        
        if (data.folder) {
          libraryFolders.push(data.folder);
          renderLibrary();
          showToast('success', 'Folder created');
        }
      } catch (err) {
        showToast('error', 'Failed to create folder');
      }
    }
    
    async function handleSaveToLibrary(e) {
      e.preventDefault();
      
      const title = document.getElementById('book-title').value.trim();
      const folderId = document.getElementById('folder-select').value || null;
      const content = document.getElementById('markdown-input').value;
      
      if (!title) {
        showToast('error', 'Enter a title');
        return;
      }
      
      const token = localStorage.getItem('auth_token');
      const headers = { 
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': 'Bearer ' + token } : {})
      };
      
      try {
        let bookId = null;
        let isUpdate = false;
        
        // Check if we're editing an existing book (currentBookId is set)
        if (typeof currentBookId !== 'undefined' && currentBookId) {
          bookId = currentBookId;
          isUpdate = true;
        }
        
        // If not editing existing, check if a book with same title already exists
        if (!isUpdate) {
          const checkRes = await fetch('/api/books', { headers });
          const checkData = await checkRes.json();
          const existingBook = (checkData.books || []).find(b => 
            b.title.toLowerCase() === title.toLowerCase()
          );
          if (existingBook) {
            bookId = existingBook.id;
            isUpdate = true;
          }
        }
        
        let res;
        if (isUpdate && bookId) {
          // Update existing book
          res = await fetch('/api/books/' + bookId, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
              title,
              folder_id: folderId,
              file_size: new Blob([content]).size,
              metadata: { content }
            })
          });
        } else {
          // Create new book
          res = await fetch('/api/books', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              title,
              folder_id: folderId,
              file_type: 'md',
              file_size: new Blob([content]).size,
              metadata: { content }
            })
          });
        }
        
        const data = await res.json();
        
        if (data.book) {
          // Link this book to current tab and track it
          const newBookId = data.book.id;
          if (typeof currentBookId !== 'undefined') {
            currentBookId = newBookId;
          }
          
          // Update current tab's bookId if tabs exist
          if (typeof tabs !== 'undefined' && typeof activeTabId !== 'undefined' && activeTabId) {
            const activeTab = tabs.find(t => t.id === activeTabId);
            if (activeTab) {
              activeTab.bookId = newBookId;
              if (typeof saveTabsToStorage === 'function') {
                saveTabsToStorage();
              }
              if (typeof renderTabs === 'function') {
                renderTabs();
              }
            }
          }
          
          closeSaveLibraryModal();
          refreshLibrary();
          openLibrarySidebar();
          showToast('success', isUpdate ? 'Updated in library!' : 'Saved to library!');
        } else {
          showToast('error', data.error || 'Failed to save');
        }
      } catch (err) {
        console.error('Save to library error:', err);
        showToast('error', 'Failed to save');
      }
    }
    
    async function openLibraryStats() {
      document.getElementById('user-dropdown').classList.remove('visible');
      
      const token = localStorage.getItem('auth_token');
      const headers = token ? { 'Authorization': 'Bearer ' + token } : {};
      
      try {
        const res = await fetch('/api/stats', { headers });
        const data = await res.json();
        
        alert(\`📚 Library Stats
        
Folders: \${data.stats.totalFolders}
Books: \${data.stats.totalBooks}
Total Size: \${formatBytes(data.stats.totalSize)}

By Type:
\${Object.entries(data.stats.booksByType || {}).map(([k, v]) => '  ' + k + ': ' + v).join('\\n') || '  None'}\`);
      } catch (err) {
        showToast('error', 'Failed to load stats');
      }
    }
    
    function formatBytes(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // ==================== DRAG AND DROP ====================
    
    let draggedBookIds = [];
    
    function toggleBookSelection(event, bookId) {
      event.stopPropagation();
      
      if (event.shiftKey && lastSelectedBookId) {
        // Shift+click: select range
        const bookItems = Array.from(document.querySelectorAll('.book-item[data-book-id]'));
        const ids = bookItems.map(el => el.dataset.bookId);
        const startIdx = ids.indexOf(lastSelectedBookId);
        const endIdx = ids.indexOf(bookId);
        
        if (startIdx !== -1 && endIdx !== -1) {
          const [from, to] = [Math.min(startIdx, endIdx), Math.max(startIdx, endIdx)];
          for (let i = from; i <= to; i++) {
            selectedBookIds.add(ids[i]);
          }
        }
      } else {
        // Normal click: toggle selection
        if (selectedBookIds.has(bookId)) {
          selectedBookIds.delete(bookId);
        } else {
          selectedBookIds.add(bookId);
        }
        lastSelectedBookId = bookId;
      }
      
      updateSelectionUI();
    }
    
    function updateSelectionUI() {
      // Update checkboxes and selected class
      document.querySelectorAll('.book-item[data-book-id]').forEach(el => {
        const bookId = el.dataset.bookId;
        const isSelected = selectedBookIds.has(bookId);
        el.classList.toggle('selected', isSelected);
        const checkbox = el.querySelector('.book-checkbox');
        if (checkbox) checkbox.checked = isSelected;
      });
      
      // Show/hide selection actions bar
      const actionsBar = document.getElementById('selection-actions');
      if (actionsBar) {
        actionsBar.classList.toggle('visible', selectedBookIds.size > 0);
        const countEl = actionsBar.querySelector('.selection-count');
        if (countEl) {
          countEl.textContent = selectedBookIds.size + ' selected';
        }
      }
    }
    
    function clearSelection() {
      selectedBookIds.clear();
      lastSelectedBookId = null;
      updateSelectionUI();
    }
    
    function selectAllBooks() {
      document.querySelectorAll('.book-item[data-book-id]').forEach(el => {
        selectedBookIds.add(el.dataset.bookId);
      });
      updateSelectionUI();
    }
    
    // Initialize drag/drop event listeners using event delegation
    function initDragDropListeners() {
      const libraryContent = document.getElementById('library-content');
      if (!libraryContent) return;
      
      // Remove old listeners by cloning (clean slate)
      const newContent = libraryContent.cloneNode(true);
      libraryContent.parentNode.replaceChild(newContent, libraryContent);
      
      const content = document.getElementById('library-content');
      
      // Book item clicks (for opening and selection)
      content.addEventListener('click', (e) => {
        const bookItem = e.target.closest('.book-item');
        const folderItem = e.target.closest('.folder-item');
        const checkbox = e.target.closest('.book-checkbox');
        
        if (checkbox && bookItem) {
          e.stopPropagation();
          const bookId = bookItem.dataset.bookId;
          toggleBookSelection(e, bookId);
          return;
        }
        
        // Click anywhere on book item (except checkbox) opens it
        if (bookItem && !checkbox) {
          e.stopPropagation();
          const bookId = bookItem.dataset.bookId;
          openBook(bookId);
          return;
        }
        
        if (folderItem && !bookItem) {
          const folderId = folderItem.dataset.folderId;
          if (folderId) {
            selectFolder(folderId, folderItem);
          }
          return;
        }
      });
      
      // Drag start on book items
      content.addEventListener('dragstart', (e) => {
        const bookItem = e.target.closest('.book-item');
        if (bookItem) {
          const bookId = bookItem.dataset.bookId;
          handleDragStartEvent(e, bookId);
        }
      });
      
      // Drag end
      content.addEventListener('dragend', (e) => {
        document.querySelectorAll('.book-item.dragging').forEach(el => {
          el.classList.remove('dragging');
        });
        draggedBookIds = [];
      });
      
      // Folder drag over/enter/leave/drop
      content.addEventListener('dragover', (e) => {
        const folderItem = e.target.closest('.folder-item');
        if (folderItem) {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
        }
      });
      
      content.addEventListener('dragenter', (e) => {
        e.preventDefault();
        const folderItem = e.target.closest('.folder-item');
        if (folderItem) {
          folderItem.classList.add('drag-over');
        }
      });
      
      content.addEventListener('dragleave', (e) => {
        const folderItem = e.target.closest('.folder-item');
        if (folderItem) {
          const relatedTarget = e.relatedTarget;
          if (!folderItem.contains(relatedTarget)) {
            folderItem.classList.remove('drag-over');
          }
        }
      });
      
      content.addEventListener('drop', (e) => {
        e.preventDefault();
        const folderItem = e.target.closest('.folder-item');
        if (folderItem) {
          folderItem.classList.remove('drag-over');
          const folderId = folderItem.dataset.folderId;
          if (folderId) {
            handleDropEvent(folderId);
          }
        }
      });
      
      console.log('📚 Drag & drop listeners initialized');
    }
    
    function handleDragStartEvent(event, bookId) {
      // If the dragged book isn't selected, only drag that one
      if (!selectedBookIds.has(bookId)) {
        draggedBookIds = [bookId];
      } else {
        // Drag all selected books
        draggedBookIds = Array.from(selectedBookIds);
      }
      
      console.log('Drag started - books:', draggedBookIds);
      
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', JSON.stringify(draggedBookIds));
      
      // Add dragging class to all dragged items
      draggedBookIds.forEach(id => {
        const el = document.querySelector(\`.book-item[data-book-id="\${id}"]\`);
        if (el) el.classList.add('dragging');
      });
      
      // Create custom drag image showing count
      if (draggedBookIds.length > 1) {
        const dragGhost = document.createElement('div');
        dragGhost.style.cssText = 'position:absolute;top:-1000px;padding:8px 12px;background:var(--bg-tertiary);border-radius:6px;color:var(--text-primary);font-size:13px;';
        dragGhost.textContent = draggedBookIds.length + ' files';
        document.body.appendChild(dragGhost);
        event.dataTransfer.setDragImage(dragGhost, 0, 0);
        setTimeout(() => dragGhost.remove(), 0);
      }
    }
    
    function handleDragEnd(event) {
      // Remove dragging class from all items
      document.querySelectorAll('.book-item.dragging').forEach(el => {
        el.classList.remove('dragging');
      });
      draggedBookIds = [];
    }
    
    function handleDragOver(event) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    }
    
    function handleDragEnter(event) {
      event.preventDefault();
      const folderItem = event.target.closest('.folder-item');
      if (folderItem) {
        folderItem.classList.add('drag-over');
      }
    }
    
    function handleDragLeave(event) {
      const folderItem = event.target.closest('.folder-item');
      if (folderItem) {
        // Only remove if actually leaving the folder item (not entering a child)
        const relatedTarget = event.relatedTarget;
        if (!folderItem.contains(relatedTarget)) {
          folderItem.classList.remove('drag-over');
        }
      }
    }
    
    async function handleDrop(event, folderId) {
      event.preventDefault();
      event.stopPropagation();
      
      const folderItem = event.target.closest('.folder-item');
      if (folderItem) {
        folderItem.classList.remove('drag-over');
      }
      
      // Get dragged book IDs
      let bookIds;
      try {
        const data = event.dataTransfer.getData('text/plain');
        bookIds = data ? JSON.parse(data) : draggedBookIds;
      } catch (e) {
        bookIds = draggedBookIds;
      }
      
      await moveBooks(bookIds, folderId);
    }
    
    async function handleDropEvent(folderId) {
      // Uses the global draggedBookIds set during dragstart
      const bookIds = [...draggedBookIds];
      await moveBooks(bookIds, folderId);
    }
    
    async function moveBooks(bookIds, folderId) {
      console.log('Drop detected - folder:', folderId, 'books:', bookIds);
      
      if (!bookIds || bookIds.length === 0) {
        console.log('No books to drop');
        return;
      }
      
      // Move books to folder
      const token = localStorage.getItem('auth_token');
      const headers = { 
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': 'Bearer ' + token } : {})
      };
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const bookId of bookIds) {
        try {
          console.log('Moving book', bookId, 'to folder', folderId);
          const res = await fetch('/api/books/' + bookId, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ folder_id: folderId })
          });
          
          const result = await res.json();
          console.log('Move result:', result);
          
          if (res.ok) {
            successCount++;
          } else {
            console.error('Move failed:', result);
            errorCount++;
          }
        } catch (err) {
          console.error('Move error:', err);
          errorCount++;
        }
      }
      
      // Clear selection and refresh
      clearSelection();
      await refreshLibrary();
      
      // If we were viewing a folder, refresh that view
      if (selectedFolderId) {
        const folderEl = document.querySelector(\`.folder-item[data-folder-id="\${selectedFolderId}"]\`);
        if (folderEl) {
          folderEl.click();
        }
      }
      
      if (successCount > 0) {
        showToast('success', \`Moved \${successCount} file\${successCount > 1 ? 's' : ''} to folder\`);
      }
      if (errorCount > 0) {
        showToast('error', \`Failed to move \${errorCount} file\${errorCount > 1 ? 's' : ''}\`);
      }
    }
    
    // ==================== INITIALIZE ====================
    
    async function initLibrary() {
      // Check for existing session
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { 'Authorization': 'Bearer ' + token }
          });
          const data = await res.json();
          if (data.user) {
            currentUser = data.user;
            updateAuthUI();
          }
        } catch (e) {}
      }
      
      // Load library
      await refreshLibrary();
      
      // Restore sidebar state
      const collapsed = localStorage.getItem('library-collapsed') === 'true';
      if (collapsed) {
        document.getElementById('library-sidebar').classList.add('collapsed');
      }
    }
    
    // Close dropdowns on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.user-menu')) {
        document.getElementById('user-dropdown')?.classList.remove('visible');
      }
    });
    
    // Expose ALL functions to global scope for inline event handlers
    // Auth functions
    window.openAuthModal = openAuthModal;
    window.closeAuthModal = closeAuthModal;
    window.switchAuthTab = switchAuthTab;
    window.handleAuthSubmit = handleAuthSubmit;
    window.handleSignOut = handleSignOut;
    window.toggleUserDropdown = toggleUserDropdown;
    window.openLibraryStats = openLibraryStats;
    
    // Library functions
    window.toggleLibrarySidebar = toggleLibrarySidebar;
    window.refreshLibrary = refreshLibrary;
    window.createNewFolder = createNewFolder;
    window.saveToLibrary = saveToLibrary;
    window.showAllBooks = showAllBooks;
    window.selectAllBooks = selectAllBooks;
    window.clearSelection = clearSelection;
    window.openSelectedBooks = openSelectedBooks;
    window.searchLibrary = searchLibrary;
    
    // Save modal functions
    window.closeSaveLibraryModal = closeSaveLibraryModal;
    window.handleSaveToLibrary = handleSaveToLibrary;
    window.createFolderInModal = createFolderInModal;
    
    // Initialize library on load
    console.log('📚 Library UI initialized');
    initLibrary();
`;

export default {
  libraryStyles,
  librarySidebarHtml,
  authModalHtml,
  saveLibraryModalHtml,
  authButtonsHtml,
  userMenuHtml,
  libraryScript
};
