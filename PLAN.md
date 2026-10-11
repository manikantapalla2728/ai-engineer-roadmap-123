# AI Engineer Roadmap — Project Plan

## Goal
A fully static personal learning website tracking a 16-week AI Engineer study plan.
Zero backend, no API keys, deployable to GitHub Pages.

## Tech Stack
- HTML5, CSS3 (custom properties for theming), Vanilla JS ES modules
- JSON data files (no hardcoded content in HTML)
- localStorage for all progress state
- Python 3.x for check_links.py and validate_data.py (dev-time scripts only)

## Packages (dev-time only)
- `requests` — for check_links.py URL verification

## Folder Structure
```
d:\ai map\
├── index.html
├── roadmap.html
├── week.html           (loaded with ?w=N)
├── resources.html
├── projects.html
├── prompts.html
├── competency.html
├── interview.html
├── later.html
├── styles/main.css
├── js/
│   ├── app.js          (shared: nav, theme, storage)
│   ├── home.js
│   ├── roadmap.js
│   ├── week.js
│   ├── resources.js
│   ├── projects.js
│   ├── prompts.js
│   ├── competency.js
│   └── interview.js
├── data/
│   ├── roadmap.json
│   ├── resources.json
│   ├── prompts.json
│   ├── competency.json
│   ├── interview.json
│   └── projects.json
├── check_links.py
├── link_report.json    (generated)
├── validate_data.py
├── README.md
├── PLAN.md             (this file)
├── PROGRESS.md
├── DECISIONS.md
└── FINAL_REPORT.md     (written at completion)
```

## Pages
1. `index.html` — Home: timeline, progress, today's tasks
2. `roadmap.html` — Month > Week > Day accordion with checkboxes
3. `week.html?w=N` — Week detail: goal, days, concepts, resources
4. `resources.html` — Searchable, filterable library
5. `projects.html` — Flagship project stages
6. `prompts.html` — Prompt library with copy buttons
7. `competency.html` — 13-skill checklist with evidence gates
8. `interview.html` — Q&A bank with localStorage answers
9. `later.html` — Deferred topics

## Phases
1. Plan + folder skeleton
2. JSON data files
3. HTML + nav skeleton
4. CSS (light/dark, responsive)
5. Core page JS (home, roadmap, week, resources)
6. Remaining JS (projects, prompts, competency, interview)
7. Scripts (check_links.py, validate_data.py) + verification
8. README, FINAL_REPORT, polish
