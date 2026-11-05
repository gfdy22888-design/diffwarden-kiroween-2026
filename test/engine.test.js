import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeDiff, parseDiff, exportMarkdown, MAX_INPUT } from '../dist/engine.js';
import { samples } from '../dist/samples.js';

function added(code) { return `--- a/file.js\n+++ b/file.js\n@@ -0,0 +1,1 @@\n+${code}\n`; }
test('synthetic release finds four actionable signals with exact new line numbers', () => {
  const result = analyzeDiff(samples.haunted.diff);
  assert.deepEqual(result.findings.map(f=>[f.ruleId,f.line]),[['html-sink',2],['test-skipped',6],['todo-fixme',3],['debugger',4]]);
  assert.equal(result.additions,4); assert.equal(result.deletions,1); assert.deepEqual(result.warnings,[]);
});
test('shell example reports two distinct security review prompts', () => {
  assert.deepEqual(analyzeDiff(samples.shell.diff).findings.map(f=>f.ruleId),['shell-string','tls-bypass']);
});
test('quiet case returns a valid empty finding list', () => {
  const result = analyzeDiff(samples.quiet.diff); assert.equal(result.findings.length,0); assert.equal(result.files.length,1);
  assert.match(exportMarkdown(result),/does not establish correctness/);
});
test('only added lines are checked; removing eval is not flagged', () => {
  assert.equal(analyzeDiff('--- a/a.js\n+++ b/a.js\n@@ -1,1 +1,1 @@\n-eval(input);\n+parse(input);\n').findings.length,0);
});
test('context line numbers and multiple hunks remain correct', () => {
  const diff = '--- a/a.js\n+++ b/a.js\n@@ -10,2 +10,3 @@\n const value = 1;\n+eval(source);\n return value;\n@@ -40,1 +41,2 @@\n done();\n+debugger;\n';
  const result = analyzeDiff(diff); assert.deepEqual(result.findings.map(f=>f.line),[11,42]); assert.deepEqual(result.warnings,[]);
});
test('an added line that starts with ++ is not confused with a file header', () => {
  const result = analyzeDiff('--- a/a.js\n+++ b/a.js\n@@ -0,0 +1,2 @@\n+++counter;\n+eval(source);\n');
  assert.equal(result.files.length,1); assert.equal(result.additions,2); assert.equal(result.findings[0].line,2);
});
test('multiple files and deleted files retain the intended paths', () => {
  const diff = added('debugger;') + 'diff --git a/gone.js b/gone.js\n--- a/gone.js\n+++ /dev/null\n@@ -1,1 +0,0 @@\n-eval(source);\n';
  const result = analyzeDiff(diff); assert.deepEqual(result.files.map(f=>f.path),['file.js','gone.js']); assert.equal(result.findings.length,1);
});
test('quoted paths with spaces and CRLF are accepted', () => {
  const result = analyzeDiff('--- "a/hello world.js"\r\n+++ "b/hello world.js"\r\n@@ -0,0 +1 @@\r\n+debugger;\r\n');
  assert.equal(result.findings[0].path,'hello world.js'); assert.deepEqual(result.warnings,[]);
});
test('malformed and truncated hunks disclose incomplete coverage', () => {
  const result = analyzeDiff('--- a/a.js\n+++ b/a.js\n@@ -0,0 +1,3 @@\n+eval(source);\n');
  assert.equal(result.findings.length,1); assert.equal(result.warnings.length,1);
});
test('extra content beyond declared hunk lengths warns instead of silently covering it', () => {
  const result = analyzeDiff(added('debugger;') + '+eval(source);\n');
  assert.equal(result.additions,1); assert.equal(result.warnings.length,1);
});
test('mixed text and binary input disclose skipped changes', () => {
  const result = analyzeDiff(added('debugger;') + 'diff --git a/a.png b/a.png\nBinary files a/a.png and b/a.png differ\n');
  assert.equal(result.findings.length,1); assert.match(result.warnings.join(' '),/Binary or combined/);
});
test('plain text, binary diffs and empty text do not pretend to have been checked', () => {
  for (const value of ['', 'eval(source);','Binary files a/a.png and b/a.png differ']) assert.throws(()=>analyzeDiff(value),/No unified diff/);
});
test('large inputs are bounded and inputs are never executed', () => {
  assert.throws(()=>parseDiff('x'.repeat(MAX_INPUT+1)),RangeError);
  assert.throws(()=>parseDiff(null),TypeError);
  delete globalThis.diffwardenExecuted;
  assert.equal(analyzeDiff(added('eval(globalThis.diffwardenExecuted = true);')).findings.length,1);
  assert.equal(globalThis.diffwardenExecuted,undefined);
});
test('obvious comments are ignored except TODOs', () => {
  assert.equal(analyzeDiff(added('// eval(input);')).findings.length,0);
  assert.equal(analyzeDiff(added('// TODO: implement this')).findings[0].ruleId,'todo-fixme');
});
test('rule fixtures cover the documented review patterns', () => {
  const fixtures = [['new Function(code)','dynamic-eval'],['node.innerHTML = html','html-sink'],['execSync(cmd)','shell-string'],['const tls = { rejectUnauthorized: false }','tls-bypass'],['db.query("DELETE FROM sessions");','sql-delete'],['test.only("x", run)','test-skipped'],['try {} catch(e) {}','empty-catch'],['// FIXME: later','todo-fixme'],['debugger;','debugger']];
  for (const [code,rule] of fixtures) assert.ok(analyzeDiff(added(code)).findings.some(f=>f.ruleId === rule),`${rule}: ${code}`);
  assert.equal(analyzeDiff(added('db.query("DELETE FROM sessions WHERE id = ?");')).findings.length,0);
});
test('export omits source snippets and distinguishes review from repair', () => {
  const result = analyzeDiff(added('eval("unique-source-snippet");')); const id = result.findings[0].id;
  const report = exportMarkdown(result,{[id]:{reviewed:true,note:'Validated the data flow.'}});
  assert.doesNotMatch(report,/unique-source-snippet/); assert.match(report,/Reviewed by user/); assert.match(report,/Validated the data flow/); assert.match(report,/not verified vulnerabilities/);
});
test('untrusted notes cannot create active Markdown link syntax', () => {
  const result = analyzeDiff(added('debugger;'));
  const report = exportMarkdown(result,{[result.findings[0].id]:{note:'[click](https://example.com)\n# heading'}});
  assert.ok(report.includes('\\[click\\]\\(https://example\\.com\\)'));
  assert.ok(!report.includes('\n# heading'));
});
