/** Pure, bounded heuristic review. Input is never evaluated or sent anywhere. */
export const MAX_INPUT = 250_000;
export const RULES = [
  { id: 'dynamic-eval', name: 'A spell that runs itself', severity: 'high', category: 'security', pattern: /\b(?:eval\s*\(|new\s+Function\s*\()/, reason: 'New code dynamically interprets a string as JavaScript. If that string can be influenced by a user, it can execute unintended code.', action: 'Replace dynamic execution with a parser or an explicit map of permitted operations. Trace the input before deciding.', reference: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval' },
  { id: 'html-sink', name: 'Something slipped into the DOM', severity: 'high', category: 'security', pattern: /(?:\.innerHTML\s*=|\.outerHTML\s*=|dangerouslySetInnerHTML\s*=|document\.write\s*\()/, reason: 'This change introduces an HTML injection sink. The rule does not know whether the value has already been safely sanitized.', action: 'Use textContent for text. If HTML is necessary, verify sanitization and the complete data flow.', reference: 'https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML' },
  { id: 'shell-string', name: 'A shell with an open door', severity: 'high', category: 'security', pattern: /\b(?:exec|execSync)\s*\(/, reason: 'A shell command is being introduced. String construction with external input can turn data into shell instructions.', action: 'Prefer execFile or spawn with an argument array and shell disabled; validate permitted arguments.', reference: 'https://nodejs.org/api/child_process.html' },
  { id: 'tls-bypass', name: 'The ward has been lowered', severity: 'high', category: 'security', pattern: /(?:rejectUnauthorized\s*:\s*false|NODE_TLS_REJECT_UNAUTHORIZED\s*=\s*['"]?0|verify\s*=\s*False)/, reason: 'This line appears to disable TLS certificate verification, allowing untrusted certificates.', action: 'Restore verification and configure the intended certificate authority instead of bypassing it.', reference: 'https://nodejs.org/api/tls.html' },
  { id: 'sql-delete', name: 'A little too much disappeared', severity: 'high', category: 'reliability', pattern: /\bDELETE\s+FROM\s+[\w.`"\[\]]+\s*;?\s*['"`)]?\s*;?\s*$/i, reason: 'A single-line DELETE statement has no visible WHERE clause. Multi-line SQL and intentional full-table operations require human interpretation.', action: 'Confirm the intended scope, use a transaction and preview the affected rows before running it.', reference: 'https://www.postgresql.org/docs/current/sql-delete.html' },
  { id: 'test-skipped', name: 'The lookout fell asleep', severity: 'medium', category: 'testing', pattern: /\b(?:it|test|describe)\.(?:skip|only)\s*\(|\b(?:xit|xtest|xdescribe)\s*\(/, reason: 'A test is skipped or focused. Focused tests may prevent the rest of the suite from running.', action: 'Restore the full test suite, or document the reason and owner of the temporary exception.', reference: 'https://nodejs.org/api/test.html' },
  { id: 'empty-catch', name: 'An error vanished without a trace', severity: 'medium', category: 'reliability', pattern: /\bcatch\s*(?:\([^)]*\))?\s*\{\s*\}/, reason: 'An empty catch block discards an error without visible recovery or reporting.', action: 'Handle the expected failure, return an explicit error state, or explain why ignoring it is intentional.', reference: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch' },
  { id: 'todo-fixme', name: 'Unfinished business', severity: 'low', category: 'reliability', pattern: /\b(?:TODO|FIXME|HACK)\b/, reason: 'The change introduces an unfinished-work marker. It may be intentional, but deserves an owner and a follow-up.', action: 'Record a concrete follow-up issue and decide whether the work belongs before or after this merge.', reference: null },
  { id: 'debugger', name: 'A breakpoint in the dark', severity: 'low', category: 'reliability', pattern: /^\s*debugger\s*;/, reason: 'A debugger statement was added to the change.', action: 'Remove the breakpoint or confirm that it is restricted to a development-only path.', reference: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/debugger' }
];

function pathFromHeader(header) {
  let path = header.trim();
  if (path.startsWith('"')) {
    try { path = JSON.parse(path); } catch { /* Display the escaped path literally. */ }
  } else path = path.split('\t')[0];
  return path.replace(/^[ab]\//, '');
}

export function parseDiff(input) {
  if (typeof input !== 'string') throw new TypeError('Paste a unified text diff.');
  if (input.length > MAX_INPUT) throw new RangeError('This review accepts up to 250,000 characters. Split the change into smaller diffs.');
  const rows = input.replace(/\r\n?/g, '\n').split('\n');
  const files = [];
  let file = null, oldLine = 0, newLine = 0, oldRemaining = 0, newRemaining = 0;
  let inHunk = false, malformed = false, awaitingNewHeader = false, unsupported = false;
  for (let index = 0; index < rows.length; index++) {
    const raw = rows[index];
    if (/^(?:diff --(?:cc|combined) |@@@ |Binary files |GIT binary patch)/.test(raw)) { unsupported = true; continue; }
    if (raw.startsWith('diff --git ')) {
      if (inHunk && (oldRemaining || newRemaining)) malformed = true;
      file = null; inHunk = false; awaitingNewHeader = false;
      continue;
    }
    if (!inHunk && raw.startsWith('--- ')) {
      file = { path: pathFromHeader(raw.slice(4)), oldPath: pathFromHeader(raw.slice(4)), lines: [], additions: 0, deletions: 0 };
      files.push(file); awaitingNewHeader = true; continue;
    }
    if (!inHunk && awaitingNewHeader && raw.startsWith('+++ ')) {
      const nextPath = pathFromHeader(raw.slice(4));
      file.path = nextPath === '/dev/null' ? file.oldPath : nextPath;
      awaitingNewHeader = false; continue;
    }
    const hunk = raw.match(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
    if (hunk) {
      if (inHunk && (oldRemaining || newRemaining)) malformed = true;
      if (!file || awaitingNewHeader) { malformed = true; inHunk = false; continue; }
      oldLine = Number(hunk[1]); newLine = Number(hunk[3]);
      oldRemaining = hunk[2] === undefined ? 1 : Number(hunk[2]);
      newRemaining = hunk[4] === undefined ? 1 : Number(hunk[4]);
      inHunk = oldRemaining > 0 || newRemaining > 0;
      file.lines.push({ type: 'hunk', text: raw, inputLine: index + 1, oldLine: null, newLine: null });
      continue;
    }
    if (!inHunk) {
      if (file && !awaitingNewHeader && /^[+ -]/.test(raw) && raw !== '-- ') malformed = true;
      continue;
    }
    if (!file || raw.startsWith('\\ No newline')) continue;
    const kind = raw[0];
    if (!['+', '-', ' '].includes(kind)) { malformed = true; inHunk = false; continue; }
    const needsOld = kind !== '+', needsNew = kind !== '-';
    if ((needsOld && oldRemaining <= 0) || (needsNew && newRemaining <= 0)) { malformed = true; inHunk = false; continue; }
    const line = { type: kind === '+' ? 'added' : kind === '-' ? 'removed' : 'context', text: raw.slice(1), inputLine: index + 1, oldLine: needsOld ? oldLine++ : null, newLine: needsNew ? newLine++ : null };
    if (needsOld) oldRemaining--;
    if (needsNew) newRemaining--;
    if (line.type === 'added') file.additions++;
    if (line.type === 'removed') file.deletions++;
    file.lines.push(line);
    if (!oldRemaining && !newRemaining) inHunk = false;
  }
  if (inHunk && (oldRemaining || newRemaining)) malformed = true;
  if (awaitingNewHeader) malformed = true;
  return { files, malformed, unsupported };
}

export function analyzeDiff(input) {
  const parsed = parseDiff(input);
  const validFiles = parsed.files.filter(file => file.lines.some(line => line.type !== 'hunk'));
  if (!validFiles.length) throw new Error('No unified diff hunks found. Use git diff, or try a sample case. Binary patches and combined merge diffs are not supported.');
  const findings = [];
  for (const file of validFiles) {
    for (const line of file.lines) {
      if (line.type !== 'added') continue;
      const comment = /^\s*(?:\/\/|\/\*|\*|#|<!--)/.test(line.text);
      for (const rule of RULES) {
        if (comment && rule.id !== 'todo-fixme') continue;
        if (!rule.pattern.test(line.text)) continue;
        findings.push({ id: `${file.path}:${line.inputLine}:${rule.id}`, ruleId: rule.id, title: rule.name, severity: rule.severity, category: rule.category, reason: rule.reason, action: rule.action, reference: rule.reference, path: file.path, line: line.newLine, inputLine: line.inputLine, snippet: line.text });
      }
    }
  }
  const order = { high: 0, medium: 1, low: 2 };
  findings.sort((a, b) => order[a.severity] - order[b.severity] || a.inputLine - b.inputLine || a.ruleId.localeCompare(b.ruleId));
  const warnings = [];
  if (parsed.malformed) warnings.push('The diff contains incomplete or malformed hunks. Only parsed added lines were checked; export and paste a complete git diff before relying on this review.');
  if (parsed.unsupported) warnings.push('Binary or combined merge changes were skipped. Review those changes separately; this report covers only the parsed text hunks.');
  return { files: validFiles, findings, additions: validFiles.reduce((n,f) => n + f.additions, 0), deletions: validFiles.reduce((n,f) => n + f.deletions, 0), rulesRun: RULES.length, warnings };
}

function inline(value) { return String(value).replace(/[\r\n]/g, ' ').replace(/[<>]/g, '').replace(/[\\`*_{}\[\]()#+.!|~-]/g, '\\$&'); }
export function exportMarkdown(result, reviews = {}) {
  const reviewed = result.findings.filter(item => reviews[item.id]?.reviewed).length;
  const lines = ['# DiffWarden review', '', `${result.files.length} files · +${result.additions} / -${result.deletions} lines · ${result.findings.length} signals · ${reviewed} reviewed`, '', 'Local pattern checks on added lines. These are review prompts, not verified vulnerabilities or approval to merge.', 'Source snippets are omitted from this export. File names and review notes are included; check them before sharing.', ''];
  for (const warning of result.warnings) lines.push(`> ${warning}`, '');
  for (const finding of result.findings) {
    const review = reviews[finding.id];
    lines.push(`## ${finding.severity.toUpperCase()} · ${finding.title}`, '', `Location: ${inline(finding.path)}:${finding.line}`, `Rule: ${finding.ruleId} · ${review?.reviewed ? 'Reviewed by user' : 'Needs review'}`, '', finding.reason, '', `Next step: ${finding.action}`, '');
    if (review?.note?.trim()) lines.push(`Review note: ${inline(review.note)}`, '');
    if (finding.reference) lines.push(`Reference: ${finding.reference}`, '');
  }
  if (!result.findings.length) lines.push('No configured patterns matched the parsed added lines. Review the complete change and run its tests; a clean scan does not establish correctness or security.', '');
  return lines.join('\n');
}
