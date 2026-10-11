/**
 * practice.js — Flashcards & active recall review bench with SM-2 style rating.
 */

import { fetchData, loadProgress, saveProgress, showToast } from './app.js';
import { initAppShell } from './shell.js';

initAppShell('practice');

let allSkills = [];
let cards = [];
let currentIndex = 0;
const FLASHCARD_STORAGE_KEY = 'aier_flashcards';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    allSkills = await fetchData('data/skills.json');
    populateTopicFilter();
    setupEventListeners();
    buildCardDeck();
    renderCurrentCard();
    renderRetentionStats();
  } catch (err) {
    console.error('Failed to init practice bench:', err);
  }
});

function populateTopicFilter() {
  const select = document.getElementById('practice-filter-topic');
  if (!select) return;

  allSkills.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = `${s.title}`;
    select.appendChild(opt);
  });
}

function buildCardDeck() {
  const topicFilter = document.getElementById('practice-filter-topic')?.value || 'all';
  const cardType = document.getElementById('practice-card-type')?.value || 'interview';

  cards = [];

  const targetSkills = topicFilter === 'all' 
    ? allSkills 
    : allSkills.filter(s => s.id === topicFilter);

  targetSkills.forEach(s => {
    if (cardType === 'interview') {
      (s.interview_questions || []).forEach((q, idx) => {
        cards.push({
          id: `${s.id}-iq-${idx}`,
          skillId: s.id,
          skillTitle: s.title,
          type: 'Interview Question',
          prompt: q.question,
          solution: q.model_answer_outline || 'Review relevant official documentation and architectural trade-offs.'
        });
      });
    } else {
      // Proof of skill
      cards.push({
        id: `${s.id}-proof`,
        skillId: s.id,
        skillTitle: s.title,
        type: 'Proof of Skill Verification',
        prompt: `Can you demonstrate or explain: ${s.title}?`,
        solution: s.proof_of_skill || 'Demonstrate hands-on execution and explain trade-offs without notes.'
      });
    }
  });

  currentIndex = 0;
  updateCounter();
}

function updateCounter() {
  const counterEl = document.getElementById('practice-counter');
  const indexLabel = document.getElementById('card-index-label');
  if (counterEl) {
    counterEl.textContent = `Card ${cards.length ? currentIndex + 1 : 0} of ${cards.length}`;
  }
  if (indexLabel) {
    indexLabel.textContent = `${cards.length ? currentIndex + 1 : 0} / ${cards.length}`;
  }
}

function renderCurrentCard() {
  const promptEl = document.getElementById('card-prompt-text');
  const subInfoEl = document.getElementById('card-sub-info');
  const tagEl = document.getElementById('card-skill-tag');
  const solutionArea = document.getElementById('card-solution-area');
  const solutionEl = document.getElementById('card-solution-text');
  const revealBtn = document.getElementById('card-reveal-btn');
  const ratingGroup = document.getElementById('card-rating-buttons');

  if (!cards.length) {
    if (promptEl) promptEl.textContent = 'No cards available for this filter.';
    if (subInfoEl) subInfoEl.textContent = '';
    if (solutionArea) solutionArea.style.display = 'none';
    if (revealBtn) revealBtn.style.display = 'none';
    if (ratingGroup) ratingGroup.style.display = 'none';
    return;
  }

  const card = cards[currentIndex];

  if (promptEl) promptEl.textContent = card.prompt;
  if (subInfoEl) subInfoEl.textContent = `${card.type} • Skill: ${card.skillTitle}`;
  if (tagEl) tagEl.textContent = card.skillTitle;
  if (solutionEl) solutionEl.textContent = card.solution;

  // Reset visibility
  if (solutionArea) solutionArea.style.display = 'none';
  if (ratingGroup) ratingGroup.style.display = 'none';
  if (revealBtn) {
    revealBtn.style.display = 'inline-block';
    revealBtn.textContent = 'Show Answer / Model Outline';
  }

  updateCounter();
}

function setupEventListeners() {
  const filterTopic = document.getElementById('practice-filter-topic');
  const filterType = document.getElementById('practice-card-type');
  const revealBtn = document.getElementById('card-reveal-btn');
  const prevBtn = document.getElementById('card-prev-btn');
  const nextBtn = document.getElementById('card-next-btn');
  const shuffleBtn = document.getElementById('practice-shuffle-btn');
  const rateBtns = document.querySelectorAll('.rate-btn');

  if (filterTopic) {
    filterTopic.addEventListener('change', () => {
      buildCardDeck();
      renderCurrentCard();
    });
  }

  if (filterType) {
    filterType.addEventListener('change', () => {
      buildCardDeck();
      renderCurrentCard();
    });
  }

  if (revealBtn) {
    revealBtn.addEventListener('click', () => {
      const solutionArea = document.getElementById('card-solution-area');
      const ratingGroup = document.getElementById('card-rating-buttons');
      if (solutionArea) solutionArea.style.display = 'block';
      if (ratingGroup) ratingGroup.style.display = 'flex';
      revealBtn.style.display = 'none';
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex--;
        renderCurrentCard();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentIndex < cards.length - 1) {
        currentIndex++;
        renderCurrentCard();
      }
    });
  }

  if (shuffleBtn) {
    shuffleBtn.addEventListener('click', () => {
      cards.sort(() => Math.random() - 0.5);
      currentIndex = 0;
      renderCurrentCard();
      showToast('Deck shuffled');
    });
  }

  rateBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const rating = btn.dataset.rate;
      recordRating(rating);
      if (currentIndex < cards.length - 1) {
        currentIndex++;
        renderCurrentCard();
      } else {
        showToast('Reached the end of the deck!');
      }
    });
  });
}

function recordRating(rating) {
  if (!cards[currentIndex]) return;
  const card = cards[currentIndex];
  const p = loadProgress();
  if (!p.flashcardRatings) p.flashcardRatings = {};

  p.flashcardRatings[card.id] = {
    rating,
    ratedAt: new Date().toISOString()
  };

  saveProgress(p);
  renderRetentionStats();
  showToast(`Recorded: ${rating.toUpperCase()}`);
}

function renderRetentionStats() {
  const p = loadProgress();
  const ratings = p.flashcardRatings || {};
  let mastered = 0;
  let review = 0;

  Object.values(ratings).forEach(r => {
    if (r.rating === 'easy' || r.rating === 'good') mastered++;
    if (r.rating === 'hard' || r.rating === 'again') review++;
  });

  const statMastered = document.getElementById('stat-mastered');
  const statReview = document.getElementById('stat-review-needed');
  const statTotal = document.getElementById('stat-total-cards');

  if (statMastered) statMastered.textContent = mastered;
  if (statReview) statReview.textContent = review;
  if (statTotal) statTotal.textContent = Object.keys(ratings).length;
}
