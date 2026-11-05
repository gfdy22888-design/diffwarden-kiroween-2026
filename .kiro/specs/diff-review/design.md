# Design

## Structure
- dist/engine.js: pure diff parser, bounded rule matching, Markdown export.
- dist/samples.js: three synthetic unified diffs.
- dist/app.js: ephemeral review state and text-node-only rendering.
- dist/index.html and style.css: responsive midnight review room.
- test/engine.test.js: realistic fixtures and parser/coverage regressions.

## Visual system
Deep forest background, pale sage accents, editorial serif headlines, monospaced
evidence, an original vector ghost and quiet orbital lines. The costume is part
of the review metaphor: ghosts are review signals, a lantern means limited
visibility, and the reviewer makes the final decision. No flashing animation.

## Boundaries
No AST, taint analysis, project dependency graph, automatic source patching or
remote AI inference. Lines inside strings may match; multiline expressions may
not. Full code review and project tests remain necessary. Comments are skipped
except TODO/FIXME/HACK markers. File paths are untrusted display strings.

## State
An analysis replaces the previous review. Editing the input invalidates results
and disables export. Notes and reviewed flags remain in memory until a new scan,
an input edit, clear or page refresh. Neither localStorage nor cookies are used.
