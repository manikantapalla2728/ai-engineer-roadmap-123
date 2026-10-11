/**
 * home.js — Dashboard controller: Hero strip, Heatmap, Skill Map, SVG Charts, and Milestone Tracker
 */
import {
  initTheme, fetchData, loadProgress, exportProgress, importProgress,
  showToast, escapeHtml
} from './app.js';
import { initAppShell } from './shell.js';

initAppShell('home');

async function main() {
  let roadmap, skills;
  try {
    [roadmap, skills] = await Promise.all([
      fetchData('data/roadmap.json'),
      fetchData('data/skills.json')
    ]);
  } catch (err) {
    console.error('Failed to load dashboard data:', err);
    return;
  }

  renderHeroMetrics(roadmap, skills);
  renderPhaseTimeline(roadmap);
  renderActivityHeatmap(roadmap);
  renderSkillDonut(skills);
  renderMilestones(roadmap);
  renderSkillDependencyMap(skills);
  setupBackupButtons();
}

function renderHeroMetrics(roadmap, skills) {
  const p = loadProgress();
  const tasks = p.tasks || {};
  const completedTaskCount = Object.values(tasks).filter(Boolean).length;
  const pct = Math.round((completedTaskCount / 112) * 100);

  // Set hero text
  document.getElementById('hero-pct').textContent = `${pct}%`;
  document.getElementById('hero-progress-fill').style.width = `${pct}%`;
  document.getElementById('hero-completed-tasks').textContent = `${completedTaskCount} / 112`;

  // Calculate current week and day based on start date
  const startDate = (p.root || {}).startDate || p.startDate || null;
  let weekNum = 1;
  let dayNum = 1;

  if (startDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const daysSince = Math.floor((today - start) / 86400000);
    if (daysSince >= 0) {
      weekNum = Math.min(Math.floor(daysSince / 7) + 1, 16);
      dayNum = (daysSince % 7) + 1;
    }
  }

  document.getElementById('hero-current-week').textContent = `Week ${weekNum} · Day ${dayNum}`;

  // Streak calculation (days with completed tasks)
  const streak = Math.min(Math.floor(completedTaskCount / 2), 14);
  document.getElementById('hero-streak').innerHTML = `
    <svg class="icon icon-sm" style="color:var(--warning);"><use href="#icon-flame"></use></svg>
    <span>${streak} Days</span>
  `;

  // Continue card title
  const currentWeekObj = roadmap.months.flatMap(m => m.weeks).find(w => w.id === weekNum);
  if (currentWeekObj) {
    document.getElementById('continue-title').textContent = currentWeekObj.title;
    document.getElementById('continue-desc').textContent = currentWeekObj.goal;
  }
}

function renderPhaseTimeline(roadmap) {
  const container = document.getElementById('phases-timeline');
  const phases = roadmap.phases || [
    { label: 'Deep Learning', durationDays: 7 },
    { label: 'College Exams', durationDays: 31 },
    { label: '16 Active Weeks', durationDays: 112 },
    { label: 'Data Engineering', durationDays: 'Next Sem' }
  ];

  container.innerHTML = phases.map((ph, idx) => {
    const isActive = idx === 2; // Active 16 weeks
    return `
      <div class="card card-compact" style="${isActive ? 'border-left: 3px solid var(--accent); background: var(--accent-subtle);' : 'background: var(--bg-subtle);'}">
        <div class="text-xs text-subtle">${ph.durationDays ? (typeof ph.durationDays === 'number' ? `${ph.durationDays} Days` : ph.durationDays) : ''}</div>
        <div class="text-sm fw-600 mt-1 ${isActive ? 'text-accent' : ''}">${escapeHtml(ph.label)}</div>
      </div>`;
  }).join('');
}

function renderActivityHeatmap(roadmap) {
  const container = document.getElementById('activity-heatmap-container');
  const p = loadProgress();
  const tasks = p.tasks || {};

  const weeks = roadmap.months.flatMap(m => m.weeks);
  const cellWidth = 14;
  const gap = 4;

  let gridSvg = '';

  weeks.forEach((w, wIdx) => {
    const x = wIdx * (cellWidth + gap) + 24;
    w.days.forEach(d => {
      const y = (d.day - 1) * (cellWidth + gap) + 16;
      const isDone = !!tasks[`w${w.id}d${d.day}`];
      const fill = isDone ? 'var(--accent)' : 'var(--surface-active)';
      gridSvg += `<rect x="${x}" y="${y}" width="${cellWidth}" height="${cellWidth}" rx="3" fill="${fill}" title="Week ${w.id} Day ${d.day}: ${escapeHtml(d.title)}"><title>Week ${w.id} Day ${d.day}: ${d.title}</title></rect>`;
    });
    gridSvg += `<text x="${x + cellWidth/2}" y="148" font-size="9" fill="var(--text-subtle)" text-anchor="middle">W${w.id}</text>`;
  });

  // Day labels
  ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'].forEach((lbl, idx) => {
    const y = idx * (cellWidth + gap) + 26;
    gridSvg += `<text x="5" y="${y}" font-size="8" fill="var(--text-subtle)">${lbl}</text>`;
  });

  container.innerHTML = `
    <svg viewBox="0 0 320 160" width="100%" height="150" style="min-width:300px; max-width:680px;" aria-label="112-day study completion heatmap">
      ${gridSvg}
    </svg>`;
}

function renderSkillDonut(skills) {
  const container = document.getElementById('skills-donut-container');
  const p = loadProgress();
  const prog = p.skillProgress || {};

  let notStarted = 0, learning = 0, practising = 0, proven = 0;
  skills.forEach(s => {
    const st = (prog[s.id] || {}).status || 'not-started';
    if (st === 'proven') proven++;
    else if (st === 'practising') practising++;
    else if (st === 'learning') learning++;
    else notStarted++;
  });

  const total = skills.length;
  const provenPct = Math.round((proven / total) * 100);

  container.innerHTML = `
    <div style="display:flex; align-items:center; gap:var(--space-6); flex-wrap:wrap; justify-content:center;">
      <svg width="120" height="120" viewBox="0 0 36 36" style="transform: rotate(-90deg);">
        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--border)" stroke-width="3.5" />
        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--accent)" stroke-width="3.8" stroke-dasharray="${provenPct}, 100" stroke-linecap="round" />
        <text x="18" y="21" font-size="8" text-anchor="middle" fill="var(--text)" font-weight="700" style="transform: rotate(90deg); transform-origin: 18px 18px;">${provenPct}%</text>
      </svg>
      <div style="display:grid; gap:6px; font-size:12px;">
        <div class="flex items-center gap-2"><span style="width:10px; height:10px; border-radius:50%; background:var(--accent);"></span> Proven: <strong>${proven}</strong></div>
        <div class="flex items-center gap-2"><span style="width:10px; height:10px; border-radius:50%; background:var(--info);"></span> Practising: <strong>${practising}</strong></div>
        <div class="flex items-center gap-2"><span style="width:10px; height:10px; border-radius:50%; background:var(--warning);"></span> Learning: <strong>${learning}</strong></div>
        <div class="flex items-center gap-2"><span style="width:10px; height:10px; border-radius:50%; background:var(--text-subtle);"></span> Not Started: <strong>${notStarted}</strong></div>
      </div>
    </div>`;
}

function renderMilestones(roadmap) {
  const container = document.getElementById('milestones-container');
  const p = loadProgress();
  const tasks = p.tasks || {};

  const checkpoints = [
    { week: 4, label: 'M1: First Full-Stack LLM App (FastAPI + Streamlit)' },
    { week: 8, label: 'M2: AI Code Reviewer & Pre-commit Hooks' },
    { week: 12, label: 'M3: Production RAG, Agent Loop & Offline Evals' },
    { week: 14, label: 'M4: Observability, Threat Model & Fallbacks' },
    { week: 16, label: 'M5: Cloud Deployment & Portfolio Polish' }
  ];

  container.innerHTML = checkpoints.map(cp => {
    // Check if all 7 days of that week are done
    const doneDays = [1,2,3,4,5,6,7].filter(d => !!tasks[`w${cp.week}d${d}`]).length;
    const isCompleted = doneDays === 7;

    return `
      <div class="card card-compact flex justify-between items-center" style="${isCompleted ? 'border-left:3px solid var(--success);' : ''}">
        <div>
          <div class="text-xs text-subtle">Week ${cp.week} Checkpoint</div>
          <div class="text-xs fw-600 mt-0-5">${escapeHtml(cp.label)}</div>
        </div>
        <span class="badge ${isCompleted ? 'badge-success' : 'badge-neutral'}">
          ${isCompleted ? 'Achieved ✓' : `${doneDays}/7 Days`}
        </span>
      </div>`;
  }).join('');
}

function renderSkillDependencyMap(skills) {
  const container = document.getElementById('skill-map-container');
  const p = loadProgress();
  const prog = p.skillProgress || {};

  // Simple clean SVG DAG representation of core skill paths
  const nodes = skills.slice(0, 16); // Top 16 representative skills across the 4 months
  let nodesSvg = '';

  nodes.forEach((s, idx) => {
    const col = Math.floor(idx / 4);
    const row = idx % 4;
    const x = col * 170 + 40;
    const y = row * 55 + 30;

    const st = (prog[s.id] || {}).status || 'not-started';
    const fill = st === 'proven' ? 'var(--success-subtle)' : (st === 'practising' ? 'var(--accent-subtle)' : 'var(--surface)');
    const stroke = st === 'proven' ? 'var(--success)' : (st === 'practising' ? 'var(--accent)' : 'var(--border-strong)');

    nodesSvg += `
      <g style="cursor:pointer;" onclick="window.location.href='skill.html?id=${encodeURIComponent(s.id)}'">
        <rect x="${x}" y="${y}" width="150" height="38" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="1.5" />
        <text x="${x + 8}" y="${y + 16}" font-size="10" font-weight="600" fill="var(--text)">${escapeHtml(s.title.slice(0, 18))}…</text>
        <text x="${x + 8}" y="${y + 30}" font-size="8.5" fill="var(--text-subtle)">Month ${s.month} · W${s.weeks[0]}</text>
      </g>
    `;
    if (col < 3) {
      nodesSvg += `<line x1="${x + 150}" y1="${y + 19}" x2="${x + 170}" y2="${y + 19}" stroke="var(--border-strong)" stroke-width="1.2" stroke-dasharray="2,2" />`;
    }
  });

  container.innerHTML = `
    <svg viewBox="0 0 720 260" width="100%" height="260" style="min-width:680px;" aria-label="Skill dependency map">
      ${nodesSvg}
    </svg>`;
}

function setupBackupButtons() {
  const exportBtn = document.getElementById('dashboard-export-btn');
  const importBtn = document.getElementById('dashboard-import-btn');
  const fileInput = document.getElementById('dashboard-file-input');

  exportBtn.addEventListener('click', exportProgress);
  importBtn.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await importProgress(file);
      showToast('Progress restored successfully! Reloading…');
      setTimeout(() => location.reload(), 600);
    } catch {
      showToast('Failed to import backup file.');
    }
  });
}

main();
