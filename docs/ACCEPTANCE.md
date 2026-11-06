# Acceptance and provenance

## Verified

- 17 automated engine tests pass; JavaScript syntax checks pass.
- Public GitHub source contains the application, MIT license and root .kiro inputs.
- Public GitHub Pages demo loaded without a login:
  https://gfdy22888-design.github.io/diffwarden-kiroween-2026/dist/
- The default synthetic release displayed four signals at the expected locations.
- A review note remained visible after marking the first finding reviewed; the
  briefing changed from 0/4 to 1/4 and the UI did not claim source repair.
- The downloaded Markdown report was read and verified: four signals, one human
  review, the note and references; source snippets were omitted.
- The quieter synthetic case displayed zero matches and retained its limits text.
- An HTML canary in pasted code was shown literally; no matching image element
  was created. This is one rendering check, not proof of comprehensive security.
- The Field guide displayed all nine rules and coverage limitations.
- At a 390 px viewport, the input and briefing panels stacked at x=20 px with
  width 335 px; document scroll width was 375 px. No horizontal page overflow was
  observed. This is a narrow-screen check, not certification across all devices.
- A genuine full-page screenshot of the synthetic release is preserved in
  screenshots/browser-proof.png. It is not generated artwork or a real user's
  project result. The exported example also uses only synthetic data.

## Hosting

Sites owner-private deployment succeeded for source commit
6ba76e505f13aeb1841395acc2a4c5332357f3b6. Its URL is
https://diffwarden-kiroween-2026.shi18395586367.chatgpt.site
and the browser visibly requested ChatGPT sign-in. It is an owner preview, not
the judge link. GitHub Pages is the public judge demo. Later source commits may
include minor accessibility/documentation fixes; the repository and Pages build
history identify the served state.

## Remaining gates

1. Kiro CLI is installed/extracted and runs, but `whoami` still reports not logged
   in. No Kiro model work is claimed. Complete login and substantive Kiro review
   or implementation; preserve a sanitized real transcript and changed files.
2. Record the real application and actual Kiro work; upload a public YouTube demo
   under three minutes, in English or with an English translation.
3. Verify the entrant's real eligibility and Devpost account fields, complete the
   entry and verify its submitted state. No registration/submission is claimed.
4. Keep the public application accessible through the judging period.

The official .kiro configuration is prepared input, not evidence of a Kiro run.
No hooks, custom agents, MCP integrations, model outputs or awards are invented.
