# Requirements: the midnight review room

## Audience and problem
A solo developer reviewing a small AI-assisted code change needs a quick, private
second look. Cloud review tools require uploading code and broad repository access.
DiffWarden gives a bounded, explainable local review with a memorable Halloween UI.

## Acceptance criteria
1. Given a standard git unified text diff, when inspected, the app groups parsed
   hunks by path and maps every matched added line to its new-file line number.
2. Removed and context lines must not trigger the nine added-code checks.
3. Incomplete or malformed hunks must disclose partial coverage. Empty, raw-code,
   binary-only and unsupported combined merge diffs must not appear successful.
4. Inputs exceeding 250,000 characters are rejected before analysis.
5. A signal shows its severity, category, reason, exact location and next action.
6. The user can filter signals, record a note and mark a signal reviewed. This
   must not be presented as changing source code or approving a merge.
7. Markdown export includes review state and notes but omits source snippets.
8. No user diff, finding or review note is transmitted or persisted by the app.
9. Samples are synthetic. No matching patterns is explicitly not a safety claim.
10. Layout works at narrow mobile and desktop widths, including keyboard focus,
    accessible control names and the reduced-motion setting.

## Evidence status
Prepared before the first authenticated Kiro session. Requirements are intended
input for Kiro review and implementation refinement, not claimed Kiro output.
