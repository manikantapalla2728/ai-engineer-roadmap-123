# PRO_UI_PLAN.md — Premium UI & UX Redesign Architecture

## 1. Vision & Inspiration
Transform the "AI Engineer Roadmap" learning hub into a high-density, professional, calm engineering tool reflecting the aesthetics and micro-interaction standards of Linear, Notion, Vercel Docs, and Stripe Docs.

### Principles:
1. **Calm & Monochromatic with Intentional Accent:** Neutral greys with high-contrast foreground, single refined accent (`#2563eb` / `#3b82f6` blue), and muted semantic alerts. Zero neon, glow, or particle fluff.
2. **Dense, Clean Typography:** High-grade system stack with strict scale, 4px grid, 60–75ch comfortable reading measure.
3. **App Shell Architecture:** Persistent collapsible left sidebar with clean section groupings, responsive bottom drawer on mobile, top bar with breadcrumbs, command palette, keyboard shortcut trigger, and study progress indicator.
4. **Zero Emoji in UI Controls:** Dedicated inline SVG sprite system (`icons.svg` / `<svg class="icon"><use href="#..."></use></svg>`).
5. **No Broken Data or Schema Regressions:** Strict preservation of `localStorage['aier_progress']`, existing keys, schema structure, and test suites.

---

## 2. Design System & Tokens (`styles/tokens.css`)

### Color System:
- **Light Theme (`:root` / `[data-theme="light"]`)**:
  - Neutral Background: `--bg: #fbfbfa`, `--bg-subtle: #f5f5f3`, `--surface: #ffffff`, `--surface-hover: #f7f7f5`
  - Borders: `--border: #e6e6e3`, `--border-strong: #d2d2cc`, `--border-focus: #2563eb`
  - Text: `--text: #171716`, `--text-muted: #666660`, `--text-subtle: #8e8e86`
  - Accent: `--accent: #2563eb`, `--accent-hover: #1d4ed8`, `--accent-subtle: #eff6ff`, `--accent-border: #bfdbfe`
  - Semantics: `--success: #15803d`, `--warning: #b45309`, `--danger: #b91c1c`, `--info: #0369a1`
- **Dark Theme (`[data-theme="dark"]`)**:
  - Neutral Background: `--bg: #0f0f0e`, `--bg-subtle: #161615`, `--surface: #1a1a19`, `--surface-hover: #222220`
  - Borders: `--border: #2a2a27`, `--border-strong: #3d3d38`, `--border-focus: #3b82f6`
  - Text: `--text: #ededeb`, `--text-muted: #9b9b94`, `--text-subtle: #686862`
  - Accent: `--accent: #3b82f6`, `--accent-hover: #60a5fa`, `--accent-subtle: #172554`, `--accent-border: #1e40af`
  - Semantics: `--success: #22c55e`, `--warning: #f59e0b`, `--danger: #ef4444`, `--info: #38bdf8`
- **System Theme (`[data-theme="system"]`)**:
  - Auto resolves using `@media (prefers-color-scheme: dark)`.

### Typography:
- Font stacks:
  - Sans: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
  - Mono: `ui-monospace, "SFMono-Regular", "SF Mono", Consolas, "Liberation Mono", Menlo, monospace`
- Hierarchy:
  - Title XL: 28px / 34px (700)
  - Title L: 22px / 28px (600)
  - Title M: 18px / 24px (600)
  - Body: 14px / 22px (400)
  - Body Strong: 14px / 22px (600)
  - Caption: 12px / 18px (500)
  - Mono Code: 13px / 20px

### Spacing & Motion:
- Spacing 4px scale: `space-1` (4px), `space-2` (8px), `space-3` (12px), `space-4` (16px), `space-5` (20px), `space-6` (24px), `space-8` (32px), `space-10` (40px)
- Radii: `radius-xs` (3px), `radius-sm` (6px), `radius-md` (8px), `radius-lg` (12px), `radius-full` (9999px)
- Motion: `150ms cubic-bezier(0.16, 1, 0.3, 1)` with full `@media (prefers-reduced-motion: reduce)` bypass.

---

## 3. UI Component Library (`styles/components.css`)
1. **Buttons**: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-danger`, `.btn-icon`
2. **Inputs & Selects**: `.input`, `.select`, `.textarea` with focus ring tokens
3. **App Shell**: `.app-layout`, `.sidebar`, `.sidebar-nav`, `.sidebar-group`, `.topbar`, `.main-content`
4. **Cards & Badges**: `.card`, `.card-compact`, `.badge`, `.status-badge`
5. **Modal & Overlays**: `.modal-backdrop`, `.modal-dialog` (Command Palette, Help, Video Player)
6. **Code Blocks & Copy**: `.code-block`, `.copy-btn`
7. **Callouts**: `.callout`, `.callout-tip`, `.callout-warning`, `.callout-note`
8. **Feedback**: `.toast`, `.progress-ring`, `.skeleton`, `.empty-state`

---

## 4. Layout & App Shell
- Standardize all 16 pages to the unified app shell:
  - Left persistent sidebar (collapsible with toggle and persistence in storage).
  - Navigation grouped into:
    - **Core**: Dashboard (`index.html`), Today (`today.html`), Roadmap (`roadmap.html`)
    - **Curriculum**: Skills Hub (`skills.html`), Videos (`videos.html`), Projects (`projects.html`)
    - **Practice & Prep**: Practice Tracker (`practice.html`), Interview (`interview.html`), Flashcards / Quiz (`quiz.html`)
    - **Knowledge & Tools**: Notes (`notes.html`), Resources (`resources.html`), Channels (`channels.html`), Stuck? (`stuck.html`), Weekly Review (`weekly-review.html`)
    - **Settings & Backup**: Settings (`settings.html`)
  - Top bar featuring:
    - Breadcrumbs reflecting page depth.
    - Global Command Palette input trigger (`Ctrl+K`).
    - Study streak & overall completion mini-badge.
    - Theme switcher (Light / Dark / System).
    - Keyboard shortcut help (`?`).

---

## 5. New & Redesigned Pages Detail

### A. Dashboard (`index.html`) Redesign:
- Hero strip: Current week badge, overall % progress, study streak days, logged weekly hours vs plan.
- "Continue where you left off" actionable card.
- "Today" quick card with 15/60/30/15 breakdown and direct focus launcher.
- 16-Week Phase Timeline (Deep Learning -> Exams -> 16 Weeks -> Data Engineering).
- SVG Activity Heatmap (GitHub-style, 16-week grid calculated from completed day tasks and logged sessions).
- Month & Status Distribution Charts (rendered cleanly via accessible SVG).
- Interactive Skill Dependency Map (SVG graph with zoom/pan and status colors).
- Upcoming Spaced Repetition Reminders & Milestone Progress Trackers (Weeks 4, 8, 12, 14, 16).

### B. Dedicated Videos Page (`videos.html`):
- Filter by Skill, Category, Level, Duration Range, and Verification status.
- Card and compact table/list views.
- Embedded video player facade using privacy-friendly `www.youtube-nocookie.com`.
- Per-video notes with timestamps and "Mark Watched" tracking.

### C. Learning Experience Features:
- **Focus Timer (`today.html`)**: 15m Learn / 60m Build / 30m Verify / 15m Record with countdown and gentle Web Audio chime.
- **Notes Hub (`notes.html`)**: Global Markdown notes manager with live preview, search, tag filter, and JSON/Markdown export.
- **Flashcards & Quiz (`quiz.html`)**: Spaced repetition cards generated from Proof-of-Skill and Interview banks with rating (Again/Hard/Good/Easy).
- **Settings Page (`settings.html`)**: Start date, daily target hours, theme mode, storage size counter, backup reminder, and complete JSON export/import.
- **Offline PWA (`manifest.json`, `sw.js`)**: App shell caching and offline banner indicator.

---

## 6. Execution Plan
- **Phase 1**: Plan (this document), verify baseline tests.
- **Phase 2**: Design tokens, base CSS, SVG icon sprite, theme engine.
- **Phase 3**: App shell layout, sidebar, topbar, Command Palette, keyboard shortcuts.
- **Phase 4**: Redesign Dashboard with SVG charts, heatmap, and skill map.
- **Phase 5**: Redesign Skill pages with sticky TOC, reading progress, and scrollspy.
- **Phase 6**: Build dedicated Videos page with facade player and notes.
- **Phase 7**: Redesign Today page with focus timer, quiz mode, and practice tracker.
- **Phase 8**: Settings, calendar, weekly review upgrade, PWA manifest and service worker.
- **Phase 9**: Visual QA: headless Chrome captures across 360px, 768px, 1440px in light and dark mode -> `QA_REPORT.md`.
- **Phase 10**: Automated tests (`test_pro_ui.py`), README, and `PRO_UI_REPORT.md`.
