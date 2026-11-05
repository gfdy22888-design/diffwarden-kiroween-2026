# DiffWarden — submission draft, not submitted

## Category
Costume Contest — Kiroween 2026.

## Elevator pitch
Catch the things that haunt your next merge. DiffWarden is a private, browser-local
review room that turns a code diff into explainable signals and a human review.

## Inspiration
AI makes it easy to produce more code than one developer can comfortably review.
We wanted a small ritual that makes pausing and reading a change approachable,
without requiring another upload or broad repository permission. A midnight
review room makes those almost-missed details memorable.

## What it does
Paste or import a unified text diff, inspect nine added-line patterns and follow
each signal to its exact new-file line. Read the reason and next step, write a
review note, mark the signal reviewed and export a Markdown report. Three
synthetic cases make the workflow immediately testable. No account or model API
key is required to use the app, and input remains in the browser tab's memory.

## The costume
An original sage-colored ghost, orbital lines and a forest-green review desk
turn code review into a quiet ghost hunt. The hierarchy keeps actual evidence
readable. The costume supports the product's meaning: a signal asks you to look
closer, while the human reviewer decides what it means.

## How we built it
Browser ES modules, a bounded unified-diff parser, transparent pattern rules,
accessible text-based rendering and a dependency-free Node test suite. Original
SVG/CSS artwork. The initial implementation was coordinated with AI assistance.

## Kiro usage — must be completed with real evidence
An official Kiro CLI is prepared and the repository contains requirements,
design, tasks and steering. Authenticated Kiro model contributions are pending.
Replace this section with verified substantive Kiro development before entry.
Insufficient Kiro usage can disqualify the project.

## Validation and limitations
Initial parser/rule/export tests pass. Browser interaction and responsive layout
checks are pending. Rules are single-line heuristics, not verified vulnerability
detection. They can miss multiline patterns and match benign strings. Removed
safeguards and binary changes need separate review. No quantitative security
accuracy or production-use claim is made.

## Required links — pending
- Public GitHub repository with MIT license and committed .kiro directory.
- Working app URL accessible to judges.
- Real public YouTube demo under three minutes.

Do not submit this draft until the required links, actual Kiro work and browser
acceptance are verified. No private account identifiers belong in public text.
