/**
 * videos.js — Video Hub directory with embedded player facade, search, filters, and list/grid toggle
 */
import {
  fetchData, escapeHtml, showToast, loadProgress, saveProgress
} from './app.js';
import { initAppShell } from './shell.js';

initAppShell('videos');

let allVideos = [];
let allSkills = [];

async function main() {
  try {
    [allVideos, allSkills] = await Promise.all([
      fetchData('data/videos.json'),
      fetchData('data/skills.json')
    ]);
  } catch (err) {
    document.getElementById('videos-container').innerHTML = `
      <div class="empty-state"><div class="empty-icon">❌</div><p>Failed to load video datasets.</p></div>`;
    return;
  }

  populateSkillOptions();
  setupFilterHandlers();
  setupPlayerModal();
  renderVideos(allVideos);
}

function populateSkillOptions() {
  const sel = document.getElementById('video-skill-filter');
  allSkills.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = `${s.title} (M${s.month})`;
    sel.appendChild(opt);
  });
}

function setupFilterHandlers() {
  const searchInput = document.getElementById('video-search-input');
  const skillSelect = document.getElementById('video-skill-filter');
  const catSelect = document.getElementById('video-category-filter');
  const viewSelect = document.getElementById('video-view-mode');
  const clearBtn = document.getElementById('video-clear-filters');

  function applyFilters() {
    const q = (searchInput.value || '').toLowerCase().trim();
    const skill = skillSelect.value;
    const cat = catSelect.value;

    const filtered = allVideos.filter(v => {
      if (q && !(v.title.toLowerCase().includes(q) || v.channel.toLowerCase().includes(q) || (v.why_it_helps || '').toLowerCase().includes(q))) return false;
      if (skill && v.skill_id !== skill) return false;
      if (cat && v.category !== cat) return false;
      return true;
    });

    renderVideos(filtered);
  }

  [searchInput, skillSelect, catSelect, viewSelect].forEach(el => {
    el.addEventListener('input', applyFilters);
    el.addEventListener('change', applyFilters);
  });

  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    skillSelect.value = '';
    catSelect.value = '';
    applyFilters();
  });
}

function renderVideos(videos) {
  const container = document.getElementById('videos-container');
  const countLabel = document.getElementById('video-count-label');
  const isList = document.getElementById('video-view-mode').value === 'list';

  countLabel.textContent = `Showing ${videos.length} of ${allVideos.length} videos`;
  container.className = isList ? 'flex flex-col gap-2' : 'video-grid';

  if (videos.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-icon">🔍</div>
        <h3>No matching videos found</h3>
        <p>Try resetting filters or searching for different keywords.</p>
      </div>`;
    return;
  }

  container.innerHTML = videos.map(v => {
    const isDirect = v.url && v.url.includes('watch?v=');
    let videoId = '';
    if (isDirect) {
      videoId = v.url.split('watch?v=')[1].split('&')[0];
    }
    const thumbUrl = v.thumbnail || (isDirect ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '');
    const badge = v.verified
      ? '<span class="badge badge-success">✓ Verified Masterclass</span>'
      : '<span class="badge badge-neutral">Curated Search</span>';

    if (isList) {
      return `
        <div class="card card-compact flex justify-between items-center gap-3">
          <div class="flex items-center gap-3" style="flex:1; min-width:0;">
            ${thumbUrl ? `
              <div class="video-card-thumb-wrap ${isDirect ? 'play-video-btn' : ''}" style="width:100px; height:56px; margin:0; flex-shrink:0;" data-url="${escapeHtml(v.url)}" data-title="${escapeHtml(v.title)}" data-channel="${escapeHtml(v.channel)}" data-why="${escapeHtml(v.why_it_helps)}">
                <img src="${thumbUrl}" alt="${escapeHtml(v.title)}" class="video-card-thumb-img" loading="lazy">
                ${isDirect ? '<div class="video-play-badge" style="width:26px; height:26px; font-size:10px;">▶</div>' : ''}
              </div>` : ''
            }
            <div style="flex:1; min-width:0;">
              <div class="flex items-center gap-2 mb-1">
                <span class="badge badge-accent" style="font-size:10px;">${escapeHtml(v.category)}</span>
                ${badge}
                <span class="text-xs text-subtle">${escapeHtml(v.channel)} · ${escapeHtml(v.duration)}</span>
              </div>
              <div class="text-sm fw-600 truncate">${escapeHtml(v.title)}</div>
            </div>
          </div>
          <div class="flex gap-2 flex-shrink-0">
            ${isDirect
              ? `<button class="btn btn-primary btn-xs play-video-btn" data-url="${escapeHtml(v.url)}" data-title="${escapeHtml(v.title)}" data-channel="${escapeHtml(v.channel)}" data-why="${escapeHtml(v.why_it_helps)}">Play ▶</button>`
              : ''
            }
            <a href="${escapeHtml(v.url)}" target="_blank" rel="noopener" class="btn btn-secondary btn-xs">${isDirect ? 'YouTube ↗' : 'Search ↗'}</a>
          </div>
        </div>`;
    }

    return `
      <div class="card flex flex-col justify-between" role="listitem">
        <div>
          ${thumbUrl ? `
            <div class="video-card-thumb-wrap ${isDirect ? 'play-video-btn' : ''}" data-url="${escapeHtml(v.url)}" data-title="${escapeHtml(v.title)}" data-channel="${escapeHtml(v.channel)}" data-why="${escapeHtml(v.why_it_helps)}">
              <img src="${thumbUrl}" alt="${escapeHtml(v.title)}" class="video-card-thumb-img" loading="lazy">
              ${isDirect ? '<div class="video-play-badge">▶</div>' : ''}
              <span class="video-duration-tag">${escapeHtml(v.duration || '25m')}</span>
              <span class="video-order-tag">#${v.watch_order || 1}</span>
            </div>` : ''
          }
          <div class="flex justify-between items-start mb-2 mt-1">
            <span class="badge badge-accent" style="font-size:10px;">${escapeHtml(v.category)}</span>
            ${badge}
          </div>
          <h3 class="text-sm fw-600 mb-1" style="line-height:1.35;">${escapeHtml(v.title)}</h3>
          <div class="text-xs text-subtle mb-2">${escapeHtml(v.channel)} · ${escapeHtml(v.duration)} · ${escapeHtml(v.level)}</div>
          <p class="text-xs text-muted mb-2">${escapeHtml(v.why_it_helps)}</p>
          ${v.what_to_watch ? `<div class="text-xs text-subtle mb-3" style="font-style:italic; background:var(--bg-subtle); padding:4px 8px; border-radius:4px;">💡 ${escapeHtml(v.what_to_watch)}</div>` : ''}
        </div>
        <div class="pt-2 flex justify-between items-center" style="border-top:1px solid var(--border); gap:0.5rem;">
          <a href="skill.html?id=${encodeURIComponent(v.skill_id)}" class="chip" style="font-size:10px;">Skill Guide →</a>
          <div class="flex gap-2">
            ${isDirect
              ? `<button class="btn btn-primary btn-xs play-video-btn" data-url="${escapeHtml(v.url)}" data-title="${escapeHtml(v.title)}" data-channel="${escapeHtml(v.channel)}" data-why="${escapeHtml(v.why_it_helps)}">Play ▶</button>`
              : ''
            }
            <a href="${escapeHtml(v.url)}" target="_blank" rel="noopener" class="btn btn-secondary btn-xs">${isDirect ? 'YouTube ↗' : 'Search ↗'}</a>
          </div>
        </div>
      </div>`;
  }).join('');

  // Attach player modal trigger listeners
  container.querySelectorAll('.play-video-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openPlayer(btn.dataset.url, btn.dataset.title, btn.dataset.channel, btn.dataset.why);
    });
  });
}

function setupPlayerModal() {
  const modal = document.getElementById('video-player-modal');
  const closeBtn = document.getElementById('close-player-btn');

  closeBtn.addEventListener('click', closePlayer);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closePlayer();
  });
}

function openPlayer(url, title, channel, why) {
  const modal = document.getElementById('video-player-modal');
  const iframeContainer = document.getElementById('player-iframe-container');
  const titleEl = document.getElementById('player-modal-title');
  const channelEl = document.getElementById('player-modal-channel');
  const whyEl = document.getElementById('player-modal-why');
  const externalLink = document.getElementById('player-modal-external');

  let videoId = '';
  if (url.includes('watch?v=')) {
    videoId = url.split('watch?v=')[1].split('&')[0];
  }

  titleEl.textContent = title;
  channelEl.textContent = `Channel: ${channel}`;
  whyEl.textContent = why;
  externalLink.href = url;

  // Use privacy-friendly youtube-nocookie.com
  iframeContainer.innerHTML = `
    <iframe
      src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0"
      title="${escapeHtml(title)}"
      style="position:absolute; top:0; left:0; width:100%; height:100%; border:none;"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
    ></iframe>
  `;

  modal.classList.add('open');
}

function closePlayer() {
  const modal = document.getElementById('video-player-modal');
  const iframeContainer = document.getElementById('player-iframe-container');
  iframeContainer.innerHTML = ''; // Destroy iframe to halt playback
  modal.classList.remove('open');
}

main();
