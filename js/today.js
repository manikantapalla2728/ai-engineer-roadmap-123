import {
  fetchData, escapeHtml, showToast,
  loadProgress, setProgress, getSpacedRepetitionReminders
} from './app.js';
import { initAppShell } from './shell.js';

initAppShell('today');

let timerInterval = null;
let currentStageIndex = 0;
const stages = [
  { name: '15m Learn Concepts', durationSec: 15 * 60, id: 'stage-learn' },
  { name: '60m Hands-on Build', durationSec: 60 * 60, id: 'stage-build' },
  { name: '30m Verify & Test', durationSec: 30 * 60, id: 'stage-verify' },
  { name: '15m Record & Commit', durationSec: 15 * 60, id: 'stage-record' }
];
let secondsRemaining = stages[0].durationSec;
let soundEnabled = false;

async function main() {
  let roadmap, skills, videos;
  try {
    [roadmap, skills, videos] = await Promise.all([
      fetchData('data/roadmap.json'),
      fetchData('data/skills.json'),
      fetchData('data/videos.json')
    ]);
  } catch (err) {
    console.error('Failed to load datasets:', err);
    return;
  }

  setupFocusTimer();
  setupStartDateControls();
  renderSpacedRepetition(skills);
  renderTodaySchedule(roadmap, skills, videos);
}

function setupFocusTimer() {
  const display = document.getElementById('timer-display');
  const stageName = document.getElementById('current-block-name');
  const startBtn = document.getElementById('timer-start-btn');
  const pauseBtn = document.getElementById('timer-pause-btn');
  const skipBtn = document.getElementById('timer-skip-btn');
  const resetBtn = document.getElementById('timer-reset-btn');
  const soundToggle = document.getElementById('timer-sound-toggle');

  function updateDisplay() {
    const mins = Math.floor(secondsRemaining / 60);
    const secs = secondsRemaining % 60;
    display.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function updateStageUI() {
    stageName.textContent = `Session Block: ${stages[currentStageIndex].name}`;
    document.querySelectorAll('.timer-stage-pill').forEach((pill, idx) => {
      pill.style.background = idx === currentStageIndex ? 'var(--accent-subtle)' : 'var(--surface)';
      pill.style.borderColor = idx === currentStageIndex ? 'var(--accent-border)' : 'var(--border)';
    });
  }

  function playChime() {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.2);
    } catch {}
  }

  startBtn.addEventListener('click', () => {
    if (timerInterval) return;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    timerInterval = setInterval(() => {
      if (secondsRemaining > 0) {
        secondsRemaining--;
        updateDisplay();
      } else {
        clearInterval(timerInterval);
        timerInterval = null;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        playChime();
        showToast(`Completed: ${stages[currentStageIndex].name}!`);
        // Advance stage
        currentStageIndex = (currentStageIndex + 1) % stages.length;
        secondsRemaining = stages[currentStageIndex].durationSec;
        updateStageUI();
        updateDisplay();
      }
    }, 1000);
  });

  pauseBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    timerInterval = null;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
  });

  skipBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    timerInterval = null;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    currentStageIndex = (currentStageIndex + 1) % stages.length;
    secondsRemaining = stages[currentStageIndex].durationSec;
    updateStageUI();
    updateDisplay();
    showToast('Skipped to next session block');
  });

  resetBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    timerInterval = null;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    secondsRemaining = stages[currentStageIndex].durationSec;
    updateDisplay();
  });

  soundToggle.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundToggle.textContent = `Chime: ${soundEnabled ? 'On' : 'Off'}`;
    showToast(soundEnabled ? 'Timer chime enabled' : 'Timer chime muted');
  });

  updateStageUI();
  updateDisplay();
}

function setupStartDateControls() {
  const p = loadProgress();
  const startDate = (p.root || {}).startDate || null;
  const displayEl = document.getElementById('display-start-date');
  const inputEl = document.getElementById('today-start-input');

  if (startDate) {
    displayEl.textContent = new Date(startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    inputEl.value = startDate;
  } else {
    displayEl.textContent = 'Not configured';
  }

  document.getElementById('save-today-start').addEventListener('click', () => {
    const val = inputEl.value;
    if (!val) { showToast('Please select a date'); return; }
    setProgress('root', 'startDate', val);
    displayEl.textContent = new Date(val).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    showToast('Start date saved! Updating plan…');
    setTimeout(() => location.reload(), 500);
  });
}

function renderSpacedRepetition(skills) {
  const container = document.getElementById('revisions-container');
  const reminders = getSpacedRepetitionReminders();

  if (reminders.length === 0) {
    return; // Leave default empty state
  }

  container.innerHTML = reminders.map(r => {
    const sObj = skills.find(s => s.id === r.skillId);
    const title = sObj ? sObj.title : r.skillId;
    return `
      <div class="card card-sm mb-2 flex justify-between items-center" style="border-left:4px solid var(--accent);">
        <div>
          <span class="badge badge-accent mb-1">${r.interval}-Day Recall Review</span>
          <div class="fw-600 text-sm">${escapeHtml(title)}</div>
          <div class="text-xs text-muted">Review proof of skill, architecture tradeoffs, and key failure modes.</div>
        </div>
        <a href="skill.html?id=${encodeURIComponent(r.skillId)}" class="btn btn-secondary btn-xs">Open Review →</a>
      </div>`;
  }).join('');
}

function renderTodaySchedule(roadmap, skills, videos) {
  const p = loadProgress();
  const startDate = (p.root || {}).startDate || null;
  const taskContainer = document.getElementById('today-task-card');
  const vidsContainer = document.getElementById('today-videos');
  const exContainer = document.getElementById('today-exercises');

  if (!startDate) {
    taskContainer.innerHTML = `
      <div class="card card-sm text-sm text-muted">
        Set your <strong>Active Study Phase Start Date</strong> above to calculate today's exact week and 2-hour task!
      </div>`;
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const daysSinceStart = Math.floor((today - start) / 86400000);

  if (daysSinceStart < 0) {
    taskContainer.innerHTML = `
      <div class="card card-sm text-sm text-muted">
        Your active 16-week study period starts in ${Math.abs(daysSinceStart)} days. Review the <strong>Later</strong> page or Deep Learning materials in the meantime!
      </div>`;
    return;
  }

  const weekIdx = Math.min(Math.floor(daysSinceStart / 7), 15);
  const dayInWeek = (daysSinceStart % 7) + 1; // 1 to 7

  const allWeeks = roadmap.months.flatMap(m => m.weeks);
  const currentWeek = allWeeks[weekIdx];

  if (!currentWeek) {
    taskContainer.innerHTML = `<div class="card card-sm text-success fw-600">🎉 Congratulations! You have completed all 16 weeks of the AI Engineer Roadmap!</div>`;
    return;
  }

  const todayTask = currentWeek.days.find(d => d.day === dayInWeek);
  const tasksProgress = p.tasks || {};
  const isDone = !!tasksProgress[`w${currentWeek.id}d${dayInWeek}`];

  // Render Task Card
  taskContainer.innerHTML = `
    <div class="card" style="border-left: 4px solid var(--accent);">
      <div class="flex justify-between items-start mb-2">
        <div>
          <span class="badge badge-accent">Week ${currentWeek.id} · Day ${dayInWeek}</span>
          <h2 style="font-size:1.15rem; margin-top:0.35rem;">${escapeHtml(todayTask.title)}</h2>
        </div>
        <label class="checkbox-label">
          <input type="checkbox" id="today-task-toggle" ${isDone ? 'checked' : ''}>
          <span class="text-xs fw-600">${isDone ? 'Completed ✓' : 'Mark Done'}</span>
        </label>
      </div>
      <div class="text-sm mb-3"><strong>What to do (60m):</strong> ${escapeHtml(todayTask.what)}</div>
      <div class="card card-sm mb-2" style="background:var(--surface-alt)">
        <div class="text-xs"><strong>Produce:</strong> ${escapeHtml(todayTask.produce)}</div>
        <div class="text-xs mt-1"><strong>How to check (30m):</strong> ${escapeHtml(todayTask.check)}</div>
      </div>
      <div class="flex justify-between items-center pt-2 text-xs text-muted" style="border-top:1px solid var(--border);">
        <span>Week Goal: ${escapeHtml(currentWeek.goal)}</span>
        <a href="week.html?w=${currentWeek.id}" class="text-accent fw-600">Open Week ${currentWeek.id} →</a>
      </div>
    </div>`;

  document.getElementById('today-task-toggle').addEventListener('change', (e) => {
    const key = `w${currentWeek.id}d${dayInWeek}`;
    try {
      const fresh = JSON.parse(localStorage.getItem('aier_progress') || '{}');
      if (!fresh.tasks) fresh.tasks = {};
      fresh.tasks[key] = e.target.checked;
      localStorage.setItem('aier_progress', JSON.stringify(fresh));
      showToast(e.target.checked ? 'Day completed ✓' : 'Task unchecked');
    } catch {}
  });

  // Find relevant skills for this week
  const weekSkills = skills.filter(s => (s.weeks || []).includes(currentWeek.id));
  const weekSkillIds = weekSkills.map(s => s.id);

  // Render Videos
  const weekVideos = videos.filter(v => weekSkillIds.includes(v.skill_id) && (v.category === 'Start here' || v.category === 'Core tutorials')).slice(0, 3);

  if (weekVideos.length > 0) {
    vidsContainer.innerHTML = weekVideos.map(v => `
      <div class="video-card">
        <span class="badge badge-accent" style="font-size:0.65rem;">${escapeHtml(v.category)}</span>
        <a href="${escapeHtml(v.url)}" target="_blank" rel="noopener" class="text-sm fw-600 text-accent" style="line-height:1.3;">
          ${escapeHtml(v.title)}
        </a>
        <span class="text-xs text-subtle">${escapeHtml(v.channel)} · ${escapeHtml(v.duration)}</span>
        <p class="text-xs text-muted mt-1">${escapeHtml(v.why_it_helps)}</p>
      </div>
    `).join('');
  } else {
    vidsContainer.innerHTML = `<p class="text-sm text-muted">Focus on today's hands-on building tasks.</p>`;
  }

  // Render Exercises
  const exercises = weekSkills.flatMap(s => (s.practice_exercises || []).map(ex => ({ ...ex, skillTitle: s.title, skillId: s.id }))).slice(0, 2);

  if (exercises.length > 0) {
    exContainer.innerHTML = exercises.map(ex => `
      <div class="exercise-box mb-2">
        <div class="flex justify-between items-center mb-1">
          <strong class="text-sm">${escapeHtml(ex.title)}</strong>
          <a href="skill.html?id=${encodeURIComponent(ex.skillId)}" class="chip" style="font-size:0.7rem;">${escapeHtml(ex.skillTitle)}</a>
        </div>
        <p class="text-xs text-muted mb-1">${escapeHtml(ex.task)}</p>
        <div class="text-xs text-subtle"><strong>Check:</strong> ${escapeHtml(ex.acceptance_criteria)}</div>
      </div>
    `).join('');
  } else {
    exContainer.innerHTML = `<p class="text-sm text-muted">Complete the deliverables in today's 2-hour task.</p>`;
  }
}

main();
