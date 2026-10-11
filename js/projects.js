/**
 * projects.js — Flagship project stages with checklists
 */
import { fetchData, loadProgress, showToast, escapeHtml } from './app.js';
import { initAppShell } from './shell.js';

initAppShell('projects');

async function main() {
  let data;
  try {
    data = await fetchData('data/projects.json');
  } catch (e) {
    document.getElementById('project-stages').innerHTML =
      `<div class="empty-state"><div class="empty-icon">❌</div><p>Failed to load project data.</p></div>`;
    return;
  }

  renderHeader(data);
  renderStages(data);
}

function renderHeader(data) {
  document.getElementById('project-header').innerHTML = `
    <h2 style="margin-bottom:0.375rem">${escapeHtml(data.name)}</h2>
    <p class="text-muted text-sm">${escapeHtml(data.description)}</p>
  `;
}

function renderStages(data) {
  const container = document.getElementById('project-stages');
  const progress = loadProgress().projectChecklist || {};

  container.innerHTML = data.stages.map(stage => {
    const checklistHtml = stage.checklist.map(item => {
      const key = item.id;
      const checked = !!progress[key];
      return `
        <label class="checkbox-label">
          <input
            type="checkbox"
            data-item-id="${key}"
            ${checked ? 'checked' : ''}
            aria-label="${escapeHtml(item.label)}"
          >
          <span class="text-sm">${escapeHtml(item.label)}</span>
          <span class="badge badge-neutral" style="margin-left:auto;font-size:0.7rem">${item.category}</span>
        </label>`;
    }).join('');

    const done = stage.checklist.filter(i => progress[i.id]).length;
    const total = stage.checklist.length;

    return `
      <div class="stage-card">
        <div class="stage-header">
          <span class="stage-month">Month ${stage.month}</span>
          <h3 style="flex:1">${escapeHtml(stage.title)}</h3>
          <span class="badge ${done === total && total > 0 ? 'badge-success' : 'badge-neutral'}">${done}/${total}</span>
        </div>
        <div class="stage-body">
          <div class="stage-features">
            <p class="text-sm text-muted mb-2">${escapeHtml(stage.description)}</p>
            <ul>
              ${stage.features.map(f => `<li>${escapeHtml(f)}</li>`).join('')}
            </ul>
          </div>
          <div class="stage-checklist">
            <h4>Stage checklist</h4>
            <div class="checklist-items">${checklistHtml}</div>
          </div>
        </div>
      </div>`;
  }).join('');

  // Save checklist state
  container.addEventListener('change', (e) => {
    if (e.target.type !== 'checkbox') return;
    const id = e.target.dataset.itemId;
    if (!id) return;
    try {
      const stored = JSON.parse(localStorage.getItem('aier_progress') || '{}');
      if (!stored.projectChecklist) stored.projectChecklist = {};
      stored.projectChecklist[id] = e.target.checked;
      localStorage.setItem('aier_progress', JSON.stringify(stored));
    } catch {}
    showToast(e.target.checked ? '✓ Item checked' : 'Item unchecked');
  });
}

main();
