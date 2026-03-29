import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';
import hljs from 'highlight.js';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure marked with highlight.js for syntax highlighting
marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value;
      } catch (err) {
        console.error('Highlight error:', err);
      }
    }
    // Try auto-detection
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

// Custom renderer for Night Owl italic styles
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

// Read the CSS file
const cssContent = readFileSync(join(__dirname, 'night-owl-theme.css'), 'utf-8');

// HTML template
const getHtmlTemplate = (title, content) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
${cssContent}
  </style>
</head>
<body>
  <!-- Theme Controls -->
  <div class="theme-controls">
    <button class="theme-toggle" onclick="toggleTheme()" aria-label="Toggle dark mode" title="Toggle dark/light mode">
      <span class="icon-sun">☀️</span>
      <span class="icon-moon">🌙</span>
    </button>
    
    <!-- Color Picker Panel (only visible in dark mode) -->
    <div class="color-picker-panel" id="colorPickerPanel">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h4 style="margin: 0;">🎨 Dark Mode Style</h4>
        <button onclick="switchToLight()" style="background: none; border: none; font-size: 18px; cursor: pointer; padding: 4px 8px; border-radius: 4px; transition: background 0.2s;" title="Switch to light mode" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='none'">☀️</button>
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
    // Dark mode variants
    const darkVariants = {
      'night-owl': '#011627',
      'pure-dark': '#0f0f0f',
      'material-dark': '#202124',
      'custom': '#1a1a2e'
    };
    
    // Get saved preferences
    function getPreferredTheme() {
      const saved = localStorage.getItem('theme');
      if (saved) return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    function getSavedDarkVariant() {
      return localStorage.getItem('darkVariant') || 'night-owl';
    }
    
    function getSavedCustomColor() {
      return localStorage.getItem('customDarkColor') || '#1a1a2e';
    }
    
    // Apply theme
    function setTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      
      // Show/hide color picker panel
      const panel = document.getElementById('colorPickerPanel');
      if (theme === 'dark') {
        panel.classList.add('visible');
      } else {
        panel.classList.remove('visible');
      }
    }
    
    // Set dark mode variant
    function setDarkVariant(variant, keepOpen = false) {
      document.documentElement.setAttribute('data-dark-variant', variant);
      localStorage.setItem('darkVariant', variant);
      
      // Update active state
      document.querySelectorAll('.color-preset').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.variant === variant);
      });
      
      // If custom, apply the custom color
      if (variant === 'custom') {
        applyCustomColor(getSavedCustomColor());
      }
      
      // Close panel after selecting a preset (unless it's custom or keepOpen is true)
      if (!keepOpen && variant !== 'custom') {
        setTimeout(() => {
          document.getElementById('colorPickerPanel').classList.remove('visible');
        }, 300);
      }
    }
    
    // Toggle color picker panel
    function toggleColorPanel() {
      const panel = document.getElementById('colorPickerPanel');
      panel.classList.toggle('visible');
    }
    
    // Update custom color
    function updateCustomColor(color) {
      // Validate hex color
      if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
        if (/^[0-9A-Fa-f]{6}$/.test(color)) {
          color = '#' + color;
        } else {
          return;
        }
      }
      
      localStorage.setItem('customDarkColor', color);
      darkVariants['custom'] = color;
      
      // Update UI
      document.getElementById('customColorPicker').value = color;
      document.getElementById('customColorHex').value = color;
      document.getElementById('customSwatch').style.backgroundColor = color;
      
      // Apply if custom is selected
      if (document.documentElement.getAttribute('data-dark-variant') === 'custom') {
        applyCustomColor(color);
      }
      
      // Auto-select custom variant
      setDarkVariant('custom');
    }
    
    // Apply custom color to CSS variables
    function applyCustomColor(color) {
      const rgb = hexToRgb(color);
      const isVeryDark = (rgb.r + rgb.g + rgb.b) / 3 < 40;
      
      document.documentElement.style.setProperty('--custom-dark-bg', color);
      document.documentElement.style.setProperty('--custom-dark-text', isVeryDark ? '#e4e4e4' : '#d6deeb');
      document.documentElement.style.setProperty('--custom-dark-border', lightenColor(color, 15));
      document.documentElement.style.setProperty('--custom-dark-table', lightenColor(color, 8));
    }
    
    // Helper: hex to rgb
    function hexToRgb(hex) {
      const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 0, g: 0, b: 0 };
    }
    
    // Helper: lighten color
    function lightenColor(hex, percent) {
      const rgb = hexToRgb(hex);
      const amt = Math.round(2.55 * percent);
      const r = Math.min(255, rgb.r + amt);
      const g = Math.min(255, rgb.g + amt);
      const b = Math.min(255, rgb.b + amt);
      return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
    }
    
    // Toggle theme
    function toggleTheme() {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const panel = document.getElementById('colorPickerPanel');
      
      if (current === 'dark') {
        // If already in dark mode, toggle panel visibility
        if (panel.classList.contains('visible')) {
          panel.classList.remove('visible');
        } else {
          panel.classList.add('visible');
        }
      } else {
        // Switch to dark mode and show panel
        setTheme('dark');
      }
    }
    
    // Switch to light mode (separate function for clarity)
    function switchToLight() {
      setTheme('light');
    }
    
    // Initialize on load
    (function init() {
      const theme = getPreferredTheme();
      const darkVariant = getSavedDarkVariant();
      const customColor = getSavedCustomColor();
      
      // Set custom color in UI
      document.getElementById('customColorPicker').value = customColor;
      document.getElementById('customColorHex').value = customColor;
      document.getElementById('customSwatch').style.backgroundColor = customColor;
      darkVariants['custom'] = customColor;
      
      // Apply custom color CSS vars if needed
      if (darkVariant === 'custom') {
        applyCustomColor(customColor);
      }
      
      // Apply theme without showing panel
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      
      // Apply dark variant without auto-close
      setDarkVariant(darkVariant, true);
    })();
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    });
  </script>
</body>
</html>`;

// Convert markdown to PDF
async function convertMarkdownToPdf(mdFilePath, outputDir) {
  const filename = basename(mdFilePath, '.md');
  console.log(`\n📄 Converting: ${filename}.md`);
  
  // Read markdown content
  const mdContent = readFileSync(mdFilePath, 'utf-8');
  
  // Convert to HTML
  const htmlContent = marked.parse(mdContent);
  
  // Create full HTML
  const fullHtml = getHtmlTemplate(filename, htmlContent);
  
  // Save HTML file (optional, for debugging)
  const htmlPath = join(outputDir, `${filename}.html`);
  writeFileSync(htmlPath, fullHtml);
  console.log(`   ✅ HTML saved: ${filename}.html`);
  
  // Generate PDF using Puppeteer
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
  
  const pdfPath = join(outputDir, `${filename}.pdf`);
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '40px',
      right: '40px', 
      bottom: '40px',
      left: '40px'
    },
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="font-size: 10px; width: 100%; text-align: center; color: #6a737d; padding: 10px;">
        <span style="font-weight: bold;">${filename}</span>
      </div>
    `,
    footerTemplate: `
      <div style="font-size: 10px; width: 100%; display: flex; justify-content: space-between; color: #6a737d; padding: 10px 40px;">
        <span>React Native Error Handling Guide</span>
        <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
      </div>
    `
  });
  
  console.log(`   ✅ PDF saved: ${filename}.pdf`);
  
  await browser.close();
  return pdfPath;
}

// Main function
async function main() {
  console.log('🚀 Starting Markdown to PDF Conversion');
  console.log('   Theme: Night Owl (with italics)');
  console.log('═'.repeat(50));
  
  const parentDir = join(__dirname, '..');
  const outputDir = __dirname;
  
  // Find all error handling markdown files
  const mdFiles = readdirSync(parentDir)
    .filter(file => file.endsWith('.md'))
    .filter(file => 
      file.includes('ERROR_HANDLING') || 
      file.includes('GLOBAL_ERROR') ||
      file.includes('PRODUCTION_APPS')
    )
    .map(file => join(parentDir, file));
  
  console.log(`\n📚 Found ${mdFiles.length} markdown files to convert:\n`);
  mdFiles.forEach(f => console.log(`   - ${basename(f)}`));
  
  const results = [];
  
  for (const mdFile of mdFiles) {
    try {
      const pdfPath = await convertMarkdownToPdf(mdFile, outputDir);
      results.push({ file: basename(mdFile), status: 'success', path: pdfPath });
    } catch (error) {
      console.error(`   ❌ Error converting ${basename(mdFile)}:`, error.message);
      results.push({ file: basename(mdFile), status: 'error', error: error.message });
    }
  }
  
  console.log('\n' + '═'.repeat(50));
  console.log('📊 Conversion Summary:\n');
  
  const successful = results.filter(r => r.status === 'success');
  const failed = results.filter(r => r.status === 'error');
  
  console.log(`   ✅ Successful: ${successful.length}`);
  console.log(`   ❌ Failed: ${failed.length}`);
  
  if (successful.length > 0) {
    console.log('\n📁 Generated PDFs:');
    successful.forEach(r => console.log(`   - ${r.file.replace('.md', '.pdf')}`));
  }
  
  if (failed.length > 0) {
    console.log('\n⚠️  Failed conversions:');
    failed.forEach(r => console.log(`   - ${r.file}: ${r.error}`));
  }
  
  console.log('\n✨ Done!');
}

main().catch(console.error);
