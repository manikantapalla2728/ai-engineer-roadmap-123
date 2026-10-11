# AI Engineer Roadmap — Final Deliverable Report

**Website Title:** AI Engineer Roadmap  
**Target Role:** AI Engineer / AI Application Engineer / AI Agent Engineer (Internships & Fresher)  
**Curriculum Structure:** 16 active post-exam weeks · 112 days · 2 hours/day (15 min learn, 60 min build, 30 min verify, 15 min record)  
**Repository Branch:** `build`  
**Deployment Target:** GitHub Pages (Zero build step, vanilla static architecture)

---

## 1. What Works & Key Deliverables

### A. Complete Static Website (9 Pages)
1. **Home (`index.html`)**:
   - Visual timeline: Deep Learning (7d) -> Exams (~31d) -> 16 Weeks (Active) -> Data Engineering (Later).
   - Dynamic study start date selector with persistent memory.
   - Live "Today's Tasks" widget calculating current day task based on elapsed days since start.
   - Comprehensive progress cards (Tasks completed, Weeks finished, Skills verified, Overall %).
   - Progress backup: One-click JSON Export & Import wrapped in error-tolerant `try/catch`.
2. **Roadmap (`roadmap.html`)**:
   - Collapsible Month-by-Month accordion with completion tags.
   - 16 distinct weeks with visual completion dots (7 dots per week) and DSA indicators.
   - Instant progress counts (X / 112 completed).
3. **Week Detail (`week.html?w=N`)**:
   - Dynamic query-param driven architecture (`?w=1` to `?w=16`).
   - Displays weekly goal, milestone, key concepts, deliverable, and DSA focus (3 sessions × 40 min).
   - 7 concrete daily task cards with explicit breakdown: **What to do**, **Produce**, and **How to check**.
   - Day 7 formatted as weekly catch-up, reflection, and consolidation.
   - Integrated week-filtered resources with live verified/unverified badges.
4. **Resources Library (`resources.html`)**:
   - Fast client-side search across title, topic, why_it_helps, and author.
   - Multi-parameter filtering: Topic, Type (docs, video, course, article, tool), Level (beginner, intermediate, advanced), and Week.
   - Verified links open official documentation; unverified links provide safe pre-formatted search queries.
5. **Projects (`projects.html`)**:
   - Comprehensive guide for the **Personal AI Engineering Assistant** flagship project.
   - Highlights strict security guidelines: start read-only, zero arbitrary shell commands or secret access without human approval.
   - 4 monthly evolution stages (M1 API+UI, M2 Comprehension+Review, M3 RAG+Agent, M4 Security+CI+Deploy).
   - Interactive checklist for README, tests, evals, security, and cloud deployment.
6. **Prompt Library (`prompts.html`)**:
   - 8 production-grade prompt templates: Plan Before Implementation, Explain Generated Code, Debug Systematically, Agent Security Review, RAG Grounding Audit, Prompt Injection Stress Test, Code Review Checklist, and Test Case Generation.
   - Tag filtering and 1-click clipboard copy button with visual confirmation feedback.
7. **Competency Checklist (`competency.html`)**:
   - 13 industry-standard AI Engineering skills.
   - **Evidence Gate**: Checkbox is disabled until the user enters concrete proof (link to PR, note, or test).
   - Evidence and verification status autosaved to `localStorage`.
8. **Interview Prep (`interview.html`)**:
   - 52 interview questions across 7 core topics: LLMs (10), Prompting (8), RAG (8), Agents (8), Testing (6), Security (6), Deployment (6).
   - Hints chips and autosaving answer textareas with quick clear actions.
9. **Later Page (`later.html`)**:
   - Deferred topics clearly separated: Data Engineering (next semester), Fine-tuning/RLHF, Open-Source local models, Deeper Cloud (Bedrock/Vertex), Advanced MLOps.

### B. Engineering & Quality Highlights
- **Design System**: Neutral palette (`#f8f8f6` / `#111110`), single blue accent (`#2563eb`), clean borders, system typography. No neon, glow, or heavy glassmorphism.
- **Theme Support**: Seamless Light and Dark mode with system preference detection and `localStorage` persistence.
- **Accessibility**: Skip-to-content links, semantic `<nav>`, `<main>`, `<aside>`, `<header>`, ARIA roles and labels, and visible focus rings.
- **Resilient Storage**: All `localStorage` reads and writes are wrapped in `try/catch` and gracefully handle empty states.

---

## 2. Link Verification & Resource Integrity Report

All 48 resources in `data/resources.json` follow strict integrity guidelines:
- **Zero invented or guessed URLs**.
- **13 Official Documentation URLs Verified**:
  - `https://platform.openai.com/docs/` (OpenAI Docs)
  - `https://docs.anthropic.com/` (Anthropic Claude Docs)
  - `https://ai.google.dev/docs` (Google AI Developer Docs)
  - `https://fastapi.tiangolo.com/` (FastAPI Docs)
  - `https://docs.pydantic.dev/` (Pydantic V2 Docs)
  - `https://docs.github.com/en/actions` (GitHub Actions Docs)
  - `https://docs.pytest.org/en/stable/` (pytest Docs)
  - `https://modelcontextprotocol.io/` (Model Context Protocol Docs)
  - `https://owasp.org/www-project-top-10-for-large-language-model-applications/` (OWASP LLM Top 10)
  - `https://docs.docker.com/` (Docker Docs)
- **35 Curated Search Queries**:
  - Educational YouTube tutorials, community articles, and open-source tools use targeted search links (`search_query`) rather than fragile direct links.
- **Verification Run Results (`link_report.json`)**:
  - **Total Resources:** 48
  - **Checked URLs:** 13
  - **Valid (HTTP 200):** 13
  - **Broken Links:** 0
  - **Skipped (Search Queries):** 35

---

## 3. Automated Test Suite Results

Ran two independent verification suites:
1. `python validate_data.py`:
   - Validated schema compliance, 16 weeks, exactly 112 days (7 per week), required daily fields (`day`, `title`, `what`, `produce`, `check`, `duration_min`), 48 resources, 13 skills, 52 interview questions, 8 prompts, and 4 project stages.
   - **Result:** `All checks passed ✅`
2. `python -m unittest test_site_integrity.py`:
   - 10 unit tests covering phase schema, task length, resource badge synchronization, skill evidence hints, and HTML accessibility.
   - **Result:** `Ran 10 tests in 0.014s — OK`

---

## 4. What Is Blocked or Unverified

- **Blocked:** None. All features are complete, tested, and runnable locally with zero external server dependencies.
- **Unverified Content:** All 35 resources without direct URLs are explicitly designated with `verified: false` and render with a visible `[⚠ Unverified]` badge in the UI.

---

## 5. First 5 Things You Should Review by Hand

When you return to review the website, here are the first 5 things to inspect:
1. **Set your Study Start Date on the Home Page (`index.html`)**:
   - Enter the target date your 16 active weeks start (right after exams). Confirm that the "Today's tasks" widget calculates and displays your current day's 2-hour task.
2. **Inspect Week 1 & 4 Detail Views (`week.html?w=1` and `week.html?w=4`)**:
   - Check off a few daily tasks and confirm that the week progress bar and home page counters update immediately.
3. **Test the Competency Evidence Gate (`competency.html`)**:
   - Try clicking a "Verify" button on an uncompleted skill. Notice that verification is disabled until you enter a note or link. Type sample evidence and verify that it activates and saves.
4. **Answer an Interview Question (`interview.html`)**:
   - Write a response under the "LLMs" tab. Refresh your browser and confirm that your answer is restored from `localStorage`.
5. **Verify the Resources Filter (`resources.html`)**:
   - Filter by Topic "AI Security" and Type "Docs" to view the OWASP Top 10 resource with its green verified badge, or search for "RAG" to see curated search links.
