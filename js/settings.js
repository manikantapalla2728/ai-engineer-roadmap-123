/**
 * settings.js — Study schedule configuration, theme preferences,
 * storage usage stats, export/import, and danger zone reset.
 */

import { loadProgress, saveProgress, exportProgress, importProgress, showToast, applyTheme } from './app.js';
import { initAppShell } from './shell.js';

initAppShell('settings');

document.addEventListener('DOMContentLoaded', () => {
  initScheduleSettings();
  initThemeButtons();
  initStorageManager();
});

function initScheduleSettings() {
  const startDateInput = document.getElementById('settings-start-date');
  const dailyHoursInput = document.getElementById('settings-daily-hours');
  const saveBtn = document.getElementById('save-schedule-settings');

  const p = loadProgress();

  if (startDateInput) {
    startDateInput.value = p.studyStartDate || '2026-10-12';
  }
  if (dailyHoursInput) {
    dailyHoursInput.value = p.dailyHoursTarget || 2;
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const updated = loadProgress();
      if (startDateInput && startDateInput.value) {
        updated.studyStartDate = startDateInput.value;
      }
      if (dailyHoursInput && dailyHoursInput.value) {
        updated.dailyHoursTarget = Math.max(1, Math.min(8, parseInt(dailyHoursInput.value, 10) || 2));
      }
      saveProgress(updated);
      showToast('Schedule settings saved');
    });
  }
}

function initThemeButtons() {
  const themeBtns = document.querySelectorAll('.theme-choice-btn');
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';

  themeBtns.forEach(btn => {
    if (btn.dataset.theme === currentTheme) {
      btn.classList.add('btn-primary');
      btn.classList.remove('btn-secondary');
    }

    btn.addEventListener('click', () => {
      const theme = btn.dataset.theme;
      applyTheme(theme);

      themeBtns.forEach(b => {
        b.classList.remove('btn-primary');
        b.classList.add('btn-secondary');
      });
      btn.classList.add('btn-primary');
      btn.classList.remove('btn-secondary');
      showToast(`Theme switched to ${theme}`);
    });
  });
}

function initStorageManager() {
  const footprintEl = document.getElementById('storage-footprint');
  const exportBtn = document.getElementById('settings-export-btn');
  const importBtn = document.getElementById('settings-import-btn');
  const fileInput = document.getElementById('settings-file-input');
  const resetBtn = document.getElementById('settings-reset-btn');

  function updateFootprint() {
    if (!footprintEl) return;
    try {
      let totalBytes = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const val = localStorage.getItem(key);
        totalBytes += (key.length + val.length) * 2; // UTF-16 approximate bytes
      }
      const kb = (totalBytes / 1024).toFixed(2);
      const itemsCount = Object.keys(loadProgress()).length;
      footprintEl.textContent = `${kb} KB (${totalBytes} bytes across ${itemsCount} data sections)`;
    } catch {
      footprintEl.textContent = 'Unable to inspect LocalStorage';
    }
  }

  updateFootprint();

  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      exportProgress();
      showToast('Progress exported as JSON');
    });
  }

  if (importBtn && fileInput) {
    importBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        await importProgress(file);
        updateFootprint();
        showToast('Progress restored successfully! Reloading...');
        setTimeout(() => window.location.reload(), 1200);
      } catch (err) {
        alert('Failed to import JSON backup: ' + err.message);
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      const confirmed = window.confirm(
        'Are you sure you want to completely RESET all progress?\nThis will erase all task checkmarks, skill statuses, interview answers, and notes!'
      );
      if (confirmed) {
        localStorage.removeItem('aier_progress');
        updateFootprint();
        showToast('All progress data has been reset');
        setTimeout(() => window.location.reload(), 1200);
      }
    });
  }
}
