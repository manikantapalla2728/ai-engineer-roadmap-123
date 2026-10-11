# Decisions Log

## D01 — No build tool (no Vite, no npm)
**Decision:** Pure HTML/CSS/JS ES modules, served from file:// or any static server.
**Why:** Zero setup friction for the user. GitHub Pages works with no config. The site has no JSX, no TypeScript, no bundling needs. Adding Vite would require Node.js, npm install, a build step, and a dist/ folder just to serve static files.
**Trade-off:** No hot-reload during development. Use `python -m http.server 8080` instead.

## D02 — Single CSS file
**Decision:** All styles in `styles/main.css` using CSS custom properties for theming.
**Why:** The site has 9 pages with shared nav and card components. One file is simpler than component-level CSS without a build tool. Custom properties handle light/dark theming cleanly.
**Trade-off:** File will grow. Acceptable for a personal site with < 1000 lines of CSS.

## D03 — One localStorage key with namespaced sub-keys
**Decision:** All progress in one object under `'aier_progress'` key, structured as `{ tasks: {}, competency: {}, interview: {}, theme: '...' }`.
**Why:** Simpler read/write pattern. Single export/import. 5MB localStorage limit is not a concern for this data volume.
**Shortcut:** no per-key migration; if schema changes, user reimports. When to upgrade: if keys exceed 100.

## D04 — resources.json: all URLs start unverified
**Decision:** All resources have `verified: false` initially. `check_links.py` sets `verified: true` after confirming HTTP status < 400.
**Why:** Prevents shipping broken links. Honest about verification state.

## D05 — No Google Fonts, no CDN (except Tailwind in generative_ui artifacts)
**Decision:** System font stack for the main site.
**Why:** Faster load, no external dependency, no privacy concerns.

## D06 — week.html is a single dynamic page loaded with ?w=N
**Decision:** One week.html file, JS reads the `w` query param and loads that week's data from roadmap.json.
**Why:** 16 identical pages would be maintenance overhead. One page + JSON data is the YAGNI choice.

## D07 — Accent color: blue-600 (#2563eb)
**Decision:** Single accent color for links, progress bars, active states, buttons.
**Why:** Professional, accessible (4.5:1 contrast on white), not "AI-gimmicky".

## D08 — DSA alongside plan: 3 sessions × 40 min per week
**Decision:** DSA is shown as a sidebar note on each week, not a full separate page.
**Why:** The user asked for a "DSA-alongside plan" not a DSA roadmap. A note with the week's DSA focus is sufficient.
