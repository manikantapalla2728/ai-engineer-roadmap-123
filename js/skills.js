/**
 * skills.js — Skills Catalogue directory with search, filter, and progress integration
 */
import {
  fetchData, escapeHtml,
  getSkillStatus, getSpacedRepetitionReminders
} from './app.js';
import { initAppShell } from './shell.js';

initAppShell('skills');

async function main() {
  let skills = [];
  try {
    skills = await fetchData('data/skills.json');
  } catch (err) {
    document.getElementById('skills-container').innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">❌</div>
        <p>Could not load skills data.</p>
      </div>`;
    return;
  }

  // Check spaced repetition reminders
  const reminders = getSpacedRepetitionReminders();
  if (reminders.length > 0) {
    const alertBox = document.getElementById('revision-alert');
    const alertText = document.getElementById('revision-text');
    if (alertBox && alertText) {
      alertText.textContent = `You have ${reminders.length} proven skill(s) due for spaced recall review today!`;
      alertBox.style.display = 'flex';
    }
  }

  setupSearchAndFilters(skills);
  renderSkills(skills, skills);
}

function setupSearchAndFilters(allSkills) {
  const searchInput = document.getElementById('skill-search');
  const monthSelect = document.getElementById('filter-month');
  const statusSelect = document.getElementById('filter-status');
  const clearBtn = document.getElementById('skills-clear');

  function applyFilter() {
    const q = (searchInput.value || '').toLowerCase().trim();
    const month = monthSelect.value ? parseInt(monthSelect.value, 10) : null;
    const status = statusSelect.value || null;

    const filtered = allSkills.filter(s => {
      // Text match
      if (q) {
        const titleMatch = s.title.toLowerCase().includes(q);
        const whyMatch = (s.why_it_matters || '').toLowerCase().includes(q);
        const subtopicMatch = (s.learning_path || []).some(lp =>
          (lp.subtopic || '').toLowerCase().includes(q) || (lp.summary || '').toLowerCase().includes(q)
        );
        if (!titleMatch && !whyMatch && !subtopicMatch) return false;
      }

      // Month match
      if (month && s.month !== month) return false;

      // Status match
      if (status) {
        const curStatus = getSkillStatus(s.id);
        if (curStatus !== status) return false;
      }

      return true;
    });

    renderSkills(allSkills, filtered);
  }

  [searchInput, monthSelect, statusSelect].forEach(el => {
    el.addEventListener('input', applyFilter);
    el.addEventListener('change', applyFilter);
  });

  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    monthSelect.value = '';
    statusSelect.value = '';
    applyFilter();
  });
}

function renderSkills(allSkills, filtered) {
  const container = document.getElementById('skills-container');
  const countEl = document.getElementById('skills-count');

  if (countEl) {
    countEl.textContent = `Showing ${filtered.length} of ${allSkills.length} skills`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-icon">🔍</div>
        <h3>No matching skills found</h3>
        <p>Try clearing your filters or searching for different keywords.</p>
      </div>`;
    return;
  }

  container.innerHTML = filtered.map(s => {
    const status = getSkillStatus(s.id);
    const weeksLabel = (s.weeks || []).map(w => `W${w}`).join(', ');

    return `
      <a href="skill.html?id=${encodeURIComponent(s.id)}" class="skill-card" role="listitem">
        <div class="skill-card-header">
          <div>
            <span class="badge badge-accent mb-1" style="font-size:0.7rem;">Month ${s.month} · ${weeksLabel}</span>
            <div class="skill-card-title">${escapeHtml(s.title)}</div>
          </div>
          <span class="status-badge status-${status}">${status.replace('-', ' ')}</span>
        </div>
        <p class="text-sm text-muted" style="line-height:1.45; flex:1;">
          ${escapeHtml(s.why_it_matters)}
        </p>
        <div class="flex justify-between items-center text-xs text-subtle pt-2" style="border-top: 1px solid var(--border);">
          <span>${(s.learning_path || []).length} topics · ${(s.practice_exercises || []).length} exercises</span>
          <span class="text-accent fw-600">Open Guide →</span>
        </div>
      </a>`;
  }).join('');
}

main();
