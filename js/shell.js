/**
 * shell.js — Persistent Sidebar, Topbar, Command Palette (Ctrl+K), and Shortcut Engine
 */
import {
  initTheme, toggleTheme, loadProgress, escapeHtml, showToast, fetchData
} from './app.js';

let commandPaletteOpen = false;
let allSearchableItems = null;

export function initAppShell(activePage = '') {
  initTheme();
  renderAppShell(activePage);
  setupCommandPalette();
  setupKeyboardShortcuts();
}

function renderAppShell(activePage) {
  // Check if app shell already exists or if we need to wrap the page
  const mainContentEl = document.querySelector('main');
  const existingNav = document.querySelector('nav.nav');
  if (existingNav) existingNav.remove(); // Remove legacy navbar

  // Insert SVG icon sprite if not present
  if (!document.getElementById('icon-sprite-container')) {
    fetch('styles/icons.svg')
      .then(r => r.text())
      .then(svgText => {
        const div = document.createElement('div');
        div.id = 'icon-sprite-container';
        div.style.display = 'none';
        div.innerHTML = svgText;
        document.body.prepend(div);
      })
      .catch(() => {});
  }

  // Calculate live progress metrics for topbar & sidebar
  const p = loadProgress();
  const tasks = p.tasks || {};
  const completedTaskCount = Object.values(tasks).filter(Boolean).length;
  const pct = Math.round((completedTaskCount / 112) * 100);

  // Wrap body in .app-layout
  const pageContainer = document.querySelector('.container.page') || mainContentEl;

  const sidebarHtml = `
    <aside class="sidebar" id="app-sidebar" aria-label="Main Navigation">
      <div class="sidebar-header">
        <a href="index.html" class="sidebar-brand">
          <div class="logo-badge">AI</div>
          <span>AI Engineer Hub</span>
        </a>
        <button id="sidebar-close-mobile" class="btn-icon btn-xs" style="display:none;" aria-label="Close sidebar">
          <svg class="icon icon-sm"><use href="#icon-x"></use></svg>
        </button>
      </div>

      <div class="sidebar-content">
        <!-- Section: Overview -->
        <div class="sidebar-group">
          <div class="sidebar-group-title">Overview</div>
          <a href="index.html" class="sidebar-link ${activePage === 'home' ? 'active' : ''}" data-page="home">
            <svg class="icon"><use href="#icon-home"></use></svg>
            <span>Dashboard</span>
          </a>
          <a href="today.html" class="sidebar-link ${activePage === 'today' ? 'active' : ''}" data-page="today">
            <svg class="icon"><use href="#icon-calendar"></use></svg>
            <span>Today's Plan</span>
          </a>
          <a href="roadmap.html" class="sidebar-link ${activePage === 'roadmap' ? 'active' : ''}" data-page="roadmap">
            <svg class="icon"><use href="#icon-map"></use></svg>
            <span>16-Week Roadmap</span>
            <span class="badge-counter">${pct}%</span>
          </a>
        </div>

        <!-- Section: Curriculum -->
        <div class="sidebar-group">
          <div class="sidebar-group-title">Curriculum</div>
          <a href="skills.html" class="sidebar-link ${activePage === 'skills' ? 'active' : ''}" data-page="skills">
            <svg class="icon"><use href="#icon-book"></use></svg>
            <span>Skills Catalogue</span>
            <span class="badge-counter">38</span>
          </a>
          <a href="videos.html" class="sidebar-link ${activePage === 'videos' ? 'active' : ''}" data-page="videos">
            <svg class="icon"><use href="#icon-video"></use></svg>
            <span>Video Hub</span>
          </a>
          <a href="projects.html" class="sidebar-link ${activePage === 'projects' ? 'active' : ''}" data-page="projects">
            <svg class="icon"><use href="#icon-briefcase"></use></svg>
            <span>Flagship Project</span>
          </a>
        </div>

        <!-- Section: Practice & Prep -->
        <div class="sidebar-group">
          <div class="sidebar-group-title">Practice & Prep</div>
          <a href="practice.html" class="sidebar-link ${activePage === 'practice' ? 'active' : ''}" data-page="practice">
            <svg class="icon"><use href="#icon-terminal"></use></svg>
            <span>Practice & Flashcards</span>
          </a>
          <a href="prompts.html" class="sidebar-link ${activePage === 'prompts' ? 'active' : ''}" data-page="prompts">
            <svg class="icon"><use href="#icon-terminal"></use></svg>
            <span>Prompt Library</span>
          </a>
        </div>

        <!-- Section: Reference & Support -->
        <div class="sidebar-group">
          <div class="sidebar-group-title">Reference</div>
          <a href="resources.html" class="sidebar-link ${activePage === 'resources' ? 'active' : ''}" data-page="resources">
            <svg class="icon"><use href="#icon-layers"></use></svg>
            <span>Resources</span>
          </a>
          <a href="channels.html" class="sidebar-link ${activePage === 'channels' ? 'active' : ''}" data-page="channels">
            <svg class="icon"><use href="#icon-tv"></use></svg>
            <span>Channels</span>
          </a>
          <a href="stuck.html" class="sidebar-link ${activePage === 'stuck' ? 'active' : ''}" data-page="stuck">
            <svg class="icon"><use href="#icon-help"></use></svg>
            <span>Stuck? (Triage)</span>
          </a>
          <a href="settings.html" class="sidebar-link ${activePage === 'settings' ? 'active' : ''}" data-page="settings">
            <svg class="icon"><use href="#icon-settings"></use></svg>
            <span>Settings</span>
          </a>
        </div>
      </div>

      <div class="sidebar-footer">
        <span>16 Weeks · 2h/day</span>
        <span class="badge badge-neutral" style="font-size:10px;">Offline Ready</span>
      </div>
    </aside>
  `;

  const breadcrumbTitle = formatBreadcrumbTitle(activePage);

  const topbarHtml = `
    <header class="topbar">
      <div class="topbar-left">
        <button id="sidebar-toggle-btn" class="btn-icon btn-sm" aria-label="Toggle Navigation">
          <svg class="icon icon-sm"><use href="#icon-menu"></use></svg>
        </button>
        <nav class="breadcrumbs" aria-label="Breadcrumb">
          <a href="index.html">AI Engineer</a>
          <span class="separator">/</span>
          <span class="current">${escapeHtml(breadcrumbTitle)}</span>
        </nav>
      </div>

      <div class="topbar-right">
        <!-- Command Palette Trigger Button -->
        <button id="cmd-palette-btn" class="search-trigger" aria-label="Open command palette">
          <svg class="icon icon-sm"><use href="#icon-search"></use></svg>
          <span>Search or jump to…</span>
          <span class="kbd-shortcut">Ctrl K</span>
        </button>

        <!-- Keyboard Help -->
        <button id="shortcut-help-btn" class="btn-icon" aria-label="Keyboard Shortcuts" title="Shortcuts (?)">
          <span style="font-family:var(--font-mono); font-size:12px; font-weight:600;">?</span>
        </button>

        <!-- Theme Switcher -->
        <button id="shell-theme-toggle" class="btn-icon" aria-label="Toggle theme" title="Toggle theme">
          <svg class="icon icon-sm"><use href="#icon-moon"></use></svg>
        </button>
      </div>
    </header>
  `;

  // Inject into document
  const layout = document.createElement('div');
  layout.className = 'app-layout';

  const appMain = document.createElement('div');
  appMain.className = 'app-main';
  appMain.innerHTML = topbarHtml;

  if (pageContainer) {
    pageContainer.classList.add('content-area');
    appMain.appendChild(pageContainer);
  }

  layout.innerHTML = sidebarHtml;
  layout.appendChild(appMain);

  document.body.appendChild(layout);

  // Setup sidebar toggling
  const sidebarEl = document.getElementById('app-sidebar');
  const toggleBtn = document.getElementById('sidebar-toggle-btn');
  const closeBtn = document.getElementById('sidebar-close-mobile');

  toggleBtn.addEventListener('click', () => {
    sidebarEl.classList.toggle('mobile-open');
  });
  if (closeBtn) {
    closeBtn.addEventListener('click', () => sidebarEl.classList.remove('mobile-open'));
  }

  // Setup theme toggle icon & handler
  const themeToggle = document.getElementById('shell-theme-toggle');
  themeToggle.addEventListener('click', () => {
    const next = toggleTheme();
    updateThemeIcon(themeToggle, next);
  });
  updateThemeIcon(themeToggle, document.documentElement.getAttribute('data-theme') || 'light');
}

function updateThemeIcon(btn, theme) {
  const iconUse = btn.querySelector('use');
  if (iconUse) {
    iconUse.setAttribute('href', theme === 'dark' ? '#icon-sun' : '#icon-moon');
  }
}

function formatBreadcrumbTitle(page) {
  const map = {
    'home': 'Dashboard',
    'today': "Today's Schedule",
    'skills': 'Skills Catalogue',
    'skill': 'Skill Guide',
    'roadmap': '16-Week Roadmap',
    'videos': 'Video Hub',
    'projects': 'Flagship Project',
    'competency': '13 Competencies',
    'interview': 'Interview Bank',
    'prompts': 'Prompt Library',
    'resources': 'Resources Library',
    'channels': 'Authoritative Channels',
    'stuck': 'Triage Ladder',
    'review': 'Weekly Review',
    'settings': 'Settings'
  };
  return map[page] || 'Overview';
}

/* ============================================================
   Command Palette (Ctrl+K) Implementation
   ============================================================ */
function setupCommandPalette() {
  const modal = document.createElement('div');
  modal.id = 'cmd-palette-modal';
  modal.className = 'modal-backdrop';
  modal.innerHTML = `
    <div class="command-palette-dialog" role="dialog" aria-modal="true" aria-label="Command Palette">
      <div class="command-palette-input">
        <svg class="icon icon-sm"><use href="#icon-search"></use></svg>
        <input type="text" id="cmd-input" placeholder="Type a command, skill, video, or topic…" autocomplete="off" />
        <button id="cmd-close" class="btn-icon btn-xs" aria-label="Close">
          <svg class="icon icon-sm"><use href="#icon-x"></use></svg>
        </button>
      </div>
      <div class="command-palette-results" id="cmd-results">
        <div class="text-xs text-muted" style="padding:var(--space-3);">Start typing to search across all skills, videos, weeks, and tools…</div>
      </div>
      <div class="command-palette-footer">
        <span>Navigation: <kbd class="kbd-shortcut">↑</kbd> <kbd class="kbd-shortcut">↓</kbd> to move, <kbd class="kbd-shortcut">Enter</kbd> to select</span>
        <span><kbd class="kbd-shortcut">Esc</kbd> to close</span>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const input = modal.querySelector('#cmd-input');
  const resultsContainer = modal.querySelector('#cmd-results');
  const closeBtn = modal.querySelector('#cmd-close');

  function openPalette() {
    modal.classList.add('open');
    input.value = '';
    input.focus();
    renderCommandResults('');
    commandPaletteOpen = true;
  }

  function closePalette() {
    modal.classList.remove('open');
    commandPaletteOpen = false;
  }

  document.getElementById('cmd-palette-btn').addEventListener('click', openPalette);
  closeBtn.addEventListener('click', closePalette);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closePalette();
  });

  input.addEventListener('input', () => {
    renderCommandResults(input.value);
  });

  // Global keydown handler
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (commandPaletteOpen) closePalette();
      else openPalette();
    }
    if (e.key === 'Escape' && commandPaletteOpen) {
      closePalette();
    }
  });
}

async function getSearchableItems() {
  if (allSearchableItems) return allSearchableItems;

  const items = [
    { title: 'Dashboard', url: 'index.html', type: 'page', desc: 'Home & Overall Progress' },
    { title: "Today's Schedule & Timer", url: 'today.html', type: 'page', desc: 'Active 2-hour daily routine' },
    { title: '16-Week Roadmap', url: 'roadmap.html', type: 'page', desc: 'Day-by-day curriculum' },
    { title: 'Skills Catalogue (38 Skills)', url: 'skills.html', type: 'page', desc: 'Detailed skill guides' },
    { title: 'Video Hub (190 Videos)', url: 'videos.html', type: 'page', desc: 'Categorized video masterclasses' },
    { title: 'Flagship Project', url: 'projects.html', type: 'page', desc: 'Personal AI Engineering Assistant' },
    { title: 'Practice & Flashcards Studio', url: 'practice.html', type: 'page', desc: 'Active recall & spaced repetition review' },
    { title: 'Prompt Library', url: 'prompts.html', type: 'page', desc: '8 production-grade prompt templates' },
    { title: 'Authoritative Channels', url: 'channels.html', type: 'page', desc: 'Curated technical creators' },
    { title: 'Settings', url: 'settings.html', type: 'page', desc: 'Backup, start date, theme' },
    { title: 'Stuck? Escalation Ladder', url: 'stuck.html', type: 'page', desc: '5-step debugging procedure' }
  ];

  try {
    const [skills, prompts] = await Promise.all([
      fetchData('data/skills.json'),
      fetchData('data/prompts.json')
    ]);

    skills.forEach(s => {
      items.push({
        title: s.title,
        url: `skill.html?id=${encodeURIComponent(s.id)}`,
        type: 'skill',
        desc: `Month ${s.month} · Week ${s.weeks.join(', ')}`
      });
    });

    prompts.forEach(p => {
      items.push({
        title: p.name,
        url: `prompts.html#prompt-${p.id}`,
        type: 'prompt',
        desc: p.useCase
      });
    });
  } catch {}

  allSearchableItems = items;
  return items;
}

async function renderCommandResults(query) {
  const container = document.getElementById('cmd-results');
  const items = await getSearchableItems();
  const q = query.toLowerCase().trim();

  const filtered = q
    ? items.filter(it => it.title.toLowerCase().includes(q) || (it.desc || '').toLowerCase().includes(q)).slice(0, 8)
    : items.slice(0, 6);

  if (filtered.length === 0) {
    container.innerHTML = `<div class="text-xs text-muted" style="padding:var(--space-3);">No matching results found for "${escapeHtml(query)}"</div>`;
    return;
  }

  container.innerHTML = filtered.map((it, idx) => `
    <a href="${it.url}" class="command-item ${idx === 0 ? 'selected' : ''}">
      <svg class="icon icon-sm"><use href="#icon-chevron-right"></use></svg>
      <div>
        <div class="fw-600">${escapeHtml(it.title)}</div>
        ${it.desc ? `<div class="text-xs text-muted">${escapeHtml(it.desc)}</div>` : ''}
      </div>
      <span class="type-tag">${it.type}</span>
    </a>
  `).join('');
}

/* ============================================================
   Keyboard Shortcuts Help Overlay (?)
   ============================================================ */
function setupKeyboardShortcuts() {
  const helpBtn = document.getElementById('shortcut-help-btn');
  if (!helpBtn) return;

  helpBtn.addEventListener('click', () => {
    alert(`Shortcuts Cheat Sheet:\n\nCtrl/Cmd + K : Open Command Palette\nT : Jump to Today's Plan\nS : Jump to Skills Catalogue\nD : Jump to Dashboard\n? : Show this help`);
  });

  document.addEventListener('keydown', (e) => {
    // Only trigger if not typing in an input
    if (['input', 'textarea', 'select'].includes(document.activeElement.tagName.toLowerCase())) return;

    if (e.key === '?') {
      helpBtn.click();
    } else if (e.key.toLowerCase() === 't') {
      window.location.href = 'today.html';
    } else if (e.key.toLowerCase() === 's') {
      window.location.href = 'skills.html';
    } else if (e.key.toLowerCase() === 'd') {
      window.location.href = 'index.html';
    }
  });
}

// Register service worker for offline functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
