# Project Scope

## Overview

**md2pdf** is an E-Library system with markdown-to-PDF/HTML conversion, featuring a web-based editor interface, folder-based book organization, and multi-provider storage support (Supabase, local filesystem).

---

## In Scope

### Core Functionality
- [x] Markdown to HTML conversion with GitHub-Flavored Markdown (GFM) support
- [x] Markdown to PDF conversion with customizable formatting
- [x] Live preview with real-time rendering
- [x] Syntax highlighting for code blocks (Night Owl theme)
- [x] Light/Dark mode support with multiple dark variants

### Web Interface
- [x] Browser-based markdown editor
- [x] Split-pane layout (editor + preview)
- [x] Fullscreen preview mode
- [x] Tab system for managing multiple documents
- [x] Drag & drop file loading
- [x] Formatting toolbar (bold, italic, code, links, lists)
- [x] Keyboard shortcuts
- [x] Character count display
- [x] Status indicators

### Export Options
- [x] Download as PDF with headers/footers
- [x] Download as standalone HTML with embedded styles
- [x] Theme preservation in exports

### CLI Tool
- [x] Command-line markdown conversion
- [x] Batch processing support

### Deployment
- [x] Docker containerization
- [x] Health check endpoint
- [x] Configurable port via environment/args

### E-Library System (v2.0)
- [x] Folder/topic hierarchy for organizing books
- [x] Book metadata management
- [x] REST API for library operations
- [x] Multi-provider adapter pattern
- [x] Supabase adapter (PostgreSQL + Storage)
- [x] Local adapter (JSON + Filesystem)
- [x] Configuration via environment variables
- [x] File upload/download support

---

## Out of Scope

The following features are **not planned** for this project:

### Collaboration & Cloud
- [ ] Real-time collaborative editing
- [ ] Document sharing via links

### Advanced Editor Features
- [ ] WYSIWYG editing mode
- [ ] Spell checking
- [ ] Auto-save to server
- [ ] Version history/undo stack
- [ ] Find and replace
- [ ] Line numbers in editor
- [ ] Vim/Emacs keybindings

### Extended Format Support
- [ ] Import from Word/DOCX
- [ ] Import from PDF
- [ ] Export to Word/DOCX
- [ ] Export to LaTeX
- [ ] EPUB generation
- [ ] Presentation mode (slides)

### Advanced PDF Features
- [ ] Custom fonts (beyond web-safe)
- [ ] Table of contents generation
- [ ] Page numbering customization
- [ ] Watermarks
- [ ] Password-protected PDFs
- [ ] Digital signatures

---

## Future Considerations

These items may be considered for future versions:

### Planned for Next Release
- [ ] User authentication/accounts (auth adapter ready)
- [ ] Multi-user support with private libraries
- [ ] Row-level security for user data

### Under Consideration
- Custom CSS injection for previews
- Template system for PDF output
- Print-optimized styles
- Mobile-responsive editor improvements
- Offline PWA support
- Plugin/extension system
- Firebase adapter
- MongoDB adapter
- S3/R2 storage adapter

---

## Technical Constraints

- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **Node.js Version**: 18.x or higher
- **PDF Engine**: Puppeteer with Chromium
- **Maximum Input Size**: 1MB per document
- **Tab Storage**: localStorage (browser limit ~5-10MB)

---

## Design Principles

1. **Simplicity First**: Keep the interface clean and intuitive
2. **Offline Capable**: Core features work without internet (except PDF generation in Docker)
3. **Privacy**: All processing is local; no data sent to external servers
4. **Performance**: Fast rendering with debounced updates
5. **Consistency**: Same output in preview and exported files
