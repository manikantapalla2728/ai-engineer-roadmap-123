/**
 * roadmap.js — Month > Week > Day accordion with task checkboxes
 */
import { fetchData, loadProgress, setProgress, showToast, escapeHtml } from './app.js';
import { initAppShell } from './shell.js';

initAppShell('roadmap');

async function main() {
  let roadmap;
  try {
    roadmap = await fetchData('data/roadmap.json');
  } catch (e) {
    document.getElementById('roadmap-container').innerHTML =
      `<div class="empty-state"><div class="empty-icon">❌</div><p>Failed to load roadmap data.</p></div>`;
    return;
  }

  renderSummary(roadmap);
  renderRoadmap(roadmap);
}

function renderSummary(roadmap) {
  const tasks = loadProgress().tasks || {};
  let total = 0, done = 0;
  for (const m of roadmap.months) {
    for (const w of m.weeks) {
      total += w.days.length;
      for (const d of w.days) {
        if (tasks[`w${w.id}d${d.day}`]) done++;
      }
    }
  }
  const pct = total ? Math.round((done / total) * 100) : 0;
  document.getElementById('roadmap-summary').innerHTML = `
    <div class="stat-card"><div class="stat-value">${done}</div><div class="stat-label">Tasks done</div></div>
    <div class="stat-card"><div class="stat-value">${total - done}</div><div class="stat-label">Remaining</div></div>
    <div class="stat-card"><div class="stat-value">${pct}%</div><div class="stat-label">Complete</div></div>
    <div class="stat-card"><div class="stat-value">${roadmap.months.length * 4}</div><div class="stat-label">Total weeks</div></div>
  `;
}

function renderRoadmap(roadmap) {
  const container = document.getElementById('roadmap-container');
  const tasks = loadProgress().tasks || {};

  container.innerHTML = roadmap.months.map((month, mIdx) => {
    const monthDone = month.weeks.every(w => w.days.every(d => tasks[`w${w.id}d${d.day}`]));

    const weeksHtml = month.weeks.map(week => {
      const done = week.days.filter(d => tasks[`w${week.id}d${d.day}`]).length;
      const total = week.days.length;
      const complete = done === total;

      const dots = week.days.map(d => {
        const key = `w${week.id}d${d.day}`;
        return `<span class="week-dot${tasks[key] ? (complete ? ' complete' : ' done') : ''}" aria-hidden="true"></span>`;
      }).join('');

      return `
        <a href="week.html?w=${week.id}" class="week-row" aria-label="Week ${week.id}: ${week.title}, ${done} of ${total} tasks done">
          <span class="week-number">Week ${week.id}</span>
          <span class="week-title">${escapeHtml(week.title)}</span>
          <span class="week-progress" aria-hidden="true">
            <span class="week-dots">${dots}</span>
            <span class="week-count">${done}/${total}</span>
          </span>
          ${complete ? '<span class="badge badge-success" aria-label="Complete">✓</span>' : ''}
          <span class="badge badge-neutral" aria-label="DSA: 3 sessions">DSA ×3</span>
        </a>`;
    }).join('');

    // First month open by default
    const isOpen = mIdx === 0;

    return `
      <div class="accordion-month">
        <button
          class="accordion-month-header"
          aria-expanded="${isOpen}"
          aria-controls="month-body-${month.id}"
          id="month-btn-${month.id}"
        >
          <span>Month ${month.id}: ${escapeHtml(month.title)}</span>
          <span style="display:flex;align-items:center;gap:0.5rem">
            ${monthDone ? '<span class="badge badge-success">Complete</span>' : ''}
            <span style="font-size:0.85rem;color:var(--fg-muted)">${isOpen ? '▲' : '▼'}</span>
          </span>
        </button>
        <div class="accordion-month-body${isOpen ? ' open' : ''}" id="month-body-${month.id}" role="region" aria-labelledby="month-btn-${month.id}">
          ${weeksHtml}
        </div>
      </div>`;
  }).join('');

  // Accordion toggle
  container.querySelectorAll('.accordion-month-header').forEach(btn => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      const body = btn.nextElementSibling;
      body.classList.toggle('open', !expanded);
      // update chevron
      const chevron = btn.querySelector('span:last-child span:last-child');
      if (chevron) chevron.textContent = !expanded ? '▲' : '▼';
    });
  });
}

main();
