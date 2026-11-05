export const samples = {
  haunted: { name: 'The haunted release', description: 'A rushed web release with four review signals.', diff: `diff --git a/src/preview.js b/src/preview.js
--- a/src/preview.js
+++ b/src/preview.js
@@ -1,3 +1,6 @@
 export function renderPreview(container, userHtml) {
-  container.textContent = userHtml;
+  container.innerHTML = userHtml;
+  // TODO: agree on the supported preview format
+  debugger;
 }
+test.skip('untrusted preview is shown as text', () => {});
` },
  shell: { name: 'A knock at the shell', description: 'An export command and a lowered TLS check.', diff: `diff --git a/server/export.js b/server/export.js
--- a/server/export.js
+++ b/server/export.js
@@ -1,3 +1,4 @@
 import { exec } from 'node:child_process';
-export const exportReport = (name) => queue.add({ name });
+export const exportReport = (name) => exec('render-report ' + name);
+const transport = { rejectUnauthorized: false };
 export const format = 'pdf';
` },
  quiet: { name: 'A quieter change', description: 'A text-only rendering change without matching patterns.', diff: `diff --git a/src/greeting.js b/src/greeting.js
--- a/src/greeting.js
+++ b/src/greeting.js
@@ -1,3 +1,3 @@
 export function greet(node, name) {
-  node.textContent = 'Hi, ' + name;
+  node.textContent = 'Welcome, ' + name;
 }
` }
};
