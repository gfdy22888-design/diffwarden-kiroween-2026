# Kiro usage — evidence log

Status on 2026-11-05: **authenticated Kiro model work is pending**.

The coordinating assistant built the initial prototype, requirements, design,
steering document and tests. Those files are configuration and intended inputs;
their existence alone is not proof of Kiro usage.

The official Kiro CLI 3.0.0 Windows MSI was downloaded from the official Kiro
download service. Its SHA-256 matched the official manifest, its Authenticode
signature was valid and signed by Amazon Web Services, Inc. It was extracted to
the ignored .tools directory. `kiro-cli --version` succeeded; `whoami` reported
`Not logged in`. A GitHub device login was initiated for user completion.

The Kiro Web connection timed out. No model response, Kiro-generated feature,
hook run, MCP use, custom-agent execution or Kiro review is claimed at this stage.

## Next real Kiro task
Read .kiro/steering/project.md and .kiro/specs/diff-review/. Review dist/engine.js,
dist/app.js and test/engine.test.js against the requirements. Find concrete
coverage or correctness gaps, implement necessary fixes, add focused regression
tests and run npm test plus npm run check. Do not claim full security analysis.
Do not modify the hosting manifest, credentials or any unrelated project.

Record the actual command/session, files changed, tests and limitations here
after a successful authenticated session. Preserve a sanitized transcript in
docs/evidence; never commit login URLs, device codes, tokens or account details.
