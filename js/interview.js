/**
 * interview.js — Interview question bank with topic tabs
 * Answers autosaved to localStorage on blur
 */
import { initTheme, initNav, fetchData, showToast, escapeHtml } from './app.js';

initTheme();
initNav('interview');

async function main() {
  let questions;
  try {
    questions = await fetchData('data/interview.json');
  } catch (e) {
    document.getElementById('question-list').innerHTML =
      `<div class="empty-state"><div class="empty-icon">❌</div><p>Failed to load questions.</p></div>`;
    return;
  }

  const topics = [...new Set(questions.map(q => q.topic))];
  let activeTopic = topics[0];

  renderTabs(topics, activeTopic);
  renderQuestions(questions, activeTopic);

  document.getElementById('interview-tabs').addEventListener('click', (e) => {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;
    // Save any pending answers first
    saveAllVisible();
    activeTopic = btn.dataset.topic;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderQuestions(questions, activeTopic);
  });
}

function renderTabs(topics, active) {
  const container = document.getElementById('interview-tabs');
  container.innerHTML = topics.map(t => `
    <button
      class="tab-btn${t === active ? ' active' : ''}"
      data-topic="${escapeHtml(t)}"
      role="tab"
      aria-selected="${t === active}"
      aria-controls="question-list"
    >${escapeHtml(t)}</button>
  `).join('');
}

function loadAnswers() {
  try {
    const p = JSON.parse(localStorage.getItem('aier_progress') || '{}');
    return p.interviewAnswers || {};
  } catch { return {}; }
}

function saveAnswer(id, value) {
  try {
    const p = JSON.parse(localStorage.getItem('aier_progress') || '{}');
    if (!p.interviewAnswers) p.interviewAnswers = {};
    p.interviewAnswers[id] = value;
    localStorage.setItem('aier_progress', JSON.stringify(p));
  } catch (e) { console.warn('Save failed:', e); }
}

function saveAllVisible() {
  document.querySelectorAll('.answer-textarea').forEach(ta => {
    saveAnswer(ta.dataset.qid, ta.value);
  });
}

function renderQuestions(questions, topic) {
  const filtered = questions.filter(q => q.topic === topic);
  const answers = loadAnswers();
  const container = document.getElementById('question-list');

  if (filtered.length === 0) {
    container.innerHTML = `<div class="empty-state"><p>No questions for this topic yet.</p></div>`;
    return;
  }

  container.innerHTML = filtered.map((q, i) => `
    <div class="question-card" id="qcard-${q.id}">
      <div class="question-text">
        <span style="color:var(--fg-subtle);font-size:0.8rem;margin-right:0.5rem">${String(i + 1).padStart(2, '0')}</span>
        ${escapeHtml(q.question)}
      </div>
      ${q.hints && q.hints.length > 0 ? `
        <div class="question-hints">
          ${q.hints.map(h => `<span class="chip">💡 ${escapeHtml(h)}</span>`).join('')}
        </div>
      ` : ''}
      <div>
        <div class="question-answer-label">My answer</div>
        <textarea
          class="textarea answer-textarea"
          data-qid="${q.id}"
          placeholder="Write your answer here…"
          rows="4"
          aria-label="Answer for: ${escapeHtml(q.question)}"
        >${escapeHtml(answers[q.id] || '')}</textarea>
      </div>
      <div class="question-actions">
        <button class="btn btn-ghost btn-xs clear-btn" data-qid="${q.id}" aria-label="Clear answer">Clear</button>
      </div>
    </div>
  `).join('');

  // Autosave on blur
  container.querySelectorAll('.answer-textarea').forEach(ta => {
    ta.addEventListener('blur', () => {
      saveAnswer(ta.dataset.qid, ta.value);
    });
    // Also save on input with debounce
    let debounce;
    ta.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => saveAnswer(ta.dataset.qid, ta.value), 800);
    });
  });

  // Clear buttons
  container.querySelectorAll('.clear-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.qid;
      const ta = container.querySelector(`.answer-textarea[data-qid="${id}"]`);
      if (ta) ta.value = '';
      saveAnswer(id, '');
      showToast('Answer cleared');
    });
  });
}

main();
