/**
 * week.js — Week detail page (week.html?w=N)
 * Shows goal, daily tasks with checkboxes, concepts, DSA, and filtered resources
 */
import { fetchData, loadProgress, setProgress, showToast, escapeHtml, formatWeekLabel } from './app.js';
import { initAppShell } from './shell.js';

initAppShell('roadmap');

async function main() {
  const params = new URLSearchParams(location.search);
  const weekNum = parseInt(params.get('w'), 10);

  if (!weekNum || isNaN(weekNum) || weekNum < 1 || weekNum > 16) {
    renderError('Invalid week. Please go back to the roadmap.');
    return;
  }

  let roadmap, resources;
  try {
    [roadmap, resources] = await Promise.all([
      fetchData('data/roadmap.json'),
      fetchData('data/resources.json')
    ]);
  } catch (e) {
    renderError('Failed to load data.');
    return;
  }

  // Find week
  const allWeeks = roadmap.months.flatMap(m => m.weeks);
  const week = allWeeks.find(w => w.id === weekNum);
  const month = roadmap.months.find(m => m.weeks.some(w => w.id === weekNum));

  if (!week) {
    renderError(`Week ${weekNum} not found.`);
    return;
  }

  document.title = `Week ${weekNum}: ${week.title} — AI Engineer Roadmap`;

  // Filter resources for this week
  const weekResources = resources.filter(r =>
    Array.isArray(r.week) ? r.week.includes(weekNum) : r.week === weekNum
  );

  // Prev/next
  const prevWeek = weekNum > 1 ? weekNum - 1 : null;
  const nextWeek = weekNum < 16 ? weekNum + 1 : null;

  const tasks = loadProgress().tasks || {};
  const doneDays = week.days.filter(d => tasks[`w${week.id}d${d.day}`]).length;

  document.getElementById('week-content').innerHTML = `
    <div class="week-layout">
      <!-- Main column -->
      <div>
        <header class="page-header">
          <div class="flex items-center gap-2 mb-2">
            <span class="badge badge-accent">Month ${month.id}</span>
            <span class="badge badge-neutral">Week ${week.id}</span>
            <span class="badge ${doneDays === week.days.length ? 'badge-success' : 'badge-neutral'}">
              ${doneDays}/${week.days.length} done
            </span>
          </div>
          <h1>${escapeHtml(week.title)}</h1>
          <p class="subtitle">${escapeHtml(week.goal)}</p>
        </header>

        <!-- Progress bar -->
        <div class="progress-bar mb-6">
          <div class="progress-bar-fill${doneDays === week.days.length ? ' complete' : ''}"
               style="width:${Math.round((doneDays / week.days.length) * 100)}%"></div>
        </div>

        <!-- Daily tasks -->
        <section aria-label="Daily tasks">
          <p class="section-title">Daily tasks (2 hours each)</p>
          <div class="day-grid" id="day-grid">
            ${week.days.map(day => renderDayCard(week, day, tasks)).join('')}
          </div>
        </section>

        <!-- Prev/next nav -->
        <div class="flex justify-between mt-6">
          ${prevWeek ? `<a href="week.html?w=${prevWeek}" class="btn btn-secondary btn-sm">← Week ${prevWeek}</a>` : '<span></span>'}
          <a href="roadmap.html" class="btn btn-ghost btn-sm">Roadmap</a>
          ${nextWeek ? `<a href="week.html?w=${nextWeek}" class="btn btn-secondary btn-sm">Week ${nextWeek} →</a>` : '<span></span>'}
        </div>
      </div>

      <!-- Sidebar -->
      <aside class="week-sidebar" aria-label="Week overview">
        <!-- Deliverable -->
        <div class="card card-sm mb-4">
          <p class="section-title">Deliverable</p>
          <p class="text-sm fw-600">${escapeHtml(week.deliverable)}</p>
          <p class="text-xs text-muted mt-1">${escapeHtml(week.milestone)}</p>
        </div>

        <!-- Concepts -->
        <div class="card card-sm mb-4">
          <p class="section-title">Key concepts</p>
          <ul style="list-style:none;display:grid;gap:0.375rem">
            ${week.concepts.map(c => `<li class="text-sm flex gap-2"><span style="color:var(--accent)">·</span>${escapeHtml(c)}</li>`).join('')}
          </ul>
        </div>

        <!-- DSA -->
        ${week.dsa ? `
        <div class="card card-sm mb-4" style="border-left:3px solid var(--accent)">
          <p class="section-title">DSA alongside</p>
          <p class="text-sm fw-600">${escapeHtml(week.dsa.focus)}</p>
          <p class="text-xs text-muted">${week.dsa.sessions} sessions · ${week.dsa.minutesPerSession} min each</p>
        </div>` : ''}

        <!-- Resources -->
        ${weekResources.length > 0 ? `
        <div class="card card-sm">
          <p class="section-title">Resources (${weekResources.length})</p>
          <div style="display:grid;gap:0.625rem">
            ${weekResources.map(r => renderResourceMini(r)).join('')}
          </div>
        </div>` : ''}
      </aside>
    </div>`;

  // Checkbox event delegation
  document.getElementById('day-grid').addEventListener('change', (e) => {
    if (e.target.type !== 'checkbox') return;
    const key = e.target.dataset.taskKey;
    if (!key) return;
    const all = loadProgress();
    if (!all.tasks) all.tasks = {};
    all.tasks[key] = e.target.checked;
    const { saveProgress } = window._aierApp || {};
    // Use direct localStorage for simplicity
    try {
      const progress = JSON.parse(localStorage.getItem('aier_progress') || '{}');
      if (!progress.tasks) progress.tasks = {};
      progress.tasks[key] = e.target.checked;
      localStorage.setItem('aier_progress', JSON.stringify(progress));
    } catch {}
    showToast(e.target.checked ? 'Task marked complete ✓' : 'Task unchecked');
    updateWeekProgress(week, tasks);
  });
}

function renderDayCard(week, day, tasks) {
  const key = `w${week.id}d${day.day}`;
  const isDone = !!tasks[key];
  const isReview = day.day === 7;

  return `
    <div class="day-card" id="day-card-${day.day}">
      <div class="day-card-header">
        <span class="day-number" style="${isReview ? 'background:var(--surface-alt);color:var(--fg-muted);border-color:var(--border)' : ''}">
          Day ${day.day}${isReview ? ' 🔄' : ''}
        </span>
        <h3 style="flex:1">${escapeHtml(day.title)}</h3>
        <label class="checkbox-label" style="margin-left:auto;gap:0.375rem">
          <input
            type="checkbox"
            ${isDone ? 'checked' : ''}
            data-task-key="${key}"
            aria-label="Mark Day ${day.day} as complete"
          >
          <span class="text-xs text-muted" aria-hidden="true">${isDone ? 'Done' : 'Mark done'}</span>
        </label>
      </div>
      <div class="day-card-body">
        <div class="day-field">
          <div class="day-field-label">What to do</div>
          <p>${escapeHtml(day.what)}</p>
        </div>
        <div class="day-field">
          <div class="day-field-label">Produce</div>
          <p>${escapeHtml(day.produce)}</p>
        </div>
        <div class="day-field" style="margin-bottom:0">
          <div class="day-field-label">How to check</div>
          <p>${escapeHtml(day.check)}</p>
        </div>
      </div>
    </div>`;
}

function renderResourceMini(r) {
  const hasUrl = r.url && r.url.trim() !== '';
  const href = hasUrl ? r.url : (r.search_query ? `https://www.youtube.com/results?search_query=${encodeURIComponent(r.search_query)}` : '#');
  const badge = r.verified
    ? '<span class="badge badge-verified" style="font-size:0.65rem">✓ Verified</span>'
    : '<span class="badge badge-unverified" style="font-size:0.65rem">⚠ Unverified</span>';

  return `
    <div style="padding-bottom:0.625rem;border-bottom:1px solid var(--border);last-child:border-none">
      <a href="${hasUrl ? r.url : href}" target="_blank" rel="noopener" class="text-sm fw-600" style="display:block;margin-bottom:0.2rem">
        ${escapeHtml(r.title)}
      </a>
      <div class="flex gap-1 flex-wrap">
        <span class="badge type-${r.type}">${r.type}</span>
        ${badge}
      </div>
    </div>`;
}

function updateWeekProgress(week, tasks) {
  // Re-read tasks from storage
  const fresh = JSON.parse(localStorage.getItem('aier_progress') || '{}');
  const freshTasks = fresh.tasks || {};
  const done = week.days.filter(d => freshTasks[`w${week.id}d${d.day}`]).length;
  const pct = Math.round((done / week.days.length) * 100);
  const bar = document.querySelector('.progress-bar-fill');
  if (bar) {
    bar.style.width = pct + '%';
    bar.classList.toggle('complete', done === week.days.length);
  }
}

function renderError(msg) {
  document.getElementById('week-content').innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">❌</div>
      <h3>Error</h3>
      <p>${escapeHtml(msg)}</p>
      <a href="roadmap.html" class="btn btn-primary mt-4">← Back to Roadmap</a>
    </div>`;
}

main();
