/**
 * weekly-review.js — Controller for Weekly Retrospectives and SVG Progress Velocity Chart
 */
import {
  initTheme, initNav, fetchData, escapeHtml, showToast, loadProgress, saveProgress
} from './app.js';

initTheme();
initNav('review');

async function main() {
  let roadmap;
  try {
    roadmap = await fetchData('data/roadmap.json');
  } catch (err) {
    console.error('Failed to load roadmap:', err);
    return;
  }

  renderVelocityChart(roadmap);
  setupRetrospectiveLog(roadmap);
}

function renderVelocityChart(roadmap) {
  const container = document.getElementById('chart-container');
  const p = loadProgress();
  const tasks = p.tasks || {};

  const allWeeks = roadmap.months.flatMap(m => m.weeks);
  const chartWidth = 720;
  const chartHeight = 160;
  const colWidth = 32;
  const gap = 12;

  let colsSvg = '';

  allWeeks.forEach((w, i) => {
    const x = i * (colWidth + gap) + 30;
    const completedDays = w.days.filter(d => !!tasks[`w${w.id}d${d.day}`]).length;
    const fillHeight = (completedDays / 7) * 110;
    const y = 130 - fillHeight;

    colsSvg += `
      <!-- Week ${w.id} Column -->
      <rect x="${x}" y="20" width="${colWidth}" height="110" rx="4" fill="var(--surface-alt)" stroke="var(--border)" stroke-width="1" />
      <rect x="${x}" y="${y}" width="${colWidth}" height="${fillHeight}" rx="4" fill="var(--accent)" />
      <text x="${x + colWidth/2}" y="150" font-size="10" text-anchor="middle" fill="var(--fg-muted)">W${w.id}</text>
      <text x="${x + colWidth/2}" y="${Math.max(y - 4, 15)}" font-size="9" text-anchor="middle" fill="var(--fg)" font-weight="600">${completedDays*2}h</text>
    `;
  });

  container.innerHTML = `
    <svg viewBox="0 0 760 170" width="100%" height="${chartHeight}" style="min-width: 680px;" aria-label="Weekly hours velocity bar chart">
      <!-- Grid lines -->
      <line x1="20" y1="20" x2="740" y2="20" stroke="var(--border)" stroke-dasharray="2,2" />
      <line x1="20" y1="75" x2="740" y2="75" stroke="var(--border)" stroke-dasharray="2,2" />
      <line x1="20" y1="130" x2="740" y2="130" stroke="var(--border-strong)" />
      <text x="15" y="24" font-size="9" text-anchor="end" fill="var(--fg-subtle)">14h</text>
      <text x="15" y="79" font-size="9" text-anchor="end" fill="var(--fg-subtle)">7h</text>
      <text x="15" y="134" font-size="9" text-anchor="end" fill="var(--fg-subtle)">0h</text>
      ${colsSvg}
    </svg>`;
}

function setupRetrospectiveLog(roadmap) {
  const selector = document.getElementById('review-week-selector');
  const compArea = document.getElementById('retro-completed');
  const slipArea = document.getElementById('retro-slipped');
  const statusLabel = document.getElementById('retro-status');
  const saveBtn = document.getElementById('save-retro-btn');

  const allWeeks = roadmap.months.flatMap(m => m.weeks);

  allWeeks.forEach(w => {
    const opt = document.createElement('option');
    opt.value = `week-${w.id}`;
    opt.textContent = `Week ${w.id}: ${w.title.slice(0, 24)}…`;
    selector.appendChild(opt);
  });

  function loadLogForWeek(weekKey) {
    const p = loadProgress();
    const retros = p.weeklyRetros || {};
    const log = retros[weekKey] || { completed: '', slipped: '' };
    compArea.value = log.completed || '';
    slipArea.value = log.slipped || '';
    statusLabel.textContent = 'Loaded ' + weekKey;
  }

  function saveLog() {
    const weekKey = selector.value;
    const p = loadProgress();
    if (!p.weeklyRetros) p.weeklyRetros = {};
    p.weeklyRetros[weekKey] = {
      completed: compArea.value,
      slipped: slipArea.value,
      updatedAt: new Date().toISOString()
    };
    saveProgress(p);
    statusLabel.textContent = 'Saved at ' + new Date().toLocaleTimeString();
    showToast('Weekly retrospective saved!');
  }

  selector.addEventListener('change', () => loadLogForWeek(selector.value));
  saveBtn.addEventListener('click', saveLog);

  // Load first week by default
  loadLogForWeek(selector.value);
}

main();
