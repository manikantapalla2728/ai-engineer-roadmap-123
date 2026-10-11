# AI Engineer Roadmap & Learning Hub

A production-quality personal learning website and complete self-contained learning hub for B.Tech CSE (AI & ML) students preparing for AI Engineer, AI Application Engineer, and AI Agent Engineer internships and fresher roles.

**16 active weeks · 2 hours/day (~224 hours) · 38 Skills · Zero backend · Deployable to GitHub Pages**

---

## 🗺 Learning Hub Navigation & Pages

| Page | Purpose |
|------|---------|
| **Home (`index.html`)** | High-level timeline, dynamic study start date, today's task, overall progress, and JSON export/import. |
| **Today (`today.html`)** | Dynamic day-by-day planner: today's 2-hour task, videos to watch (with 20m cutoff), practice exercises, and **spaced repetition recall alerts (1, 7, 30 days)**. |
| **Skills Hub (`skills.html`)** | Directory of 38 core skills searchable and filterable by month, week, level, and mastery status (Not started, Learning, Practising, Proven). |
| **Skill Guide (`skill.html?id=...`)** | Complete 12-section guide per skill: prerequisites, learning path, how to learn, video masterclasses, official docs, exercises, mini project, proof of skill, common mistakes, interview outlines, and autosaved personal notes. Features a **print-friendly view**. |
| **Roadmap (`roadmap.html`)** | Month > Week > Day collapsible accordion with completion dots and checkboxes. |
| **Week Detail (`week.html?w=N`)** | Focused 7-day breakdown for week N with concepts, deliverables, and DSA notes. |
| **Resources (`resources.html`)** | 48 curated resources, searchable and filterable with verified badges. |
| **Channels (`channels.html`)** | Directory of authoritative creators and official engineering channels (Karpathy, 3Blue1Brown, OpenAI, Anthropic, tiangolo, freeCodeCamp, etc.). |
| **How to Watch (`how-to-watch.html`)** | Strategic guide to active video learning (1.25x-1.5x speed, split-screen coding, 20m cutoff, zero binge-watching). |
| **Stuck? (`stuck.html`)** | 5-step engineering escalation ladder (Reproduce -> Docs -> Search -> AI prompt -> Human) + emergency prompt copy launcher. |
| **Weekly Review (`weekly-review.html`)** | Interactive retrospective logger and SVG 16-week study velocity chart (hours planned vs completed). |
| **Flagship Project (`projects.html`)** | 4-month evolving Personal AI Engineering Assistant project stages with checklists. |
| **Prompt Library (`prompts.html`)** | 8 copy-ready production prompts (Planning, Explaining, Debugging, Security, etc.). |
| **Competency Checklist (`competency.html`)** | 13 industry skills with mandatory evidence gate before ticking. |
| **Interview Prep (`interview.html`)** | 52 questions across 7 topics with autosaved personal answers. |
| **Later (`later.html`)** | Deferred topics (Data Engineering, Fine-tuning, Open-source local models, Cloud). |

---

## 🚀 Quick Start (Local)

No Node.js, npm, or build tooling required. Runs purely as static HTML5, CSS3, and Vanilla JavaScript (ES modules):

```bash
# Start any static server
python -m http.server 8080
# Open http://localhost:8080 in your browser
```

---

## 🌐 GitHub Pages Deployment

1. Push the `learning-hub` branch (or `main`) to your GitHub repository.
2. In GitHub, go to **Settings → Pages → Source → Deploy from branch**.
3. Select your branch and `/ (root)` folder.
4. Your website is immediately live at `https://<username>.github.io/<repo>/`.

---

## 🧪 Developer & Verification Scripts

```bash
# 1. Run full Learning Hub unit test suite (skills, videos, links, html)
python -m unittest test_hub_integrity.py

# 2. Run original roadmap & schema validation
python validate_data.py
python -m unittest test_site_integrity.py

# 3. Verify all YouTube videos via official YouTube oEmbed API
python verify_videos.py
# (Outputs VIDEO_VERIFICATION_REPORT.md)

# 4. Verify all official documentation URLs via HTTP GET
python check_links.py
# (Outputs link_report.json)
```

---

## 🛡 Security & Verification Guarantees

- **Zero Guesswork / Fake URLs**: Every resource link was verified via HTTP status checks or the official YouTube oEmbed endpoint. Videos without direct confirmed URLs use pre-formatted YouTube search queries marked `unverified`.
- **Zero Backend / Complete Privacy**: All progress, notes, interview answers, and retrospectives reside safely in your browser's `localStorage` and can be exported as a backup JSON file at any time.
