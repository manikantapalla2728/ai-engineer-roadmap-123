/**
 * prompts.js — Prompt library with tag filter and copy buttons
 */
import { fetchData, showToast, escapeHtml } from './app.js';
import { initAppShell } from './shell.js';

initAppShell('prompts');

async function main() {
  let prompts;
  try {
    prompts = await fetchData('data/prompts.json');
  } catch (e) {
    document.getElementById('prompt-grid').innerHTML =
      `<div class="empty-state"><div class="empty-icon">❌</div><p>Failed to load prompts.</p></div>`;
    return;
  }

  const allTags = [...new Set(prompts.flatMap(p => p.tags || []))].sort();
  let activeTag = null;

  // Render tag filters
  const tagContainer = document.getElementById('prompt-tags');
  const allBtn = document.createElement('button');
  allBtn.className = 'tab-btn active';
  allBtn.textContent = 'All';
  allBtn.addEventListener('click', () => { activeTag = null; render(); setActive(allBtn); });
  tagContainer.appendChild(allBtn);

  allTags.forEach(tag => {
    const btn = document.createElement('button');
    btn.className = 'tab-btn';
    btn.textContent = tag;
    btn.addEventListener('click', () => {
      activeTag = tag === activeTag ? null : tag;
      render();
      setActive(activeTag ? btn : allBtn);
    });
    tagContainer.appendChild(btn);
  });

  function setActive(active) {
    tagContainer.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    active.classList.add('active');
  }

  function render() {
    const filtered = activeTag ? prompts.filter(p => (p.tags || []).includes(activeTag)) : prompts;
    renderPrompts(filtered);
  }

  render();
}

function renderPrompts(prompts) {
  const grid = document.getElementById('prompt-grid');
  grid.innerHTML = prompts.map(p => `
    <div class="prompt-card" id="prompt-${p.id}">
      <div class="prompt-card-header">
        <div>
          <div class="prompt-name">${escapeHtml(p.name)}</div>
          <div class="prompt-use-case">${escapeHtml(p.useCase)}</div>
        </div>
        <div class="flex gap-2 items-center">
          ${(p.tags || []).map(t => `<span class="chip">${escapeHtml(t)}</span>`).join('')}
          <button
            class="btn btn-secondary btn-sm copy-btn"
            data-prompt-id="${p.id}"
            aria-label="Copy prompt: ${escapeHtml(p.name)}"
          >Copy</button>
        </div>
      </div>
      <div class="prompt-body">
        <pre class="prompt-text" id="prompt-text-${p.id}">${escapeHtml(p.prompt)}</pre>
      </div>
    </div>
  `).join('');

  // Copy button handler
  grid.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.promptId;
      const textEl = document.getElementById(`prompt-text-${id}`);
      if (!textEl) return;
      const text = textEl.textContent;
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = '✓ Copied!';
        btn.classList.add('copied');
        showToast('Prompt copied to clipboard');
        setTimeout(() => {
          btn.textContent = 'Copy';
          btn.classList.remove('copied');
        }, 2000);
      } catch {
        // Fallback for environments without clipboard API
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        btn.textContent = '✓ Copied!';
        setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
        showToast('Prompt copied to clipboard');
      }
    });
  });
}

main();
