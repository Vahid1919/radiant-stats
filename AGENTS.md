# Agent Instructions

This file is a portable baseline for agents working in this repository. Add
project-specific rules only after verifying them from the codebase and its
configuration.

More specific `AGENTS.md` files may exist in subdirectories. Their rules apply
when a task touches that directory and take precedence over this file.

## Core Principles

1. **Type-safe**: use the project's strictest supported typing conventions.
   Do not use `any`; narrow `unknown` at trust boundaries.
2. **Validate external input**: treat network, file, environment, and user input
   as untrusted until it is validated at the owning boundary.
3. **Keep secrets private**: never expose credentials, private configuration, or
   server-only data to client code, logs, or committed files.
4. **Test changed behavior**: add or update focused behavioral tests with every
   behavior change when the repository has a suitable test harness.
5. **Preserve isolation**: prevent state, cache, configuration, and data from
   leaking across users, requests, tenants, or other logical partitions.

When a principle conflicts with an executable check, enforced policy, or a more
specific instruction, the more specific mechanism is authoritative. Report the
discrepancy rather than silently choosing between conflicting rules.

## Sources of Truth

- When documentation conflicts with working code or configuration, implement
  against the code and report the stale document.
- When a structure document conflicts with the file tree, use the file tree and
  report the stale document.
- When agent instructions conflict, follow the most specific applicable file and
  report the conflict.

## Agent Behavior and Approval Boundaries

- Ask clarifying questions before editing when requirements are ambiguous.
- Prefer small, focused changes over broad refactors.
- Do not add dependencies without explaining the need and first considering what
  the existing project already provides.
- Do not change public behavior, routes, environment variables, or data
  contracts unless the user explicitly requests it.
- Call out risks and required tests when modifying security-sensitive code.
- Never commit, amend, rebase, push, or open a pull request without explicit
  user approval.
- Treat approval to edit files separately from approval for Git operations.
- Before an approved Git operation, show the exact command or commit plan and
  the changes it affects.
- Before editing three or more files, migrations, security boundaries, or public
  interfaces, show a plan and wait for explicit approval.

## Working Method

- Discover the language, framework, package manager, runtime, and validation
  commands from repository manifests and configuration before relying on them.
- Follow established local patterns before introducing a new abstraction or
  style.
- Keep shared domain types and pure logic close to their owning domain module.
- Use the narrowest useful validation first, then run broader checks when the
  change affects shared behavior.
- Report validation commands, results, and remaining uncertainty at handoff.
