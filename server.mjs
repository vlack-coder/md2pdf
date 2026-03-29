#!/usr/bin/env node

/**
 * md2pdf Web UI Server
 * 
 * A web interface for converting Markdown to HTML/PDF
 * with Night Owl theme and dark mode support.
 * 
 * Usage: node server.mjs [--port 3000]
 */

import { createServer } from 'http';
import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';
import hljs from 'highlight.js';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse port from env or args
const args = process.argv.slice(2);
let PORT = parseInt(process.env.PORT) || 3000;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--port' || args[i] === '-p') {
    PORT = parseInt(args[++i]) || PORT;
  }
}

// Configure marked with highlight.js
marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value;
      } catch (err) {}
    }
    try {
      return hljs.highlightAuto(code).value;
    } catch (err) {
      return code;
    }
  },
  langPrefix: 'hljs language-',
  gfm: true,
  breaks: false
});

// Custom renderer
const renderer = new marked.Renderer();
renderer.code = function(code, language) {
  const validLang = language && hljs.getLanguage(language) ? language : '';
  let highlighted;
  
  if (validLang) {
    try {
      highlighted = hljs.highlight(code, { language: validLang }).value;
    } catch (e) {
      highlighted = hljs.highlightAuto(code).value;
    }
  } else {
    highlighted = hljs.highlightAuto(code).value;
  }
  
  const langLabel = validLang ? ` data-language="${validLang}"` : '';
  return `<pre${langLabel}><code class="hljs${validLang ? ` language-${validLang}` : ''}">${highlighted}</code></pre>`;
};

marked.use({ renderer });

// Read CSS
const cssContent = readFileSync(join(__dirname, 'night-owl-theme.css'), 'utf-8');

// Web UI HTML
const webUIHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>md2pdf - Markdown to PDF Converter</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    :root {
      --bg-primary: #0f0f0f;
      --bg-secondary: #1a1a1a;
      --bg-tertiary: #252525;
      --text-primary: #e4e4e4;
      --text-secondary: #a0a0a0;
      --accent: #82aaff;
      --accent-hover: #9ec0ff;
      --border: #333;
      --success: #addb67;
      --error: #ef5350;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: var(--bg-primary);
      color: var(--text-primary);
      min-height: 100vh;
    }
    
    /* Header */
    .header {
      background: linear-gradient(135deg, #011627 0%, #0d293e 100%);
      padding: 20px 30px;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .logo-icon {
      font-size: 32px;
    }
    
    .logo h1 {
      font-size: 24px;
      font-weight: 600;
      color: #fff;
    }
    
    .logo span {
      color: var(--accent);
    }
    
    .header-actions {
      display: flex;
      gap: 12px;
    }
    
    /* Main Layout */
    .main {
      display: grid;
      grid-template-columns: 1fr 1fr;
      height: calc(100vh - 73px);
    }
    
    @media (max-width: 900px) {
      .main {
        grid-template-columns: 1fr;
        grid-template-rows: 1fr 1fr;
      }
    }
    
    /* Editor Panel */
    .editor-panel {
      display: flex;
      flex-direction: column;
      border-right: 1px solid var(--border);
    }
    
    .panel-header {
      padding: 12px 20px;
      background-color: var(--bg-secondary);
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .panel-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .editor-container {
      flex: 1;
      position: relative;
    }
    
    #markdown-input {
      width: 100%;
      height: 100%;
      padding: 20px;
      background-color: var(--bg-primary);
      color: var(--text-primary);
      border: none;
      resize: none;
      font-family: 'SF Mono', 'Fira Code', 'Monaco', monospace;
      font-size: 14px;
      line-height: 1.6;
      outline: none;
    }
    
    #markdown-input::placeholder {
      color: var(--text-secondary);
    }
    
    /* Preview Panel */
    .preview-panel {
      display: flex;
      flex-direction: column;
      background-color: var(--bg-secondary);
    }
    
    .preview-container {
      flex: 1;
      overflow: auto;
    }
    
    #preview-frame {
      width: 100%;
      height: 100%;
      border: none;
      background: #fff;
    }
    
    /* Buttons */
    .btn {
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 8px;
      border: none;
    }
    
    .btn-primary {
      background-color: var(--accent);
      color: #011627;
    }
    
    .btn-primary:hover {
      background-color: var(--accent-hover);
      transform: translateY(-1px);
    }
    
    .btn-secondary {
      background-color: var(--bg-tertiary);
      color: var(--text-primary);
      border: 1px solid var(--border);
    }
    
    .btn-secondary:hover {
      background-color: var(--border);
    }
    
    .btn-icon {
      padding: 8px 12px;
    }
    
    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    /* File Input */
    .file-input-wrapper {
      position: relative;
      overflow: hidden;
    }
    
    .file-input-wrapper input[type="file"] {
      position: absolute;
      left: 0;
      top: 0;
      opacity: 0;
      cursor: pointer;
      width: 100%;
      height: 100%;
    }
    
    /* Status Bar */
    .status-bar {
      padding: 8px 20px;
      background-color: var(--bg-tertiary);
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: var(--text-secondary);
    }
    
    .status-indicator {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: var(--success);
    }
    
    .status-dot.error {
      background-color: var(--error);
    }
    
    .status-dot.loading {
      background-color: var(--accent);
      animation: pulse 1s infinite;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    
    /* Download Options */
    .download-options {
      display: flex;
      gap: 8px;
    }
    
    /* Toast Messages */
    .toast {
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 12px 20px;
      background-color: var(--bg-tertiary);
      border: 1px solid var(--border);
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 10px;
      transform: translateY(100px);
      opacity: 0;
      transition: all 0.3s ease;
      z-index: 1000;
    }
    
    .toast.visible {
      transform: translateY(0);
      opacity: 1;
    }
    
    .toast.success {
      border-color: var(--success);
    }
    
    .toast.error {
      border-color: var(--error);
    }
    
    /* Modal */
    .modal-overlay {
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
    
    .modal-overlay.visible {
      display: flex;
    }
    
    .modal {
      background-color: var(--bg-secondary);
      border-radius: 12px;
      padding: 24px;
      width: 90%;
      max-width: 400px;
      border: 1px solid var(--border);
    }
    
    .modal h3 {
      margin-bottom: 16px;
      font-size: 18px;
    }
    
    .modal-input {
      width: 100%;
      padding: 12px;
      background-color: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: 6px;
      color: var(--text-primary);
      font-size: 14px;
      margin-bottom: 16px;
    }
    
    .modal-input:focus {
      outline: none;
      border-color: var(--accent);
    }
    
    .modal-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }
    
    /* Toolbar */
    .toolbar {
      display: flex;
      gap: 4px;
    }
    
    .toolbar-btn {
      padding: 6px 10px;
      background: transparent;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      border-radius: 4px;
      font-size: 14px;
      transition: all 0.2s;
    }
    
    .toolbar-btn:hover {
      background-color: var(--bg-tertiary);
      color: var(--text-primary);
    }
    
    /* Drag & Drop */
    .drop-zone {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(130, 170, 255, 0.1);
      border: 2px dashed var(--accent);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 10;
    }
    
    .drop-zone.visible {
      display: flex;
    }
    
    .drop-zone-text {
      font-size: 18px;
      color: var(--accent);
    }
  </style>
</head>
<body>
  <!-- Header -->
  <header class="header">
    <div class="logo">
      <span class="logo-icon">📝</span>
      <h1>md<span>2</span>pdf</h1>
    </div>
    <div class="header-actions">
      <div class="file-input-wrapper">
        <button class="btn btn-secondary">
          📂 Open File
        </button>
        <input type="file" id="file-input" accept=".md,.markdown,.txt">
      </div>
      <button class="btn btn-secondary" onclick="clearEditor()">
        🗑️ Clear
      </button>
    </div>
  </header>
  
  <!-- Main Content -->
  <main class="main">
    <!-- Editor Panel -->
    <div class="editor-panel">
      <div class="panel-header">
        <span class="panel-title">📝 Markdown Editor</span>
        <div class="toolbar">
          <button class="toolbar-btn" onclick="insertText('**', '**')" title="Bold">B</button>
          <button class="toolbar-btn" onclick="insertText('*', '*')" title="Italic"><i>I</i></button>
          <button class="toolbar-btn" onclick="insertCodeBlock()" title="Code Block">&lt;/&gt;</button>
          <button class="toolbar-btn" onclick="insertText('[', '](url)')" title="Link">🔗</button>
          <button class="toolbar-btn" onclick="insertListItem()" title="List">•</button>
        </div>
      </div>
      <div class="editor-container">
        <textarea 
          id="markdown-input" 
          placeholder="# Start typing your markdown here...

Or drag & drop a .md file

## Features
- **Bold** and *italic* text
- Code blocks with syntax highlighting
- Tables, lists, and more!

\`\`\`javascript
const greeting = 'Hello, World!';
console.log(greeting);
\`\`\`
"></textarea>
        <div class="drop-zone" id="drop-zone">
          <span class="drop-zone-text">📄 Drop your .md file here</span>
        </div>
      </div>
      <div class="status-bar">
        <div class="status-indicator">
          <span class="status-dot" id="status-dot"></span>
          <span id="status-text">Ready</span>
        </div>
        <span id="char-count">0 characters</span>
      </div>
    </div>
    
    <!-- Preview Panel -->
    <div class="preview-panel">
      <div class="panel-header">
        <span class="panel-title">👁️ Live Preview</span>
        <div class="download-options">
          <button class="btn btn-secondary btn-icon" onclick="downloadHtml()" title="Download HTML">
            📄 HTML
          </button>
          <button class="btn btn-primary" onclick="downloadPdf()" id="pdf-btn">
            📥 Download PDF
          </button>
        </div>
      </div>
      <div class="preview-container">
        <iframe id="preview-frame" sandbox="allow-same-origin"></iframe>
      </div>
    </div>
  </main>
  
  <!-- Toast -->
  <div class="toast" id="toast">
    <span id="toast-icon">✓</span>
    <span id="toast-message">Success!</span>
  </div>
  
  <!-- Filename Modal -->
  <div class="modal-overlay" id="filename-modal">
    <div class="modal">
      <h3>📄 Save As</h3>
      <input type="text" class="modal-input" id="filename-input" placeholder="document" value="document">
      <div class="modal-actions">
        <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="confirmDownload()" id="confirm-download-btn">Download</button>
      </div>
    </div>
  </div>
  
  <script>
    const markdownInput = document.getElementById('markdown-input');
    const previewFrame = document.getElementById('preview-frame');
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');
    const charCount = document.getElementById('char-count');
    const dropZone = document.getElementById('drop-zone');
    
    let debounceTimer;
    let currentDownloadType = 'pdf';
    
    // Update preview on input
    markdownInput.addEventListener('input', () => {
      updateCharCount();
      debouncedRender();
    });
    
    function updateCharCount() {
      const count = markdownInput.value.length;
      charCount.textContent = count.toLocaleString() + ' characters';
    }
    
    function debouncedRender() {
      clearTimeout(debounceTimer);
      setStatus('loading', 'Rendering...');
      debounceTimer = setTimeout(renderPreview, 300);
    }
    
    async function renderPreview() {
      const markdown = markdownInput.value;
      
      try {
        const response = await fetch('/api/render', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ markdown })
        });
        
        const html = await response.text();
        const doc = previewFrame.contentDocument;
        doc.open();
        doc.write(html);
        doc.close();
        
        setStatus('success', 'Ready');
      } catch (error) {
        setStatus('error', 'Render failed');
        showToast('Failed to render preview', 'error');
      }
    }
    
    function setStatus(type, text) {
      statusDot.className = 'status-dot ' + type;
      statusText.textContent = text;
    }
    
    // File input
    document.getElementById('file-input').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) loadFile(file);
    });
    
    function loadFile(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        markdownInput.value = e.target.result;
        updateCharCount();
        renderPreview();
        showToast('File loaded: ' + file.name, 'success');
      };
      reader.readAsText(file);
    }
    
    // Drag and drop
    markdownInput.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('visible');
    });
    
    markdownInput.addEventListener('dragleave', () => {
      dropZone.classList.remove('visible');
    });
    
    markdownInput.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('visible');
      
      const file = e.dataTransfer.files[0];
      if (file && (file.name.endsWith('.md') || file.name.endsWith('.markdown') || file.name.endsWith('.txt'))) {
        loadFile(file);
      } else {
        showToast('Please drop a markdown file (.md)', 'error');
      }
    });
    
    // Download functions
    function downloadHtml() {
      currentDownloadType = 'html';
      document.getElementById('filename-input').value = 'document';
      document.getElementById('filename-modal').classList.add('visible');
    }
    
    function downloadPdf() {
      currentDownloadType = 'pdf';
      document.getElementById('filename-input').value = 'document';
      document.getElementById('filename-modal').classList.add('visible');
    }
    
    function closeModal() {
      document.getElementById('filename-modal').classList.remove('visible');
    }
    
    async function confirmDownload() {
      const filename = document.getElementById('filename-input').value || 'document';
      closeModal();
      
      if (currentDownloadType === 'html') {
        await downloadHtmlFile(filename);
      } else {
        await downloadPdfFile(filename);
      }
    }
    
    async function downloadHtmlFile(filename) {
      try {
        const response = await fetch('/api/render', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ markdown: markdownInput.value })
        });
        
        const html = await response.text();
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename + '.html';
        a.click();
        
        URL.revokeObjectURL(url);
        showToast('HTML downloaded!', 'success');
      } catch (error) {
        showToast('Download failed', 'error');
      }
    }
    
    async function downloadPdfFile(filename) {
      const pdfBtn = document.getElementById('pdf-btn');
      pdfBtn.disabled = true;
      pdfBtn.innerHTML = '⏳ Generating...';
      setStatus('loading', 'Generating PDF...');
      
      try {
        const response = await fetch('/api/pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            markdown: markdownInput.value,
            filename: filename
          })
        });
        
        if (!response.ok) throw new Error('PDF generation failed');
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename + '.pdf';
        a.click();
        
        URL.revokeObjectURL(url);
        showToast('PDF downloaded!', 'success');
        setStatus('success', 'Ready');
      } catch (error) {
        showToast('PDF generation failed', 'error');
        setStatus('error', 'PDF failed');
      } finally {
        pdfBtn.disabled = false;
        pdfBtn.innerHTML = '📥 Download PDF';
      }
    }
    
    // Toolbar functions
    function insertText(before, after) {
      const start = markdownInput.selectionStart;
      const end = markdownInput.selectionEnd;
      const text = markdownInput.value;
      const selected = text.substring(start, end);
      
      markdownInput.value = text.substring(0, start) + before + selected + after + text.substring(end);
      markdownInput.focus();
      markdownInput.setSelectionRange(start + before.length, start + before.length + selected.length);
      
      debouncedRender();
    }
    
    function insertCodeBlock() {
      const start = markdownInput.selectionStart;
      const end = markdownInput.selectionEnd;
      const text = markdownInput.value;
      const selected = text.substring(start, end);
      const backticks = String.fromCharCode(96, 96, 96);
      const codeBlock = '\\n' + backticks + '\\n' + selected + '\\n' + backticks + '\\n';
      
      markdownInput.value = text.substring(0, start) + codeBlock + text.substring(end);
      markdownInput.focus();
      debouncedRender();
    }
    
    function insertListItem() {
      const start = markdownInput.selectionStart;
      const text = markdownInput.value;
      const listItem = '\\n- ';
      
      markdownInput.value = text.substring(0, start) + listItem + text.substring(start);
      markdownInput.focus();
      markdownInput.setSelectionRange(start + listItem.length, start + listItem.length);
      debouncedRender();
    }
    
    function clearEditor() {
      if (confirm('Clear all content?')) {
        markdownInput.value = '';
        updateCharCount();
        renderPreview();
      }
    }
    
    // Toast
    function showToast(message, type = 'success') {
      const toast = document.getElementById('toast');
      const toastIcon = document.getElementById('toast-icon');
      const toastMessage = document.getElementById('toast-message');
      
      toastIcon.textContent = type === 'success' ? '✓' : '✗';
      toastMessage.textContent = message;
      toast.className = 'toast visible ' + type;
      
      setTimeout(() => {
        toast.classList.remove('visible');
      }, 3000);
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 's') {
          e.preventDefault();
          downloadPdf();
        } else if (e.key === 'b') {
          e.preventDefault();
          insertText('**', '**');
        } else if (e.key === 'i') {
          e.preventDefault();
          insertText('*', '*');
        }
      }
    });
    
    // Initial render
    renderPreview();
  </script>
</body>
</html>`;

// Get document HTML template
const getDocumentHtml = (content) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <style>
${cssContent}
  </style>
</head>
<body>
  <div class="theme-controls">
    <button class="theme-toggle" onclick="toggleTheme()" aria-label="Toggle dark mode">
      <span class="icon-sun">☀️</span>
      <span class="icon-moon">🌙</span>
    </button>
    <div class="color-picker-panel" id="colorPickerPanel">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h4 style="margin: 0;">🎨 Dark Mode Style</h4>
        <button onclick="switchToLight()" style="background: none; border: none; font-size: 18px; cursor: pointer; padding: 4px 8px; border-radius: 4px;" title="Switch to light mode">☀️</button>
      </div>
      <div class="color-presets">
        <button class="color-preset active" data-variant="night-owl" onclick="setDarkVariant('night-owl')">
          <span class="color-swatch" style="background-color: #011627;"></span>
          <span class="color-preset-label">Night Owl</span>
        </button>
        <button class="color-preset" data-variant="pure-dark" onclick="setDarkVariant('pure-dark')">
          <span class="color-swatch" style="background-color: #0f0f0f;"></span>
          <span class="color-preset-label">Pure Dark</span>
        </button>
        <button class="color-preset" data-variant="material-dark" onclick="setDarkVariant('material-dark')">
          <span class="color-swatch" style="background-color: #202124;"></span>
          <span class="color-preset-label">Material Dark</span>
        </button>
        <button class="color-preset" data-variant="custom" onclick="setDarkVariant('custom')">
          <span class="color-swatch" id="customSwatch" style="background-color: #1a1a2e;"></span>
          <span class="color-preset-label">Custom</span>
        </button>
      </div>
      <div class="custom-color-section">
        <div class="custom-color-row">
          <input type="color" class="custom-color-input" id="customColorPicker" value="#1a1a2e" onchange="updateCustomColor(this.value)">
          <input type="text" class="custom-color-hex" id="customColorHex" value="#1a1a2e" placeholder="#000000" onchange="updateCustomColor(this.value)">
        </div>
      </div>
    </div>
  </div>
  
  <article class="markdown-body">
    ${content}
  </article>
  
  <script>
    const darkVariants = { 'night-owl': '#011627', 'pure-dark': '#0f0f0f', 'material-dark': '#202124', 'custom': '#1a1a2e' };
    function getPreferredTheme() { return localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); }
    function getSavedDarkVariant() { return localStorage.getItem('darkVariant') || 'night-owl'; }
    function getSavedCustomColor() { return localStorage.getItem('customDarkColor') || '#1a1a2e'; }
    function setTheme(t) { document.documentElement.setAttribute('data-theme', t); localStorage.setItem('theme', t); document.getElementById('colorPickerPanel').classList.toggle('visible', t === 'dark'); }
    function setDarkVariant(v, k) { document.documentElement.setAttribute('data-dark-variant', v); localStorage.setItem('darkVariant', v); document.querySelectorAll('.color-preset').forEach(b => b.classList.toggle('active', b.dataset.variant === v)); if (v === 'custom') applyCustomColor(getSavedCustomColor()); if (!k && v !== 'custom') setTimeout(() => document.getElementById('colorPickerPanel').classList.remove('visible'), 300); }
    function updateCustomColor(c) { if (!/^#[0-9A-Fa-f]{6}$/.test(c)) { if (/^[0-9A-Fa-f]{6}$/.test(c)) c = '#' + c; else return; } localStorage.setItem('customDarkColor', c); darkVariants['custom'] = c; document.getElementById('customColorPicker').value = c; document.getElementById('customColorHex').value = c; document.getElementById('customSwatch').style.backgroundColor = c; if (document.documentElement.getAttribute('data-dark-variant') === 'custom') applyCustomColor(c); setDarkVariant('custom'); }
    function applyCustomColor(c) { const rgb = hexToRgb(c), d = (rgb.r+rgb.g+rgb.b)/3 < 40; document.documentElement.style.setProperty('--custom-dark-bg', c); document.documentElement.style.setProperty('--custom-dark-text', d ? '#e4e4e4' : '#d6deeb'); document.documentElement.style.setProperty('--custom-dark-border', lightenColor(c, 15)); document.documentElement.style.setProperty('--custom-dark-table', lightenColor(c, 8)); }
    function hexToRgb(h) { const r = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(h); return r ? { r: parseInt(r[1],16), g: parseInt(r[2],16), b: parseInt(r[3],16) } : {r:0,g:0,b:0}; }
    function lightenColor(h, p) { const rgb = hexToRgb(h), a = Math.round(2.55*p); return '#' + [Math.min(255,rgb.r+a),Math.min(255,rgb.g+a),Math.min(255,rgb.b+a)].map(x=>x.toString(16).padStart(2,'0')).join(''); }
    function toggleTheme() { const c = document.documentElement.getAttribute('data-theme')||'light', p = document.getElementById('colorPickerPanel'); if (c==='dark') p.classList.toggle('visible'); else setTheme('dark'); }
    function switchToLight() { setTheme('light'); }
    (function() { const t=getPreferredTheme(), v=getSavedDarkVariant(), c=getSavedCustomColor(); document.getElementById('customColorPicker').value=c; document.getElementById('customColorHex').value=c; document.getElementById('customSwatch').style.backgroundColor=c; darkVariants['custom']=c; if(v==='custom') applyCustomColor(c); document.documentElement.setAttribute('data-theme',t); localStorage.setItem('theme',t); setDarkVariant(v,true); })();
  </script>
</body>
</html>`;

// Parse request body
async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

// Create server
const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Routes
  if (url.pathname === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(webUIHtml);
  }
  else if (url.pathname === '/api/render' && req.method === 'POST') {
    const body = await parseBody(req);
    const htmlContent = marked.parse(body.markdown || '');
    const fullHtml = getDocumentHtml(htmlContent);
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(fullHtml);
  }
  else if (url.pathname === '/api/pdf' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const htmlContent = marked.parse(body.markdown || '');
      const fullHtml = getDocumentHtml(htmlContent);
      const filename = body.filename || 'document';
      
      // Ensure temp directory exists
      const tempDir = join(__dirname, 'temp');
      if (!existsSync(tempDir)) {
        mkdirSync(tempDir, { recursive: true });
      }
      
      // Generate PDF
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        ...(process.env.PUPPETEER_EXECUTABLE_PATH && {
          executablePath: process.env.PUPPETEER_EXECUTABLE_PATH
        })
      });
      
      const page = await browser.newPage();
      await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '40px', right: '40px', bottom: '40px', left: '40px' },
        displayHeaderFooter: true,
        headerTemplate: `<div style="font-size:10px;width:100%;text-align:center;color:#6a737d;padding:10px;"><span style="font-weight:bold;">${filename}</span></div>`,
        footerTemplate: `<div style="font-size:10px;width:100%;display:flex;justify-content:space-between;color:#6a737d;padding:10px 40px;"><span>Generated with md2pdf</span><span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>`
      });
      
      await browser.close();
      
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}.pdf"`,
        'Content-Length': pdfBuffer.length
      });
      res.end(pdfBuffer);
    } catch (error) {
      console.error('PDF generation error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'PDF generation failed' }));
    }
  }
  else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║           md2pdf Web UI Server                  ║
╚════════════════════════════════════════════════╝

🌐 Server running at: http://localhost:${PORT}

Features:
  • Live markdown preview
  • Night Owl syntax highlighting
  • Dark mode with theme presets
  • Download as HTML or PDF
  • Drag & drop file support

Press Ctrl+C to stop the server
`);
});
