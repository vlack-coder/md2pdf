# Changelog

All notable changes to the md2pdf project will be documented in this file.

## [1.1.0] - 2026-04-25

### Added
- **Fullscreen Preview Mode**: Toggle fullscreen view of the preview panel by clicking the ⛶ button. Press Escape to exit fullscreen.
- **Tab System**: Save markdown documents as tabs for easy switching between multiple documents.
  - Tabs persist across browser sessions using localStorage
  - Auto-save feature updates tabs as you type
  - Tab titles are automatically extracted from the first heading
  - Close, switch, and create new tabs seamlessly
- **Dark Mode Color Picker**: Dropdown menu to choose from preset dark mode themes (Night Owl, Pure Dark, Material Dark) or set a custom background color for the preview.
  - Custom color picker with hex input support
  - Color preferences persist across sessions
  - Preview button shows current theme variant name

### Changed
- Header now includes "Save Tab" button for quick tab creation
- Tab bar appears below header when tabs are saved

## [1.0.0] - 2026-04-24

### Initial Release
- **Web UI Server**: Full-featured web interface for markdown editing and conversion
- **Live Preview**: Real-time markdown rendering with syntax highlighting
- **Night Owl Theme**: Beautiful code syntax highlighting with Night Owl color scheme
- **Dark Mode Support**: Toggle between light and dark themes in preview
- **PDF Export**: Generate PDFs with custom headers and footers using Puppeteer
- **HTML Export**: Download rendered markdown as standalone HTML files
- **Drag & Drop**: Drop .md files directly into the editor
- **Markdown Toolbar**: Quick formatting buttons for bold, italic, code blocks, links, and lists
- **Keyboard Shortcuts**: 
  - Ctrl/Cmd + S: Download PDF
  - Ctrl/Cmd + B: Bold
  - Ctrl/Cmd + I: Italic
- **CLI Tool**: Command-line interface (`convert-to-pdf.mjs`) for batch conversions
- **Shared Browser Instance**: Optimized PDF generation with reusable Puppeteer instance
- **Docker Support**: Containerized deployment with Dockerfile
- **Health Check Endpoint**: `/health` endpoint for monitoring
- **CORS Support**: Cross-origin requests enabled for API endpoints
- **Input Validation**: File size limits and filename sanitization
