/**
 * resources.js — Searchable, filterable resource library
 */
import { fetchData, escapeHtml } from './app.js';
import { initAppShell } from './shell.js';

initAppShell('resources');

async function main() {
  let resources;
  try {
    resources = await fetchData('data/resources.json');
  } catch (e) {
    document.getElementById('resources-grid').innerHTML =
      `<div class="empty-state"><div class="empty-icon">❌</div><p>Failed to load resources.</p></div>`;
    return;
  }

  populateFilters(resources);
  renderGrid(resources, resources);
  setupFilters(resources);
}

function populateFilters(resources) {
  const topics = [...new Set(resources.map(r => r.topic))].sort();
  const topicSel = document.getElementById('res-topic');
  topics.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t;
    topicSel.appendChild(opt);
  });

  const allWeeks = [...new Set(resources.flatMap(r => Array.isArray(r.week) ? r.week : [r.week]))].sort((a, b) => a - b);
  const weekSel = document.getElementById('res-week');
  allWeeks.forEach(w => {
    const opt = document.createElement('option');
    opt.value = w;
    opt.textContent = `Week ${w}`;
    weekSel.appendChild(opt);
  });
}

function setupFilters(resources) {
  const searchEl = document.getElementById('res-search');
  const topicEl = document.getElementById('res-topic');
  const typeEl = document.getElementById('res-type');
  const levelEl = document.getElementById('res-level');
  const weekEl = document.getElementById('res-week');
  const clearEl = document.getElementById('res-clear');

  function applyFilters() {
    const q = searchEl.value.toLowerCase().trim();
    const topic = topicEl.value;
    const type = typeEl.value;
    const level = levelEl.value;
    const week = weekEl.value ? parseInt(weekEl.value, 10) : null;

    const filtered = resources.filter(r => {
      if (q && !(
        r.title.toLowerCase().includes(q) ||
        r.topic.toLowerCase().includes(q) ||
        (r.why_it_helps || '').toLowerCase().includes(q) ||
        (r.author_or_channel || '').toLowerCase().includes(q)
      )) return false;
      if (topic && r.topic !== topic) return false;
      if (type && r.type !== type) return false;
      if (level && r.level !== level) return false;
      if (week) {
        const rWeeks = Array.isArray(r.week) ? r.week : [r.week];
        if (!rWeeks.includes(week)) return false;
      }
      return true;
    });

    renderGrid(resources, filtered);
  }

  [searchEl, topicEl, typeEl, levelEl, weekEl].forEach(el => {
    el.addEventListener('input', applyFilters);
    el.addEventListener('change', applyFilters);
  });

  clearEl.addEventListener('click', () => {
    searchEl.value = '';
    topicEl.value = '';
    typeEl.value = '';
    levelEl.value = '';
    weekEl.value = '';
    applyFilters();
  });
}

function renderGrid(all, filtered) {
  const grid = document.getElementById('resources-grid');
  const countEl = document.getElementById('res-count');

  countEl.textContent = `${filtered.length} of ${all.length}`;

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="no-results empty-state" style="grid-column:1/-1"><div class="empty-icon">🔍</div><h3>No resources match</h3><p>Try different filters.</p></div>`;
    return;
  }

  grid.innerHTML = filtered.map(r => {
    const hasUrl = r.url && r.url.trim() !== '';
    const href = hasUrl
      ? r.url
      : (r.search_query
          ? `https://www.youtube.com/results?search_query=${encodeURIComponent(r.search_query)}`
          : null);

    const verifiedBadge = r.verified
      ? '<span class="badge badge-verified">✅ Verified</span>'
      : '<span class="badge badge-unverified">⚠ Unverified</span>';

    const searchHint = !hasUrl && r.search_query
      ? `<div class="text-xs text-muted mt-1" style="font-style:italic">Search: "${escapeHtml(r.search_query)}"</div>`
      : '';

    const weeks = Array.isArray(r.week) ? r.week : [r.week];

    return `
      <div class="resource-card" role="listitem">
        <div class="resource-card-top">
          ${href
            ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener" class="resource-title">${escapeHtml(r.title)}</a>`
            : `<span class="resource-title" style="color:var(--fg)">${escapeHtml(r.title)}</span>`
          }
          ${verifiedBadge}
        </div>
        ${searchHint}
        <div class="resource-meta">
          <span class="badge type-${r.type}">${r.type}</span>
          <span class="chip">${escapeHtml(r.topic)}</span>
          <span class="chip">${r.level}</span>
        </div>
        <p class="resource-why">${escapeHtml(r.why_it_helps || '')}</p>
        <div class="resource-footer">
          <span class="resource-author">${escapeHtml(r.author_or_channel || '')}</span>
          <span class="resource-week-badge">${weeks.map(w => `W${w}`).join(', ')}</span>
        </div>
      </div>`;
  }).join('');
}

main();
