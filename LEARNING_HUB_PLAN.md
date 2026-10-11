# Learning Hub Expansion Plan — LEARNING_HUB_PLAN.md

## 1. Objectives & Architectural Extension
The goal is to turn "AI Engineer Roadmap" into an all-in-one, self-contained personal learning hub for a 16-week journey (2 hours/day) towards AI Engineer / AI Application Engineer / AI Agent Engineer roles.

We extend the existing production site without rewriting or breaking what is already functioning.

---

## 2. Skill Catalogue Architecture (38 Core Skills)

Mapped across Months 1-4 and the 16 Roadmap Weeks.

### Month 1: AI Tools, GenAI & Prompting (Weeks 1–4)
1. `ai-tools-assistants`: AI tools and assistants (ChatGPT, Claude, Gemini, Cursor, Copilot) [Week 1]
2. `research-verification`: Research with AI and verifying claims (Perplexity, NotebookLM, hallucination defense) [Week 1]
3. `prompt-engineering`: Prompt engineering (system prompts, few-shot, decomposition, CoT) [Week 2]
4. `llm-fundamentals`: LLM fundamentals (tokens, context windows, sampling parameters) [Week 3]
5. `transformer-intuition`: Transformer & model intuition (attention, feedforward, positional encodings conceptual) [Week 3]
6. `embeddings-semantic-search`: Embeddings and semantic search (vector geometry, similarity metrics) [Week 3]
7. `model-apis`: Model APIs (OpenAI, Anthropic SDKs, async calls, client lifecycle) [Week 4]
8. `structured-outputs`: Structured outputs with Pydantic (schema enforcement, instructor, JSON mode) [Week 4]
9. `fastapi-backend`: FastAPI backend for AI services (/chat, schemas, streaming, async endpoints) [Week 4]
10. `streamlit-frontend`: Streamlit interactive UI (st.chat_message, session state, settings controls) [Week 4]

### Month 2: AI-Assisted Engineering & Testing (Weeks 5–8)
11. `coding-agents`: Coding agents & AI-assisted development (Claude Code, Cursor, Aider, context steering) [Week 5]
12. `requirements-specs`: Writing requirements, PRDs & acceptance criteria (spec-driven development) [Week 6]
13. `reading-code`: Reading and reverse-engineering unfamiliar codebases (AST, topology, call graphs) [Week 6]
14. `systematic-debugging`: Systematic debugging & root-cause analysis (tracebacks, minimal repros) [Week 7]
15. `pytest-httpx`: Automated testing with pytest and HTTPX (async client, test suites) [Week 7]
16. `mocking-apis`: Mocking external model APIs (pytest-mock, respx, offline determinism) [Week 7]
17. `git-workflows`: Git workflows, branches, semantic commits & PRs (trunk-based, hygiene) [Week 8]
18. `code-review`: AI-assisted code review (security, performance, maintainability rubrics) [Week 8]

### Month 3: LLM Applications, RAG & Agents (Weeks 9–12)
19. `rag-architecture`: RAG architecture & pipelines (retrieval-augmented generation, citation grounding) [Week 9]
20. `vector-search-chunking`: Vector search, vector DBs (Chroma/Qdrant) & chunking strategies [Week 9]
21. `tool-calling`: Tool calling and function calling (JSON Schema, dispatcher, parameter validation) [Week 10]
22. `agent-loop`: The autonomous agent loop (ReAct, multi-step execution, termination criteria) [Week 10]
23. `agent-frameworks`: Agent frameworks (OpenAI Agents SDK primary, LangGraph/CrewAI overview) [Week 10]
24. `state-memory-orchestration`: State, conversation memory & orchestration (sliding window, checkpoints) [Week 11]
25. `mcp-protocol`: Model Context Protocol (MCP architecture, custom clients and servers) [Week 11]
26. `hitl-approval`: Human-in-the-loop (HITL) approval gates & security boundaries [Week 11]
27. `eval-benchmarking`: Evaluation of LLM apps and agents (offline datasets, assertions, LLM-as-judge) [Week 12]

### Month 4: Production, Security & Career (Weeks 13–16)
28. `observability-logging`: Structured logging, tracing & observability (trace_id, OpenTelemetry, metrics) [Week 14]
29. `prompt-injection-security`: Prompt injection & AI security (OWASP Top 10 for LLMs, red-teaming) [Week 13]
30. `docker-containers`: Docker multi-stage builds & containerization for Python AI services [Week 15]
31. `github-actions-ci`: GitHub Actions CI pipelines (automated linting, tests, security scans) [Week 15]
32. `cloud-deployment`: Cloud deployment basics (Render, Fly.io, Railway, environment secrets) [Week 15]
33. `readme-portfolio`: Writing high-impact READMEs, video demos & portfolios [Week 16]
34. `ai-interview-prep`: AI technical interview preparation (architectural defense, tradeoffs) [Week 16]
35. `dsa-alongside`: DSA alongside practice plan (arrays, pointers, trees, graphs, DP in 40-min blocks) [Weeks 1–16]
36. `system-design-ai`: System design basics for AI applications (latency, cost, caching, queues) [Weeks 12, 16]
37. `resume-github-profile`: Resume and GitHub profile optimization for AI internships and junior roles [Week 16]
38. `evaluation-metrics-telemetry`: Latency, token economics, cost budgets & SLA guarantees [Weeks 3, 12, 14]

*(Note: Data Analysis, ML fundamentals, and Data Engineering stay on the `later.html` page as requested).*

---

## 3. Data Schema Specifications

### `data/skills.json`
Every skill item has all 12 mandatory sections:
1. `id`: slug string (e.g. `rag-architecture`)
2. `title`: human-readable skill title
3. `month`: number (1-4)
4. `weeks`: array of week numbers
5. `why_it_matters`: 2-3 specific sentences for AI Engineer / AI Agent Engineer roles
6. `prerequisites`: array of skill IDs (e.g. `["model-apis", "embeddings-semantic-search"]`)
7. `learning_path`: array of ordered sub-topics (beginner to job-ready) with one-line explanation
8. `how_to_learn`: day-by-day/session-by-session method with estimated hours, what to read/watch first, what to build, and when to stop studying
9. `where_to_learn`: structured object `{ official_docs: [...], courses: [...], articles: [...], repos: [...] }`
10. `practice_exercises`: 3-5 exercises of increasing difficulty with clear acceptance criteria
11. `mini_project`: deliverable name, description, and exact connection to the flagship Personal AI Assistant
12. `proof_of_skill`: criteria that must be demonstrated/explained without notes before ticking complete
13. `common_mistakes`: array of 3-5 common errors and specific mitigations
14. `interview_questions`: array of 8-10 questions with short model answer outlines

### `data/videos.json`
Array of verified videos with strict oEmbed verification:
- `id`: unique ID (e.g. `v001`)
- `skill_id`: reference to skill ID
- `title`: exact video title from YouTube
- `channel`: exact channel name
- `url`: full `https://www.youtube.com/watch?v=...` URL or playlist URL
- `type`: `tutorial` | `crash course` | `deep dive` | `talk` | `playlist` | `course`
- `level`: `beginner` | `intermediate` | `advanced`
- `duration`: human readable (e.g. `1h 42m`, `18m`)
- `published`: year or date
- `language`: `English` | `Hindi` | `Telugu`
- `watch_order`: number (1, 2, 3...)
- `category`: `Start here` | `Core tutorials` | `Deep dives` | `Official talks` | `Optional extras`
- `why_it_helps`: specific technical reason to watch this
- `what_to_watch`: chapters/timestamps guidance (e.g. "Focus on 12:00 - 45:00")
- `prerequisites`: string notes
- `verified`: boolean (true if verified via oEmbed)
- `verified_at`: ISO date string (e.g. `2026-10-11`)
- `notes`: extra context or "check against current docs" flags

### `data/channels.json`
Recommended creators and official channels by category.

---

## 4. New & Updated Site Pages
1. `skills.html`: Skills index page with search and multi-filtering (Month, Week, Level, Status: Not started, Learning, Practising, Proven).
2. `skill.html?id=<skill_id>`: Dedicated skill view with all 12 sections, video cards grouped by category, practice checkboxes, notes editor, and print-friendly mode (`@media print`).
3. `today.html`: Dynamic "Today" dashboard driven by study start date — showing today's week tasks, recommended videos to watch today, exercises, and spaced repetition review prompts.
4. `revision.html` & Spaced Repetition: After a skill is marked proven, triggers reminders at 1, 7, and 30 days.
5. `weekly-review.html`: Weekly retro dashboard showing completed tasks, hours logged vs planned, and interactive SVG completion chart.
6. `stuck.html`: Systematic 5-step triage procedure when blocked (Reproduce -> Docs -> Search -> AI prompt -> Human) + prompt launcher.
7. `channels.html`: Directory of top creators, official channels, and documentation hubs.
8. `how-to-watch.html`: Strategic video learning guide (1.25x-1.5x speed, active build-along, no passive binge-watching).

---

## 5. Verification & Testing Protocol
- `verify_videos.py`: Queries `https://www.youtube.com/oembed?url=...` for every video, validates exact channel and title, updates `verified` and `verified_at`, writes `VIDEO_VERIFICATION_REPORT.md`.
- `test_hub_integrity.py`: Automated tests checking:
  - All 38 skills have all 12 mandatory sections.
  - Every video has all required fields and `verified=true` only if `verified_at` is set.
  - Zero duplicate video URLs.
  - Every skill is linked to valid roadmap weeks.
  - Internal skill prerequisite links resolve.
  - LocalStorage save/load routines function with empty/corrupt storage.
