# DiffWarden — the midnight review room

A local-first, Halloween-themed code-diff review aid, created for Kiroween 2026's
Costume Contest. Paste a unified diff, inspect explainable added-line patterns,
record what you reviewed and export a source-snippet-free Markdown report.

**Status:** working source prototype with 17 automated engine tests. Kiro account
authentication and substantive Kiro contributions, browser QA, public judge
access, public GitHub publication, demo recording and Devpost submission remain
unverified. This repository is not evidence of a completed competition entry.

## Run

Requires Node.js 22+. No npm dependencies or runtime services.

```sh
npm test
npm run check
npm run dev
```

Open http://127.0.0.1:4337. The initial screen uses a clearly labeled synthetic
sample. Load another case, or paste the output of `git diff --no-ext-diff`.

## Workflow

1. Paste or import a unified text diff (up to 250,000 characters).
2. Inspect added lines and review high, medium and low pattern matches.
3. Read the location, reason, next step and source documentation.
4. Record a note and mark a signal reviewed. This does not change any code.
5. Export the review as Markdown. It omits source snippets but includes file
   paths and notes; inspect those before sharing.

Input, findings and notes stay in memory. Editing or clearing the input,
rescanning or refreshing clears the current review. The app makes no runtime
network requests, sets no cookies and uses no browser persistence. Loading the
website itself still involves requests to its hosting provider. Opening an
external documentation reference navigates to that reference's provider.

## Scope

Nine line-based checks cover dynamic evaluation, HTML sinks, shell commands,
TLS verification bypass, single-line unscoped SQL DELETE, skipped/focused tests,
empty catch blocks, unfinished-work markers and debugger statements. They are
heuristics, not full security analysis: benign strings can match and multiline
expressions may be missed. Removed safeguards, binaries, dependencies and
combined merge diffs need separate review. A zero finding count is not a claim
of correctness or security. Incomplete parsed hunks produce a coverage warning.

## Source layout

- `dist/`: browser-native static app and original SVG/CSS art.
- `test/`: meaningful parser, line mapping, coverage and report regressions.
- `.kiro/`: actual prepared requirements, design, task list and steering inputs.
- `docs/KIRO-USAGE.md`: honest Kiro execution status and planned real contribution.
- `docs/SUBMISSION-DRAFT.md`, `docs/DEMO-SCRIPT.md`: English entry materials.
- `.openai/hosting.json`: Sites project identity and static deployment config.

The tool was newly implemented on 2026-11-05. It does not reuse the separate
Codegeist Patchgeist project. No external assets, music, third-party runtime
libraries or paid APIs are included. MIT licensed.

## Competition sources

- [Official rules](https://kiroween.devpost.com/rules)
- [Official FAQ](https://kiroween.devpost.com/details/faqs)

Deadline: 2026-12-05 06:00 Asia/Singapore (2026-12-04 14:00 PST). The rules require
real Kiro usage, a public open-source GitHub repository with the root .kiro
directory, a functional app URL, English materials and a public YouTube demo
under three minutes. Retain the app through the judging period.
