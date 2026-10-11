/**
 * competency.js — 13-skill competency checklist with evidence gates
 * Evidence is required before ticking. State stored in localStorage.
 */
import { initTheme, initNav, fetchData, loadProgress, showToast, escapeHtml } from './app.js';

initTheme();
initNav('competency');

async function main() {
  let skills;
  try {
    skills = await fetchData('data/competency.json');
  } catch (e) {
    document.getElementById('competency-list').innerHTML =
      `<div class="empty-state"><div class="empty-icon">❌</div><p>Failed to load competency data.</p></div>`;
    return;
  }

  renderList(skills);
  updateProgress(skills);
}

function loadCompetencyState() {
  try {
    const p = JSON.parse(localStorage.getItem('aier_progress') || '{}');
    return p.competency || {};
  } catch { return {}; }
}

function saveCompetencyItem(id, field, value) {
  try {
    const p = JSON.parse(localStorage.getItem('aier_progress') || '{}');
    if (!p.competency) p.competency = {};
    if (!p.competency[id]) p.competency[id] = {};
    p.competency[id][field] = value;
    localStorage.setItem('aier_progress', JSON.stringify(p));
  } catch (e) { console.warn('Save failed:', e); }
}

function renderList(skills) {
  const state = loadCompetencyState();
  const container = document.getElementById('competency-list');

  container.innerHTML = skills.map((skill, i) => {
    const s = state[skill.id] || {};
    const evidence = s.evidence || '';
    const ticked = !!s.ticked;
    const hasEvidence = evidence.trim().length > 0;

    const weeks = skill.weeks.map(w => `<a href="week.html?w=${w}" class="chip">Week ${w}</a>`).join('');

    return `
      <div class="competency-item${ticked ? ' ticked' : ''}" id="comp-item-${skill.id}">
        <div class="competency-top">
          <span class="competency-num">${String(i + 1).padStart(2, '0')}</span>
          <div class="competency-main">
            <div class="competency-skill">${escapeHtml(skill.skill)}</div>
            <div class="competency-desc">${escapeHtml(skill.description)}</div>
            <div class="competency-weeks">${weeks}</div>
          </div>
          <div style="flex-shrink:0">
            ${ticked
              ? '<span class="badge badge-success">✓ Verified</span>'
              : '<span class="badge badge-neutral">Not yet</span>'
            }
          </div>
        </div>

        <div class="competency-evidence">
          <div style="flex:1">
            <label for="evidence-${skill.id}" class="text-xs text-muted" style="display:block;margin-bottom:0.3rem">
              ${skill.evidenceHint || 'Add evidence (link or note)'}
            </label>
            <input
              type="text"
              id="evidence-${skill.id}"
              class="input"
              data-skill-id="${skill.id}"
              value="${escapeHtml(evidence)}"
              placeholder="e.g., github.com/you/project or 'Built Week 4 app with FastAPI'"
              aria-label="Evidence for: ${escapeHtml(skill.skill)}"
            >
          </div>
          <button
            class="btn btn-sm competency-tick-btn ${ticked ? 'btn-ghost' : 'btn-primary'}"
            data-skill-id="${skill.id}"
            ${hasEvidence ? '' : 'disabled'}
            title="${hasEvidence ? '' : 'Add evidence first'}"
            aria-label="${ticked ? 'Unverify skill' : 'Verify skill'}: ${escapeHtml(skill.skill)}"
          >${ticked ? '↩ Unverify' : '✓ Verify'}</button>
        </div>
      </div>`;
  }).join('');

  // Evidence input: enable/disable tick button
  container.addEventListener('input', (e) => {
    if (!e.target.matches('.competency-evidence .input')) return;
    const id = e.target.dataset.skillId;
    const btn = container.querySelector(`.competency-tick-btn[data-skill-id="${id}"]`);
    const hasEvidence = e.target.value.trim().length > 0;
    if (btn) btn.disabled = !hasEvidence;
    // Autosave evidence
    saveCompetencyItem(id, 'evidence', e.target.value);
  });

  // Tick/untick
  container.addEventListener('click', (e) => {
    const btn = e.target.closest('.competency-tick-btn');
    if (!btn) return;
    const id = btn.dataset.skillId;
    const item = document.getElementById(`comp-item-${id}`);
    const evInput = document.getElementById(`evidence-${id}`);
    if (!evInput || evInput.value.trim().length === 0) {
      showToast('Add evidence before verifying');
      return;
    }

    const state = loadCompetencyState();
    const current = (state[id] || {}).ticked;
    const next = !current;

    saveCompetencyItem(id, 'ticked', next);
    saveCompetencyItem(id, 'evidence', evInput.value);

    item.classList.toggle('ticked', next);
    const badge = item.querySelector('.competency-top .badge');
    if (badge) {
      badge.className = next ? 'badge badge-success' : 'badge badge-neutral';
      badge.textContent = next ? '✓ Verified' : 'Not yet';
    }
    btn.textContent = next ? '↩ Unverify' : '✓ Verify';
    btn.className = `btn btn-sm competency-tick-btn ${next ? 'btn-ghost' : 'btn-primary'}`;
    showToast(next ? '✓ Skill verified!' : 'Skill unverified');

    updateProgress(skills);
  });
}

function updateProgress(skills) {
  const state = loadCompetencyState();
  const done = skills.filter(s => (state[s.id] || {}).ticked).length;
  const pct = skills.length ? Math.round((done / skills.length) * 100) : 0;

  const bar = document.getElementById('comp-bar');
  const summary = document.getElementById('comp-summary');
  if (bar) { bar.style.width = pct + '%'; if (done === skills.length) bar.classList.add('complete'); }
  if (summary) summary.textContent = `${done} / ${skills.length} skills verified`;
}

main();
