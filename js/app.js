/**
 * app.js — Shared utilities: theme, storage, navigation, toast
 */

// ── Theme ──────────────────────────────────────────────────────────────────
const THEME_KEY = 'aier_theme';

export function initTheme() {
  let theme = 'dark';
  try { theme = localStorage.getItem(THEME_KEY) || 'dark'; } catch {}
  applyTheme(theme);
  return theme;
}

export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem(THEME_KEY, theme); } catch {}
}

export function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  return next;
}

// ── Storage ────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'aier_progress';
// shortcut: single key for all progress; split if schema grows beyond ~500 entries

export function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveProgress(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('localStorage write failed:', e);
    showToast('Could not save progress (storage full?)');
  }
}

export function getProgress(section, key) {
  const all = loadProgress();
  return (all[section] || {})[key] ?? null;
}

export function setProgress(section, key, value) {
  const all = loadProgress();
  if (!all[section]) all[section] = {};
  all[section][key] = value;
  saveProgress(all);
}

export function exportProgress() {
  const data = localStorage.getItem(STORAGE_KEY) || '{}';
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `aier-progress-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importProgress(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        saveProgress(data);
        resolve();
      } catch {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsText(file);
  });
}

// ── Toast ──────────────────────────────────────────────────────────────────
let toastEl = null;
let toastTimer = null;

export function showToast(msg, duration = 2500) {
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.className = 'toast';
    toastEl.setAttribute('role', 'status');
    toastEl.setAttribute('aria-live', 'polite');
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), duration);
}

// ── Navigation ─────────────────────────────────────────────────────────────
export function initNav(activePage) {
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const next = toggleTheme();
      themeBtn.setAttribute('aria-label', `Switch to ${next === 'dark' ? 'light' : 'dark'} mode`);
      updateThemeIcon(themeBtn, next);
    });
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    updateThemeIcon(themeBtn, current);
  }

  // Mark active nav link
  if (activePage) {
    document.querySelectorAll('.nav-links a').forEach(a => {
      if (a.dataset.page === activePage) a.classList.add('active');
    });
  }
}

function updateThemeIcon(btn, theme) {
  btn.textContent = theme === 'dark' ? '☀️' : '🌙';
  btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
}

// ── Data fetching ──────────────────────────────────────────────────────────
const cache = {};

export async function fetchData(path) {
  if (cache[path]) return cache[path];

  // 1. Check preloaded bundle first (instant, works on file:// and offline)
  const bundleKey = path.replace(/^[./]*data\//, '').replace(/\.json$/, '');
  if (typeof window !== 'undefined' && window.AIER_DATA && window.AIER_DATA[bundleKey]) {
    cache[path] = window.AIER_DATA[bundleKey];
    return cache[path];
  }

  // 2. Fetch over HTTP if not preloaded
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
    cache[path] = await res.json();
    return cache[path];
  } catch (err) {
    // 3. Fallback to bundle if fetch failed (e.g. CORS on file://)
    if (typeof window !== 'undefined' && window.AIER_DATA && window.AIER_DATA[bundleKey]) {
      cache[path] = window.AIER_DATA[bundleKey];
      return cache[path];
    }
    throw err;
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────
export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function formatWeekLabel(week) {
  return `W${week}`;
}

export function pluralise(n, word) {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

// ── Learning Hub Helpers ───────────────────────────────────────────────────
export function getSkillStatus(skillId) {
  const p = loadProgress();
  const s = (p.skillProgress || {})[skillId] || {};
  return s.status || 'not-started'; // 'not-started' | 'learning' | 'practising' | 'proven'
}

export function setSkillStatus(skillId, status) {
  const p = loadProgress();
  if (!p.skillProgress) p.skillProgress = {};
  if (!p.skillProgress[skillId]) p.skillProgress[skillId] = {};
  p.skillProgress[skillId].status = status;
  if (status === 'proven' && !p.skillProgress[skillId].provenAt) {
    p.skillProgress[skillId].provenAt = new Date().toISOString();
  }
  saveProgress(p);
}

export function getSkillNotes(skillId) {
  const p = loadProgress();
  return (p.skillNotes || {})[skillId] || '';
}

export function setSkillNotes(skillId, text) {
  const p = loadProgress();
  if (!p.skillNotes) p.skillNotes = {};
  p.skillNotes[skillId] = text;
  saveProgress(p);
}

export function getSpacedRepetitionReminders() {
  const p = loadProgress();
  const prog = p.skillProgress || {};
  const reminders = [];
  const now = new Date();

  for (const [skillId, data] of Object.entries(prog)) {
    if (data.status === 'proven' && data.provenAt) {
      const provenDate = new Date(data.provenAt);
      const diffDays = Math.floor((now - provenDate) / (1000 * 60 * 60 * 24));
      
      // Intervals: 1 day, 7 days, 30 days
      if (diffDays === 1 || diffDays === 7 || diffDays === 30) {
        reminders.push({ skillId, interval: diffDays, provenDate });
      }
    }
  }
  return reminders;
}

