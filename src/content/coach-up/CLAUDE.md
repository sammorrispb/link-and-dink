# Coach Up Handbook — Authoring Contract

This directory is the **Coach Up coaching handbook** — the IP, vocabulary, frameworks, systems, flows, and values behind Link & Dink's paid coaching apprenticeship. It is content, not code. Today it is a standalone MDX handbook; a later engagement wires it into `/coach-up/learn/*` routes in the app. Author it so that future plumbing needs zero file moves.

## What this is

The apprenticeship promises apprentices a "12-week structured roadmap" and that they'll "know what week 5 looks like before you start." This directory is what makes that true. It is the curriculum an apprentice pays for and learns from.

It is **seeded from** the NGA Coaching System (`~/Projects/nga-coaching-system/`) — same structural rigor, same diagnostic spine — but NGA coaches kids 8–16 and Coach Up trains coaches of **adult** rec players. Inherit the pedagogy; re-author the application.

## Directory layout

```
src/content/coach-up/
  index.mdx            handbook landing — read-this-first orientation
  CLAUDE.md            this file
  creed/               values & philosophy — the "why" everything else cites
  frameworks/          named mental models (the Pillars, Hierarchy of Assessment, ...)
  vocabulary/          term-per-file shared language (pickleball + coaching-craft)
  systems/             repeatable operational playbooks (run an event, structure a lesson)
  flows/               step-by-step runbooks ("what to do when X")
  curriculum/          roadmap-overview + week-01..week-12 — the 12-week roadmap
  progression/         the coach progression model (the ladder, the rubric)
```

One file = one piece of content. Filenames are the slug plus `.mdx` (e.g. `the-coach-up-creed.mdx`, `term-third-shot-drop.mdx`, `week-05.mdx`).

## Frontmatter contract

Every file opens with YAML frontmatter. Author it in final shape — there is no loader or mapper layer; what you write is what the app will read.

### Base fields (every file)

```yaml
---
slug: the-coach-up-creed        # url-safe, unique within its category
title: The Coach Up Creed
category: creed                 # creed | framework | vocabulary | system | flow | week | progression
summary: One or two sentences.  # teaser + future meta description
order: 1                        # sort order within the category
status: published               # published | draft  (draft = excluded from prod builds later)
related:                        # optional cross-links, as "category/slug"
  - framework/the-coach-up-pillars
  - creed/operating-principles
updated: 2026-05-14             # ISO date, last meaningful edit
---
```

### Per-category additions

**vocabulary** — adds:
```yaml
coachingCue: The one-liner a coach actually says or thinks on court.
tier: fundamentals             # fundamentals | intermediate | advanced | methodology | business
aliases:                       # optional alternate names, for future search
  - ATP
```

**framework** — adds:
```yaml
steps:                         # optional; only if the framework is sequential
  - Intent
  - Outcome
  - Technique
  - Tactics
```

**system** — adds:
```yaml
appliesTo:                     # one or more of: event | lesson | clinic
  - event
```

**flow** — adds:
```yaml
trigger: After every event you run.   # the condition that kicks off the flow
```

**week** (curriculum/week-NN.mdx) — adds:
```yaml
week: 5                        # 1–12
phase: reps                    # foundation (wk 1–3) | reps (wk 4–9) | ownership (wk 10–12)
focus: First 1:1 lesson.       # the headline for the week
objectives:                    # checklist-able outcomes for the apprentice
  - Run a full 1:1 lesson observed by Sam.
teaches:                       # slugs of vocab/framework/system content covered this week
  - framework/hierarchy-of-assessment
  - system/structure-a-1-1-lesson
```

**progression** — adds:
```yaml
tier: coach                    # apprentice | coach | lead-coach | master-track  (omit for non-tier docs)
```

## Cross-linking

`related` and `teaches` hold slug strings in `category/slug` form. Every referenced slug must resolve to a real file — a dangling link is a defect (the future loader will fail the build on one). The `teaches` arrays in the `week-NN.mdx` files are the spine that threads the 12-week roadmap into the rest of the handbook; every framework, system, and key vocabulary term should be `teaches`-referenced by at least one week.

## Voice

Write in the Link & Dink voice — the register of `src/lib/coach-up/content.ts` and the marketing page. Plain-spoken, confident, specific. Name what things are *not* ("It's mentorship, not certification"). Short declarative sentences. No hype, no filler. Borrow NGA's structural tools — comparison tables, ASCII arc/structure diagrams, a blockquote for a mantra, an "Attribution" section when a framework derives from outside research — but keep the prose L&D-clean (sparing emoji, never manic).

Every framework that comes from research **cites its source** by name (researcher/institution). Claims are traceable, not hand-waved. See `creed/research-foundations.mdx` for the canonical reference list.

## Editing workflow

Author `.mdx` directly in this directory — no Notion round-trip (unlike the NGA handbook, the Coach Up app is itself the reading surface). Run the `brand-review` skill on prose before committing. Use `status: draft` to keep an in-progress file out of future prod builds. Keep `updated` current on meaningful edits.
