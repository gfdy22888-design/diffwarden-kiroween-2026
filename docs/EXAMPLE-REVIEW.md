# DiffWarden review

1 files · +4 / -1 lines · 4 signals · 1 reviewed

Local pattern checks on added lines. These are review prompts, not verified vulnerabilities or approval to merge.
Source snippets are omitted from this export. File names and review notes are included; check them before sharing.

## HIGH · Something slipped into the DOM

Location: src/preview\.js:2
Rule: html-sink · Reviewed by user

This change introduces an HTML injection sink. The rule does not know whether the value has already been safely sanitized.

Next step: Use textContent for text. If HTML is necessary, verify sanitization and the complete data flow.

Review note: Checked the value origin\. Sanitization still needs review\.

Reference: https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML

## MEDIUM · The lookout fell asleep

Location: src/preview\.js:6
Rule: test-skipped · Needs review

A test is skipped or focused. Focused tests may prevent the rest of the suite from running.

Next step: Restore the full test suite, or document the reason and owner of the temporary exception.

Reference: https://nodejs.org/api/test.html

## LOW · Unfinished business

Location: src/preview\.js:3
Rule: todo-fixme · Needs review

The change introduces an unfinished-work marker. It may be intentional, but deserves an owner and a follow-up.

Next step: Record a concrete follow-up issue and decide whether the work belongs before or after this merge.

## LOW · A breakpoint in the dark

Location: src/preview\.js:4
Rule: debugger · Needs review

A debugger statement was added to the change.

Next step: Remove the breakpoint or confirm that it is restricted to a development-only path.

Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/debugger
