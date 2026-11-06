import { analyzeDiff, exportMarkdown, MAX_INPUT, RULES } from './engine.js';
import { samples } from './samples.js';
const $ = id => document.getElementById(id);
let result = null, reviews = {}, selectedId = null, filter = 'all', sampleName = '', toastTimer, listLimit = 50;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function toast(message) {
  $('toast').textContent = message; $('toast').hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { $('toast').hidden = true; }, 4500);
}
function counts() {
  if (!result) return;
  $('signal-count').textContent = result.findings.length;
  for (const severity of ['high','medium','low']) $(severity + '-count').textContent = result.findings.filter(f => f.severity === severity).length;
  const reviewed = result.findings.filter(f => reviews[f.id]?.reviewed).length;
  $('review-count').textContent = result.findings.length ? `${reviewed} / ${result.findings.length} reviewed` : 'No matched signals';
  $('review-progress').max = result.findings.length || 1;
  $('review-progress').value = reviewed;
  $('brief-subtitle').textContent = sampleName ? `Sample case · ${sampleName}` : `${result.rulesRun} pattern checks · added lines only`;
  $('export').disabled = false;
}
function resetResults() {
  result = null; reviews = {}; selectedId = null;
  $('results-section').hidden = true; $('export').disabled = true;
  for (const id of ['signal-count','high-count','medium-count','low-count']) $(id).textContent = '—';
  $('review-count').textContent = 'Not started'; $('review-progress').value = 0;
  $('brief-subtitle').textContent = 'Inspect the current diff to begin';
}
function updateInput() {
  $('char-count').textContent = `${$('diff-input').value.length.toLocaleString()} / 250k characters`;
}
function matchingFindings() {
  return result.findings.filter(f => filter === 'all' || f.severity === filter || f.category === filter);
}
function renderList() {
  const list = $('findings'); list.replaceChildren();
  const matches = matchingFindings();
  if (!matches.some(f => f.id === selectedId)) selectedId = matches[0]?.id || null;
  for (const finding of matches.slice(0,listLimit)) {
    const button = el('button','finding-button' + (finding.id === selectedId ? ' selected' : ''));
    button.setAttribute('aria-pressed', String(finding.id === selectedId));
    button.append(el('span',`badge severity-${finding.severity}`,finding.severity));
    if (reviews[finding.id]?.reviewed) button.append(el('span','reviewed-badge','✓ Reviewed'));
    button.append(el('strong',null,finding.title),el('small',null,`${finding.path}:${finding.line}`));
    button.addEventListener('click', () => { selectedId = finding.id; renderList(); renderDetail(); highlightDiff(); });
    list.append(button);
  }
  if (matches.length > listLimit) {
    const more = el('button','finding-button',`Show next ${Math.min(50,matches.length-listLimit)} signals (${listLimit} of ${matches.length})`);
    more.addEventListener('click', () => { listLimit += 50; renderList(); }); list.append(more);
  }
  if (!matches.length) list.append(el('p','empty-state', result.findings.length ? 'No signals in this filter. Try All to see the full review.' : 'The configured patterns didn’t match. Keep reviewing the change.'));
}
function renderDetail() {
  const panel = $('finding-detail'); panel.replaceChildren();
  const finding = result.findings.find(f => f.id === selectedId);
  if (!finding) {
    const empty = el('div','clear-state');
    empty.append(el('span','large-star','✦'),el('h3',null,result.findings.length ? 'A quiet corner.' : 'Nothing stirred. Stay curious.'),el('p',null,result.findings.length ? 'Choose another filter to inspect the other signals.' : 'None of the nine configured patterns matched the parsed added lines. That does not establish that the change is correct or secure. Review its context and run the full test suite.'));
    panel.append(empty); return;
  }
  const review = reviews[finding.id] ||= { reviewed: false, note: '' };
  panel.append(el('span',`badge severity-${finding.severity}`,`${finding.severity} · ${finding.category}`),el('h3',null,finding.title),el('div','detail-location',`${finding.path}:${finding.line} / ${finding.ruleId}`));
  panel.append(el('pre','code-excerpt',`+ ${finding.snippet}`),el('div','detail-label','Why it surfaced'),el('p',null,finding.reason),el('div','detail-label','Your next move'),el('p',null,finding.action));
  if (finding.reference) {
    const link = el('a',null,'Read the reference ↗'); link.href = finding.reference; link.target = '_blank'; link.rel = 'noopener noreferrer'; panel.append(link);
  }
  const label = el('label','note-label','Leave a review note'); label.htmlFor = 'review-note';
  const note = el('textarea','note-input'); note.id = 'review-note'; note.maxLength = 1200; note.placeholder = 'What did you check? What still needs attention?'; note.value = review.note;
  note.addEventListener('input', () => { review.note = note.value; });
  const actions = el('div','review-actions');
  const mark = el('button','review-button',review.reviewed ? '✓ Reviewed — undo' : 'Mark reviewed');
  mark.setAttribute('aria-pressed',String(review.reviewed));
  mark.addEventListener('click', () => { review.reviewed = !review.reviewed; counts(); renderList(); renderDetail(); toast(review.reviewed ? 'Marked reviewed. The code has not been changed.' : 'Returned to the review queue.'); });
  actions.append(mark,el('small',null,'A review record, not a code fix.'));
  panel.append(label,note,actions);
}
function renderDiffs() {
  const container = $('file-diffs'); container.replaceChildren();
  $('file-count').textContent = `${result.files.length} ${result.files.length === 1 ? 'file' : 'files'}`;
  let remaining = 1500;
  for (const file of result.files) {
    if (remaining <= 0) break;
    const section = el('section');
    section.append(el('h3','diff-file-heading',`${file.path}   +${file.additions} / -${file.deletions}`));
    const lines = el('div','diff-lines');
    for (const line of file.lines.slice(0,remaining)) {
      const row = el('div',`diff-row ${line.type}`); row.dataset.inputLine = line.inputLine;
      const prefix = line.type === 'added' ? '+ ' : line.type === 'removed' ? '- ' : '  ';
      row.append(el('span',null,line.oldLine ?? ''),el('span',null,line.newLine ?? ''),el('span',null,line.type === 'hunk' ? line.text : prefix + line.text));
      lines.append(row);
    }
    remaining -= file.lines.length;
    section.append(lines); container.append(section);
  }
  if (remaining <= 0) container.append(el('p','empty-state','The diff preview shows the first 1,500 parsed lines. Analysis and report include all parsed lines within the input limit.'));
  highlightDiff();
}
function highlightDiff() {
  const finding = result?.findings.find(f => f.id === selectedId);
  document.querySelectorAll('.diff-row').forEach(row => row.classList.toggle('focused',Number(row.dataset.inputLine) === finding?.inputLine));
}
function inspect(scroll = true) {
  $('input-error').hidden = true;
  try {
    result = analyzeDiff($('diff-input').value);
    reviews = {}; selectedId = null; filter = 'all'; listLimit = 50;
    document.querySelectorAll('[data-filter]').forEach(button => { const active = button.dataset.filter === filter; button.classList.toggle('active',active); button.setAttribute('aria-pressed',String(active)); });
    counts(); renderList(); renderDetail(); renderDiffs();
    $('results-title').textContent = result.findings.length ? 'A few things worth a second look.' : 'The patterns are quiet tonight.';
    $('change-stats').textContent = `${result.files.length} ${result.files.length === 1 ? 'file' : 'files'} · +${result.additions} / −${result.deletions} lines · ${result.rulesRun} checks`;
    $('warnings').textContent = result.warnings.join(' '); $('warnings').hidden = !result.warnings.length;
    $('results-section').hidden = false;
    if (scroll) { $('results-section').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' }); toast(`${result.findings.length} review signals found. Your code stayed in this tab.`); }
  } catch (error) {
    resetResults(); $('input-error').textContent = error.message; $('input-error').hidden = false;
  }
}
function loadSample(announce = true) {
  const sample = samples[$('sample-select').value];
  $('diff-input').value = sample.diff; sampleName = sample.name; resetResults(); updateInput(); $('input-error').hidden = true;
  if (announce) toast(`Loaded a synthetic sample: ${sample.name}. Choose Inspect change.`);
}
$('diff-input').addEventListener('input', () => { sampleName = ''; resetResults(); updateInput(); $('input-error').hidden = true; });
$('load-sample').addEventListener('click', () => loadSample());
$('scan').addEventListener('click', () => inspect());
$('clear-input').addEventListener('click', () => { $('diff-input').value = ''; sampleName = ''; resetResults(); updateInput(); $('input-error').hidden = true; $('diff-input').focus(); });
$('diff-input').addEventListener('keydown', event => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); inspect(); } });
$('diff-file').addEventListener('change', async event => {
  const file = event.target.files[0]; if (!file) return;
  try {
    if (file.size > MAX_INPUT * 4) throw new Error('Choose a smaller diff file (up to 250,000 characters).');
    const text = await file.text();
    if (text.length > MAX_INPUT) throw new Error('This file exceeds 250,000 characters. Split it into smaller changes.');
    $('diff-input').value = text; sampleName = ''; resetResults(); updateInput(); $('input-error').hidden = true; toast('Diff file loaded locally. Choose Inspect change.');
  } catch (error) { $('input-error').textContent = error.message; $('input-error').hidden = false; }
  event.target.value = '';
});
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  filter = button.dataset.filter; listLimit = 50;
  document.querySelectorAll('[data-filter]').forEach(item => { const active = item === button; item.classList.toggle('active',active); item.setAttribute('aria-pressed',String(active)); });
  renderList(); renderDetail(); highlightDiff();
}));
$('export').addEventListener('click', () => {
  if (!result) return;
  const url = URL.createObjectURL(new Blob([exportMarkdown(result,reviews)],{type:'text/markdown;charset=utf-8'}));
  const link = el('a'); link.href = url; link.download = 'diffwarden-review.md'; document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url),1000); toast('Review exported. Source snippets are omitted; check notes and paths before sharing.');
});
for (const rule of RULES) {
  const row = el('div'); row.append(el('span',`badge severity-${rule.severity}`,`${rule.severity} · ${rule.category}`),el('h3',null,rule.name),el('p',null,rule.reason)); $('rule-list').append(row);
}
$('rules-open').addEventListener('click', () => $('guide').showModal());
$('rules-close').addEventListener('click', () => $('guide').close());
$('guide').addEventListener('click', event => { if (event.target === $('guide')) { const r = $('guide').getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) $('guide').close(); } });
loadSample(false); inspect(false);
