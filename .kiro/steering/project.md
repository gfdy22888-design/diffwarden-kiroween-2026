---
inclusion: always
---
# DiffWarden project context

DiffWarden is a local-first Halloween code-diff review room for Kiroween 2026,
Costume Contest. All interface and submission text is English.

- Browser-native ES modules in dist/. No runtime framework or third-party service.
- Input stays in memory. No fetch, telemetry, cookies, browser storage or API keys.
- Never evaluate or execute pasted code. Render all user content as text nodes.
- Engine rules are line-based heuristics on added lines, not verified bugs.
- A review flag records a human action; it never means a vulnerability was fixed.
- Synthetic sample cases must stay clearly labeled. No invented benchmark results.
- Run npm test and npm run check after substantive engine changes.
- Support keyboard navigation, mobile layouts and reduced-motion preferences.
- Preserve source attribution and document precisely what Kiro actually did.

This steering document was prepared by the coordinating assistant. It is not
evidence that a Kiro model has executed. See docs/KIRO-USAGE.md for actual status.
