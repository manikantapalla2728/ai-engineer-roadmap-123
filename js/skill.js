/**
 * skill.js — Dedicated Skill Guide Controller
 * Loads all 12 sections, video cards grouped by category, exercises, and local notes
 */
import {
  fetchData, escapeHtml, showToast,
  getSkillStatus, setSkillStatus, getSkillNotes, setSkillNotes
} from './app.js';
import { initAppShell } from './shell.js';

initAppShell('skills');

async function main() {
  const params = new URLSearchParams(location.search);
  const skillId = params.get('id');

  if (!skillId) {
    renderError('No skill ID specified. Please select a skill from the catalogue.');
    return;
  }

  let skills = [], videos = [];
  try {
    [skills, videos] = await Promise.all([
      fetchData('data/skills.json'),
      fetchData('data/videos.json')
    ]);
  } catch (err) {
    renderError('Failed to load skill or video datasets.');
    return;
  }

  const skill = skills.find(s => s.id === skillId);
  if (!skill) {
    renderError(`Skill "${skillId}" not found in catalogue.`);
    return;
  }

  document.title = `${skill.title} — AI Engineer Learning Hub`;

  const skillVideos = videos.filter(v => v.skill_id === skillId);
  renderSkillGuide(skill, skillVideos, skills);
}

function renderSkillGuide(skill, videos, allSkills) {
  const container = document.getElementById('skill-content');
  const status = getSkillStatus(skill.id);
  const notes = getSkillNotes(skill.id);
  const weeksLabel = (skill.weeks || []).map(w => `<a href="week.html?w=${w}" class="chip">Week ${w}</a>`).join(' ');
  const currentIndex = allSkills.findIndex(s => s.id === skill.id);
  const prevSkill = currentIndex > 0 ? allSkills[currentIndex - 1] : null;
  const nextSkill = currentIndex < allSkills.length - 1 ? allSkills[currentIndex + 1] : null;

  // Prerequisites lookup
  const prereqHtml = (skill.prerequisites && skill.prerequisites.length > 0)
    ? skill.prerequisites.map(pid => {
        const pObj = allSkills.find(s => s.id === pid);
        const pTitle = pObj ? pObj.title : pid;
        return `<a href="skill.html?id=${encodeURIComponent(pid)}" class="chip">🔗 ${escapeHtml(pTitle)}</a>`;
      }).join(' ')
    : '<span class="text-sm text-muted">None (Foundational)</span>';

  // Group videos by category
  const categories = ['Start here', 'Core tutorials', 'Deep dives', 'Official talks', 'Optional extras'];
  let videosHtml = '';

  categories.forEach(cat => {
    const catVids = videos.filter(v => v.category === cat);
    if (catVids.length > 0) {
      videosHtml += `
        <div class="video-category-header">${cat}</div>
        <div class="video-grid">
          ${catVids.map(v => renderVideoCard(v)).join('')}
        </div>`;
    }
  });

  if (!videosHtml) {
    videosHtml = `<p class="text-sm text-muted">Videos are being compiled for this topic.</p>`;
  }

  container.innerHTML = `
    <header class="page-header">
      <div class="flex items-center gap-2 mb-2 flex-wrap">
        <span class="badge badge-accent">Month ${skill.month}</span>
        ${weeksLabel}
        <select id="status-selector" class="select" style="max-width:160px; padding:0.25rem 0.5rem; font-size:0.8rem;">
          <option value="not-started" ${status === 'not-started' ? 'selected' : ''}>Not Started</option>
          <option value="learning" ${status === 'learning' ? 'selected' : ''}>Learning</option>
          <option value="practising" ${status === 'practising' ? 'selected' : ''}>Practising</option>
          <option value="proven" ${status === 'proven' ? 'selected' : ''}>Proven ✓</option>
        </select>
      </div>
      <h1>${escapeHtml(skill.title)}</h1>
      <p class="subtitle" style="font-size:1.05rem; margin-top:0.5rem;">${escapeHtml(skill.why_it_matters)}</p>
    </header>

    <!-- 1. Prerequisites -->
    <section class="card mb-6">
      <h3 class="mb-2">1. Prerequisites</h3>
      <div class="flex gap-2 flex-wrap items-center">
        ${prereqHtml}
      </div>
    </section>

    <!-- 2. Learning Path -->
    <section class="card mb-6">
      <h3 class="mb-3">2. Step-by-Step Learning Path</h3>
      <ol class="learning-path-list">
        ${(skill.learning_path || []).map((lp, i) => `
          <li class="learning-path-item">
            <div class="fw-600 text-sm">${i + 1}. ${escapeHtml(lp.subtopic)}</div>
            <div class="text-xs text-muted mt-1">${escapeHtml(lp.summary)}</div>
          </li>`).join('')}
      </ol>
    </section>

    <!-- 3. How to Learn It -->
    <section class="card mb-6">
      <h3 class="mb-3">3. Study Method & Time Allocation</h3>
      <div class="grid gap-3 mb-3 text-sm">
        <p><strong>Estimated Hours:</strong> ${skill.how_to_learn?.estimated_hours || 6} hours total (across 2-hour daily sessions)</p>
        <p><strong>Reading Priority:</strong> ${escapeHtml(skill.how_to_learn?.reading_priority || '')}</p>
        <p><strong>Building Focus:</strong> ${escapeHtml(skill.how_to_learn?.building_focus || '')}</p>
        <p><strong>When to Stop Studying & Build:</strong> ${escapeHtml(skill.how_to_learn?.when_to_stop_studying || '')}</p>
      </div>
      <div class="card card-sm" style="background:var(--surface-alt)">
        <p class="section-title">Session Breakdown</p>
        <ul style="list-style:none; display:grid; gap:0.4rem;" class="text-sm">
          ${(skill.how_to_learn?.sessions || []).map(sess => `
            <li class="flex gap-2"><span style="color:var(--accent)">→</span> ${escapeHtml(sess)}</li>
          `).join('')}
        </ul>
      </div>
    </section>

    <!-- 4. Curated Videos -->
    <section class="mb-6">
      <div class="flex items-center justify-between mb-2">
        <h3 style="margin-bottom:0;">4. Recommended Video Masterclasses</h3>
        <a href="how-to-watch.html" class="text-xs text-accent">How to watch effectively →</a>
      </div>
      <p class="text-xs text-muted mb-4">Curated in optimal watch order. Verified links open directly; search suggestions provide safe pre-formatted queries.</p>
      ${videosHtml}
    </section>

    <!-- 5. Documentation, Courses & Repos -->
    <section class="card mb-6">
      <h3 class="mb-3">5. Official Documentation & Authoritative Sources</h3>
      <div style="display:grid; gap:1rem;">
        <div>
          <span class="badge badge-accent mb-2">Official Docs</span>
          <ul style="list-style:none; display:grid; gap:0.4rem;" class="text-sm">
            ${(skill.where_to_learn?.official_docs || []).map(d => {
              const title = typeof d === 'string' ? d : (d.title || d.name || 'Documentation');
              const url = typeof d === 'string' ? `https://www.google.com/search?q=${encodeURIComponent(d + ' official documentation')}` : (d.url || '#');
              const why = typeof d === 'object' && d.why ? `: <span class="text-muted">${escapeHtml(d.why)}</span>` : '';
              return `<li>📄 <a href="${escapeHtml(url)}" target="_blank" rel="noopener" class="text-accent fw-600">${escapeHtml(title)}</a>${why}</li>`;
            }).join('')}
          </ul>
        </div>
        ${skill.where_to_learn?.courses?.length ? `
        <div class="pt-2" style="border-top:1px solid var(--border);">
          <span class="badge type-course mb-2">Courses & Tutorials</span>
          <ul style="list-style:none; display:grid; gap:0.4rem;" class="text-sm">
            ${skill.where_to_learn.courses.map(c => {
              const title = typeof c === 'string' ? c : (c.title || c.name || 'Course');
              const url = typeof c === 'string' ? `https://www.youtube.com/results?search_query=${encodeURIComponent(c)}` : (c.url || '#');
              const why = typeof c === 'object' && c.why ? `: <span class="text-muted">${escapeHtml(c.why)}</span>` : '';
              return `<li>🎓 <a href="${escapeHtml(url)}" target="_blank" rel="noopener" class="text-accent fw-600">${escapeHtml(title)}</a>${why}</li>`;
            }).join('')}
          </ul>
        </div>` : ''}
        ${skill.where_to_learn?.repos?.length ? `
        <div class="pt-2" style="border-top:1px solid var(--border);">
          <span class="badge type-tool mb-2">Code Examples & Repos</span>
          <ul style="list-style:none; display:grid; gap:0.4rem;" class="text-sm">
            ${skill.where_to_learn.repos.map(r => {
              const title = typeof r === 'string' ? r : (r.title || r.name || 'Repository');
              const url = typeof r === 'string' ? `https://github.com/search?q=${encodeURIComponent(r)}` : (r.url || '#');
              const why = typeof r === 'object' && r.why ? `: <span class="text-muted">${escapeHtml(r.why)}</span>` : '';
              return `<li>💻 <a href="${escapeHtml(url)}" target="_blank" rel="noopener" class="text-accent fw-600">${escapeHtml(title)}</a>${why}</li>`;
            }).join('')}
          </ul>
        </div>` : ''}
      </div>
    </section>

    <!-- 6. Practice Exercises -->
    <section class="card mb-6">
      <h3 class="mb-3">6. Practice Exercises</h3>
      <div style="display:grid; gap:1rem;">
        ${(skill.practice_exercises || []).map((ex, i) => `
          <div class="exercise-box">
            <div class="flex items-center justify-between mb-2">
              <strong>Exercise ${i + 1}: ${escapeHtml(ex.title)}</strong>
              <span class="chip">${escapeHtml(ex.difficulty)}</span>
            </div>
            <p class="text-sm mb-2">${escapeHtml(ex.task)}</p>
            <div class="text-xs text-muted" style="background:var(--surface); padding:0.5rem; border-radius:4px; border:1px solid var(--border);">
              <strong>Acceptance Criteria:</strong> ${escapeHtml(ex.acceptance_criteria)}
            </div>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- 7. Mini Project & Flagship Connection -->
    <section class="card mb-6" style="border-left: 4px solid var(--accent);">
      <h3 class="mb-2">7. Mini Project Deliverable</h3>
      <div class="fw-600 mb-1">${escapeHtml(skill.mini_project?.name || 'Skill Deliverable')}</div>
      <p class="text-sm text-muted mb-3">${escapeHtml(skill.mini_project?.deliverable || '')}</p>
      <div class="card card-sm" style="background:var(--accent-light);">
        <strong class="text-xs text-accent">Connection to Flagship Assistant:</strong>
        <p class="text-xs text-muted mt-1">${escapeHtml(skill.mini_project?.flagship_connection || '')}</p>
      </div>
    </section>

    <!-- 8. Proof of Skill -->
    <section class="card mb-6" style="background:var(--surface-alt);">
      <h3 class="mb-2">8. Proof of Skill (Before Ticking Complete)</h3>
      <p class="text-sm">${escapeHtml(skill.proof_of_skill)}</p>
    </section>

    <!-- 9. Common Mistakes -->
    <section class="card mb-6">
      <h3 class="mb-3">9. Common Mistakes & How to Avoid Them</h3>
      <div style="display:grid; gap:0.75rem;">
        ${(skill.common_mistakes || []).map(m => `
          <div style="padding-bottom:0.75rem; border-bottom:1px solid var(--border);">
            <div class="fw-600 text-sm text-danger">⚠️ ${escapeHtml(m.mistake)}</div>
            <p class="text-xs text-muted mt-1"><strong>Why it happens:</strong> ${escapeHtml(m.why_it_happens)}</p>
            <p class="text-xs text-success mt-1"><strong>How to avoid:</strong> ${escapeHtml(m.how_to_avoid)}</p>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- 10. Interview Questions -->
    <section class="card mb-6">
      <h3 class="mb-3">10. Interview Questions & Model Answers</h3>
      <div style="display:grid; gap:1rem;">
        ${(skill.interview_questions || []).map((iq, i) => `
          <div class="card card-sm">
            <div class="fw-600 text-sm mb-2">Q${i + 1}: ${escapeHtml(iq.question)}</div>
            <div class="text-xs text-muted" style="background:var(--surface-alt); padding:0.6rem; border-radius:4px;">
              <strong>Model Answer Outline:</strong> ${escapeHtml(iq.model_answer_outline)}
            </div>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- 11. Personal Notes Drawer -->
    <section class="notes-container mb-6" id="sec-notes">
      <h3 class="mb-2">My Personal Notes for ${escapeHtml(skill.title)}</h3>
      <p class="text-xs text-muted mb-3">Autosaved locally in your browser. Export anytime as JSON.</p>
      <textarea id="skill-notes" class="textarea" rows="6" placeholder="Document insights, gotchas, code snippets, or benchmark numbers…">${escapeHtml(notes)}</textarea>
      <div class="flex justify-between items-center mt-2">
        <span id="notes-status" class="text-xs text-muted">All changes saved locally</span>
        <button id="save-notes-btn" class="btn btn-primary btn-sm">Save Notes</button>
      </div>
    </section>

    <!-- Prev / Next Navigation Footer -->
    <div class="flex justify-between items-center pt-4 mb-8" style="border-top:1px solid var(--border);">
      ${prevSkill ? `<a href="skill.html?id=${encodeURIComponent(prevSkill.id)}" class="btn btn-secondary btn-sm">← ${escapeHtml(prevSkill.title)}</a>` : '<span></span>'}
      <a href="skills.html" class="btn btn-ghost btn-sm">All Skills</a>
      ${nextSkill ? `<a href="skill.html?id=${encodeURIComponent(nextSkill.id)}" class="btn btn-secondary btn-sm">${escapeHtml(nextSkill.title)} →</a>` : '<span></span>'}
    </div>
  `;

  // Status Selector Handler
  document.getElementById('status-selector').addEventListener('change', (e) => {
    setSkillStatus(skill.id, e.target.value);
    showToast(`Status updated to ${e.target.value}!`);
  });

  // Notes Auto-save & Button
  const notesArea = document.getElementById('skill-notes');
  const statusLabel = document.getElementById('notes-status');
  let noteTimeout;

  notesArea.addEventListener('input', () => {
    statusLabel.textContent = 'Saving…';
    clearTimeout(noteTimeout);
    noteTimeout = setTimeout(() => {
      setSkillNotes(skill.id, notesArea.value);
      statusLabel.textContent = 'Saved at ' + new Date().toLocaleTimeString();
    }, 600);
  });

  document.getElementById('save-notes-btn').addEventListener('click', () => {
    setSkillNotes(skill.id, notesArea.value);
    statusLabel.textContent = 'Saved at ' + new Date().toLocaleTimeString();
    showToast('Notes saved!');
  });
}

function renderVideoCard(v) {
  const isDirect = v.url && v.url.includes('watch?v=');
  let videoId = '';
  if (isDirect) {
    videoId = v.url.split('watch?v=')[1].split('&')[0];
  }
  const thumbUrl = v.thumbnail || (isDirect ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '');
  const badge = v.verified
    ? '<span class="badge badge-success" style="font-size:0.65rem;">✓ Verified Masterclass</span>'
    : '<span class="badge badge-neutral" style="font-size:0.65rem;">Curated Search</span>';

  return `
    <div class="video-card">
      ${thumbUrl ? `
        <a href="${escapeHtml(v.url)}" target="_blank" rel="noopener" class="video-card-thumb-wrap" style="display:block; text-decoration:none;">
          <img src="${thumbUrl}" alt="${escapeHtml(v.title)}" class="video-card-thumb-img" loading="lazy">
          <div class="video-play-badge">▶</div>
          <span class="video-duration-tag">${escapeHtml(v.duration || '25m')}</span>
          <span class="video-order-tag">#${v.watch_order || 1}</span>
        </a>` : ''
      }
      <div class="flex justify-between items-start gap-1">
        <span class="badge badge-accent" style="font-size:0.7rem;">${escapeHtml(v.category || v.type)}</span>
        ${badge}
      </div>
      <a href="${escapeHtml(v.url)}" target="_blank" rel="noopener" class="text-sm fw-600 text-accent" style="line-height:1.35;">
        ${escapeHtml(v.title)}
      </a>
      <div class="text-xs text-subtle">
        <span>${escapeHtml(v.channel)}</span> · <span>${escapeHtml(v.duration)}</span> · <span>${escapeHtml(v.level)}</span>
      </div>
      <p class="text-xs text-muted mt-1">${escapeHtml(v.why_it_helps)}</p>
      ${v.what_to_watch ? `<div class="text-xs text-subtle mt-1" style="font-style:italic; background:var(--bg-subtle); padding:4px 8px; border-radius:4px;">💡 ${escapeHtml(v.what_to_watch)}</div>` : ''}
      <div class="pt-2 mt-auto flex justify-between items-center" style="border-top:1px solid var(--border);">
        <span class="text-xs text-subtle">Step ${v.watch_order || 1}</span>
        <a href="${escapeHtml(v.url)}" target="_blank" rel="noopener" class="btn btn-primary btn-xs">
          ${isDirect ? 'Watch on YouTube ↗' : 'Search Query ↗'}
        </a>
      </div>
    </div>`;
}

function renderError(msg) {
  document.getElementById('skill-content').innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">❌</div>
      <h3>Error Loading Skill Guide</h3>
      <p>${escapeHtml(msg)}</p>
      <a href="skills.html" class="btn btn-primary mt-4">← Return to Skills Catalogue</a>
    </div>`;
}

main();
